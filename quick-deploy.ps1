# Quick A2MP Deployment with Storage
$timestamp = Get-Date -Format "MMddHHmm"
$registryName = "a2mpreg$timestamp"
$webappName = "a2mp-app-$timestamp"
$storageName = "a2mpstorage$timestamp"

Write-Host "Quick deployment starting..." -ForegroundColor Green

# Set subscription (use the known working one)
az account set --subscription "4dd3fd37-2a86-420b-8fe4-5f5a491ea13b"

# Create resource group
az group create --name a2mp-rg --location "East US"

# Create storage account
Write-Host "Creating storage..." -ForegroundColor Yellow
az storage account create --name $storageName --resource-group a2mp-rg --location "East US" --sku Standard_LRS

# Get storage key
$storageKey = (az storage account keys list --resource-group a2mp-rg --account-name $storageName --query '[0].value' --output tsv)

# Create file share
az storage share create --name a2mp-data --account-name $storageName --account-key $storageKey

# Create registry
Write-Host "Creating registry..." -ForegroundColor Yellow
az acr create --resource-group a2mp-rg --name $registryName --sku Basic
az acr login --name $registryName

# Build and push
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t a2mp-app .
docker tag a2mp-app "$registryName.azurecr.io/a2mp-app:latest"
docker push "$registryName.azurecr.io/a2mp-app:latest"

# Create app service plan
az appservice plan create --name a2mp-plan --resource-group a2mp-rg --is-linux --sku B1

# Create web app
Write-Host "Creating web app..." -ForegroundColor Yellow
az webapp create --resource-group a2mp-rg --plan a2mp-plan --name $webappName --deployment-container-image-name "$registryName.azurecr.io/a2mp-app:latest"

# Enable registry access
az webapp identity assign --resource-group a2mp-rg --name $webappName
az acr update --name $registryName --admin-enabled true
$registryPassword = (az acr credential show --name $registryName --query "passwords[0].value" --output tsv)

# Configure container
az webapp config container set --resource-group a2mp-rg --name $webappName --docker-custom-image-name "$registryName.azurecr.io/a2mp-app:latest" --docker-registry-server-url "https://$registryName.azurecr.io" --docker-registry-server-user $registryName --docker-registry-server-password $registryPassword

# Add storage mount
Write-Host "Mounting storage..." -ForegroundColor Yellow
az webapp config storage-account add --resource-group a2mp-rg --name $webappName --custom-id "database" --storage-type AzureFiles --share-name "a2mp-data" --account-name $storageName --access-key $storageKey --mount-path "/app/backend/data"

# Configure app settings
az webapp config appsettings set --resource-group a2mp-rg --name $webappName --settings NODE_ENV=production GEMINI_API_KEY="AIzaSyCEtCXnOrSimCd-5flHnydDUxtJ-N3A6KE" HOST_PASSWORD=12345 "CORS_ORIGIN=https://$webappName.azurewebsites.net" WEBSITES_PORT=3000 WEBSITES_ENABLE_APP_SERVICE_STORAGE=false

# Restart and show URL
az webapp restart --resource-group a2mp-rg --name $webappName
$url = (az webapp show --resource-group a2mp-rg --name $webappName --query defaultHostName --output tsv)

Write-Host "DEPLOYED!" -ForegroundColor Green
Write-Host "URL: https://$url" -ForegroundColor Cyan
Write-Host "Host: https://$url/host (password: 12345)" -ForegroundColor Cyan