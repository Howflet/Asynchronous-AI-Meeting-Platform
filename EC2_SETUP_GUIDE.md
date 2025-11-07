# EC2 Instance Setup - Step-by-Step Guide

## Part 1: Launch EC2 Instance (AWS Console)

### Step 1: Access EC2 Dashboard

1. Log in to AWS Console: https://console.aws.amazon.com/
2. Select region: **US East (N. Virginia)** or your preferred region
3. Navigate to **Services** → **EC2**
4. Click **Launch Instance**

### Step 2: Configure Instance

#### 2.1 Name and Tags
```
Name: a2mp-backend
```

#### 2.2 Application and OS Images (AMI)
```
AMI: Amazon Linux 2023 AMI
Architecture: 64-bit (x86)
```
✅ **Free tier eligible** badge should be visible

#### 2.3 Instance Type
```
Instance type: t2.micro
- 1 vCPU
- 1 GB RAM
- Free tier eligible (750 hours/month)
```

#### 2.4 Key Pair (Login)
1. Click **Create new key pair**
2. Settings:
   ```
   Key pair name: a2mp-key
   Key pair type: RSA
   Private key file format: .pem (for Mac/Linux) or .ppk (for PuTTY/Windows)
   ```
3. Click **Create key pair**
4. **IMPORTANT:** Save the downloaded key file securely!
   - Windows: Save to `C:\Users\YourName\.ssh\a2mp-key.pem`
   - Mac/Linux: Save to `~/.ssh/a2mp-key.pem` and run `chmod 400 ~/.ssh/a2mp-key.pem`

#### 2.5 Network Settings

Click **Edit** and configure:

```
VPC: Default VPC
Subnet: No preference (default)
Auto-assign public IP: Enable ✓
```

**Firewall (Security Group):**
1. Select **Create security group**
2. Security group name: `a2mp-security-group`
3. Description: `Security group for A2MP application`

**Security Group Rules:**

| Type | Protocol | Port Range | Source Type | Source | Description |
|------|----------|-----------|-------------|--------|-------------|
| SSH | TCP | 22 | My IP | (Your IP) | SSH access |
| HTTP | TCP | 80 | Anywhere | 0.0.0.0/0 | HTTP access |
| HTTPS | TCP | 443 | Anywhere | 0.0.0.0/0 | HTTPS access |
| Custom TCP | TCP | 4000 | Anywhere | 0.0.0.0/0 | Backend API |
| Custom TCP | TCP | 5173 | Anywhere | 0.0.0.0/0 | Frontend (if hosting on EC2) |

**Important Security Note:** 
- Initially set SSH to "My IP" for security
- After testing, you can restrict port 4000 and 5173 as needed

#### 2.6 Configure Storage
```
Volume 1 (Root):
- Size: 30 GB
- Volume type: gp3 (SSD)
- Delete on termination: Yes ✓
```
✅ **Free tier eligible:** 30 GB

#### 2.7 Advanced Details
Leave as default (no changes needed)

### Step 3: Launch Instance

1. Review the **Summary** panel on the right
2. Verify Free tier eligible: ✅ Yes
3. Click **Launch Instance**
4. Wait for launch confirmation
5. Click **View Instances**

### Step 4: Wait for Instance to Start

1. Select your instance in the list
2. Wait for **Instance State** to show `running` (green)
3. Wait for **Status Check** to show `2/2 checks passed` (~2-3 minutes)

### Step 5: Get Connection Information

From the instance details:
1. Copy **Public IPv4 address** (e.g., `3.85.123.45`)
2. Copy **Public IPv4 DNS** (e.g., `ec2-3-85-123-45.compute-1.amazonaws.com`)

---

## Part 2: Connect to EC2 Instance

### Option A: Windows (PowerShell)

```powershell
# Navigate to where you saved the key
cd C:\Users\YourName\.ssh

# Set proper permissions on key file
icacls a2mp-key.pem /inheritance:r
icacls a2mp-key.pem /grant:r "$($env:USERNAME):(R)"

# Connect to EC2
ssh -i a2mp-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>

# Example:
ssh -i a2mp-key.pem ec2-user@3.85.123.45
```

