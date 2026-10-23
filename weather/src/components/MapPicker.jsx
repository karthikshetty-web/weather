import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Navigation, Search, Loader2, Check, Layers } from 'lucide-react';
import { reverseGeocode, searchCities, getNearbyAreas } from '../services/api';

// Custom Glowing Pin SVG for Leaflet
const customPinIcon = L.divIcon({
  className: 'custom-map-pin',
  html: `
    <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
      <div style="width: 32px; height: 32px; border-radius: 50% 50% 50% 0; background: linear-gradient(135deg, #0284c7, #38bdf8); transform: rotate(-45deg); box-shadow: 0 0 16px rgba(56, 189, 248, 0.9); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #ffffff;"></div>
      </div>
      <div style="position: absolute; bottom: -5px; left: 8px; width: 16px; height: 6px; border-radius: 50%; background: rgba(0,0,0,0.5); filter: blur(2px);"></div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Real map tile providers with NO API KEY required
const MAP_LAYERS = {
  streets: {
    name: 'Real Street Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  satellite: {
    name: 'Real Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
  terrain: {
    name: 'Topographic Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
  },
};

export default function MapPicker({ isOpen, onClose, currentCity, onSelectLocation }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('streets'); // 'streets', 'satellite', 'terrain'
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [nearbyList, setNearbyList] = useState([]);
  const [mapSearch, setMapSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  // Initial coords from currentCity or default
  const initLat = currentCity?.latitude || 40.7128;
  const initLon = currentCity?.longitude || -74.006;

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initLat, initLon],
        zoom: 12,
        zoomControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add Official OpenStreetMap Real Tiles (100% Free, NO API key)
      const initialLayerConfig = MAP_LAYERS[mapStyle];
      const tileLayer = L.tileLayer(initialLayerConfig.url, {
        attribution: initialLayerConfig.attribution,
        maxZoom: initialLayerConfig.maxZoom,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const marker = L.marker([initLat, initLon], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng();
        handleUpdateCoords(lat, lng, map, false);
      });

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleUpdateCoords(lat, lng, map, false);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode
      handleUpdateCoords(initLat, initLon, map, false);
    } else {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);
    }
  }, [isOpen]);

  // Switch Layer (Streets vs Satellite vs Terrain)
  const handleChangeLayer = (layerKey) => {
    setMapStyle(layerKey);
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const cfg = MAP_LAYERS[layerKey];
    const newLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  };

  const handleUpdateCoords = async (lat, lng, map = mapInstanceRef.current, pan = true) => {
    setSelectedCoords({ lat, lng });
    setResolving(true);

    if (pan && map) {
      map.flyTo([lat, lng], 13, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    try {
      const info = await reverseGeocode(lat, lng);
      setPlaceInfo(info);

      // Also get nearby sectors
      const nearby = await getNearbyAreas(lat, lng);
      setNearbyList(nearby);
    } catch (e) {
      console.warn('Geocode failed:', e);
      setPlaceInfo({ name: `Area (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`, latitude: lat, longitude: lng });
    } finally {
      setResolving(false);
    }
  };

  // Click "Near Me" GPS
  const handleGPSNearMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        handleUpdateCoords(latitude, longitude, mapInstanceRef.current, true);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not access GPS. Please ensure location permissions are granted in your browser settings.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Search inside map
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!mapSearch.trim()) return;
    const items = await searchCities(mapSearch);
    setSearchResults(items);
  };

  const handleSelectSearchResult = (item) => {
    setSearchResults([]);
    setMapSearch('');
    handleUpdateCoords(item.latitude, item.longitude, mapInstanceRef.current, true);
  };

  const handleConfirmLocation = () => {
    if (!placeInfo && !selectedCoords) return;
    const finalCity = {
      name: placeInfo?.name || 'Selected Location',
      admin1: placeInfo?.admin1 || '',
      country: placeInfo?.country || '',
      latitude: selectedCoords?.lat || initLat,
      longitude: selectedCoords?.lng || initLon,
      timezone: placeInfo?.timezone || 'auto',
    };
    onSelectLocation(finalCity);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        backgroundColor: 'rgba(5, 10, 24, 0.92)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1080px',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                Real Interactive World Map & Nearby Picker
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Powered by OpenStreetMap. Click anywhere or drag the marker to target that spot.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleGPSNearMe}
              disabled={isLocating}
              style={{
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                borderRadius: '10px',
                padding: '6px 14px',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
              {isLocating ? 'Locating...' : 'Near By Me (GPS)'}
            </button>
            <button onClick={onClose} className="icon-btn" style={{ width: 36, height: 36 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search bar & Map Style Layer Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '0.45rem 0.8rem',
              }}
            >
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                value={mapSearch}
                onChange={(e) => setMapSearch(e.target.value)}
                placeholder="Search any town, neighborhood, landmark..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#38bdf8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: '#0f172a',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>

            {/* Search Dropdown */}
            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(15, 23, 42, 0.98)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  zIndex: 2000,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '4px',
                }}
              >
                {searchResults.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelectSearchResult(r)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      color: '#f8fafc',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <strong>{r.name}</strong>, {[r.admin1, r.country].filter(Boolean).join(', ')}
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Map Layer Switcher: Streets / Satellite / Terrain */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '3px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <button
              onClick={() => handleChangeLayer('streets')}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                background: mapStyle === 'streets' ? '#38bdf8' : 'transparent',
                color: mapStyle === 'streets' ? '#0f172a' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Street Map
            </button>
            <button
              onClick={() => handleChangeLayer('satellite')}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                background: mapStyle === 'satellite' ? '#38bdf8' : 'transparent',
                color: mapStyle === 'satellite' ? '#0f172a' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Satellite
            </button>
            <button
              onClick={() => handleChangeLayer('terrain')}
              style={{
                padding: '5px 10px',
                borderRadius: '8px',
                border: 'none',
                background: mapStyle === 'terrain' ? '#38bdf8' : 'transparent',
                color: mapStyle === 'terrain' ? '#0f172a' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Terrain
            </button>
          </div>
        </div>

        {/* Leaflet Map Frame (Real OpenStreetMap) */}
        <div
          ref={mapContainerRef}
          style={{
            flex: 1,
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            minHeight: '260px',
            position: 'relative',
          }}
        />

        {/* Nearby Areas Quick Chips */}
        {nearbyList.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              padding: '0.5rem 0',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
              Nearby Sectors:
            </span>
            {nearbyList.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleUpdateCoords(item.latitude, item.longitude, mapInstanceRef.current, true)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#cbd5e1',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}

        {/* Selected Area Confirmation Bar */}
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.85rem 1rem',
            borderRadius: '14px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
              Target Selected Location
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {resolving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Resolving address...
                </>
              ) : (
                <>
                  {placeInfo?.name || 'Selected Map Point'}
                  {placeInfo?.country && <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>({placeInfo.country})</span>}
                </>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Coords: {selectedCoords?.lat.toFixed(4)}°, {selectedCoords?.lng.toFixed(4)}°
            </div>
          </div>

          <button
            onClick={handleConfirmLocation}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
              border: 'none',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.35)',
            }}
          >
            <Check size={16} /> Load Weather for this Area
          </button>
        </div>
      </div>
    </div>
  );
}
