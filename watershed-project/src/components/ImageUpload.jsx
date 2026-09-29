import { UploadCloud } from 'lucide-react';

export default function ImageUpload() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
      <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700">Upload Bhuvan Drishti Image</h3>
      <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
        Drag and drop geo-tagged field photos here. EXIF metadata (GPS, Timestamp) will be automatically extracted.
      </p>
      <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Browse Files
      </button>
    </div>
  );
}