### Option B: Windows (PuTTY)

1. Download PuTTY: https://www.putty.org/
2. Convert .pem to .ppk:
   - Open PuTTYgen
   - Click **Load** → Select `a2mp-key.pem`
   - Click **Save private key** → Save as `a2mp-key.ppk`
3. Open PuTTY:
   ```
   Host Name: ec2-user@<YOUR-EC2-PUBLIC-IP>
   Port: 22
   Connection → SSH → Auth → Browse → Select a2mp-key.ppk
   ```
4. Click **Open**

### Option C: Mac/Linux

```bash
# Navigate to where you saved the key
cd ~/.ssh

# Set proper permissions
chmod 400 a2mp-key.pem

# Connect to EC2
ssh -i a2mp-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>

# Example:
ssh -i a2mp-key.pem ec2-user@3.85.123.45
```

### First Connection Prompt

When connecting for the first time:
```
The authenticity of host '3.85.123.45' can't be established.
ED25519 key fingerprint is SHA256:...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```
Type: **yes** and press Enter

You should see:
```
   ,     #_
   ~\_  ####_        Amazon Linux 2023
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___   https://aws.amazon.com/linux/amazon-linux-2023
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'

[ec2-user@ip-XXX-XXX-XXX-XXX ~]$
```

✅ **You're connected to your EC2 instance!**

---

## Part 3: Deploy A2MP Backend

### Step 1: Download and Run Deployment Script

```bash
# Download the deployment script
curl -o deploy-backend.sh https://raw.githubusercontent.com/Howflet/Asynchronous-AI-Meeting-Platform/main/deploy-backend.sh

# Make it executable
chmod +x deploy-backend.sh

# Run the deployment script
./deploy-backend.sh
```

The script will prompt you for:
1. **Gemini API Key (participant):** Your main Gemini API key
2. **Gemini Moderator API Key:** Your secondary Gemini API key
3. **Frontend URL:** Press Enter to use EC2 public IP automatically

### Step 2: Monitor Deployment

The script will:
- ✅ Update system packages
- ✅ Install Node.js 20.x
- ✅ Install Git
- ✅ Install PM2
- ✅ Clone repository
- ✅ Install dependencies
- ✅ Create .env file
- ✅ Build TypeScript
- ✅ Start backend with PM2
- ✅ Configure auto-restart

### Step 3: Verify Backend is Running

```bash
# Check PM2 status
pm2 status

# You should see:
┌────┬────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id │ name           │ mode        │ ↺       │ status  │ cpu      │
├────┼────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0  │ a2mp-backend   │ fork        │ 0       │ online  │ 0%       │
└────┴────────────────┴─────────────┴─────────┴─────────┴──────────┘

# View logs
pm2 logs a2mp-backend --lines 50

# Test backend locally
curl http://localhost:4000/api/meetings

# Should return: {"meetings":[]}
```

### Step 4: Test from Your Computer

Open browser or use curl:
```bash
# Replace with your EC2 public IP
curl http://<YOUR-EC2-PUBLIC-IP>:4000/api/meetings
```

If you get an error, check security group port 4000 is open.

---

## Part 4: Deploy Frontend (Option 1: On EC2)

### Step 1: Build Frontend on EC2

```bash
# Navigate to frontend directory
cd /home/ec2-user/Asynchronous-AI-Meeting-Platform/frontend

# Install dependencies
npm install

# Update API endpoint (should auto-detect from .env)
# Build for production
npm run build
```

### Step 2: Install and Start Frontend Server

```bash
# Install http-server globally
sudo npm install -g http-server

# Start frontend with PM2
pm2 start http-server --name a2mp-frontend -- dist -p 5173

# Save PM2 configuration
pm2 save
```

### Step 3: Access Application

Open browser:
```
http://<YOUR-EC2-PUBLIC-IP>:5173
```

You should see the A2MP home page! 🎉

---

## Part 5: Post-Deployment Tasks

### 1. Set Up Database Backups (Optional)

