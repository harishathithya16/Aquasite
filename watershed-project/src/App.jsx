import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Map from './pages/Map';
import Upload from './pages/Upload';
import AiInsights from './pages/AiInsights';

// Layout wrapper for pages with Sidebar and Navbar
const Layout = ({ children }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/map" element={<Layout><Map /></Layout>} />
      <Route path="/analysis" element={<Layout><Analysis /></Layout>} />
      <Route path="/upload" element={<Layout><Upload /></Layout>} />
      {/* Wrapped AiInsights inside the Layout component here */}
      <Route path="/ai-insights" element={<Layout><AiInsights /></Layout>} /> 
    </Routes>
  );
}

export default App;