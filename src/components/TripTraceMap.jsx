import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { geocodingService } from '../lib/geocoding';
import 'leaflet/dist/leaflet.css';

// Component to update map bounds
function MapBoundsUpdater({ records }) {
  const map = useMap();

  useEffect(() => {
    if (records.length > 0) {
      const bounds = L.latLngBounds(
        records.map(r => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 6 });
    }
  }, [records, map]);

  return null;
}

// Custom CSS for dark map
const mapStyle = `
  .leaflet-container {
    background: #0A0718 !important;
  }
  
  .leaflet-tile {
    filter: brightness(0.3) contrast(1.2) saturate(0.5) hue-rotate(200deg);
  }
  
  .leaflet-control-zoom {
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px);
  }
  
  .leaflet-control-zoom a {
    background: transparent !important;
    color: #F6C24B !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
  
  .leaflet-control-zoom a:hover {
    background: rgba(246, 194, 75, 0.1) !important;
  }
  
  .leaflet-control-attribution {
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(10px);
    color: #808080 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 10px !important;
  }
  
  .leaflet-control-attribution a {
    color: #F6C24B !important;
  }
`;

export default function TripTraceMap({ records, onPinClick, highlightedRecordId }) {
  const [styleInjected, setStyleInjected] = useState(false);
  const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);
  const [geocodedRecords, setGeocodedRecords] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!styleInjected) {
      const style = document.createElement('style');
      style.innerHTML = mapStyle;
      document.head.appendChild(style);
      setStyleInjected(true);
    }
  }, [styleInjected]);

  // 地理编码记录
  useEffect(() => {
    const geocodeRecords = async () => {
      if (records.length > 0) {
        const geocoded = await geocodingService.batchReverseGeocode(records);
        setGeocodedRecords(geocoded);
      }
    };
    geocodeRecords();
  }, [records]);

  const handleMarkerClick = (recordId) => {
    onPinClick?.(recordId);
  };

  // 获取地理编码后的位置信息
  const getGeocodedLocation = (record) => {
    const geocodedRecord = geocodedRecords.find(gr => gr.id === record.id);
    if (geocodedRecord && geocodedRecord.geocodedLocation) {
      return geocodingService.formatLocation(geocodedRecord.geocodedLocation);
    }
    return record.location; // 回退到原始位置信息
  };

  // Calculate center position
  const centerLat = records.reduce((sum, r) => sum + r.latitude, 0) / records.length;
  const centerLng = records.reduce((sum, r) => sum + r.longitude, 0) / records.length;

  // Sort records by date to draw paths chronologically
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.travel_date) - new Date(b.travel_date)
  );

  // Create path coordinates
  const pathCoordinates = sortedRecords.map(r => [r.latitude, r.longitude]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate total distance (approximate)
  const calculateDistance = () => {
    let total = 0;
    for (let i = 0; i < sortedRecords.length - 1; i++) {
      const lat1 = sortedRecords[i].latitude;
      const lon1 = sortedRecords[i].longitude;
      const lat2 = sortedRecords[i + 1].latitude;
      const lon2 = sortedRecords[i + 1].longitude;
      
      // Haversine formula (approximate)
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  };

  const totalDistance = calculateDistance();

  return (
    <div className="triptrace-map-container">
      {/* Legend Panel - Collapsible */}
      <div className={`triptrace-legend ${isLegendCollapsed ? 'collapsed' : ''}`}>
        <div className="legend-header">
          <h3 className="logo-text-legend">
            {!isLegendCollapsed && 'TripTrace Network'}
          </h3>
          <button 
            className="legend-toggle"
            onClick={() => setIsLegendCollapsed(!isLegendCollapsed)}
            title={isLegendCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
        
        {!isLegendCollapsed && (
          <div className="legend-content">
            <div className="legend-stats">
              <div className="stat-row">
                <span className="stat-label">Total Journeys</span>
                <span className="stat-value">{records.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Mapped Locations</span>
                <span className="stat-value">{records.length}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Distance</span>
                <span className="stat-value">{totalDistance.toFixed(0)} km</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">First Journey</span>
                <span className="stat-value">
                  {formatDate(sortedRecords[0].travel_date)}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Latest Journey</span>
                <span className="stat-value">
                  {formatDate(sortedRecords[sortedRecords.length - 1].travel_date)}
                </span>
              </div>
            </div>
            <div className="legend-footer">
              <div className="legend-marker gold"></div>
              <span>Active Node</span>
              <div className="legend-marker violet"></div>
              <span>Journey Path</span>
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater records={records} />

        {/* Journey Paths */}
        {pathCoordinates.length > 1 && (
          <>
            <Polyline
              positions={pathCoordinates}
              pathOptions={{
                color: '#D57CF9',
                weight: 2,
                opacity: 0.6,
                dashArray: '5, 10',
                className: 'journey-path'
              }}
            />
            <Polyline
              positions={pathCoordinates}
              pathOptions={{
                color: '#D57CF9',
                weight: 6,
                opacity: 0.2,
                className: 'journey-path-glow'
              }}
            />
          </>
        )}

        {/* Location Nodes */}
        {records.map((record, index) => {
          const isHighlighted = highlightedRecordId === record.id;
          const isFirst = index === 0;
          const isLast = index === sortedRecords.length - 1;
          
          return (
            <CircleMarker
              key={record.id}
              center={[record.latitude, record.longitude]}
              radius={isHighlighted ? 12 : 8}
              pathOptions={{
                fillColor: isHighlighted ? '#F6C24B' : (isFirst || isLast) ? '#F6C24B' : '#D57CF9',
                fillOpacity: isHighlighted ? 1 : 0.8,
                color: isHighlighted ? '#F6C24B' : 'rgba(255, 255, 255, 0.6)',
                weight: isHighlighted ? 3 : 2,
                className: `triptrace-node ${isHighlighted ? 'highlighted' : ''} ${isFirst ? 'first-node' : ''} ${isLast ? 'last-node' : ''}`
              }}
              eventHandlers={{
                click: () => handleMarkerClick(record.id),
                mouseover: (e) => {
                  e.target.setRadius(12);
                  e.target.setStyle({ fillOpacity: 1 });
                },
                mouseout: (e) => {
                  if (!isHighlighted) {
                    e.target.setRadius(8);
                    e.target.setStyle({ fillOpacity: 0.8 });
                  }
                }
              }}
            >
              <Popup className="triptrace-popup">
                <div className="popup-content-dark">
                  <img 
                    src={record.photo_url} 
                    alt={getGeocodedLocation(record)}
                    className="popup-image-dark"
                  />
                  <h4 className="popup-title-dark">{getGeocodedLocation(record)}</h4>
                  <p className="popup-date-dark">{formatDate(record.travel_date)}</p>
                  {record.notes && (
                    <p className="popup-notes-dark">{record.notes.substring(0, 100)}</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Total Distance Display */}
      <div className="distance-display">
        <div className="distance-label">Journey Distance</div>
        <div className="distance-value">{totalDistance.toLocaleString('en-US', { maximumFractionDigits: 0 })} km</div>
      </div>
    </div>
  );
}

