import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <Sidebar />
      {/* Main content — on mobile add padding-top to avoid hamburger button overlap */}
      <main className="flex-1 flex flex-col overflow-hidden md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  );
}