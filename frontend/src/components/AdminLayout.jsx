import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/dashboard?tab=products', icon: Package },
    { name: 'Orders', path: '/admin/dashboard?tab=orders', icon: ShoppingCart },
  ];

  // Basic check for simple hiding header on login
  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop / Top Nav for Mobile */}
      <aside className="bg-white w-full md:w-64 md:border-r border-gray-200 md:flex-shrink-0 flex flex-col shadow-sm md:h-screen sticky top-0 z-40">
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg leading-none -mt-0.5">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Admin</span>
          </div>
          {/* Mobile Logout Button (next to logo) */}
          <Link to="/" className="md:hidden flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-xl">
             <LogOut className="h-5 w-5" />
          </Link>
        </div>
        
        <nav className="px-4 py-3 md:py-4 flex flex-row md:flex-col gap-2 overflow-x-auto border-b border-gray-100 md:border-none md:flex-1 hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            let isActive = false;
            
            // Clean logic for determining active tab from search params
            const currentTab = new URLSearchParams(location.search).get('tab');
            if (item.path === '/admin/dashboard' && !currentTab) isActive = true;
            if (item.path.includes(`tab=${currentTab}`)) isActive = true;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-2.5 md:py-3 text-sm font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-2.5 md:mr-3 h-[18px] w-[18px] md:h-5 md:w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Logout Button */}
        <div className="hidden md:block p-4 border-t border-gray-100 mt-auto">
           <Link
                to="/"
                className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 text-red-500" />
                Exit to App
            </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
