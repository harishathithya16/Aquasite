export default function StatCard({ title, value, icon, colorClass, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}