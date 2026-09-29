import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ShieldCheck, AlertTriangle, TrendingUp, AlertCircle, Image as ImageIcon } from 'lucide-react';
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

export default function Dashboard() {
  const [interventions, setInterventions] = useState([]);
  const [imgErrorMap, setImgErrorMap] = useState({});

  useEffect(() => {
    const fetchInterventions = async () => {
      let fetchedData = [];
      
      try {
        const response = await fetch('http://localhost:5000/api/interventions');
        if (response.ok) {
          const data = await response.json();
          fetchedData = data.reverse(); // Reverse to show newest first
        }
      } catch (error) {
        console.warn("Database offline. Falling back to local data only.");
      }

      // HACKATHON MAGIC: Inject the latest upload from sessionStorage into the Dashboard!
      const savedUpload = sessionStorage.getItem('drishti_analysis_data');
      if (savedUpload) {
        const latest = JSON.parse(savedUpload);
        
        // Check if this local upload is already in the database
        const alreadyExists = fetchedData.some(item => String(item.id) === String(latest.id));
        
        if (!alreadyExists) {
          // Format it to match the database structure and push it to the top of the list
          const injectedAsset = {
            id: latest.id,
            type: latest.type,
            lat: latest.lat,
            lng: latest.lng,
            integrity_score: latest.integrity_score,
            image_url: latest.originalImage // Use the Base64 image from Upload
          };
          fetchedData = [injectedAsset, ...fetchedData];
        }
      }

      setInterventions(fetchedData);
    };
    
    fetchInterventions();
  }, []);

  // 3-Tier classification logic
  const getStatusDetails = (score) => {
    if (score >= 80) return { label: 'Verified', color: 'text-green-700 bg-green-100 border border-green-200' };
    if (score >= 60) return { label: 'Needs Review', color: 'text-yellow-700 bg-yellow-100 border border-yellow-200' };
    return { label: 'Flagged', color: 'text-red-700 bg-red-100 border border-red-200' };
  };

  // Calculate stats for the top cards
  const verifiedAssets = interventions.filter(i => i.integrity_score >= 80).length;
  const reviewAssets = interventions.filter(i => i.integrity_score >= 60 && i.integrity_score < 80).length;
  const flaggedAssets = interventions.filter(i => i.integrity_score < 60).length;

  const handleImageError = (id) => {
    setImgErrorMap(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in bg-slate-50 p-4 rounded-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Watershed Overview</h1>
      </div>

      {/* TOP STATS: 4-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Verified Assets</p>
            <p className="text-2xl font-black text-gray-800">{verifiedAssets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><AlertCircle size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Needs Review</p>
            <p className="text-2xl font-black text-gray-800">{reviewAssets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Flagged Anomalies</p>
            <p className="text-2xl font-black text-gray-800">{flaggedAssets}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg NDVI Growth</p>
            <p className="text-2xl font-black text-gray-800">+14.2%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Section */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Spatial Verification View</h3>
          <div className="bg-white p-2 rounded-xl border shadow-sm h-[450px] relative z-0">
            <MapContainer center={[13.0827, 80.2707]} zoom={9} className="w-full h-full rounded-lg">
              <TileLayer 
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                attribution="Tiles &copy; Esri"
              />
              {interventions.map((asset) => {
                const lat = Number(asset.lat);
                const lng = Number(asset.lng);
                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <Marker key={asset.id} position={[lat, lng]}>
                    <Popup className="font-sans">
                      <strong className="text-sm">{asset.type}</strong><br/>
                      <span className="text-xs text-gray-600">Integrity: {asset.integrity_score}%</span>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Recent Uploads Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Recent Uploads</h3>
          <div className="bg-white rounded-xl border shadow-sm h-[450px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {interventions.map((asset) => {
              const status = getStatusDetails(asset.integrity_score);
              const hasImgError = imgErrorMap[asset.id];
              
              return (
                <div key={asset.id} className="flex space-x-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="w-20 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 border shadow-sm flex items-center justify-center">
                    {(asset.image_url && !hasImgError) ? (
                      <img 
                        src={asset.image_url} 
                        alt={asset.type} 
                        className="w-full h-full object-cover" 
                        onError={() => handleImageError(asset.id)}
                      />
                    ) : (
                      <ImageIcon className="text-gray-400 opacity-50" size={24} />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-bold text-sm text-gray-800 leading-tight truncate">{asset.type}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 mb-1.5 font-mono">
                      Integrity Match: {asset.integrity_score}%
                    </p>
                    <div>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {interventions.length === 0 && (
              <div className="text-center text-gray-400 text-sm mt-10">
                No recent uploads found.
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}