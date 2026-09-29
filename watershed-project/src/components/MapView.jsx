import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Accept interventions as a prop instead of importing dummy data
export default function MapView({ interventions = [] }) {
  return (
    <div className="h-[400px] w-full bg-white rounded-lg shadow-sm border p-2">
      <MapContainer center={[18.5204, 73.8567]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://bhuvan.nrsc.gov.in">ISRO Bhuvan SRISHTI</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {interventions.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
            <Popup>
              <div className="p-1">
                <h3 className="font-bold">{item.type}</h3>
                <p className="text-sm text-gray-600">Integrity: {item.integrity_score}%</p>
                <img src={item.image_url} alt={item.type} className="w-full h-24 object-cover mt-2 rounded" />
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}