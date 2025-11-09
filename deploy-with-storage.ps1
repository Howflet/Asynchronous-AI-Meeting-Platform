# A²MP Azure Deployment - With Persistent Storage
# Complete deployment including Azure Files for SQLite persistence

Write-Host "=== A²MP Deployment (With Persistent Storage) ===" -ForegroundColor Green

# Fresh authentication
Write-Host "Clearing Azure CLI cache and re-authenticating..." -ForegroundColor Yellow
az logout
az account clear
az login

# List available subscriptions
Write-Host "Available subscriptions:" -ForegroundColor Yellow
az account list --output table

# Let user choose subscription
$subscriptionId = Read-Host "Enter your Subscription ID from the list above"
az account set --subscription $subscriptionId

# Verify access by listing resource groups
Write-Host "Testing subscription access..." -ForegroundColor Yellow
try {
    az group list --output table
    Write-Host "Subscription access confirmed!" -ForegroundColor Green
} catch {
    Write-Host "Cannot access subscription. Please check permissions." -ForegroundColor Red
    exit 1
}

# Generate unique names
$timestamp = Get-Date -Format "MMddHHmm"
$registryName = "a2mpreg$timestamp"
$webappName = "a2mp-app-$timestamp"
$storageName = "a2mpstorage$timestamp"

Write-Host "Using names:" -ForegroundColor Yellow
Write-Host "  Registry: $registryName"
Write-Host "  WebApp: $webappName"
Write-Host "  Storage: $storageName"

# Get API key
$geminiApiKey = Read-Host "Enter your Gemini API Key"
$hostPassword = Read-Host "Enter Host Dashboard Password (or press Enter for default '12345')"
if ([string]::IsNullOrEmpty($hostPassword)) { $hostPassword = "12345" }

Write-Host "Starting deployment..." -ForegroundColor Green

try {
    # Create resource group
    Write-Host "Creating resource group..." -ForegroundColor Yellow
    az group create --name a2mp-rg --location "East US"

    # Create storage account
    Write-Host "Creating storage account..." -ForegroundColor Yellow
    az storage account create --name $storageName --resource-group a2mp-rg --location "East US" --sku Standard_LRS --kind StorageV2

    # Get storage key
    $storageKey = (az storage account keys list --resource-group a2mp-rg --account-name $storageName --query '[0].value' --output tsv)

    # Create file share
    Write-Host "Creating file share for database..." -ForegroundColor Yellow
    az storage share create --name a2mp-data --account-name $storageName --account-key $storageKey

    # Create container registry
    Write-Host "Creating container registry..." -ForegroundColor Yellow
    az acr create --resource-group a2mp-rg --name $registryName --sku Basic
    az acr login --name $registryName

    # Build and push Docker image
    Write-Host "Building and pushing Docker image..." -ForegroundColor Yellow
    docker build -t a2mp-app .
    docker tag a2mp-app "$registryName.azurecr.io/a2mp-app:latest"
    docker push "$registryName.azurecr.io/a2mp-app:latest"

    # Create app service plan
    Write-Host "Creating App Service Plan..." -ForegroundColor Yellow
    az appservice plan create --name a2mp-plan --resource-group a2mp-rg --is-linux --sku B1

    # Create web app
    Write-Host "Creating Web App..." -ForegroundColor Yellow
    az webapp create --resource-group a2mp-rg --plan a2mp-plan --name $webappName --deployment-container-image-name "$registryName.azurecr.io/a2mp-app:latest"

    # Configure registry access
    Write-Host "Configuring registry access..." -ForegroundColor Yellow
    az webapp identity assign --resource-group a2mp-rg --name $webappName
    az acr update --name $registryName --admin-enabled true
    
    # Get registry credentials
    $registryUser = $registryName
    $registryPassword = (az acr credential show --name $registryName --query "passwords[0].value" --output tsv)

    # Configure container
    az webapp config container set --resource-group a2mp-rg --name $webappName --docker-custom-image-name "$registryName.azurecr.io/a2mp-app:latest" --docker-registry-server-url "https://$registryName.azurecr.io" --docker-registry-server-user $registryUser --docker-registry-server-password $registryPassword

    # Configure persistent storage mount
    Write-Host "Configuring persistent storage mount..." -ForegroundColor Yellow
    az webapp config storage-account add --resource-group a2mp-rg --name $webappName --custom-id "a2mp-database" --storage-type AzureFiles --share-name "a2mp-data" --account-name $storageName --access-key $storageKey --mount-path "/app/backend/data"

    # Configure app settings
    Write-Host "Configuring application settings..." -ForegroundColor Yellow
    az webapp config appsettings set --resource-group a2mp-rg --name $webappName --settings NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 BACKEND_PORT=4000 "GEMINI_API_KEY=$geminiApiKey" "HOST_PASSWORD=$hostPassword" MAX_TURNS_PER_MEETING=25 ENGINE_TICK_MS=8000 "CORS_ORIGIN=https://$webappName.azurewebsites.net" WEBSITES_PORT=3000 WEBSITES_ENABLE_APP_SERVICE_STORAGE=false

    # Restart webapp
    Write-Host "Restarting application..." -ForegroundColor Yellow
    az webapp restart --resource-group a2mp-rg --name $webappName

    # Wait and get URL
    Write-Host "Waiting for application to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
    
    $webappUrl = (az webapp show --resource-group a2mp-rg --name $webappName --query defaultHostName --output tsv)

    Write-Host "=== DEPLOYMENT SUCCESSFUL! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your A2MP application is live with persistent storage!" -ForegroundColor Cyan
    Write-Host "   https://$webappUrl" -ForegroundColor White
    Write-Host ""
    Write-Host "Host Dashboard:" -ForegroundColor Cyan  
    Write-Host "   https://$webappUrl/host" -ForegroundColor White
    Write-Host "   Password: $hostPassword" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Database Storage:" -ForegroundColor Cyan
    Write-Host "   Persistent SQLite database configured" -ForegroundColor Green
    Write-Host "   Mounted at: /app/backend/data" -ForegroundColor Gray
    Write-Host "   Data will persist across container restarts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Resources Created:" -ForegroundColor Cyan
    Write-Host "   Resource Group: a2mp-rg" -ForegroundColor Gray
    Write-Host "   Registry: $registryName" -ForegroundColor Gray
    Write-Host "   WebApp: $webappName" -ForegroundColor Gray
    Write-Host "   Storage: $storageName" -ForegroundColor Gray
    Write-Host "   File Share: a2mp-data" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Estimated Monthly Cost: ~$20-25 (Basic App Service + Storage)" -ForegroundColor Yellow

} catch {
    Write-Host "DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "1. Check your subscription permissions in Azure Portal" -ForegroundColor Gray
    Write-Host "2. Ensure subscription is not expired or suspended" -ForegroundColor Gray
    Write-Host "3. Try using a different subscription if available" -ForegroundColor Gray
    Write-Host "4. Check storage account naming (must be globally unique)" -ForegroundColor Gray
}