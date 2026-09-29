import { Download } from 'lucide-react';
import InterventionCard from '../components/InterventionCard';
import { interventions } from '../data/dummyData';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Impact Reports</h1>
          <p className="text-gray-600">Generated AI evaluations for recent watershed interventions.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition">
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-6">
        {interventions.map((item) => (
          <InterventionCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}