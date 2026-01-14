# 🚀 Quick Start Guide - AI Book Writer

## Super Easy Setup (First Time Only)

### Step 1: Get Your API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Create an API key
4. Copy it

### Step 2: Add Your API Key
1. Find the file `.env.example` in this folder
2. Copy it and rename the copy to `.env`
3. Open `.env` with any text editor (Notepad, TextEdit, etc.)
4. Replace `your_api_key_here` with your actual API key:
   ```
   REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```
5. Save and close

### Step 3: Rebuild with Your API Key
Open terminal/command prompt in this folder and run:
```bash
npm run build
```

## 📝 How to Use Daily

### Windows Users:
**Double-click:** `START_APP.bat`

### Mac Users:
**Double-click:** `START_APP.command`
(First time: Right-click → Open, then click "Open" to allow it)

### Linux Users:
**Double-click:** `START_APP.sh`
(Or run: `./START_APP.sh` in terminal)

## 🎉 What Happens:

1. A terminal window opens (don't close it!)
2. Your browser opens automatically to `http://localhost:3000`
3. Your AI Book Writer app is ready!
4. When done writing, press `Ctrl+C` in the terminal window

## 💾 Your Data

- Everything is saved automatically in your browser
- Your manuscripts are stored locally on your computer
- To backup: Use the "Export to JSON" button in the app
- To restore: Import the JSON file back

## ❓ Troubleshooting

**"serve" command not found:**
- The script will install it automatically on first run
- Or manually run: `npm install -g serve`

**App won't open:**
- Make sure Node.js is installed
- Check that you're in the correct folder
- Try running `npm install` first

**AI agents not working:**
- Make sure you completed Step 2 (API key setup)
- Make sure you rebuilt with `npm run build`
- Check your internet connection

## 🎯 Tips

- **Bookmark it:** Once opened, bookmark `http://localhost:3000` in Chrome
- **Keep terminal open:** The app only works while the terminal is running
- **Export regularly:** Use export features to backup your work
- **Dark mode:** Click "Night Mode" in the header for dark theme

---

**Need help?** Check the full README.md file for detailed documentation.

**Enjoy writing your book!** 📚✨
