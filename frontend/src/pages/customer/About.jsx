import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, Shield, Heart, Truck, ExternalLink, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import useLanguageStore from '../../store/useLanguageStore';

const About = () => {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { icon: Star, value: '20+', labelKey: 'yearsOfTrust', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { icon: Heart, value: '10000+', labelKey: 'happyCustomers', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    { icon: Shield, value: '100%', labelKey: 'qualityAssured', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { icon: Truck, value: 'Fast', labelKey: 'delivery', color: 'text-brand-500', bg: 'bg-brand-50', border: 'border-brand-200' },
  ];

  const categories = [
    { emoji: '🛒', key: 'grocery', desc: 'Fresh daily essentials' },
    { emoji: '🌾', key: 'provision', desc: 'Quality grains & pulses' },
    { emoji: '🏠', key: 'household', desc: 'Cleaning & supplies' },
    { emoji: '🧺', key: 'looseGrocery', desc: 'Custom quantities' },
    { emoji: '🧳', key: 'travelAccessories', desc: 'On-the-go items' },
    { emoji: '✨', key: 'personalCare', desc: 'Beauty & hygiene' },
  ];

  const contacts = [
    { name: 'Amit Kulkarni', role: 'Store Manager', phone: '9028535600', whatsapp: '919028535600' },
    { name: 'Ashish Mehta', role: 'Support Lead', phone: '9028533002', whatsapp: '919028533002' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 font-sans selection:bg-brand-200 selection:text-brand-900">

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      {/* Hero Banner Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-800 z-10 shadow-2xl rounded-b-[2.5rem] lg:rounded-b-[4rem]">
        {/* Abstract Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4v-2h20v2H20v2h20v2H20v2h20v2H20v2h20v2H20v2h20v2H20v2h20v-2H20v-2h20v-2H20v-2h20v-2H20v-2h20v-2H20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

        <div className="relative px-6 pt-10 pb-16 max-w-4xl mx-auto flex flex-col items-center text-center">
          <button
            onClick={() => navigate('/')}
            className="absolute top-6 left-6 inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all duration-300 hover:scale-105"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 ml-[-2px]" />
          </button>

          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} mt-8`}>
            <div className="inline-flex items-center justify-center p-1.5 bg-white/10 backdrop-blur-md rounded-3xl mb-6 shadow-lg border border-white/20">
              <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                <img src="/logo.jpg" alt="Padmavati super bazar Logo" className="w-full h-full object-cover" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Padmavati super bazar
            </h1>
            <p className="text-brand-100 text-lg md:text-xl mt-3 font-medium max-w-md mx-auto leading-relaxed">
              Serving the Pethvadgaon community with quality products since 2004.
            </p>

            <div className="flex items-center justify-center gap-2 mt-6 bg-white/10 w-fit mx-auto px-5 py-2.5 rounded-full backdrop-blur-sm border border-white/10">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={`star-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-sm" />
                ))}
              </div>
              <span className="text-white text-sm font-semibold tracking-wide ml-1">{t('trustedSince')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 -mt-10 space-y-8">

        {/* Stats Section */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 transform transition-all duration-1000 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {stats.map(({ icon: Icon, value, labelKey, color, bg, border }, idx) => (
            <div key={labelKey} className={`bg-white rounded-3xl p-5 text-center shadow-xl shadow-gray-200/40 border border-gray-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group`}>
              <div className={`w-12 h-12 mx-auto ${bg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="font-black text-2xl text-gray-900 tracking-tight">{value}</div>
              <div className="text-sm text-gray-500 font-medium mt-1">{t(labelKey)}</div>
            </div>
          ))}
        </div>

        {/* Our Story Section */}
        <div className={`bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-gray-200/40 border border-gray-100 transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl">📖</div>
            <h2 className="text-2xl font-bold text-gray-900">{t('ourStory')}</h2>
          </div>
          <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
            <p className="text-base">{t('storyP1')}</p>
            <p className="text-base">{t('storyP2')}</p>
            <div className="bg-brand-50 p-5 rounded-2xl border border-brand-100 flex items-start gap-4 mt-6">
              <CheckCircle2 className="w-6 h-6 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-brand-900 text-sm font-semibold">{t('storyP3')}</p>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className={`bg-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-gray-200/40 border border-gray-100 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-900">{t('whatWeOffer')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(({ emoji, key, desc }) => (
              <div key={key} className="group bg-[#F8F9FA] hover:bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center cursor-default">
                <span className="text-4xl mb-3 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300 drop-shadow-sm">{emoji}</span>
                <span className="text-base font-bold text-gray-900 mb-1">{t(key) || key}</span>
                <span className="text-xs text-gray-500 font-medium">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid for Location and Contact */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Location & Hours */}
          <div className={`space-y-8 transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('findUs')}</h2>
              </div>

              <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-100 mb-5 relative group-hover:shadow-md transition-shadow">
                <iframe
                  title="Padmavati super bazar Location"
                  src="https://maps.google.com/maps?q=Pethvadgaon,Maharashtra&t=&z=14&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale-[0.2] contrast-[1.1]"
                />
              </div>

              <div className="bg-[#F8F9FA] rounded-2xl p-4 mb-5 border border-gray-100">
                <h3 className="font-bold text-gray-900">Padmavati super bazar</h3>
                <p className="text-gray-500 text-sm mt-1 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  {t('pethvadgaon')}
                </p>
              </div>

              <a
                href="https://maps.app.goo.gl/krznerZPoD5sghEW8"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200"
              >
                <ExternalLink className="w-4 h-4" /> {t('openGoogleMaps')}
              </a>
            </div>

            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t('storeHours')}</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-[#F8F9FA] rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" /> {t('Monday To Sunday')}
                  </span>
                  <span className="text-sm font-black text-brand-700 tracking-wide">9:00 AM – 8:00 PM</span>
                </div>
                {/* <div className="flex justify-between items-center p-4 bg-[#F8F9FA] rounded-xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300" /> {t('sunday')}
                  </span>
                  <span className="text-sm font-black text-gray-500 tracking-wide">9:00 AM – 6:00 PM</span>
                </div> */}
                <div className="text-center pt-2">
                  <p className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {t('onlineAvailable')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className={`bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-100 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} h-fit`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('forMoreInfo')}</h2>
            </div>

            <p className="text-sm text-gray-500 mb-6 font-medium">Have questions about your order or our products? We're here to help.</p>

            <div className="space-y-4">
              {contacts.map(({ name, role, phone, whatsapp }) => (
                <div key={name} className="bg-[#F8F9FA] hover:bg-white rounded-2xl p-5 border border-gray-100 hover:border-brand-200 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                      <p className="text-brand-600 text-xs font-bold uppercase tracking-wider mt-0.5">{role}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href={`tel:${phone}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-brand-100 hover:border-brand-500 hover:bg-brand-50 text-brand-700 text-sm font-bold py-2.5 rounded-xl transition-all"
                    >
                      <Phone className="w-4 h-4" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold py-2.5 rounded-xl transition-all shadow-sm shadow-green-200"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className={`text-center py-8 transform transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-flex items-center justify-center p-2 bg-gray-100 rounded-2xl mb-4">
            <span className="text-gray-900 font-bold px-4 tracking-tight">Padmavati super bazar</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">© {new Date().getFullYear()} Padmavati super bazar, Pethvadgaon.</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1 font-medium">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for the community
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
