import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Truck, LogOut } from 'lucide-react';

const RiderLayout = () => {
  const location = useLocation();

  // Basic check for simple hiding header on login
  if (location.pathname === '/rider/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="bg-white w-full md:w-64 md:border-r border-gray-200 md:flex-shrink-0 flex flex-col shadow-sm md:h-screen sticky top-0 z-40">
        <div className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center mr-3">
              <Truck className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Rider</span>
          </div>
          <Link to="/" className="md:hidden flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-xl">
             <LogOut className="h-5 w-5" />
          </Link>
        </div>
        
        <nav className="px-4 py-3 md:py-4 flex flex-row md:flex-col gap-2 overflow-x-auto border-b border-gray-100 md:border-none md:flex-1 hide-scrollbar">
            <Link
              to="/rider/dashboard"
              className="flex items-center px-4 py-2.5 md:py-3 text-sm font-medium rounded-xl transition-colors whitespace-nowrap shrink-0 bg-brand-50 text-brand-700 shadow-sm"
            >
              <Truck className="mr-2.5 md:mr-3 h-[18px] w-[18px] md:h-5 md:w-5 text-brand-600" />
              Deliveries
            </Link>
        </nav>

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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full md:max-w-[100vw]">
        <div className="max-w-4xl mx-auto w-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
};

export default RiderLayout;
