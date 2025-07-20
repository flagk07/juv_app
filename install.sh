#!/bin/bash

# JUV Telegram WebApp Installation Script
echo "🚀 Installing JUV Telegram WebApp..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are available"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install webapp dependencies
echo "📱 Installing WebApp dependencies..."
cd webapp
npm install
cd ..

# Install bot dependencies
echo "🤖 Installing Bot dependencies..."
cd bot
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env || echo "⚠️  Please create .env file manually using .env.example as template"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Installation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'npm run setup:db' to set up database"
echo "3. Run 'npm run dev' to start development"
echo ""
echo "📖 See README.md for detailed instructions" 