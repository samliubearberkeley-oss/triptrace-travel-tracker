# 🚀 Travel Tracker - Getting Started

Welcome! Your Travel Tracker app is ready to use. Follow these simple steps to get started.

---

## ⚡ Quick Start (3 Steps)

### 1️⃣ Set Your Backend URL

Create a `.env` file in this directory:

```bash
echo "VITE_INSFORGE_URL=https://your-backend-url.insforge.app" > .env
```

**🔑 Replace with your actual InsForge backend URL!**

### 2️⃣ Install & Run

```bash
npm install
npm run dev
```

### 3️⃣ Open Browser

Go to: **http://localhost:5173**

---

## ✅ What's Already Set Up

Your InsForge backend is fully configured with:

### Database
- ✅ `travel_records` table (with RLS policies)
- ✅ `users` table (for profiles)
- ✅ Indexes for fast queries
- ✅ Secure row-level security

### Storage
- ✅ `travel-photos` bucket (public)
- ✅ Ready for photo uploads

### Authentication
- ✅ Email/Password sign-in
- ✅ Google OAuth
- ✅ GitHub OAuth

---

## 📸 How to Use

### First Time
1. **Sign Up** - Create account with email or OAuth
2. **Add Memory** - Click "+ Add Memory" button
3. **Upload Photo** - Select a travel photo
4. **Auto-Extract** - Date & GPS auto-filled from EXIF (if available)
5. **Fill Details** - Add location and notes
6. **Save** - Click "Add Travel Memory"

### View Memories
- Browse your gallery of travel photos
- Click any photo to see full details
- Delete memories you no longer want

---

## 📁 Project Structure

```
travel_tracker/
├── src/
│   ├── components/
│   │   ├── Auth.jsx              # Login/Signup
│   │   ├── UploadForm.jsx        # Photo upload with EXIF
│   │   └── TravelGallery.jsx     # Gallery & details
│   ├── lib/
│   │   └── insforge.js           # Backend config
│   ├── App.jsx                   # Main app
│   └── App.css                   # Styles
├── .env                          # ⚠️ CREATE THIS!
├── README.md                     # Full documentation
├── SETUP.md                      # Setup guide
└── BACKEND_SETUP.md             # Backend details
```

---

## 🎯 Key Features

- 📸 **Photo Upload** - Drag & drop or click to upload
- 🗺️ **GPS Tracking** - Auto-extract coordinates from photos
- 📅 **Date Extraction** - Auto-detect when photo was taken
- 📝 **Notes** - Add personal memories
- 🔐 **Secure** - Your data, your access
- 🎨 **Beautiful** - Modern, responsive design
- ⚡ **Fast** - Built with Vite

---

## 🔧 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
```

---

## 📖 Need Help?

- **Setup Issues** → See [SETUP.md](./SETUP.md)
- **Backend Details** → See [BACKEND_SETUP.md](./BACKEND_SETUP.md)
- **Full Docs** → See [README.md](./README.md)

---

## 🐛 Common Issues

### ❌ "Cannot find module '@insforge/sdk'"
**Fix:** Run `npm install`

### ❌ "Failed to fetch" / Network errors
**Fix:** 
1. Check `.env` file exists
2. Verify `VITE_INSFORGE_URL` is correct
3. Restart dev server: `Ctrl+C` then `npm run dev`

### ❌ OAuth not working
**Fix:** Check OAuth is configured in your InsForge dashboard

### ❌ EXIF data not found
**Info:** Some photos don't have EXIF metadata. Manually enter date/location.

---

## 🎉 You're All Set!

Your Travel Tracker is ready to capture your adventures!

**Next Steps:**
1. Create `.env` file with your InsForge URL
2. Run `npm install && npm run dev`
3. Open browser and start uploading memories

**Happy Travels! 🌍✈️📸**

---

Built with ❤️ using [React](https://react.dev), [Vite](https://vitejs.dev), and [InsForge](https://insforge.com)

