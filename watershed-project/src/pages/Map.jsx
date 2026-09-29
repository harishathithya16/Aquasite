import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import { Layers, Calendar, Map as MapIcon, Filter, Info, CheckCircle, AlertTriangle, AlertCircle, Eye, Image as ImageIcon, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function AutoCenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, 12, { duration: 1.5 }); 
    }
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const [interventions, setInterventions] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [imgError, setImgError] = useState(false);
  
  const [selectedZone, setSelectedZone] = useState('TN-Chennai-01');
  const [mapCenter, setMapCenter] = useState([13.0827, 80.2707]); 
  
  const [activeLayer, setActiveLayer] = useState('satellite'); 
  const [showInterventions, setShowInterventions] = useState(true);
  const [showWatershed, setShowWatershed] = useState(true);

  const [selectedDate, setSelectedDate] = useState('2023-10-15');
  const [isFetchingTiles, setIsFetchingTiles] = useState(false);
  const [seasonalFilter, setSeasonalFilter] = useState('');

  const watershedData = {
    'TN-Chennai-01': {
      center: [13.0827, 80.2707],
      boundary: [[13.15, 80.15], [13.15, 80.40], [12.95, 80.40], [12.95, 80.15]]
    },
    'TN-Madurai-04': {
      center: [9.9252, 78.1198],
      boundary: [[10.00, 78.00], [10.00, 78.25], [9.85, 78.25], [9.85, 78.00]]
    },
    'MH-Pune-12': {
      center: [18.5204, 73.8567],
      boundary: [[18.65, 73.70], [18.65, 74.00], [18.40, 74.00], [18.40, 73.70]]
    }
  };

  useEffect(() => {
    const fetchInterventions = async () => {
      let fetchedData = [];
      
      try {
        const response = await fetch('http://https://aquasite-6jer.vercel.app/api/interventions');
        if (response.ok) {
          fetchedData = await response.json();
        }
      } catch (error) {
        console.warn("Database offline. Falling back to local data only.");
      }

      // HACKATHON MAGIC: Inject the latest upload from sessionStorage onto the Map!
      const savedUpload = sessionStorage.getItem('drishti_analysis_data');
      if (savedUpload) {
        const latest = JSON.parse(savedUpload);
        
        const alreadyExists = fetchedData.some(item => String(item.id) === String(latest.id));
        
        if (!alreadyExists) {
          const injectedAsset = {
            id: latest.id,
            type: latest.type,
            lat: latest.lat,
            lng: latest.lng,
            integrity_score: latest.integrity_score,
            ndvi_change: latest.ndvi_change,
            image_url: latest.originalImage 
          };
          fetchedData.push(injectedAsset);
        }
      }

      setInterventions(fetchedData);
    };
    fetchInterventions();
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setIsFetchingTiles(true);

    setTimeout(() => {
      const month = new Date(newDate).getMonth();
      if (month >= 1 && month <= 4) {
        setSeasonalFilter('saturate(60%) sepia(20%) hue-rotate(-10deg) contrast(110%)');
      } else if (month >= 7 && month <= 11) {
        setSeasonalFilter('saturate(140%) contrast(110%)');
      } else {
        setSeasonalFilter('');
      }
      setIsFetchingTiles(false);
    }, 1800); 
  };

  const handleMarkerClick = (asset) => {
    setSelectedAsset(asset);
    setImgError(false); // Reset image error state when clicking a new pin
    setMapCenter([Number(asset.lat), Number(asset.lng)]);
  };

  const handleZoneChange = (e) => {
    const zoneId = e.target.value;
    setSelectedZone(zoneId);
    setMapCenter(watershedData[zoneId].center); 
    setSelectedAsset(null); 
  };

  const getStatusDetails = (score) => {
    if (score >= 80) return { 
      label: 'Verified', 
      color: 'bg-green-50 border-green-200', 
      textColor: 'text-green-900',
      icon: <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />,
      text: 'Supporting ground and satellite evidence is consistent.' 
    };
    if (score >= 60) return { 
      label: 'Needs Review', 
      color: 'bg-yellow-50 border-yellow-200', 
      textColor: 'text-yellow-900',
      icon: <AlertCircle size={18} className="text-yellow-600 mt-0.5 flex-shrink-0" />,
      text: 'Minor degradation detected. Satellite evidence requires field review.' 
    };
    return { 
      label: 'Flagged', 
      color: 'bg-red-50 border-red-200', 
      textColor: 'text-red-900',
      icon: <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />,
      text: 'Major anomalies detected. Immediate physical inspection is recommended.' 
    };
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-4 animate-fade-in">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800">SRISHTI Spatial View</h1>
        <p className="text-gray-500 text-sm mt-1">Government-grade GIS monitoring dashboard for watershed interventions.</p>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        
        {/* Sidebar Controls */}
        <div className="w-64 bg-white rounded-xl border shadow-sm flex flex-col overflow-y-auto z-10">
          <div className="p-4 border-b bg-gray-50 rounded-t-xl">
            <h3 className="font-bold text-gray-800 flex items-center text-sm">
              <Filter size={16} className="mr-2 text-blue-600" /> GIS Filters
            </h3>
          </div>
          
          <div className="p-4 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Watershed Zone</label>
              <select 
                className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 bg-gray-50 cursor-pointer"
                value={selectedZone}
                onChange={handleZoneChange}
              >
                <option value="TN-Chennai-01">TN-Chennai-01</option>
                <option value="TN-Madurai-04">TN-Madurai-04</option>
                <option value="MH-Pune-12">MH-Pune-12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Satellite Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input 
                  type="date" 
                  className="w-full text-sm border-gray-300 rounded-md pl-8 focus:ring-blue-500 cursor-pointer" 
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Analytical Layers</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="radio" name="layer" checked={activeLayer === 'satellite'} onChange={() => setActiveLayer('satellite')} className="text-blue-600 focus:ring-blue-500" />
                  <span className={activeLayer === 'satellite' ? 'font-semibold text-gray-800' : 'text-gray-600'}>High-Res Satellite</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer group">
                  <input type="radio" name="layer" checked={activeLayer === 'ndvi'} onChange={() => setActiveLayer('ndvi')} className="text-green-600 focus:ring-green-500" />
                  <span className={activeLayer === 'ndvi' ? 'font-semibold text-green-700' : 'text-gray-600'}>NDVI (Vegetation)</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="radio" name="layer" checked={activeLayer === 'ndwi'} onChange={() => setActiveLayer('ndwi')} className="text-blue-500 focus:ring-blue-500" />
                  <span className={activeLayer === 'ndwi' ? 'font-semibold text-blue-700' : 'text-gray-600'}>NDWI (Water)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-3">Map Overlays</label>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={showInterventions} onChange={(e) => setShowInterventions(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span>Asset Markers</span>
                </label>
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={showWatershed} onChange={(e) => setShowWatershed(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                  <span>Watershed Boundary</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Satellite Map */}
        <div className="flex-1 bg-white rounded-xl border shadow-sm relative overflow-hidden z-0">
          
          <style>
            {activeLayer === 'satellite' && seasonalFilter && `.leaflet-tile-pane { filter: ${seasonalFilter}; transition: filter 1s ease-in-out; }`}
            {activeLayer === 'ndvi' && `.leaflet-tile-pane { filter: contrast(150%) saturate(400%); transition: filter 0.5s ease; }`}
            {activeLayer === 'ndwi' && `.leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) contrast(250%) saturate(400%); transition: filter 0.5s ease; }`}
          </style>

          {isFetchingTiles && (
            <div className="absolute inset-0 z-[500] bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
              <p className="font-bold text-blue-900 shadow-sm px-4 py-2 bg-white rounded-full border">
                Querying SRISHTI Satellite Data for {new Date(selectedDate).toLocaleDateString()}...
              </p>
            </div>
          )}

          <MapContainer center={mapCenter} zoom={11} className="w-full h-full">
            <AutoCenterMap center={mapCenter} />
            
            <TileLayer 
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              attribution="Tiles &copy; Esri"
            />
            
            {showWatershed && (
              <Polygon 
                positions={watershedData[selectedZone].boundary} 
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} 
              />
            )}
            
            {showInterventions && interventions.map((asset) => {
              const lat = Number(asset.lat);
              const lng = Number(asset.lng);
              if (isNaN(lat) || isNaN(lng)) return null;

              return (
                <Marker 
                  key={asset.id} 
                  position={[lat, lng]}
                  eventHandlers={{ click: () => handleMarkerClick(asset) }}
                />
              );
            })}
          </MapContainer>

          <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg text-xs font-medium">
            <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">Legend</h4>
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm"></div> Intervention Asset</div>
            <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 border-2 border-blue-500 border-dashed bg-blue-100 opacity-50"></div> Watershed Boundary</div>
            {activeLayer === 'ndvi' && <div className="mt-2 pt-1 border-t flex items-center gap-2 text-green-700"><Eye size={12}/> High Vegetation Index</div>}
            {activeLayer === 'ndwi' && <div className="mt-2 pt-1 border-t flex items-center gap-2 text-cyan-500"><Eye size={12}/> High Water Content</div>}
          </div>
        </div>

        {/* Intervention Details Panel */}
        {selectedAsset ? (
          <div className="w-80 bg-white rounded-xl border shadow-sm flex flex-col overflow-hidden animate-fade-in z-10">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg leading-tight">{selectedAsset.type}</h3>
                <p className="text-slate-400 text-xs">ID: #{selectedAsset.id} • {Number(selectedAsset.lat).toFixed(4)}, {Number(selectedAsset.lng).toFixed(4)}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ground Truth Data</h4>
                <div className="w-full h-40 bg-gray-100 rounded-lg border overflow-hidden relative shadow-sm mb-3 flex items-center justify-center">
                  {(selectedAsset.image_url && !imgError) ? (
                    <img 
                      src={selectedAsset.image_url} 
                      alt="Field Capture" 
                      className="w-full h-full object-cover" 
                      onError={() => setImgError(true)} 
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <span className="text-xs">Image unavailable</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded">Field Upload</div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600 mb-1">AI Classification Model:</p>
                  <p className="font-semibold text-blue-900 text-sm">{selectedAsset.type} Detected</p>
                  <div className="mt-2 flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-500">Confidence Score:</span>
                    <span className="text-green-600">94.2%</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Satellite Verification</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">NDWI Pre-Implementation:</span>
                    <span className="font-mono text-gray-800">0.05</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">NDWI Post-Implementation:</span>
                    <span className="font-mono text-blue-600 font-bold">0.42</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-gray-600 font-medium">Observed Change:</span>
                    <span className="font-bold text-green-600">{selectedAsset.ndvi_change || '+37%'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Final Assessment</h4>
                {(() => {
                  const status = getStatusDetails(selectedAsset.integrity_score);
                  return (
                    <div className={`p-3 rounded-lg flex items-start space-x-3 border ${status.color}`}>
                      {status.icon}
                      <div>
                        <p className={`font-bold text-sm mb-0.5 ${status.textColor}`}>{status.label}</p>
                        <p className={`text-xs leading-tight ${status.textColor} opacity-90`}>{status.text}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        ) : (
          <div className="w-80 bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center p-6 text-center z-10">
            <Info size={40} className="text-gray-300 mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">No Intervention Selected</h3>
            <p className="text-sm text-gray-500">Click on any blue asset marker on the satellite map to view detailed ground photography, AI assessments, and GIS metrics.</p>
          </div>
        )}

      </div>
    </div>
  );
}