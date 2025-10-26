import { useState, useEffect } from 'react';
import { insforge } from '../lib/insforge';
import { geocodingService } from '../lib/geocoding';
import TripTraceMap from './TripTraceMap';

export default function TravelHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState(null);
  const [viewMode, setViewMode] = useState('both'); // 'timeline', 'map', 'both'
  const [geocodedRecords, setGeocodedRecords] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError('');

    try {
      // Get current user first
      const { data: userData } = await insforge.auth.getCurrentUser();
      if (!userData?.user?.id) {
        setError('You must be logged in to view your travel history');
        setLoading(false);
        return;
      }

      // Query only current user's records
      const { data, error } = await insforge.database
        .from('travel_records')
        .select('*')
        .eq('user_id', userData.user.id)  // 🔒 Only show current user's data
        .order('travel_date', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to load records');
      }

      const recordsData = data || [];
      setRecords(recordsData);

      // 对包含GPS坐标的记录进行地理编码
      const recordsWithGPS = recordsData.filter(r => r.latitude && r.longitude);
      if (recordsWithGPS.length > 0) {
        const geocoded = await geocodingService.batchReverseGeocode(recordsWithGPS);
        setGeocodedRecords(geocoded);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Group records by month and year
  const groupedRecords = records.reduce((groups, record) => {
    const date = new Date(record.travel_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    
    if (!groups[key]) {
      groups[key] = {
        label,
        records: [],
        year: date.getFullYear(),
        month: date.getMonth()
      };
    }
    
    groups[key].records.push(record);
    return groups;
  }, {});

  const sortedGroups = Object.entries(groupedRecords).sort((a, b) => b[0].localeCompare(a[0]));

  const handleRecordClick = (record) => {
    setSelectedRecord(record);
    setHighlightedRecordId(record.id);
  };

  const handleMapPinClick = (recordId) => {
    setHighlightedRecordId(recordId);
    // Scroll to the record in timeline
    const element = document.getElementById(`record-${recordId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // 获取地理编码后的位置信息
  const getGeocodedLocation = (record) => {
    const geocodedRecord = geocodedRecords.find(gr => gr.id === record.id);
    if (geocodedRecord && geocodedRecord.geocodedLocation) {
      return geocodingService.formatLocation(geocodedRecord.geocodedLocation);
    }
    return record.location; // 回退到原始位置信息
  };

  if (loading) {
    return <div className="loading">Loading travel history...</div>;
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
        <h3>No Travel History Yet</h3>
        <p>Start adding your travel photos to see your journey timeline!</p>
      </div>
    );
  }

  const recordsWithGPS = records.filter(r => r.latitude && r.longitude);

  return (
    <div className="travel-history">
      <div className="history-header">
        <div>
          <h2>Travel History</h2>
          <p className="history-stats">
            {records.length} {records.length === 1 ? 'trip' : 'trips'} • 
            {recordsWithGPS.length > 0 && ` ${recordsWithGPS.length} mapped`}
          </p>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="8" y1="6" x2="21" y2="6"/>
              <line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Timeline
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            disabled={recordsWithGPS.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Map
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'both' ? 'active' : ''}`}
            onClick={() => setViewMode('both')}
            disabled={recordsWithGPS.length === 0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Both
          </button>
        </div>
      </div>

      <div className={`history-content ${viewMode}`}>
        {(viewMode === 'timeline' || viewMode === 'both') && (
          <div className="timeline-view">
            {sortedGroups.map(([key, group]) => (
              <div key={key} className="timeline-group">
                <div className="timeline-group-header">
                  <h3>{group.label}</h3>
                  <span className="timeline-count">{group.records.length} {group.records.length === 1 ? 'trip' : 'trips'}</span>
                </div>
                <div className="timeline-items">
                  {group.records.map((record) => (
                    <div
                      key={record.id}
                      id={`record-${record.id}`}
                      className={`timeline-item ${highlightedRecordId === record.id ? 'highlighted' : ''}`}
                      onClick={() => handleRecordClick(record)}
                    >
                      <div className="timeline-marker"></div>
                      <div className="timeline-item-content">
                        <div className="timeline-thumbnail">
                          <img src={record.photo_url} alt={record.location} />
                        </div>
                        <div className="timeline-details">
                          <h4>{getGeocodedLocation(record)}</h4>
                          <p className="timeline-date">{formatDate(record.travel_date)}</p>
                          {record.notes && (
                            <p className="timeline-notes">{record.notes.substring(0, 100)}{record.notes.length > 100 ? '...' : ''}</p>
                          )}
                          {record.latitude && record.longitude && (
                            <div className="timeline-gps">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              <span className="location-text">{getGeocodedLocation(record)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(viewMode === 'map' || viewMode === 'both') && recordsWithGPS.length > 0 && (
          <div className="map-view-container">
            <TripTraceMap
              records={recordsWithGPS}
              onPinClick={handleMapPinClick}
              highlightedRecordId={highlightedRecordId}
            />
          </div>
        )}
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
              <h2>{getGeocodedLocation(selectedRecord)}</h2>
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
                    <span>{getGeocodedLocation(selectedRecord)}</span>
                  </div>
                )}
              </div>

              {selectedRecord.notes && (
                <div className="modal-notes">
                  <h3>Notes</h3>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

