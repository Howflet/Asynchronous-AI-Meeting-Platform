#!/bin/bash

# A²MP Docker Build and Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file and add your Gemini API key before continuing."
    print_warning "At minimum, set GEMINI_API_KEY and GEMINI_MODERATOR_API_KEY"
    exit 1
fi

# Check for required environment variables
if ! grep -q "GEMINI_API_KEY=.*[a-zA-Z0-9]" .env; then
    print_error "GEMINI_API_KEY not set in .env file. Please add your API key."
    exit 1
fi

# Function to build and start production
start_production() {
    print_status "Building and starting A²MP in production mode..."
    
    # Stop any running containers
    docker-compose down 2>/dev/null || true
    
    # Build and start
    docker-compose up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if services are healthy
    if docker-compose ps | grep -q "Up"; then
        print_success "A²MP is now running!"
        echo ""
        echo "🌐 Access your application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend:  http://localhost:4000"
        echo "   Health:   http://localhost:4000/api/health"
        echo ""
        echo "📱 Host Dashboard: http://localhost:3000/host"
        echo "   Default password: $(grep HOST_PASSWORD .env | cut -d'=' -f2 | sed 's/^"//' | sed 's/"$//')"
        echo ""
        echo "📋 Management commands:"
        echo "   docker-compose logs -f    # View logs"
        echo "   docker-compose ps         # Check status"
        echo "   docker-compose down       # Stop services"
    else
        print_error "Failed to start services. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Function to start development mode
start_development() {
    print_status "Starting A²MP in development mode..."
    
    # Stop any running containers
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    
    # Start development environment
    docker-compose -f docker-compose.dev.yml up --build
}

# Function to stop all services
stop_services() {
    print_status "Stopping A²MP services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    print_success "Services stopped."
}

# Function to show status
show_status() {
    print_status "A²MP Service Status:"
    echo ""
    
    if docker-compose ps | grep -q "Up"; then
        print_success "Production services are running"
        docker-compose ps
    else
        print_warning "Production services are not running"
    fi
    
    echo ""
    
    if docker-compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "Up"; then
        print_success "Development services are running"
        docker-compose -f docker-compose.dev.yml ps
    else
        print_warning "Development services are not running"
    fi
}

# Function to show logs
show_logs() {
    if docker-compose ps | grep -q "Up"; then
        print_status "Showing production logs (Ctrl+C to exit)..."
        docker-compose logs -f
    elif docker-compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "Up"; then
        print_status "Showing development logs (Ctrl+C to exit)..."
        docker-compose -f docker-compose.dev.yml logs -f
    else
        print_warning "No services are currently running."
    fi
}

# Function to clean up
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
    docker system prune -f
    print_success "Cleanup completed."
}

# Main menu
case "${1:-help}" in
    "prod"|"production")
        start_production
        ;;
    "dev"|"development")
        start_development
        ;;
    "stop")
        stop_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        echo "A²MP Docker Management Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  prod, production  - Build and start in production mode"
        echo "  dev, development  - Start in development mode with hot reload"
        echo "  stop              - Stop all services"
        echo "  status            - Show service status"
        echo "  logs              - Show service logs"
        echo "  cleanup           - Clean up Docker resources"
        echo "  help              - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 prod           # Start production environment"
        echo "  $0 dev            # Start development environment"
        echo "  $0 logs           # View logs"
        echo "  $0 stop           # Stop all services"
        ;;
esac