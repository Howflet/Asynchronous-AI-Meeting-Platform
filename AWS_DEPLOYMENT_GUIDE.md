# AWS Free Tier Deployment Guide - A²MP

## Overview

This guide shows how to deploy the Asynchronous AI Meeting Platform on AWS Free Tier, keeping costs at $0/month for the first 12 months.

## Architecture3

```
┌─────────────────────────────────────────────────────────────┐
│                      AWS Free Tier                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   CloudFront     │         │   Route 53       │        │
│  │   (CDN)          │◄────────│   (DNS)          │        │
│  │   Free Tier:     │         │   $0.50/month    │        │
│  │   50GB/month     │         │   per hosted     │        │
│  └────────┬─────────┘         │   zone           │        │
│           │                   └──────────────────┘        │
│           │                                                │
│           ▼                                                │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   S3 Bucket      │         │   EC2 t2.micro   │        │
│  │   (Frontend)     │         │   (Backend)      │        │
│  │   Free Tier:     │         │   Free Tier:     │        │
│  │   5GB storage    │◄────────│   750 hrs/month  │        │
│  │   20k GET req    │         │   1GB RAM        │        │
│  └──────────────────┘         │   30GB EBS       │        │
│                               └────────┬─────────┘        │
│                                        │                   │
│                                        ▼                   │
│                               ┌──────────────────┐        │
│                               │   EBS Volume     │        │
│                               │   (SQLite DB)    │        │
│                               │   Free Tier:     │        │
│                               │   30GB SSD       │        │
│                               └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Free Tier Limits (12 months)

| Service | Free Tier Limit | Usage for A²MP |
|---------|----------------|----------------|
| **EC2 t2.micro** | 750 hours/month | ~720 hrs (24/7) ✅ |
| **EBS Storage** | 30GB SSD | ~5GB (OS + app + DB) ✅ |
| **S3 Storage** | 5GB | ~100MB (frontend) ✅ |
| **S3 Requests** | 20,000 GET, 2,000 PUT | ~5,000/month ✅ |
| **CloudFront** | 50GB data transfer | ~10GB/month ✅ |
| **Route 53** | $0.50/month (NOT free) | Required for custom domain |

**Estimated Monthly Cost:** $0.50 (Route 53 only) or $0 (if using EC2 public IP)

---

## Option 1: Full AWS Deployment (Recommended)

### Step 1: EC2 Backend Setup

#### 1.1 Launch EC2 Instance

```bash
# Instance Configuration
- AMI: Amazon Linux 2023 (free tier eligible)
- Instance Type: t2.micro (1 vCPU, 1GB RAM)
- Storage: 30GB gp3 EBS (free tier)
- Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 4000 (Backend)
```

**Security Group Rules:**
```
Type        Protocol  Port Range  Source
SSH         TCP       22          Your IP (0.0.0.0/0 for testing)
HTTP        TCP       80          0.0.0.0/0
HTTPS       TCP       443         0.0.0.0/0
Custom TCP  TCP       4000        0.0.0.0/0 (backend API)
```

#### 1.2 Connect to EC2 and Install Dependencies

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>

# Update system
sudo yum update -y

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Install PM2 (process manager)
sudo npm install -g pm2

# Verify installations
node --version  # Should show v20.x
npm --version
```

#### 1.3 Clone and Setup Backend

```bash
# Clone repository
cd /home/ec2-user
git clone https://github.com/Howflet/Asynchronous-AI-Meeting-Platform.git
cd Asynchronous-AI-Meeting-Platform/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODERATOR_API_KEY=your_moderator_api_key_here
MAX_TURNS_PER_MEETING=25
ENGINE_TICK_MS=15000
CORS_ORIGIN=http://<YOUR-EC2-IP>:5173
EOF

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name a2mp-backend
pm2 save
pm2 startup
```

#### 1.4 Configure PM2 Auto-Restart

```bash
# PM2 will automatically restart on crashes and reboots
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

# Check status
pm2 status
pm2 logs a2mp-backend
```

### Step 2: S3 + CloudFront Frontend Setup

#### 2.1 Build Frontend Locally

```bash
# On your local machine
cd frontend
npm install

# Update API endpoint in vite.config.ts
# Replace localhost:4000 with http://<EC2-PUBLIC-IP>:4000

# Build for production
npm run build
# This creates frontend/dist folder
```

