import { Bell, Search, UserCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-96">
        <Search className="w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search districts, interventions, or coordinates..." 
          className="bg-transparent border-none outline-none ml-2 w-full text-sm" />
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2 border-l pl-4">
          <UserCircle className="w-8 h-8 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Admin User</span>
        </div>
      </div>
    </header>
  );
}