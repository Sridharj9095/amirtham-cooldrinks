# Upload Project to GitHub

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `amirtham-cooldrinks` (or your preferred name)
   - **Description**: "Restaurant Management System - Full Stack Application"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/amirtham-cooldrinks.git

# Rename branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Alternative: Using SSH (if you have SSH keys set up)

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin git@github.com:YOUR_USERNAME/amirtham-cooldrinks.git

# Rename branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Step 3: Verify Upload

1. Go to your GitHub repository page
2. You should see all your files uploaded
3. The README.md should be visible on the repository homepage

## Troubleshooting

### If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate a new token with `repo` permissions
3. When prompted for password, use the token instead

**Option 2: Use GitHub CLI**
```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh
# Then authenticate:
gh auth login
```

### If branch name is different:

If your default branch is `master` instead of `main`:
```bash
git branch -M main
git push -u origin main
```

## Next Steps

After uploading to GitHub, you can:
1. Deploy to Vercel (see VERCEL_DEPLOYMENT.md)
2. Set up CI/CD pipelines
3. Collaborate with team members
4. Create issues and manage the project

