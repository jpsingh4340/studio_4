#!/bin/bash

# Setup script for RentMate development environment
# This script handles the React version dependency conflict

echo "🚀 Setting up RentMate development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies with legacy peer deps to handle React 19 compatibility
echo "📦 Installing dependencies with --legacy-peer-deps..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Run initial checks
echo "🔍 Running initial code quality checks..."

# Check if ESLint passes
echo "🔧 Running ESLint..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ ESLint checks passed"
else
    echo "⚠️  ESLint issues found. Run 'npm run lint' to see details."
fi

# Check if Prettier formatting is correct
echo "💅 Checking code formatting..."
npm run format:check > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Code formatting is correct"
else
    echo "⚠️  Code formatting issues found. Run 'npm run format' to fix."
fi

# Check if tests pass
echo "🧪 Running tests..."
npm test -- --watchAll=false --passWithNoTests > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Tests passed"
else
    echo "⚠️  Some tests failed. Run 'npm test' to see details."
fi

# Try building the project
echo "🏗️  Testing build..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
    rm -rf build  # Clean up build folder
else
    echo "⚠️  Build failed. Run 'npm run build' to see details."
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "   • Start development: npm start"
echo "   • Run tests: npm test"
echo "   • Check code quality: npm run lint"
echo "   • Format code: npm run format"
echo "   • Build for production: npm run build"
echo ""
echo "📚 For CI/CD documentation, see: CI_CD_SETUP.md"
echo "🤝 For contributing guidelines, see: CONTRIBUTING.md"
