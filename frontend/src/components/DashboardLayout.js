import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:px-8 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-2xl mr-4">
            ☰
          </button>
          <h1 className="text-xl font-semibold text-gray-800">School Management Portal</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
