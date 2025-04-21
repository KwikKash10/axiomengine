#!/bin/bash

# Build and Deploy Script for Checkout App (v1.7.1)

echo "🚀 Starting build and deployment process for v1.7.1..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

# Ask which platform to deploy to
echo "📣 Select deployment platform:"
echo "1. Vercel"
echo "2. Netlify"
echo "3. Both"
echo "4. Skip deployment"

read -p "Enter your choice (1-4): " deploy_choice

# Deploy based on user's choice
case $deploy_choice in
    1)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "❌ Vercel CLI is not installed. Installing..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    2)
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "❌ Netlify CLI is not installed. Installing..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    3)
        echo "🚀 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "❌ Vercel CLI is not installed. Installing..."
            npm install -g vercel
        fi
        vercel --prod
        
        echo "🚀 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "❌ Netlify CLI is not installed. Installing..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod
        ;;
    4)
        echo "⏭️ Skipping deployment."
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo "✅ Build and deployment process completed!"
echo "📝 For more information, see RELEASE_v1.7.1.md" 