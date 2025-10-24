#!/bin/bash

# Script to push PORR project to fst-tech-academy organization
# Usage: ./push-to-fst-tech.sh [REPOSITORY_NAME]

set -e

# Check if repository name is provided
if [ -z "$1" ]; then
    echo "❌ Error: Repository name is required"
    echo "Usage: ./push-to-fst-tech.sh [REPOSITORY_NAME]"
    echo "Example: ./push-to-fst-tech.sh porr-system"
    exit 1
fi

REPOSITORY_NAME=$1
REMOTE_URL="https://github.com/fst-tech-academy/${REPOSITORY_NAME}.git"

echo "🚀 Setting up PORR repository in fst-tech-academy organization..."
echo "📁 Repository: ${REPOSITORY_NAME}"
echo "🔗 URL: ${REMOTE_URL}"

# Remove existing fst-tech remote if it exists
if git remote get-url fst-tech >/dev/null 2>&1; then
    echo "🔄 Removing existing fst-tech remote..."
    git remote remove fst-tech
fi

# Add new remote
echo "➕ Adding fst-tech remote..."
git remote add fst-tech ${REMOTE_URL}

# Verify remote was added
echo "✅ Remote added successfully"
git remote -v

# Push main branch
echo "📤 Pushing main branch..."
if git push fst-tech main; then
    echo "✅ Main branch pushed successfully"
else
    echo "❌ Failed to push main branch"
    echo "💡 Make sure the repository exists in fst-tech-academy organization"
    exit 1
fi

# Push develop branch
echo "📤 Pushing develop branch..."
if git push fst-tech develop; then
    echo "✅ Develop branch pushed successfully"
else
    echo "❌ Failed to push develop branch"
    exit 1
fi

# Verify branches
echo "🔍 Verifying branches..."
git ls-remote fst-tech

echo ""
echo "🎉 PORR project successfully pushed to fst-tech-academy!"
echo ""
echo "📋 Repository Details:"
echo "   Organization: fst-tech-academy"
echo "   Repository: ${REPOSITORY_NAME}"
echo "   URL: ${REMOTE_URL}"
echo ""
echo "🔧 Next Steps:"
echo "   1. Configure GitHub secrets in repository settings"
echo "   2. Set up GitHub Actions workflow"
echo "   3. Test database connection"
echo "   4. Start PORR development"
echo ""
echo "📚 Documentation:"
echo "   - README.md: Project overview"
echo "   - dbsetup/REMOTE_DATABASE_SETUP.md: Database setup"
echo "   - .github/workflows/README.md: GitHub Actions guide"
