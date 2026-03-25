import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';

// Padmavati Super Bazar, Pethvadgaon coordinates
const STORE_LAT = 16.8352;
const STORE_LNG = 74.3151;
const MAX_DELIVERY_KM = 10;

// Haversine formula — returns distance in km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Coming Soon Screen ───────────────────────────────────────────────────────
const ComingSoonScreen = ({ distanceKm, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-800 to-emerald-900 flex flex-col items-center justify-center px-6 text-center">
    {/* Animated map pin */}
    <div className="relative mb-8">
      <div className="w-28 h-28 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <MapPin className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-black text-sm">!</span>
      </div>
    </div>

    <h1 className="text-3xl font-black text-white mb-3 leading-tight">
      We're Coming to<br />Your Area Soon!
    </h1>

    <p className="text-white/75 text-base leading-relaxed mb-2 max-w-xs">
      Our delivery is currently limited to within <span className="text-white font-bold">{MAX_DELIVERY_KM} km</span> of Padmavati Super Bazar, Pethvadgaon.
    </p>

    {distanceKm && (
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 mb-6">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Your distance from store</p>
        <p className="text-white font-black text-2xl">{distanceKm.toFixed(1)} km</p>
      </div>
    )}

    <p className="text-white/60 text-sm mb-8 max-w-xs">
      We're working hard to expand our delivery network. Stay tuned — we'll be available in your location very soon! 🚀
    </p>

    <div className="space-y-3 w-full max-w-xs">
      <a
        href="https://wa.me/919028535600?text=Hi!%20I%20am%20outside%20your%20delivery%20zone.%20Please%20notify%20me%20when%20you%20expand%20to%20my%20area."
        target="_blank"
        rel="noreferrer"
        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3.5 px-6 rounded-2xl transition-colors shadow-lg"
      >
        💬 Notify Me on WhatsApp
      </a>
      <button
        onClick={onBack}
        className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3.5 px-6 rounded-2xl transition-colors"
      >
        ← Change Details
      </button>
    </div>

    <p className="text-white/40 text-xs mt-8">Ram Bazar · Pethvadgaon, Maharashtra</p>
  </div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { customer, setCustomer } = useCustomerStore();

  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationStep, setLocationStep] = useState(false); // true = checking location
  const [savedCustomer, setSavedCustomer] = useState(null);
  const [tooFar, setTooFar] = useState(false);
  const [userDistance, setUserDistance] = useState(null);

  useEffect(() => {
    if (customer) navigate('/');
  }, [customer, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const checkLocationAndProceed = async (cust) => {
    setLocationStep(true);

    try {
      // Use the raw address with Maharashtra, India to allow addresses outside Pethvadgaon
      let query = encodeURIComponent(`${formData.address}, Maharashtra, India`);
      let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent': 'RamBazarLocalApp/1.0'
        }
      });
      
      let data = await response.json();

      // If full address isn't found, Nominatim returns empty. Fallback to just the city/last part:
      const parts = formData.address.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      if ((!data || data.length === 0) && parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        query = encodeURIComponent(`${lastPart}, Maharashtra, India`);
        response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'RamBazarLocalApp/1.0'
          }
        });
        data = await response.json();
      }

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        let dist = haversineDistance(lat, lon, STORE_LAT, STORE_LNG);

        // Try getting real driving distance via OSRM (OpenStreetMap Routing)
        try {
          const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${STORE_LNG},${STORE_LAT};${lon},${lat}?overview=false`);
          const routeData = await routeRes.json();
          if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
            // Distance is in meters, converting to km
            dist = routeData.routes[0].distance / 1000;
          }
        } catch (routeErr) {
          console.warn('OSRM routing failed, falling back to Haversine distance', routeErr);
        }

        setUserDistance(dist);
        
        if (dist > MAX_DELIVERY_KM) {
          setTooFar(true);
          setLocationStep(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding failed, allowing through as fallback:', err);
      // Fallback: benefit of the doubt, allow through
    }

    setCustomer(cust);
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/customers', formData);
      const cust = response.data;
      setSavedCustomer(cust);
      setLoading(false);
      checkLocationAndProceed(cust);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  if (customer) return null;

  // ── Too Far screen ──
  if (tooFar) {
    return (
      <ComingSoonScreen
        distanceKm={userDistance}
        onBack={() => { setTooFar(false); setLocationStep(false); }}
      />
    );
  }

  // ── Location checking spinner ──
  if (locationStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
        <h2 className="text-xl font-bold text-gray-900">Checking your location…</h2>
        <p className="text-gray-500 text-sm max-w-xs">
          We're verifying delivery availability in your area. Please allow location access if prompted.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-brand-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-3xl leading-none -mt-1">R</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome to Ram Bazar
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your details to start ordering
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Location info banner */}
            <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
              <p className="text-xs text-brand-800">
                We deliver within <strong>10 km</strong> of Padmavati Super Bazar, Pethvadgaon. We'll check your location after you sign up.
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1">
                <input id="name" name="name" type="text" required autoFocus placeholder="Ram Kumar" value={formData.name} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1">
                <input id="phone" name="phone" type="tel" required placeholder="9876543210" value={formData.phone} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input id="email" name="email" type="email" required placeholder="ram@example.com" value={formData.email} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
              <div className="mt-1">
                <textarea id="address" name="address" rows="3" required placeholder="House number, Street name, Landmark" value={formData.address} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white resize-none" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input id="password" name="password" type="password" required placeholder="••••••••" value={formData.password} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Re-enter Password</label>
              <div className="mt-1">
                <input id="confirmPassword" name="confirmPassword" type="password" required placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full flex justify-center btn-primary disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? 'Saving...' : 'Continue to Shopping'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already registered?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
