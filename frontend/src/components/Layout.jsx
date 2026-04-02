import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Upload, Receipt, Menu } from 'lucide-react';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Navigation schema for cleaner mapping
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Upload Invoice', path: '/upload', icon: <Upload size={20} /> },
    { name: 'Saved Invoices', path: '/invoices', icon: <Receipt size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Topbar */}
      <div className="md:hidden bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold tracking-tight">InvoiceAI</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-indigo-700 rounded-md transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        ${mobileMenuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-white shadow-xl md:min-h-screen border-r border-slate-200 z-10 transition-all duration-300
      `}>
        <div className="p-6 hidden md:block border-b border-slate-100">
          <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight flex items-center gap-2">
            <Receipt className="text-indigo-600" /> InvoiceAI
          </h1>
        </div>
        <ul className="mt-4 flex flex-col gap-2 p-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                // Tailwind classes for active vs inactive states
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}
                `}
                onClick={() => setMobileMenuOpen(false)} // close mobile menu on click
              >
                {item.icon}
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 animate-fade-in overflow-y-auto w-full max-w-[100vw] md:max-w-none">
        {/* Render nested routes here */}
        <Outlet />
      </main>
    </div>
  );
}
