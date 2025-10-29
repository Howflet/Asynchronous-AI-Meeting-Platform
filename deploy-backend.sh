#!/bin/bash
# A2MP Backend Deployment Script for EC2
# This script sets up the backend on a fresh Amazon Linux 2023 instance

set -e  # Exit on any error

echo "=========================================="
echo "A2MP Backend Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if running on EC2
if [ ! -f /sys/hypervisor/uuid ] || ! grep -q ec2 /sys/hypervisor/uuid 2>/dev/null; then
    print_info "Warning: This doesn't appear to be an EC2 instance"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

print_info "Step 1: Updating system packages..."
sudo yum update -y
print_success "System updated"

print_info "Step 2: Installing Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
NODE_VERSION=$(node --version)
print_success "Node.js installed: $NODE_VERSION"

print_info "Step 3: Installing Git..."
sudo yum install -y git
GIT_VERSION=$(git --version)
print_success "Git installed: $GIT_VERSION"

print_info "Step 4: Installing PM2 (Process Manager)..."
sudo npm install -g pm2
PM2_VERSION=$(pm2 --version)
print_success "PM2 installed: $PM2_VERSION"

print_info "Step 5: Cloning A2MP repository..."
cd /home/ec2-user
if [ -d "Asynchronous-AI-Meeting-Platform" ]; then
    print_info "Repository already exists, pulling latest changes..."
    cd Asynchronous-AI-Meeting-Platform
    git pull origin main
else
    git clone https://github.com/Howflet/Asynchronous-AI-Meeting-Platform.git
    cd Asynchronous-AI-Meeting-Platform
fi
print_success "Repository ready"

print_info "Step 6: Installing backend dependencies..."
cd backend
npm install
print_success "Dependencies installed"

echo ""
echo "=========================================="
echo "Configuration Required"
echo "=========================================="
echo ""
echo "We need to create the .env file with your API keys."
echo ""

# Prompt for API keys
read -p "Enter your Gemini API Key (participant): " GEMINI_API_KEY
read -p "Enter your Gemini Moderator API Key: " GEMINI_MODERATOR_API_KEY
read -p "Enter your frontend URL (or press Enter for EC2 public IP): " FRONTEND_URL

# Get EC2 public IP if not provided
if [ -z "$FRONTEND_URL" ]; then
    EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    FRONTEND_URL="http://$EC2_PUBLIC_IP:5173"
    print_info "Using EC2 public IP: $EC2_PUBLIC_IP"
fi

print_info "Step 7: Creating .env file..."
cat > .env << EOF
# Backend Configuration
PORT=4000

# Gemini AI API Keys
GEMINI_API_KEY=$GEMINI_API_KEY
GEMINI_MODERATOR_API_KEY=$GEMINI_MODERATOR_API_KEY

# Meeting Engine Settings
MAX_TURNS_PER_MEETING=25
ENGINE_TICK_MS=15000

# CORS Configuration
CORS_ORIGIN=$FRONTEND_URL

# Rate Limiting (Gemini Free Tier)
# 15 requests per minute
# 1,000,000 tokens per minute
# 1,500 requests per day
EOF

print_success ".env file created"

print_info "Step 8: Building TypeScript..."
npm run build
print_success "Build completed"

print_info "Step 9: Starting backend with PM2..."
pm2 delete a2mp-backend 2>/dev/null || true  # Delete if exists
pm2 start dist/server.js --name a2mp-backend
pm2 save
print_success "Backend started"

print_info "Step 10: Configuring PM2 to start on boot..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save
print_success "Auto-startup configured"

echo ""
echo "=========================================="
echo "Database Backup Configuration (Optional)"
echo "=========================================="
echo ""
read -p "Do you want to set up automated S3 backups? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter S3 bucket name for backups: " BACKUP_BUCKET
    
    print_info "Creating backup script..."
    cat > /home/ec2-user/backup-db.sh << 'BACKUP_EOF'
#!/bin/bash
DB_PATH="/home/ec2-user/Asynchronous-AI-Meeting-Platform/backend/backend/data/a2mp.db"
BACKUP_BUCKET="BUCKET_NAME_PLACEHOLDER"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Backup to S3
aws s3 cp $DB_PATH s3://$BACKUP_BUCKET/backup-$TIMESTAMP.db

# Keep only last 7 days of backups
aws s3 ls s3://$BACKUP_BUCKET/ | grep backup- | sort | head -n -7 | awk '{print $4}' | xargs -I {} aws s3 rm s3://$BACKUP_BUCKET/{}

echo "Backup completed: backup-$TIMESTAMP.db"
BACKUP_EOF
    
    # Replace bucket name
    sed -i "s/BUCKET_NAME_PLACEHOLDER/$BACKUP_BUCKET/" /home/ec2-user/backup-db.sh
    chmod +x /home/ec2-user/backup-db.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup-db.sh >> /home/ec2-user/backup.log 2>&1") | crontab -
    
    print_success "Backup configured (runs daily at 2 AM)"
fi

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
print_success "Backend is running on port 4000"
print_success "Process managed by PM2 (auto-restarts on crash/reboot)"
echo ""
echo "Backend URL: http://$EC2_PUBLIC_IP:4000"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Useful Commands:"
echo "  pm2 status              - Check process status"
echo "  pm2 logs a2mp-backend   - View logs"
echo "  pm2 restart a2mp-backend - Restart backend"
echo "  pm2 stop a2mp-backend   - Stop backend"
echo ""
echo "Database Location:"
echo "  /home/ec2-user/Asynchronous-AI-Meeting-Platform/backend/backend/data/a2mp.db"
echo ""
echo "Next Steps:"
echo "  1. Test backend: curl http://localhost:4000/api/meetings"
echo "  2. Configure security group to allow port 4000"
echo "  3. Deploy frontend (see AWS_DEPLOYMENT_GUIDE.md)"
echo ""
print_info "Viewing current status..."
pm2 status
echo ""
print_success "All done! 🚀"
