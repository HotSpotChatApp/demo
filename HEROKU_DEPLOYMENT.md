# Heroku Deployment Guide

## Step 1: Install Heroku CLI

### Option A: Direct Download (Recommended)
1. Visit: https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
2. Download the Windows 64-bit installer
3. Run the installer and follow the prompts
4. Restart your terminal/VS Code after installation

### Option B: Using Chocolatey
If you have Chocolatey installed:
```powershell
choco install heroku-cli
```

### Option C: Using NPM
```powershell
npm install -g heroku
```

After installation, verify by running:
```powershell
heroku --version
```

## Step 2: Login to Heroku

```powershell
heroku login
```

This will open a browser window for authentication.

## Step 3: Create a Heroku App

```powershell
heroku create your-videochat-app-name
```

Replace `your-videochat-app-name` with your desired app name (must be unique).

## Step 4: Initialize Git and Commit Files

```powershell
git init
git add .
git commit -m "Initial commit"
```

## Step 5: Deploy to Heroku

```powershell
git push heroku main
```

If you're on master branch instead of main:
```powershell
git push heroku master
```

## Step 6: Open Your App

```powershell
heroku open
```

Your app will be live at: `https://your-videochat-app-name.herokuapp.com`

## Troubleshooting

If deployment fails, check logs:
```powershell
heroku logs --tail
```

## Important Notes

- Heroku free tier has limited hours per month
- Your app URL will be: `https://your-app-name.herokuapp.com`
- HTTPS is automatically provided (required for WebRTC)
- Share the URL with friends to test

## Quick Deploy Script

Run these commands in order:

```powershell
# 1. Install Heroku CLI (if not installed)
winget install Heroku.HerokuCLI

# 2. Restart terminal, then login
heroku login

# 3. Create app (choose unique name)
heroku create my-random-videochat

# 4. Commit code
git add .
git commit -m "Deploy video chat app"

# 5. Deploy
git push heroku main

# 6. Open app
heroku open
```
