export default function InterventionCard({ item }) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
      <img src={item.imageUrl} alt={item.type} className="w-full md:w-32 h-24 rounded object-cover" />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-gray-800 text-lg">{item.type}</h4>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            item.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {item.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Uploaded: {item.dateUploaded}</p>
        <div className="mt-3 flex gap-4 text-sm">
          <div className="bg-gray-50 px-2 py-1 rounded">
            Integrity: <span className={item.integrityScore > 80 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>{item.integrityScore}%</span>
          </div>
          <div className="bg-gray-50 px-2 py-1 rounded">
            NDVI: <span className="text-blue-600 font-bold">{item.ndviChange}</span>
          </div>
        </div>
      </div>
    </div>
  );
}