#### 2.2 Create S3 Bucket

```bash
# Install AWS CLI
# On Windows PowerShell:
# winget install Amazon.AWSCLI

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Format (json)

# Create S3 bucket (replace with unique name)
BUCKET_NAME="a2mp-frontend-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region us-east-1

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Upload frontend build
cd frontend/dist
aws s3 sync . s3://$BUCKET_NAME --acl public-read

# Set bucket policy for public access
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
```

#### 2.3 Create CloudFront Distribution

```bash
# Create CloudFront distribution (via console or CLI)
aws cloudfront create-distribution \
  --origin-domain-name $BUCKET_NAME.s3.amazonaws.com \
  --default-root-object index.html

# Note the CloudFront URL: https://d1234567890.cloudfront.net
# This is your production frontend URL (FREE, no Route 53 needed!)
```

#### 2.4 Update Backend CORS

```bash
# SSH back to EC2
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>

# Update backend/.env with CloudFront URL
cd /home/ec2-user/Asynchronous-AI-Meeting-Platform/backend
nano .env

# Change CORS_ORIGIN to:
CORS_ORIGIN=https://d1234567890.cloudfront.net

# Restart backend
pm2 restart a2mp-backend
```

### Step 3: Database Persistence

```bash
# SQLite database is stored at: /home/ec2-user/Asynchronous-AI-Meeting-Platform/backend/backend/data/a2mp.db

# Setup automated backups to S3 (optional but recommended)
# Create backup bucket
aws s3 mb s3://a2mp-backups-$(date +%s)

# Create backup script
cat > /home/ec2-user/backup-db.sh << 'EOF'
#!/bin/bash
DB_PATH="/home/ec2-user/Asynchronous-AI-Meeting-Platform/backend/backend/data/a2mp.db"
BACKUP_BUCKET="a2mp-backups-XXXXX"  # Replace with your bucket name
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Backup to S3
aws s3 cp $DB_PATH s3://$BACKUP_BUCKET/backup-$TIMESTAMP.db

# Keep only last 7 days of backups
aws s3 ls s3://$BACKUP_BUCKET/ | grep backup- | sort | head -n -7 | awk '{print $4}' | xargs -I {} aws s3 rm s3://$BACKUP_BUCKET/{}
EOF

chmod +x /home/ec2-user/backup-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ec2-user/backup-db.sh") | crontab -
```

### Step 4: SSL/HTTPS with Let's Encrypt (Optional)

```bash
# Install Nginx as reverse proxy
sudo yum install -y nginx

# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# If using custom domain (requires Route 53 $0.50/month):
sudo certbot --nginx -d yourdomain.com

# Update Nginx config
sudo nano /etc/nginx/nginx.conf

# Add proxy configuration:
server {
    listen 80;
    server_name yourdomain.com;  # Or EC2 public IP

    location / {
        proxy_pass http://localhost:5173;  # Frontend (if hosting locally)
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Option 2: EC2 Only (Simplest, $0/month)

Host both frontend and backend on the same EC2 instance.

```bash
# After setting up backend (Step 1), build frontend on EC2:
cd /home/ec2-user/Asynchronous-AI-Meeting-Platform/frontend
npm install

# Update vite.config.ts to use http://localhost:4000
npm run build

# Serve frontend with PM2 using http-server
sudo npm install -g http-server
pm2 start http-server --name a2mp-frontend -- dist -p 5173

# Access application at: http://<EC2-PUBLIC-IP>:5173
```

**Pros:**
- $0/month cost
- Simplest setup
- No S3/CloudFront needed

**Cons:**
- No CDN (slower for distant users)
- Single point of failure
- Less professional (uses IP address)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Create AWS account (free tier eligible)
- [ ] Get Gemini API keys (2 keys for dual rate limiting)
- [ ] Choose deployment option (1 or 2)
- [ ] Prepare domain name (optional, $0.50/month Route 53)

### EC2 Backend
- [ ] Launch t2.micro instance (Amazon Linux 2023)
- [ ] Configure security groups (ports 22, 80, 443, 4000)
- [ ] Install Node.js 20.x, Git, PM2
- [ ] Clone repository
- [ ] Create .env file with API keys
- [ ] Build and start backend with PM2
- [ ] Configure PM2 auto-restart
- [ ] Test backend: `curl http://<EC2-IP>:4000/health`

