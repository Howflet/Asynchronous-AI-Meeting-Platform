# A²MP Azure App Service Deployment - PowerShell Commands

# Step 1: Login to Azure
az login
az account set --subscription "your-subscription-id"

# Step 2: Create Resource Group
az group create --name a2mp-rg --location "East US"

# Step 3: Create Azure Container Registry (ACR)
az acr create --resource-group a2mp-rg --name a2mpregistry --sku Basic
az acr login --name a2mpregistry

# Step 4: Build and Push Docker Image
docker build -t a2mp-app .
docker tag a2mp-app a2mpregistry.azurecr.io/a2mp-app:latest
docker push a2mpregistry.azurecr.io/a2mp-app:latest

# Step 5: Create App Service Plan
az appservice plan create --name a2mp-plan --resource-group a2mp-rg --is-linux --sku B1

# Step 6: Create Web App
az webapp create --resource-group a2mp-rg --plan a2mp-plan --name a2mp-webapp --deployment-container-image-name a2mpregistry.azurecr.io/a2mp-app:latest

# Step 7: Configure App Settings
az webapp config appsettings set --resource-group a2mp-rg --name a2mp-webapp --settings NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 BACKEND_PORT=4000 GEMINI_API_KEY="your-gemini-api-key" GEMINI_MODERATOR_API_KEY="your-moderator-api-key" HOST_PASSWORD="your-secure-password" MAX_TURNS_PER_MEETING=25 ENGINE_TICK_MS=8000 RATE_LIMIT_RPM=15 RATE_LIMIT_TPM=1000000 RATE_LIMIT_RPD=1500 CORS_ORIGIN="https://a2mp-webapp.azurewebsites.net"

# Step 8: Configure Container Settings
az webapp config container set --resource-group a2mp-rg --name a2mp-webapp --docker-custom-image-name a2mpregistry.azurecr.io/a2mp-app:latest --docker-registry-server-url https://a2mpregistry.azurecr.io

# Step 9: Enable Container Registry Access
az webapp identity assign --resource-group a2mp-rg --name a2mp-webapp
az acr update --name a2mpregistry --admin-enabled true

# Step 10: Get Registry Credentials
az acr credential show --name a2mpregistry

# Step 11: Configure Persistent Storage
az storage account create --name a2mpstorage8269 --resource-group a2mp-rg --location "East US" --sku Standard_LRS
az storage share create --name a2mp-data --account-name a2mpstorage


# Step 12: Restart and Get URL
az webapp restart --resource-group a2mp-rg --name a2mp-webapp
az webapp show --resource-group a2mp-rg --name a2mp-webapp --query defaultHostName --output tsv