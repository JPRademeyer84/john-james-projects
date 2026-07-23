#!/bin/bash
# Setup script for deployment credentials
# This script helps configure Supabase, Vercel, and GitHub access

echo "=========================================="
echo "JOHN JAMES PROJECTS - CREDENTIAL SETUP"
echo "=========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "Checking required tools..."
echo ""

if ! command_exists git; then
    echo "❌ git not found - please install git"
    exit 1
fi
echo "✅ git found"

if ! command_exists node; then
    echo "❌ node not found - please install Node.js"
    exit 1
fi
echo "✅ node found ($(node --version))"

if ! command_exists npm; then
    echo "❌ npm not found - please install npm"
    exit 1
fi
echo "✅ npm found ($(npm --version))"

echo ""
echo "=========================================="
echo "SUPABASE CONFIGURATION"
echo "=========================================="
echo ""

# Supabase credentials
echo "Please provide your Supabase credentials:"
echo "You can find these at: https://supabase.com/dashboard/project/fgubaqoftdeefcakejwu/settings/api"
echo ""

read -p "Supabase Project URL (default: https://fgubaqoftdeefcakejwu.supabase.co): " SUPABASE_URL
SUPABASE_URL=${SUPABASE_URL:-https://fgubaqoftdeefcakejwu.supabase.co}

read -p "Supabase Anon Key: " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Supabase Anon Key is required"
    exit 1
fi

read -sp "Supabase Service Role Key (for migrations): " SUPABASE_SERVICE_KEY
echo ""

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Supabase Service Role Key is required for database migrations"
    exit 1
fi

# Create .env.local file
echo ""
echo "Creating .env.local file..."
cat > .env.local <<EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Project Configuration
VITE_PROJECT_ID=2
EOF

echo "✅ .env.local created"

# Create .env file for Supabase CLI
cat > .env <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY
EOF

echo "✅ .env created for Supabase CLI"

echo ""
echo "=========================================="
echo "GITHUB CONFIGURATION"
echo "=========================================="
echo ""

# Check if already authenticated
if git config --get user.email >/dev/null 2>&1; then
    echo "✅ Git already configured"
    echo "   User: $(git config --get user.name)"
    echo "   Email: $(git config --get user.email)"
else
    echo "Configuring Git..."
    read -p "Your name: " GIT_NAME
    read -p "Your email: " GIT_EMAIL
    
    git config --global user.name "$GIT_NAME"
    git config --global user.email "$GIT_EMAIL"
    
    echo "✅ Git configured"
fi

echo ""
echo "=========================================="
echo "VERCEL CONFIGURATION"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command_exists vercel; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI already installed"
fi

echo ""
echo "To authenticate with Vercel, run:"
echo "  vercel login"
echo ""

echo "=========================================="
echo "SETUP COMPLETE"
echo "=========================================="
echo ""
echo "Credentials have been saved to:"
echo "  - .env.local (frontend environment)"
echo "  - .env (Supabase CLI)"
echo ""
echo "Next steps:"
echo "  1. Run: npm install"
echo "  2. Run: ./deploy/run-migrations.sh (to setup database)"
echo "  3. Run: npm run dev (to test locally)"
echo "  4. Run: vercel --prod (to deploy)"
echo ""