```bash
# Create S3 bucket for backups
aws s3 mb s3://a2mp-backups-$(date +%s)

# The deployment script already created the backup script if you chose yes
# Test it manually:
/home/ec2-user/backup-db.sh

# Check crontab
crontab -l
# Should show: 0 2 * * * /home/ec2-user/backup-db.sh >> /home/ec2-user/backup.log 2>&1
```

### 2. Configure Monitoring

```bash
# Install CloudWatch agent (optional)
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Basic monitoring is enabled by default in AWS Console:
# EC2 → Instances → Select instance → Monitoring tab
```

### 3. Secure SSH Access

```bash
# Edit security group to restrict SSH to your IP only
# AWS Console → EC2 → Security Groups → a2mp-security-group
# Edit inbound rules → SSH → Change source to "My IP"
```

### 4. Enable Swap (Helps with 1GB RAM)

```bash
# Create 2GB swap file
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify
free -h
```

---

## Useful Commands Reference

### PM2 Management
```bash
pm2 status                    # Check all processes
pm2 logs a2mp-backend         # View backend logs
pm2 logs a2mp-frontend        # View frontend logs
pm2 restart a2mp-backend      # Restart backend
pm2 stop a2mp-backend         # Stop backend
pm2 delete a2mp-backend       # Remove from PM2
pm2 save                      # Save current process list
pm2 resurrect                 # Restore saved processes
```

### System Monitoring
```bash
top                           # CPU/Memory usage (press 'q' to quit)
df -h                         # Disk usage
free -h                       # Memory usage
netstat -tuln                 # Check open ports
```

### Application Updates
```bash
cd /home/ec2-user/Asynchronous-AI-Meeting-Platform
git pull origin main          # Pull latest code
cd backend
npm install                   # Update dependencies
npm run build                 # Rebuild
pm2 restart a2mp-backend      # Restart
```

### Database Management
```bash
# View database
cd /home/ec2-user/Asynchronous-AI-Meeting-Platform
node list-meetings.js         # List all meetings
node check-db.js              # Check database stats
node clear-all-data.js        # Clear all data (careful!)

# Backup database manually
cp backend/backend/data/a2mp.db ~/backup-$(date +%Y%m%d).db
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs a2mp-backend --err

# Common issues:
# 1. Port already in use
sudo lsof -i :4000
# Kill process if needed: sudo kill -9 <PID>

# 2. Missing .env file
ls backend/.env
cat backend/.env

# 3. TypeScript build failed
cd backend
npm run build
```

### Cannot connect from browser
```bash
# 1. Check security group allows port 4000
# AWS Console → EC2 → Security Groups → Check inbound rules

# 2. Check backend is listening
sudo netstat -tuln | grep 4000

# 3. Test locally first
curl http://localhost:4000/api/meetings
```

### Out of memory errors
```bash
# Enable swap (see Part 5, step 4 above)
# Or upgrade to t2.small (not free tier, ~$17/month)
```

### SSL/HTTPS Setup
```bash
# Install Nginx
sudo yum install -y nginx

# Install Certbot (for Let's Encrypt SSL)
sudo yum install -y certbot python3-certbot-nginx

# If you have a domain:
sudo certbot --nginx -d yourdomain.com
```

---

## Cost Monitoring

### Check Free Tier Usage

1. AWS Console → Billing Dashboard
2. Click **Free Tier** in left menu
3. Monitor:
   - EC2 running hours (limit: 750/month)
   - EBS storage (limit: 30GB)
   - Data transfer (limit: 15GB outbound)

### Set Up Billing Alerts

1. AWS Console → CloudWatch
2. Billing → Create Alarm
3. Set threshold: $1 (or your comfort level)
4. Add email notification

---

## Next Steps

✅ EC2 instance running
✅ Backend deployed and running
✅ Frontend deployed (if Option 1)
⬜ Deploy frontend to S3 + CloudFront (see AWS_DEPLOYMENT_GUIDE.md)
⬜ Set up custom domain with Route 53 (optional)
⬜ Configure SSL certificate
⬜ Run production tests

Need help with any of these steps? Check AWS_DEPLOYMENT_GUIDE.md or ask for assistance!
