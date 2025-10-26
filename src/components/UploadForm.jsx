import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import * as exifr from 'exifr';

export default function UploadForm({ onUploadSuccess }) {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractingExif, setExtractingExif] = useState(false);

  const extractExifData = async (file) => {
    setExtractingExif(true);
    try {
      const exifData = await exifr.parse(file);
      
      if (exifData) {
        // Extract date from EXIF
        if (exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate) {
          const exifDate = exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate;
          const formattedDate = new Date(exifDate).toISOString().split('T')[0];
          setDate(formattedDate);
        }

        // Extract GPS coordinates
        if (exifData.latitude && exifData.longitude) {
          setLatitude(exifData.latitude.toFixed(6));
          setLongitude(exifData.longitude.toFixed(6));
          
          // Try to reverse geocode (optional - you could add a geocoding service)
          // For now, just show coordinates
          setLocation(`${exifData.latitude.toFixed(4)}°, ${exifData.longitude.toFixed(4)}°`);
        }
      }
    } catch (err) {
      console.log('No EXIF data found or error parsing:', err);
    } finally {
      setExtractingExif(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Extract EXIF data
      await extractExifData(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      setError('Please select a photo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get current user
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (!userData?.user?.id) {
        setError('You must be logged in to upload');
        return;
      }

      // Upload photo to storage
      const fileName = `${Date.now()}-${photo.name}`;
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from('travel-photos')
        .upload(fileName, photo);

      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload photo');
      }

      // Create travel record in database
      const { data: record, error: dbError } = await insforge.database
        .from('travel_records')
        .insert([{
          user_id: userData.user.id,
          photo_url: uploadData.url,
          photo_key: uploadData.key,
          location,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          travel_date: date,
          notes: notes || null
        }])
        .select()
        .single();

      if (dbError) {
        throw new Error(dbError.message || 'Failed to create record');
      }

      // Reset form
      setPhoto(null);
      setPreview('');
      setLocation('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setLatitude('');
      setLongitude('');
      
      onUploadSuccess?.(record);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h2>Add Travel Memory</h2>
      
      {error && <div className="error-message">{error}</div>}
      {extractingExif && <div className="info-message">Extracting photo data...</div>}

      <form onSubmit={handleSubmit}>
        <div className="photo-upload">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            id="photo-input"
            disabled={loading}
            required
          />
          <label htmlFor="photo-input" className="photo-upload-label">
            {preview ? (
              <img src={preview} alt="Preview" className="photo-preview" />
            ) : (
              <div className="photo-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Click to upload photo</span>
              </div>
            )}
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            id="location"
            type="text"
            placeholder="e.g., Paris, France or GPS coordinates"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude (optional)</label>
            <input
              id="latitude"
              type="number"
              step="0.000001"
              placeholder="e.g., 48.8566"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude (optional)</label>
            <input
              id="longitude"
              type="number"
              step="0.000001"
              placeholder="e.g., 2.3522"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            placeholder="Share your thoughts about this place..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || extractingExif}>
          {loading ? 'Uploading...' : 'Add Travel Memory'}
        </button>
      </form>
    </div>
  );
}

