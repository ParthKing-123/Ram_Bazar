import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useCustomerStore from '../../store/useCustomerStore';
import api from '../../services/api';
import { AlertTriangle, Loader2, MapPin, LocateFixed } from 'lucide-react';

// ─── Store Constants ──────────────────────────────────────────────────────────
const STORE_LAT = 16.8352;
const STORE_LNG = 74.3151;
const MAX_DELIVERY_KM = 10;

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
const ComingSoonScreen = ({ onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-brand-700 via-brand-800 to-emerald-900 flex flex-col items-center justify-center px-6 text-center">
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
    <p className="text-white/75 text-base leading-relaxed mb-6 max-w-xs">
      Our delivery is currently limited to within <span className="text-white font-bold">{MAX_DELIVERY_KM} km</span> of Padmavati Super Bazar, Pethvadgaon.
    </p>
    <p className="text-white/60 text-sm mb-8 max-w-xs">
      We're working hard to expand. Stay tuned — we'll be in your area soon! 🚀
    </p>
    <div className="space-y-3 w-full max-w-xs">
      <a
        href="https://wa.me/919028535600?text=Hi!%20I%20am%20outside%20your%20delivery%20zone.%20Please%20notify%20me%20when%20you%20expand%20to%20my%20area."
        target="_blank" rel="noreferrer"
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
    <p className="text-white/40 text-xs mt-8">Padmavati super bazar · Pethvadgaon, Maharashtra</p>
  </div>
);

// ─── Main Auth Component ──────────────────────────────────────────────────────
const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, setCustomer } = useCustomerStore();

  // Start on "register" tab if coming from /onboarding, else "login"
  const [tab, setTab] = useState(location.pathname === '/onboarding' ? 'register' : 'login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Login state ──
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ── Register state ──
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '', password: '', confirmPassword: '' });
  const [locating, setLocating] = useState(false);
  const [detectedCoords, setDetectedCoords] = useState(null);
  const [locationStep, setLocationStep] = useState(false);
  const [tooFar, setTooFar] = useState(false);

  useEffect(() => {
    if (customer) navigate('/');
  }, [customer, navigate]);

  useEffect(() => {
    setError('');
  }, [tab]);

  if (customer) return null;

  // ── Location check ──────────────────────────────────────────────────────────
  // formDataToSave is passed in — account is created ONLY after location is confirmed
  const checkLocationAndProceed = async (formDataToSave) => {
    setLocationStep(true);

    const finishSuccess = async () => {
      try {
        const res = await api.post('/customers', formDataToSave);
        setCustomer(res.data);
        navigate('/');
      } catch (err) {
        setLocationStep(false);
        setError(err.response?.data?.message || 'Failed to create account.');
      }
    };

    const failLocation = () => { setTooFar(true); setLocationStep(false); };

    if (detectedCoords) {
      const dist = haversineDistance(detectedCoords.lat, detectedCoords.lng, STORE_LAT, STORE_LNG);
      if (dist <= MAX_DELIVERY_KM) finishSuccess(); else failLocation();
      return;
    }

    const lowerAddress = formDataToSave.address.toLowerCase();
    const VALID_LOCAL_AREAS = [
      'peth vadgaon', 'pethvadgaon', 'vadgaon', 'wathar', 'kini', 'ambap',
      'minche', 'talsande', 'latawade', 'bhendavade', 'bhadole', 'hatkanangale',
      'savarde', 'nagaon', 'toap', 'shiye', 'atharv'
    ];
    if (VALID_LOCAL_AREAS.some(area => lowerAddress.includes(area))) {
      finishSuccess(); return;
    }

    try {
      const cleanAddr = formDataToSave.address.replace(/maharashtra/ig, '').replace(/india/ig, '').replace(/,,/g, ',').trim();
      const query = encodeURIComponent(`${cleanAddr}, Maharashtra, India`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9', 'User-Agent': 'RamBazarLocalApp/1.0' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const dist = haversineDistance(parseFloat(data[0].lat), parseFloat(data[0].lon), STORE_LAT, STORE_LNG);
        if (dist > MAX_DELIVERY_KM) failLocation(); else finishSuccess();
      } else {
        failLocation();
      }
    } catch {
      failLocation();
    }
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported by your browser'); return; }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setDetectedCoords({ lat: latitude, lng: longitude });
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.display_name) setFormData(prev => ({ ...prev, address: data.display_name }));
          else setError('Could not get address from location');
        } catch { setError('Failed to fetch address details'); }
        finally { setLocating(false); }
      },
      () => { setError('Location permission denied'); setLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  // ── Login submit ─────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/customers/login', { phone: loginPhone, password: loginPassword });
      setCustomer(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  // ── Register submit ──────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits.'); return;
    }
    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Email must end with @gmail.com'); return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      // Step 1: Check phone/email uniqueness without creating the account
      await api.post('/customers/check', { phone: formData.phone, email: formData.email });
      setLoading(false);
      // Step 2: Location check — account created inside finishSuccess only if location passes
      checkLocationAndProceed(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // ── Screens ──────────────────────────────────────────────────────────────────
  if (tooFar) return <ComingSoonScreen onBack={() => { setTooFar(false); setLocationStep(false); }} />;

  if (locationStep) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-6">
      <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
      <h2 className="text-xl font-bold text-gray-900">Checking your location…</h2>
      <p className="text-gray-500 text-sm max-w-xs">Verifying delivery availability in your area.</p>
    </div>
  );

  const inputClass = "appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-brand-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-3xl leading-none -mt-1">R</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 tracking-tight">
          Padmavati super bazar
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-soft sm:rounded-2xl sm:px-8 border border-gray-100">
          {/* Tab Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" required autoFocus placeholder="9876543210" value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" required placeholder="••••••••" value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex justify-center btn-primary disabled:opacity-70 disabled:cursor-not-allowed mt-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
              </button>
              <p className="text-center text-sm text-gray-500 pt-1">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-brand-600 font-medium hover:underline">
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
                <p className="text-xs text-brand-800">We deliver within <strong>10 km</strong> of Padmavati Super Bazar, Pethvadgaon.</p>
              </div>

              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" required placeholder="Ram Kumar" value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="tel" required placeholder="9876543210 (10 digits)" maxLength={10} value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" required placeholder="yourname@gmail.com" value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
                <p className="mt-1 text-xs text-gray-400">Must be a @gmail.com address</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={labelClass.replace('mb-1', '')}>Delivery Address</label>
                  <button type="button" onClick={handleAutoLocate} disabled={locating}
                    className="text-xs text-brand-600 font-medium flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md transition-colors hover:bg-brand-100">
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <LocateFixed className="w-3.5 h-3.5"/>}
                    {locating ? 'Locating...' : 'Auto-detect'}
                  </button>
                </div>
                <textarea rows="2" required placeholder="House number, Street name, Landmark" value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className={inputClass + ' resize-none'} />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <input type="password" required placeholder="Min. 6 characters" value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Confirm Password</label>
                <input type="password" required placeholder="••••••••" value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className={inputClass} />
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex justify-center btn-primary disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account & Continue'}
              </button>

              <p className="text-center text-sm text-gray-500 pt-1">
                Already registered?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-brand-600 font-medium hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
