#!/bin/bash
echo ""
echo "=== Setting up Face Analyst AI ==="
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file
echo ""
echo "Enter your Anthropic API key (starts with sk-ant-):"
read -r API_KEY
echo "ANTHROPIC_API_KEY=$API_KEY" > .env
echo "API key saved!"

# Start the app
echo ""
echo "=== Starting the app ==="
echo "Open this link in your browser: http://localhost:3000/face"
echo ""
npm run dev
