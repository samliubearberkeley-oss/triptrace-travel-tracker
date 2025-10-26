# Quick Setup Guide

## Step 1: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
echo "VITE_INSFORGE_URL=https://your-insforge-backend-url.insforge.app" > .env
```

**Important:** Replace `your-insforge-backend-url.insforge.app` with your actual InsForge backend URL.

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Run the Development Server

```bash
npm run dev
```

## Step 4: Open in Browser

Navigate to `http://localhost:5173`

## Backend Already Configured ✅

The InsForge backend has been set up with:

- ✅ `travel_records` table with Row Level Security (RLS)
- ✅ `travel-photos` storage bucket (public)
- ✅ Authentication with Google & GitHub OAuth
- ✅ User profiles table

## First Time Usage

1. Sign up with email/password or OAuth
2. Click "Add Memory" to upload your first travel photo
3. The app will automatically extract date and GPS from EXIF data if available
4. View your memories in the gallery

## Troubleshooting

### Issue: "Failed to fetch"
- Check that `.env` file exists and has the correct `VITE_INSFORGE_URL`
- Restart the dev server after creating/modifying `.env`

### Issue: "EXIF data not found"
- Some photos don't have EXIF metadata (especially if they've been edited)
- You can manually enter the date and location

### Issue: "Authentication failed"
- Ensure your InsForge backend is running
- Check that OAuth providers are configured in InsForge dashboard

## Need Help?

Refer to the main [README.md](./README.md) for detailed documentation.

