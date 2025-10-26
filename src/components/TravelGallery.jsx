import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';

export default function TravelGallery({ refresh }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const loadRecords = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await insforge.database
        .from('travel_records')
        .select('*')
        .order('travel_date', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to load records');
      }

      setRecords(data || []);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this travel memory?')) {
      return;
    }

    try {
      const { error } = await insforge.database
        .from('travel_records')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message || 'Failed to delete');
      }

      setRecords(records.filter(r => r.id !== id));
      setSelectedRecord(null);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading your travel memories...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (records.length === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <h3>No Travel Memories Yet</h3>
        <p>Start adding your travel photos and create lasting memories!</p>
      </div>
    );
  }

  return (
    <>
      <div className="travel-gallery">
        <div className="gallery-header">
          <h2>Your Travel Memories</h2>
          <p className="record-count">{records.length} {records.length === 1 ? 'memory' : 'memories'}</p>
        </div>

        <div className="gallery-grid">
          {records.map((record) => (
            <div 
              key={record.id} 
              className="gallery-card"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="card-image">
                <img src={record.photo_url} alt={record.location} />
              </div>
              <div className="card-content">
                <h3>{record.location}</h3>
                <p className="card-date">{formatDate(record.travel_date)}</p>
                {record.notes && (
                  <p className="card-notes">{record.notes.substring(0, 100)}{record.notes.length > 100 ? '...' : ''}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedRecord(null)}
            >
              ×
            </button>
            
            <img 
              src={selectedRecord.photo_url} 
              alt={selectedRecord.location}
              className="modal-image"
            />
            
            <div className="modal-content">
              <h2>{selectedRecord.location}</h2>
              <div className="modal-meta">
                <div className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{formatDate(selectedRecord.travel_date)}</span>
                </div>
                
                {(selectedRecord.latitude && selectedRecord.longitude) && (
                  <div className="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{selectedRecord.latitude.toFixed(4)}°, {selectedRecord.longitude.toFixed(4)}°</span>
                  </div>
                )}
              </div>

              {selectedRecord.notes && (
                <div className="modal-notes">
                  <h3>Notes</h3>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}

              <button 
                className="btn btn-danger"
                onClick={() => handleDelete(selectedRecord.id)}
              >
                Delete Memory
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

