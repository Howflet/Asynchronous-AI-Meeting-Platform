# 🚀 A²MP Azure Deployment Guide

Deploy your Asynchronous AI Meeting Platform to Azure App Services with this comprehensive guide.

## 📋 Prerequisites

Before deploying, ensure you have:

### Required Tools
- ✅ **Azure CLI** - [Download here](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- ✅ **Docker Desktop** - Running and accessible from command line
- ✅ **PowerShell** - Administrator access (Windows)

### Required Information
- 🔑 **Azure Subscription ID** - Find in Azure Portal → Subscriptions
- 🤖 **Gemini API Key** - From Google AI Studio
- 🤖 **Gemini Moderator API Key** - Second key for moderation (can be same as above)
- 🔐 **Host Password** - Secure password for meeting hosts

## 🎯 Quick Deploy (Windows)

### Option 1: Automated Script
```batch
# Run as Administrator
deploy-azure.bat
```

### Option 2: PowerShell Script
```powershell
# Run as Administrator
.\deploy-azure.ps1 -SubscriptionId "your-sub-id" -GeminiApiKey "your-key" -GeminiModeratorApiKey "your-mod-key"
```

## 🔧 Manual Deployment Steps

### 1. Login to Azure
```bash
az login
az account set --subscription "your-subscription-id"
```

### 2. Create Resource Group
```bash
az group create --name a2mp-rg --location "East US"
```

### 3. Build and Deploy Container
```bash
# Create container registry
az acr create --resource-group a2mp-rg --name a2mpregistry --sku Basic
az acr login --name a2mpregistry

# Build and push image
docker build -t a2mp-app .
docker tag a2mp-app a2mpregistry.azurecr.io/a2mp-app:latest
docker push a2mpregistry.azurecr.io/a2mp-app:latest
```

### 4. Create App Service
```bash
# Create app service plan
az appservice plan create --name a2mp-plan --resource-group a2mp-rg --is-linux --sku B1

# Create web app
az webapp create --resource-group a2mp-rg --plan a2mp-plan --name a2mp-webapp --deployment-container-image-name a2mpregistry.azurecr.io/a2mp-app:latest
```

### 5. Configure Application
```bash
# Set environment variables
az webapp config appsettings set --resource-group a2mp-rg --name a2mp-webapp --settings \
  NODE_ENV=production \
  GEMINI_API_KEY="your-gemini-key" \
  GEMINI_MODERATOR_API_KEY="your-moderator-key" \
  HOST_PASSWORD="your-secure-password" \
  WEBSITES_PORT=3000
```

## 🗄️ Database Persistence

Your SQLite database will persist using Azure Files:

```bash
# Create storage account
az storage account create --name a2mpstorage --resource-group a2mp-rg --sku Standard_LRS

# Create file share
az storage share create --name a2mp-data --account-name a2mpstorage

# Mount to app service
az webapp config storage-account add \
  --resource-group a2mp-rg \
  --name a2mp-webapp \
  --custom-id a2mp-db-storage \
  --storage-type AzureFiles \
  --share-name a2mp-data \
  --account-name a2mpstorage \
  --mount-path /app/backend/data
```

## 🎛️ Configuration Options

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `GEMINI_MODERATOR_API_KEY` | Moderation API key | Required |
| `HOST_PASSWORD` | Meeting host password | Required |
| `MAX_TURNS_PER_MEETING` | Max conversation turns | 25 |
| `ENGINE_TICK_MS` | Engine processing interval | 8000 |
| `RATE_LIMIT_RPM` | Requests per minute | 15 |
| `RATE_LIMIT_TPM` | Tokens per minute | 1000000 |
| `RATE_LIMIT_RPD` | Requests per day | 1500 |

### Pricing Tiers
| Tier | CPU | RAM | Storage | Price/Month | Use Case |
|------|-----|-----|---------|-------------|----------|
| **B1 Basic** | 1 Core | 1.75 GB | 10 GB | ~$13 | Development/Testing |
| **S1 Standard** | 1 Core | 1.75 GB | 50 GB | ~$73 | Small Production |
| **P1v2 Premium** | 1 Core | 3.5 GB | 250 GB | ~$146 | Production |

## 🔍 Monitoring & Troubleshooting

### View Logs
```bash
# Real-time logs
az webapp log tail --resource-group a2mp-rg --name a2mp-webapp

# Download logs
az webapp log download --resource-group a2mp-rg --name a2mp-webapp
```

### Common Issues & Solutions

#### ❌ Container won't start
```bash
# Check logs for startup errors
az webapp log tail --resource-group a2mp-rg --name a2mp-webapp

# Verify container settings
az webapp config container show --resource-group a2mp-rg --name a2mp-webapp
```

#### ❌ Database not persisting
```bash
# Verify storage mount
az webapp config storage-account list --resource-group a2mp-rg --name a2mp-webapp

# Check file share contents
az storage file list --share-name a2mp-data --account-name a2mpstorage
```

#### ❌ API errors
```bash
# Check environment variables
az webapp config appsettings list --resource-group a2mp-rg --name a2mp-webapp
```

### Health Checks
- **Frontend**: `https://your-app.azurewebsites.net`
- **Backend Health**: `https://your-app.azurewebsites.net/api/health`
- **Expected Response**: `{"ok":true}`

## 🚦 Scaling & Performance

### Vertical Scaling (More Resources)
```bash
# Upgrade to Standard plan
az appservice plan update --name a2mp-plan --resource-group a2mp-rg --sku S1

# Upgrade to Premium plan  
az appservice plan update --name a2mp-plan --resource-group a2mp-rg --sku P1v2
```

### Horizontal Scaling (More Instances)
```bash
# Scale to 2 instances
az appservice plan update --name a2mp-plan --resource-group a2mp-rg --number-of-workers 2
```

## 🔄 Updates & Maintenance

### Deploy New Version
```bash
# Build new image
docker build -t a2mp-app .
docker tag a2mp-app a2mpregistry.azurecr.io/a2mp-app:latest
docker push a2mpregistry.azurecr.io/a2mp-app:latest

# Restart app to pull new image
az webapp restart --resource-group a2mp-rg --name a2mp-webapp
```

### Backup Database
```bash
# Download database files from Azure Files
az storage file download-batch --destination ./backup --source a2mp-data --account-name a2mpstorage
```

## 🗑️ Cleanup Resources

### Delete Everything
```bash
# WARNING: This deletes all resources and data
az group delete --name a2mp-rg --yes --no-wait
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Azure App Service logs
3. Verify your environment variables
4. Ensure your API keys are valid
5. Check Azure service health status

## 🎉 Success!

Once deployed, your A²MP application will be available at:
`https://your-app-name.azurewebsites.net`

Features available:
- ✅ Create async AI meetings
- ✅ Real-time conversation streaming
- ✅ AI persona generation
- ✅ Meeting reports and summaries
- ✅ Persistent SQLite database
- ✅ Auto-scaling support