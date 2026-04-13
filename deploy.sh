#!/bin/bash

# GL Assessment Analytics - Quick Deployment Script
# This script helps you prepare your app for deployment

echo "🚀 GL Assessment Analytics - Deployment Helper"
echo "================================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git not initialized. Initializing now..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if there are changes to commit
if [[ -n $(git status -s) ]]; then
    echo ""
    echo "📝 Uncommitted changes found. Creating commit..."
    git add .

    # Prompt for commit message
    read -p "Enter commit message (or press Enter for default): " commit_msg

    if [ -z "$commit_msg" ]; then
        commit_msg="Update GL Assessment Analytics - $(date +%Y-%m-%d)"
    fi

    git commit -m "$commit_msg"
    echo "✅ Changes committed"
else
    echo "✅ No uncommitted changes"
fi

# Check if remote is configured
if git remote | grep -q "origin"; then
    echo "✅ Git remote 'origin' is configured"

    # Offer to push
    echo ""
    read -p "Push to GitHub? (y/n): " push_choice

    if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
        git push origin main
        echo "✅ Pushed to GitHub"
        echo ""
        echo "🎉 Next steps:"
        echo "   1. Go to https://render.com and sign in"
        echo "   2. Click 'New +' → 'Web Service'"
        echo "   3. Connect your GitHub repository"
        echo "   4. Render will auto-deploy using render.yaml"
    fi
else
    echo "⚠️  No git remote configured"
    echo ""
    echo "📖 Next steps:"
    echo "   1. Create a GitHub repository at https://github.com/new"
    echo "   2. Run these commands:"
    echo "      git remote add origin https://github.com/YOUR_USERNAME/gl-assessment-analytics.git"
    echo "      git branch -M main"
    echo "      git push -u origin main"
    echo "   3. Then deploy to Render: https://render.com"
fi

echo ""
echo "📚 For detailed deployment instructions, see DEPLOYMENT.md"
echo ""
