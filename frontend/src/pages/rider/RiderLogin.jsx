import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import api from '../../services/api';

const RiderLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
        const response = await api.post('/auth/staff/login', { username, password });
        if (response.data.role === 'Rider' || response.data.role === 'Admin') {
            localStorage.setItem('rider_auth', 'true'); // legacy check
            localStorage.setItem('staff_token', response.data.token); // real token
            navigate('/rider/dashboard');
        } else {
            setError('Access Denied. Not a Rider.');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-md mb-4">
            <Truck className="text-white w-8 h-8" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Delivery Partner
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to manage your active deliveries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600 sm:text-sm bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-brand-600 focus:border-brand-600 sm:text-sm bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 transition-colors"
              >
                Start Delivery Shift
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RiderLogin;
