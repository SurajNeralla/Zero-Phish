# Zero Phish Extension - Setup Guide

## 📦 Installation on Any System

### Prerequisites
- Google Chrome browser
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- Text editor (VS Code recommended)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Download the Extension
1. Copy the entire `hack1` folder to your new system
2. Place it anywhere (Desktop, Documents, etc.)

### Step 2: Install Backend Dependencies
```bash
cd hack1/server
npm install
```

### Step 3: Configure Environment (Optional)
If using Supabase:
1. Open `hack1/server/.env`
2. Add your Supabase credentials:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

If NOT using Supabase, skip this step - the extension will work without it.

### Step 4: Start the Backend Server
```bash
cd hack1/server
node server.js
```

You should see:
```
🚀 Zero Phish Backend Server
   🌐 Server: http://localhost:3000
   ✓ Ready
```

### Step 5: Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `hack1/extension` folder
5. The Zero Phish extension should now appear!

### Step 6: Open Dashboard
1. Click the Zero Phish extension icon
2. Click "Open Dashboard"
3. Login with PIN: `1234`

---

## 📁 Folder Structure
```
hack1/
├── extension/          # Chrome Extension files
│   ├── manifest.json
│   ├── background/
│   ├── content/
│   └── dashboard/
├── server/            # Backend API
│   ├── server.js
│   ├── package.json
│   └── .env
└── admin-dashboard/   # React Dashboard (optional)
```

---

## 🔧 Configuration

### Change Backend Port
Edit `hack1/server/server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your port
```

### Change API URL (if backend is on different machine)
Edit `hack1/extension/dashboard/main.js`:
```javascript
const API_URL = 'http://localhost:3000'; // Change to your server IP
```

---

## 🌐 Running on Different Machines

### Option 1: Same Machine (Easiest)
- Backend and Extension on the same computer
- Use `http://localhost:3000`

### Option 2: Different Machines (Network)
1. Start backend on Machine A
2. Find Machine A's IP address:
   - Windows: `ipconfig` → Look for IPv4
   - Mac/Linux: `ifconfig` → Look for inet
3. Update extension on Machine B:
   - Change API_URL to `http://MACHINE_A_IP:3000`

### Option 3: Cloud Backend (Advanced)
- Deploy backend to Vercel/Heroku/Railway
- Update API_URL to your deployed URL
- No need to run server locally

---

## 🐛 Troubleshooting

### Extension not loading?
- Make sure you selected the `extension` folder, not `hack1`
- Check Chrome console for errors (F12)

### Backend not starting?
- Run `npm install` in the server folder
- Check if port 3000 is already in use
- Try a different port

### Dashboard not connecting?
- Verify backend is running (`http://localhost:3000`)
- Check browser console for CORS errors
- Ensure API_URL matches your backend

---

## 📝 Notes

- **PIN Login**: Default PIN is `1234` (hardcoded)
- **Data Storage**: Uses Supabase if configured, otherwise logs to console
- **Port**: Default is 3000, can be changed
- **CORS**: Enabled for all origins (development mode)

---

## 🎯 What Works Without Supabase

✅ Extension loads and runs
✅ Phishing detection
✅ Redirect tracking
✅ Dashboard UI
✅ Theme toggle
❌ Data persistence (reports won't be saved)
❌ Statistics (will show 0)

To enable full functionality, set up Supabase (see SUPABASE_SETUP.md)
