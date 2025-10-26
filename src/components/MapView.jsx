import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for highlighted marker
const highlightedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map bounds when records change
function MapBoundsUpdater({ records }) {
  const map = useMap();

  useEffect(() => {
    if (records.length > 0) {
      const bounds = L.latLngBounds(
        records.map(r => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [records, map]);

  return null;
}

export default function MapView({ records, onPinClick, highlightedRecordId }) {
  const markerRefs = useRef({});

  const handleMarkerClick = (recordId) => {
    onPinClick?.(recordId);
    // Open popup for the clicked marker
    if (markerRefs.current[recordId]) {
      markerRefs.current[recordId].openPopup();
    }
  };

  // Calculate center position
  const centerLat = records.reduce((sum, r) => sum + r.latitude, 0) / records.length;
  const centerLng = records.reduce((sum, r) => sum + r.longitude, 0) / records.length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="map-container">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsUpdater records={records} />

        {records.map((record) => (
          <Marker
            key={record.id}
            position={[record.latitude, record.longitude]}
            icon={highlightedRecordId === record.id ? highlightedIcon : new L.Icon.Default()}
            eventHandlers={{
              click: () => handleMarkerClick(record.id)
            }}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[record.id] = ref;
              }
            }}
          >
            <Popup>
              <div className="map-popup">
                <img 
                  src={record.photo_url} 
                  alt={record.location}
                  className="popup-image"
                />
                <h4>{record.location}</h4>
                <p className="popup-date">{formatDate(record.travel_date)}</p>
                {record.notes && (
                  <p className="popup-notes">{record.notes.substring(0, 100)}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

