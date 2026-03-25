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
      <aside className="bg-white border-r border-gray-200 w-full md:w-64 md:flex-shrink-0 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
           <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center mr-3">
                 <span className="text-white font-bold text-lg leading-none -mt-0.5">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Admin Panel</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Basic active state check, slightly flawed with query params but okay for simple UI
            const isActive = location.pathname + location.search === item.path || 
                             (item.path === '/admin/dashboard' && location.search === '');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
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
