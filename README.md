# Random Video Chat App

A simple random video chat application similar to Omegle. Connect with strangers via video and text chat.

## Features

- 🎥 Random video chat with strangers
- 💬 Real-time text messaging during video calls
- ⏭️ Skip to next random stranger
- 📱 Responsive design

## Local Testing

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and visit:
```
http://localhost:3000
```

4. To test with a friend, both of you need to access the same deployed URL.

## Deployment Options

### Option 1: Deploy to Render (Recommended - Free)

1. Create account at [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository or upload code
4. Configure:
   - **Name**: random-video-chat
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Your app will be live at: `https://your-app-name.onrender.com`

### Option 2: Deploy to Railway

1. Create account at [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js and deploy
5. Your app will be live with a provided URL

### Option 3: Deploy to Heroku

1. Install Heroku CLI and login:
```bash
heroku login
```

2. Create a new Heroku app:
```bash
heroku create your-app-name
```

3. Deploy:
```bash
git push heroku main
```

4. Open your app:
```bash
heroku open
```

## Testing with Friends

1. Deploy using any option above
2. Share the deployment URL with your friend
3. Both visit the URL
4. Click "Start" on both devices
5. You should be matched together (if you're the only two users)

## Important Notes

- **Camera/Microphone Permission**: Users must grant browser permission for camera and microphone access
- **HTTPS Required**: WebRTC requires HTTPS in production. All deployment platforms provide HTTPS automatically
- **Browser Compatibility**: Works best on Chrome, Firefox, and Edge. Safari may have limitations
- **Firewall**: Some corporate networks may block WebRTC connections

## How It Works

1. Users click "Start" to enable camera/microphone
2. Server matches waiting users randomly
3. WebRTC establishes peer-to-peer video connection
4. Users can chat via text during video call
5. "Skip" button disconnects and finds new partner
6. "Stop" button ends the session

## Technology Stack

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: Vanilla JavaScript, WebRTC
- **Signaling**: Socket.io for WebRTC signaling
- **STUN Servers**: Google's public STUN servers

## Troubleshooting

**Videos not showing:**
- Check camera/microphone permissions in browser
- Ensure HTTPS is enabled (required for WebRTC)
- Try a different browser

**Can't connect to stranger:**
- Ensure both users have granted media permissions
- Check if firewall is blocking WebRTC
- Try refreshing the page

**Deployment issues:**
- Ensure `package.json` has correct start script
- Check that PORT environment variable is used
- Verify Node.js version compatibility

## License

MIT