### Frontend (Option 1: S3 + CloudFront)
- [ ] Build frontend locally with correct API endpoint
- [ ] Create S3 bucket
- [ ] Enable static website hosting
- [ ] Upload build files
- [ ] Set public read policy
- [ ] Create CloudFront distribution
- [ ] Update backend CORS with CloudFront URL
- [ ] Test: Access CloudFront URL

### Frontend (Option 2: EC2 Only)
- [ ] Build frontend on EC2
- [ ] Start with PM2 + http-server
- [ ] Test: Access http://<EC2-IP>:5173

### Database
- [ ] Verify SQLite database created
- [ ] Create S3 backup bucket (optional)
- [ ] Setup automated daily backups (optional)
- [ ] Test backup script

### Production Hardening
- [ ] Change security group SSH to your IP only
- [ ] Setup CloudWatch logs (free tier: 5GB/month)
- [ ] Enable EC2 detailed monitoring (optional, paid)
- [ ] Setup alerts for high CPU/memory
- [ ] Test auto-restart after reboot
- [ ] Document EC2 IP address and credentials

---

## Monitoring & Maintenance

### Check Application Status

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@<EC2-PUBLIC-IP>

# Check PM2 processes
pm2 status

# View logs
pm2 logs a2mp-backend --lines 100

# Restart if needed
pm2 restart a2mp-backend

# Check database size
du -sh /home/ec2-user/Asynchronous-AI-Meeting-Platform/backend/backend/data/
```

### Update Application

```bash
# SSH to EC2
cd /home/ec2-user/Asynchronous-AI-Meeting-Platform

# Pull latest code
git pull origin main

# Rebuild backend
cd backend
npm install
npm run build

# Restart
pm2 restart a2mp-backend

# If frontend changed (Option 2):
cd ../frontend
npm install
npm run build
pm2 restart a2mp-frontend
```

### CloudWatch Free Tier Monitoring

```bash
# Enable basic monitoring (free)
aws ec2 monitor-instances --instance-ids i-1234567890abcdef0

# View metrics in AWS Console:
# EC2 → Instances → Select instance → Monitoring tab
# - CPU Utilization
# - Network In/Out
# - Disk Read/Write
```

---

## Cost Breakdown

### First 12 Months (Free Tier)

| Service | Monthly Cost | Annual Cost |
|---------|-------------|-------------|
| EC2 t2.micro (750 hrs) | $0 | $0 |
| EBS 30GB SSD | $0 | $0 |
| S3 Storage (5GB) | $0 | $0 |
| CloudFront (50GB) | $0 | $0 |
| Data Transfer (15GB) | $0 | $0 |
| Route 53 (optional) | $0.50 | $6 |
| **TOTAL** | **$0-$0.50** | **$0-$6** |

### After 12 Months

| Service | Monthly Cost |
|---------|-------------|
| EC2 t2.micro | ~$8.50 |
| EBS 30GB | ~$2.40 |
| S3 + CloudFront | ~$1 |
| Route 53 | $0.50 |
| **TOTAL** | **~$12.40** |

**Optimization Tip:** After free tier expires, consider AWS Lightsail ($3.50/month for similar specs).

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs a2mp-backend

# Common issues:
# - Port 4000 in use: sudo lsof -i :4000
# - Missing .env file: ls backend/.env
# - Node version: node --version (needs 20.x)
```

### Frontend can't connect to backend
```bash
# Check CORS settings in backend/.env
# Verify security group allows port 4000
# Test backend directly: curl http://<EC2-IP>:4000/health
```

### Database locked errors
```bash
# SQLite lock timeout - check for zombie processes
pm2 restart a2mp-backend
```

### Out of memory (1GB EC2)
```bash
# Check memory usage
free -h

# Add swap space (helps with builds)
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Next Steps

1. **Choose deployment option** (S3+CloudFront or EC2 only)
2. **Launch EC2 instance** and note public IP
3. **Follow deployment checklist** step by step
4. **Test thoroughly** with a sample meeting
5. **Setup backups** for database
6. **Monitor costs** in AWS Billing Console

Need help with any specific step? Let me know!
