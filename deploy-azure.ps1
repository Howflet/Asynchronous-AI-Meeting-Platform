# A²MP Azure Deployment Script for Windows PowerShell
# Run this script in PowerShell as Administrator

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$true)]
    [string]$GeminiApiKey,
    
    [Parameter(Mandatory=$true)]
    [string]$GeminiModeratorApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$HostPassword = "SecureA2MP2025!",
    
    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "a2mp-rg",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "a2mp-webapp",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US"
)

Write-Host "🚀 Starting A²MP deployment to Azure App Services..." -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Azure CLI
try {
    $azVersion = az --version 2>$null
    if (-not $azVersion) {
        throw "Azure CLI not found"
    }
    Write-Host "✅ Azure CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not installed. Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    $dockerVersion = docker --version 2>$null
    if (-not $dockerVersion) {
        throw "Docker not found"
    }
    Write-Host "✅ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not running. Please start Docker Desktop" -ForegroundColor Red
    exit 1
}

# Login to Azure
Write-Host "Logging into Azure..." -ForegroundColor Yellow
az login
az account set --subscription $SubscriptionId

# Create Resource Group
Write-Host "Creating resource group: $ResourceGroup..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# Create Azure Container Registry
$registryName = $AppName.Replace("-", "") + "registry"
Write-Host "Creating Azure Container Registry: $registryName..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroup --name $registryName --sku Basic --location $Location
az acr login --name $registryName

# Build and push Docker image
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t a2mp-app .

Write-Host "Tagging and pushing to ACR..." -ForegroundColor Yellow
$imageName = "$registryName.azurecr.io/a2mp-app:latest"
docker tag a2mp-app $imageName
docker push $imageName

# Create App Service Plan
Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
  --name "$AppName-plan" `
  --resource-group $ResourceGroup `
  --is-linux `
  --sku B1 `
  --location $Location

# Create Web App
Write-Host "Creating Web App..." -ForegroundColor Yellow
az webapp create `
  --resource-group $ResourceGroup `
  --plan "$AppName-plan" `
  --name $AppName `
  --deployment-container-image-name $imageName

# Enable ACR access
Write-Host "Configuring Container Registry access..." -ForegroundColor Yellow
az webapp identity assign --resource-group $ResourceGroup --name $AppName
az acr update --name $registryName --admin-enabled true

# Get ACR credentials
$acrCredentials = az acr credential show --name $registryName | ConvertFrom-Json
$acrPassword = $acrCredentials.passwords[0].value

# Configure container settings
Write-Host "Configuring container settings..." -ForegroundColor Yellow
az webapp config container set `
  --resource-group $ResourceGroup `
  --name $AppName `
  --docker-custom-image-name $imageName `
  --docker-registry-server-url "https://$registryName.azurecr.io" `
  --docker-registry-server-username $registryName `
  --docker-registry-server-password $acrPassword

# Configure application settings
Write-Host "Setting application configuration..." -ForegroundColor Yellow
$appUrl = "https://$AppName.azurewebsites.net"
az webapp config appsettings set `
  --resource-group $ResourceGroup `
  --name $AppName `
  --settings `
    NODE_ENV=production `
    NEXT_TELEMETRY_DISABLED=1 `
    BACKEND_PORT=4000 `
    GEMINI_API_KEY=$GeminiApiKey `
    GEMINI_MODERATOR_API_KEY=$GeminiModeratorApiKey `
    HOST_PASSWORD=$HostPassword `
    MAX_TURNS_PER_MEETING=25 `
    ENGINE_TICK_MS=8000 `
    RATE_LIMIT_RPM=15 `
    RATE_LIMIT_TPM=1000000 `
    RATE_LIMIT_RPD=1500 `
    CORS_ORIGIN=$appUrl `
    WEBSITES_PORT=3000

# Create storage account for SQLite persistence
Write-Host "Creating storage for database persistence..." -ForegroundColor Yellow
$storageName = $AppName.Replace("-", "") + "storage"
az storage account create `
  --name $storageName `
  --resource-group $ResourceGroup `
  --location $Location `
  --sku Standard_LRS

# Create file share
az storage share create `
  --name "a2mp-data" `
  --account-name $storageName

# Get storage key
$storageKey = az storage account keys list `
  --resource-group $ResourceGroup `
  --account-name $storageName `
  --query "[0].value" `
  --output tsv

# Mount storage
az webapp config storage-account add `
  --resource-group $ResourceGroup `
  --name $AppName `
  --custom-id "a2mp-db-storage" `
  --storage-type AzureFiles `
  --share-name "a2mp-data" `
  --account-name $storageName `
  --access-key $storageKey `
  --mount-path "/app/backend/data"

# Restart the app
Write-Host "Restarting application..." -ForegroundColor Yellow
az webapp restart --resource-group $ResourceGroup --name $AppName

# Get the app URL
$appHostname = az webapp show --resource-group $ResourceGroup --name $AppName --query defaultHostName --output tsv

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "📱 Your A²MP application is available at: https://$appHostname" -ForegroundColor Cyan
Write-Host "🔧 Resource Group: $ResourceGroup" -ForegroundColor White
Write-Host "🏗️ App Service: $AppName" -ForegroundColor White
Write-Host "📦 Container Registry: $registryName" -ForegroundColor White
Write-Host "💾 Storage Account: $storageName" -ForegroundColor White

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Visit your application URL to test functionality" -ForegroundColor White
Write-Host "2. Monitor logs: az webapp log tail --resource-group $ResourceGroup --name $AppName" -ForegroundColor White
Write-Host "3. Scale up if needed: az appservice plan update --name $AppName-plan --resource-group $ResourceGroup --sku S1" -ForegroundColor White

# Show logs command for troubleshooting
Write-Host "`n🔍 Troubleshooting Commands:" -ForegroundColor Yellow
Write-Host "View logs: az webapp log tail --resource-group $ResourceGroup --name $AppName" -ForegroundColor White
Write-Host "Restart app: az webapp restart --resource-group $ResourceGroup --name $AppName" -ForegroundColor White
Write-Host "Update image: docker build -t a2mp-app . && docker tag a2mp-app $imageName && docker push $imageName && az webapp restart --resource-group $ResourceGroup --name $AppName" -ForegroundColor White