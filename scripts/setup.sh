#!/bin/bash

# MindForge Development Setup Script

echo "🚀 Setting up MindForge development environment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install $1 first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "📋 Checking prerequisites..."
check_tool "node"
check_tool "npm"
check_tool "python3"
check_tool "git"

# Setup frontend
echo "📱 Setting up React Native frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Setup backend
echo "🐍 Setting up FastAPI backend..."
cd ../backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Python virtual environment created"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please update .env file with your API keys"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update backend/.env with your API keys"
echo "2. Set up Supabase database (import database/schema.sql)"
echo "3. Start backend: cd backend && source venv/bin/activate && python main.py"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "📚 For more details, check README.md"
