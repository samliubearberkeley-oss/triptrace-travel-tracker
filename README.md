# Travel Tracker 🌍

A beautiful React + Vite app for tracking your travel memories with photos, locations, dates, and notes. Built with InsForge as the backend.

## ✨ Features

- 📸 **Photo Upload** - Upload travel photos with automatic EXIF data extraction
- 📍 **Location Tracking** - Store location names and GPS coordinates
- 📅 **Date Management** - Automatically extract dates from photo EXIF data
- 📝 **Notes** - Add personal notes to each travel memory
- 🔐 **Authentication** - Email/password and OAuth (Google, GitHub) sign-in
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 🖼️ **Gallery View** - Browse your travel memories in a stunning grid layout
- 🔍 **Detail View** - Click on any memory to see full details

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- An InsForge account and backend instance

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd travel_tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your InsForge backend URL:**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_INSFORGE_URL=https://your-insforge-backend-url.insforge.app
   ```
   
   Replace `your-insforge-backend-url.insforge.app` with your actual InsForge backend URL.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🗄️ Backend Structure

The app uses InsForge with the following backend setup:

### Database Table: `travel_records`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to user |
| photo_url | TEXT | URL of the uploaded photo |
| photo_key | TEXT | Storage key for the photo |
| location | TEXT | Location name or description |
| latitude | DECIMAL | GPS latitude (optional) |
| longitude | DECIMAL | GPS longitude (optional) |
| travel_date | DATE | Date of the travel |
| notes | TEXT | User notes (optional) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### Storage Bucket

- **Name:** `travel-photos`
- **Type:** Public bucket for storing travel photos

### Row Level Security (RLS)

- ✅ All users can read all travel records
- ✅ Authenticated users can insert their own records
- ✅ Users can update their own records
- ✅ Users can delete their own records

## 🎯 Usage

### Sign Up / Sign In

1. Open the app in your browser
2. Choose to sign up with email/password or use OAuth (Google/GitHub)
3. After authentication, you'll be redirected to your travel gallery

### Add a Travel Memory

1. Click the **"+ Add Memory"** button in the header
2. Upload a photo (EXIF data will be automatically extracted if available)
3. Fill in the location, date, and optional notes
4. GPS coordinates will be auto-filled if present in the photo's EXIF data
5. Click **"Add Travel Memory"** to save

### View Your Memories

- Browse your travel memories in the gallery view
- Click on any memory card to see full details
- View the full-size photo, location, date, GPS coordinates, and notes

### Delete a Memory

1. Click on a memory to open the detail view
2. Click the **"Delete Memory"** button
3. Confirm the deletion

### Sign Out

Click the **"Sign Out"** button in the header to log out

## 🛠️ Technologies Used

- **Frontend:**
  - React 18
  - Vite
  - exifr (EXIF data extraction)

- **Backend:**
  - InsForge (Backend-as-a-Service)
  - PostgreSQL (managed by InsForge)
  - Storage (managed by InsForge)

- **Authentication:**
  - Email/Password
  - OAuth (Google, GitHub)

## 📁 Project Structure

```
travel_tracker/
├── src/
│   ├── components/
│   │   ├── Auth.jsx           # Authentication component
│   │   ├── UploadForm.jsx     # Photo upload form with EXIF extraction
│   │   └── TravelGallery.jsx  # Gallery and detail views
│   ├── lib/
│   │   └── insforge.js        # InsForge client configuration
│   ├── App.jsx                # Main app component
│   ├── App.css                # App styles
│   ├── index.css              # Global styles
│   └── main.jsx               # App entry point
├── .env                       # Environment variables (create this)
├── package.json
└── README.md
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_INSFORGE_URL` | Your InsForge backend URL | Yes |

## 📸 EXIF Data Support

The app automatically extracts the following data from uploaded photos:

- **Date Taken** - Uses `DateTimeOriginal`, `DateTime`, or `CreateDate` from EXIF
- **GPS Coordinates** - Extracts latitude and longitude if available
- **Location** - Displays GPS coordinates as a fallback location

## 🎨 Customization

### Styling

All styles are in `src/App.css`. You can customize:
- Color scheme (CSS variables at the top of the file)
- Layout and spacing
- Animations and transitions

### Features

To add more features:
1. Extend the `travel_records` table schema
2. Update the `UploadForm.jsx` component
3. Update the `TravelGallery.jsx` component to display new data

## 🐛 Troubleshooting

### "Network Error" when uploading

- Check that your `.env` file has the correct `VITE_INSFORGE_URL`
- Ensure your InsForge backend is running
- Verify the `travel-photos` bucket exists in your InsForge storage

### EXIF data not extracted

- Ensure the photo has EXIF metadata (some processed/edited photos may not)
- The app will use current date as fallback if no EXIF date is found

### Authentication not working

- Verify your InsForge backend URL is correct
- Check that OAuth providers are properly configured in your InsForge backend

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 💬 Support

For issues related to:
- **Frontend**: Check the browser console for errors
- **Backend**: Check your InsForge backend logs
- **General Help**: Open an issue in this repository

---

Built with ❤️ using [InsForge](https://insforge.com)
