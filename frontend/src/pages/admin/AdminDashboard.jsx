import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductsTab from './ProductsTab';
import OrdersTab from './OrdersTab';
import DashboardTab from './DashboardTab';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentTab === 'dashboard' ? 'Event Management' : currentTab === 'products' ? 'Product Management' : 'Order Management'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {currentTab === 'dashboard'
            ? 'Create highlight banners and special events for users.'
            : currentTab === 'products' 
              ? 'Add, edit, and manage your inventory.' 
              : 'View and update customer orders.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {currentTab === 'dashboard' && <DashboardTab />}
        {currentTab === 'products' && <ProductsTab />}
        {currentTab === 'orders' && <OrdersTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
