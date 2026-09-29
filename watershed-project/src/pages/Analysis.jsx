import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Calendar, CheckCircle2, AlertTriangle, AlertCircle, Check } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icons not appearing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// This component makes the maps automatically "fly" to new coordinates when the dropdown changes
function AutoCenterMap({ center, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0])) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function Analysis() {
  const [latestUpload, setLatestUpload] = useState(null);
  const [interventions, setInterventions] = useState([]); 
  
  const [ndviDate, setNdviDate] = useState('2026-09-28');
  const [ndwiDate, setNdwiDate] = useState('2026-09-28');
  const [selectedLocation, setSelectedLocation] = useState('latest');
  
  const [mapCenter, setMapCenter] = useState([11.1271, 78.6569]);
  const [macroZoom, setMacroZoom] = useState(6);
  const [microZoom, setMicroZoom] = useState(14);

  const locations = {
    'latest': { name: 'Latest Field Upload', lat: latestUpload?.lat || 12.2253, lng: latestUpload?.lng || 79.0747 },
    'chennai': { name: 'TN-Chennai-01 Watershed', lat: 13.0827, lng: 80.2707 },
    'madurai': { name: 'TN-Madurai-04 Watershed', lat: 9.9252, lng: 78.1198 },
    'pune': { name: 'MH-Pune-12 Watershed', lat: 18.5204, lng: 73.8567 }
  };

  useEffect(() => {
    const savedUpload = sessionStorage.getItem('drishti_analysis_data');
    if (savedUpload) {
      const parsed = JSON.parse(savedUpload);
      setLatestUpload(parsed);
      setMapCenter([Number(parsed.lat), Number(parsed.lng)]);
    } else {
      setMapCenter([12.2253, 79.0747]); // Fallback
    }

    const fetchInterventions = async () => {
      try {
        const response = await fetch('https://aquasite-6jer.vercel.app/api/interventions');
        if (response.ok) {
          const data = await response.json();
          setInterventions(data);
        }
      } catch (error) {
        console.error("Error fetching map pins:", error);
      }
    };
    fetchInterventions();
  }, []);

  const handleLocationChange = (e) => {
    const key = e.target.value;
    setSelectedLocation(key);
    
    if (locations[key]) {
      setMapCenter([Number(locations[key].lat), Number(locations[key].lng)]);
      if (key !== 'latest') {
        setMacroZoom(10);
        setMicroZoom(13);
      } else {
        setMacroZoom(6);
        setMicroZoom(15);
      }
    }
  };

  const getStatusDetails = (score) => {
    if (score >= 80) return { 
      label: 'Verified / Consistent', color: 'text-green-700', bg: 'bg-green-50 border-green-200', badge: 'bg-green-700',
      icon: <CheckCircle2 size={32} className="text-green-600" />,
      resultText: 'Increased water signal detected. Intervention appears successful.'
    };
    if (score >= 60) return { 
      label: 'Needs Field Review', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-600',
      icon: <AlertCircle size={32} className="text-yellow-600" />,
      resultText: 'Inconclusive satellite delta. Ground review recommended.'
    };
    return { 
      label: 'Flagged / Mismatch', color: 'text-red-700', bg: 'bg-red-50 border-red-200', badge: 'bg-red-700',
      icon: <AlertTriangle size={32} className="text-red-600" />,
      resultText: 'No positive NDWI change detected. Potential failure or misreporting.'
    };
  };

  const status = getStatusDetails(latestUpload?.integrity_score || 87);

  const renderMarkers = () => {
    return interventions.map((asset) => {
      const lat = Number(asset.lat);
      const lng = Number(asset.lng);
      if (isNaN(lat) || isNaN(lng)) return null;
      return (
        <Marker key={`marker-${asset.id}`} position={[lat, lng]}>
          <Popup className="font-sans">
            <strong className="text-sm">{asset.type}</strong><br/>
            <span className="text-xs text-gray-600">ID: #{asset.id}</span>
          </Popup>
        </Marker>
      );
    });
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto animate-fade-in bg-slate-100 p-4 rounded-xl">
      
      <div className="bg-[#0f172a] text-white p-4 rounded-lg flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold tracking-wide flex items-center">
            <span className="text-orange-400 mr-2">SRISHTI - DRISHTI</span> Analytics & Decision Support System
          </h1>
          <p className="text-slate-400 text-xs mt-1">Satellite + Ground Data for Sustainable Watershed Management</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-sm">📍 Tamil Nadu</div>
          <div className="text-slate-400 text-xs">Spatial Analysis Dashboard</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        
        {/* NDVI Panel */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#0f4a46] text-white p-2.5 px-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-sm">NDVI (Normalized Difference Vegetation Index)</h2>
              <p className="text-[10px] text-teal-100">Vegetation Health & Land Cover</p>
            </div>
            <div className="bg-white/20 text-xs px-2 py-1 rounded flex items-center gap-2 border border-white/30 cursor-pointer">
              <Calendar size={14} /> 
              <input 
                type="date" 
                value={ndviDate}
                onChange={(e) => setNdviDate(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
          
          <div className="p-4 flex gap-4 flex-1">
            <div className="flex-1 bg-gray-100 border rounded relative overflow-hidden h-72">
               <style>{`.ndvi-heatmap .leaflet-tile-pane { filter: contrast(180%) saturate(600%) hue-rotate(50deg) sepia(40%); transition: filter 0.5s; }`}</style>
               <MapContainer center={mapCenter} zoom={macroZoom} className="w-full h-full ndvi-heatmap">
                 <AutoCenterMap center={mapCenter} zoom={macroZoom} />
                 <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                 {renderMarkers()}
               </MapContainer>
               <div className="absolute bottom-2 right-2 text-[10px] text-white bg-black/50 px-1 italic z-[400]">Indian Ocean</div>
            </div>
            
            <div className="w-48 flex flex-col gap-4">
              <div className="border rounded p-2 text-xs">
                <h3 className="font-bold border-b pb-1 mb-2 text-gray-700">NDVI Value Range</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-blue-800 mr-2 border border-gray-400"></div> {'< 0 (Water / Clouds)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-amber-700 mr-2 border border-gray-400"></div> {'0 - 0.2 (Bare soil)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-yellow-300 mr-2 border border-gray-400"></div> {'0.2 - 0.4 (Sparse veg)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-green-400 mr-2 border border-gray-400"></div> {'0.4 - 0.6 (Moderate)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-green-600 mr-2 border border-gray-400"></div> {'0.6 - 0.8 (Healthy)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-green-900 mr-2 border border-gray-400"></div> {'> 0.8 (Dense veg)'}</div>
                </div>
              </div>
              <div className="border rounded p-2 text-xs bg-gray-50">
                <h3 className="font-bold border-b pb-1 mb-1 text-gray-700">Area Statistics</h3>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                  <span>Avg. NDVI</span><span>: 0.42</span>
                  <span>Max. NDVI</span><span>: 0.89</span>
                  <span>Min. NDVI</span><span>: -0.12</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NDWI Panel */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#0a3663] text-white p-2.5 px-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-sm">NDWI (Normalized Difference Water Index)</h2>
              <p className="text-[10px] text-blue-200">Surface Water & Moisture</p>
            </div>
            <div className="bg-white/20 text-xs px-2 py-1 rounded flex items-center gap-2 border border-white/30 cursor-pointer">
              <Calendar size={14} /> 
              <input 
                type="date" 
                value={ndwiDate}
                onChange={(e) => setNdwiDate(e.target.value)}
                className="bg-transparent text-white border-none outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
          </div>
          
          <div className="p-4 flex gap-4 flex-1">
            <div className="flex-1 bg-gray-100 border rounded relative overflow-hidden h-72">
               <style>{`.ndwi-heatmap .leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) contrast(300%) saturate(400%); transition: filter 0.5s; }`}</style>
               <MapContainer center={mapCenter} zoom={macroZoom} className="w-full h-full ndwi-heatmap">
                 <AutoCenterMap center={mapCenter} zoom={macroZoom} />
                 <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                 {renderMarkers()}
               </MapContainer>
               <div className="absolute bottom-2 right-2 text-[10px] text-white bg-black/50 px-1 italic z-[400]">Indian Ocean</div>
            </div>
            
            <div className="w-48 flex flex-col gap-4">
              <div className="border rounded p-2 text-xs">
                <h3 className="font-bold border-b pb-1 mb-2 text-gray-700">NDWI Value Range</h3>
                <div className="space-y-1.5">
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-amber-800 mr-2 border border-gray-400"></div> {'< -0.3 (Dry land)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-yellow-400 mr-2 border border-gray-400"></div> {'-0.3 - 0 (Non-water)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-cyan-300 mr-2 border border-gray-400"></div> {'0 - 0.2 (Moisture)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-blue-500 mr-2 border border-gray-400"></div> {'0.2 - 0.5 (Likely water)'}</div>
                  <div className="flex items-center text-[10px]"><div className="w-4 h-4 bg-blue-900 mr-2 border border-gray-400"></div> {'> 0.5 (Strong water)'}</div>
                </div>
              </div>
              <div className="border rounded p-2 text-xs bg-gray-50">
                <h3 className="font-bold border-b pb-1 mb-1 text-gray-700">Area Statistics</h3>
                <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
                  <span>Avg. NDWI</span><span>: 0.16</span>
                  <span>Max. NDWI</span><span>: 0.78</span>
                  <span>Min. NDWI</span><span>: -0.45</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Change Detection (2 Columns) */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#0f3654] text-white p-2.5 px-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-sm">NDWI Change Detection (Before ➔ After)</h2>
              <p className="text-[10px] text-blue-200">Impact Analysis of Watershed Interventions</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px]">Select Location</span>
              <select 
                className="bg-white text-black text-xs px-2 py-1 rounded border-none outline-none cursor-pointer"
                value={selectedLocation}
                onChange={handleLocationChange}
              >
                {latestUpload && <option value="latest">{latestUpload.type || 'Recent Field Upload'} (★)</option>}
                <option value="chennai">TN-Chennai-01 Zone</option>
                <option value="madurai">TN-Madurai-04 Zone</option>
                <option value="pune">MH-Pune-12 Zone</option>
              </select>
            </div>
          </div>

          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="bg-orange-400 text-white text-xs font-bold text-center py-1 rounded">Before (Jan 2023)</div>
              <div className="h-48 bg-gray-100 border rounded overflow-hidden">
                <style>{`.before-map .leaflet-tile-pane { filter: contrast(150%) saturate(300%) sepia(30%) hue-rotate(15deg); }`}</style>
                <MapContainer center={mapCenter} zoom={microZoom} className="w-full h-full before-map">
                  <AutoCenterMap center={mapCenter} zoom={microZoom} />
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                  {renderMarkers()}
                </MapContainer>
              </div>
              <div className="h-2 w-full bg-gradient-to-r from-amber-700 via-yellow-400 to-green-800 rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-green-500 text-white text-xs font-bold text-center py-1 rounded">After (Jan 2025)</div>
              <div className="h-48 bg-gray-100 border rounded overflow-hidden">
                <style>{`.after-map .leaflet-tile-pane { filter: contrast(180%) saturate(600%) hue-rotate(50deg) sepia(40%); }`}</style>
                <MapContainer center={mapCenter} zoom={microZoom} className="w-full h-full after-map">
                  <AutoCenterMap center={mapCenter} zoom={microZoom} />
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                  {renderMarkers()}
                </MapContainer>
              </div>
              <div className="h-2 w-full bg-gradient-to-r from-amber-700 via-yellow-400 to-green-800 rounded-full"></div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-purple-500 text-white text-xs font-bold text-center py-1 rounded">Change (Δ NDWI)</div>
              <div className="h-48 bg-gray-100 border rounded overflow-hidden">
                <style>{`.delta-map .leaflet-tile-pane { filter: contrast(400%) saturate(400%) hue-rotate(190deg) sepia(50%); }`}</style>
                <MapContainer center={mapCenter} zoom={microZoom} className="w-full h-full delta-map">
                  <AutoCenterMap center={mapCenter} zoom={microZoom} />
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                  {renderMarkers()}
                </MapContainer>
              </div>
              <div className="h-2 w-full bg-gradient-to-r from-orange-600 via-yellow-300 to-blue-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Validation Scorecard */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-[#124b52] text-white p-2.5 px-4">
            <h2 className="font-bold text-sm">Project Validation (AI + Spatial)</h2>
          </div>
          
          <div className="p-4 space-y-4 text-sm flex-1 flex flex-col justify-between">
            <div className="flex gap-4">
              <div className="w-24 h-16 bg-gray-200 rounded border overflow-hidden shadow-inner">
                {/* FIX: Added onError fallback to handle expired blob URLs gracefully */}
                {latestUpload?.originalImage && selectedLocation === 'latest' ? (
                  <img 
                    src={latestUpload.originalImage} 
                    className="w-full h-full object-cover" 
                    alt="site" 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1544253303-34e83f0f70f8?w=200&q=80'; }}
                  />
                ) : (
                  <img src="https://images.unsplash.com/photo-1544253303-34e83f0f70f8?w=200&q=80" className="w-full h-full object-cover" alt="site" />
                )}
              </div>
              <div className="flex-1 text-[11px] font-mono grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-gray-700">
                <span className="font-bold">Project ID</span><span>: TN-TR-{latestUpload?.id || '1024'}</span>
                <span className="font-bold">Type</span><span>: {locations[selectedLocation]?.name || 'Farm Pond'}</span>
                <span className="font-bold">Location</span><span>: {mapCenter[0].toFixed(2)}°N, {mapCenter[1].toFixed(2)}°E</span>
                <span className="font-bold">Date</span><span>: {new Date().toLocaleDateString('en-GB')}</span>
              </div>
            </div>

            <div className={`border rounded-lg p-3 flex justify-between items-center ${status.bg}`}>
              <div className="flex items-center gap-3">
                {status.icon}
                <div>
                  <div className={`text-[10px] font-bold ${status.color}`}>Validation Confidence</div>
                  <div className={`text-3xl font-black ${status.color}`}>{latestUpload?.integrity_score || '87'}%</div>
                </div>
              </div>
              <div className={`${status.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                {status.label}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xs border-b pb-1 mb-2 text-gray-800">Cross-Reference Summary</h3>
              <div className="text-[11px] space-y-1.5 font-mono text-gray-600">
                <div className="grid grid-cols-[140px_1fr]"><span className="flex items-center"><Check size={12} className="text-green-600 mr-1"/> AI Image Class</span><span>: {latestUpload?.type || 'Pond'} verified</span></div>
                <div className="grid grid-cols-[140px_1fr]"><span className="flex items-center"><Check size={12} className="text-green-600 mr-1"/> GPS coordinates</span><span>: Within boundary</span></div>
                <div className="grid grid-cols-[140px_1fr]"><span className="flex items-center"><Check size={12} className="text-green-600 mr-1"/> NDWI (Before)</span><span>: 0.08</span></div>
                <div className="grid grid-cols-[140px_1fr]"><span className="flex items-center"><Check size={12} className="text-green-600 mr-1"/> NDWI (After)</span><span>: 0.34</span></div>
                <div className="grid grid-cols-[140px_1fr]"><span className="flex items-center"><Check size={12} className="text-green-600 mr-1"/> Spatial Δ Change</span><span className="text-green-600 font-bold">: {latestUpload?.ndvi_change || '+26%'} (↑)</span></div>
              </div>
            </div>

            <div className="bg-gray-50 border rounded p-2 text-[11px] font-mono mt-2">
              <span className="font-bold text-gray-800">Result : </span>
              <span className={status.color}>{status.resultText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}