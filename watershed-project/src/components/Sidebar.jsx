import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, UploadCloud, Bot } from 'lucide-react'; // <-- Imported Bot here

export default function Sidebar() {
  const location = useLocation();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'SRISHTI Map', path: '/map', icon: Map },
    { name: 'ROI Analysis', path: '/analysis', icon: BarChart3 },
    { name: 'DRISHTI Upload', path: '/upload', icon: UploadCloud },
    { name: 'AI Insights', path: '/ai-insights', icon: Bot }, // <-- Added the new page here
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6">
        <h2 className="text-2xl font-bold tracking-tight text-blue-400">AquaSite</h2>
        <p className="text-xs text-slate-400 mt-1">SIH26015 Analytical Engine</p>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path} 
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}>
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}