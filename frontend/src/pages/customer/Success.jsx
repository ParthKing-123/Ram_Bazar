import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import useCustomerStore from '../../store/useCustomerStore';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer } = useCustomerStore();
  
  const [whatsappSent, setWhatsappSent] = useState(false);

  const orderId = location.state?.orderId;
  const total = location.state?.total;

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  const sendWhatsApp = () => {
      // Admin phone number hardcoded or from env
      const adminPhone = '919876543210'; 
      const text = `*New Order Received!*\n\n*Order ID:* ${orderId}\n*Customer:* ${customer?.name}\n*Phone:* ${customer?.phone}\n*Address:* ${customer?.address}\n\n*Total:* ₹${total}\n\nPlease check the admin panel for details.`;
      
      const encodedText = encodeURIComponent(text);
      const url = `https://wa.me/${adminPhone}?text=${encodedText}`;
      
      window.open(url, '_blank');
      setWhatsappSent(true);
  };

  useEffect(() => {
      // Auto open whatsapp on mount with slight delay
      if (orderId && !whatsappSent) {
          const timer = setTimeout(() => {
              sendWhatsApp();
          }, 1500);
          return () => clearTimeout(timer);
      }
  }, [orderId, whatsappSent]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-md w-full text-center space-y-8 animate-[slide-up_0.5s_ease-out]">
            <div className="flex justify-center">
                <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-16 w-16 text-brand-600" />
                </div>
            </div>
            
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    Order Placed!
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                    Your order #{orderId.substring(orderId.length - 6)} has been received.
                </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ul className="space-y-3 text-sm text-gray-600 mt-4">
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div>
                        We are sending your order details to the shop via WhatsApp.
                    </li>
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div>
                        The shop will confirm your order shortly.
                    </li>
                    <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0 font-bold text-xs">3</div>
                        Pay via cash or UPI on delivery.
                    </li>
                </ul>
            </div>

            <div className="space-y-4 pt-4">
                {!whatsappSent && (
                    <button 
                        onClick={sendWhatsApp}
                        className="w-full btn-primary flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E]"
                    >
                        <MessageCircle className="h-5 w-5" /> Send to WhatsApp Now
                    </button>
                )}
                
                <Link 
                    to="/"
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                >
                    Back to Shopping
                </Link>
            </div>
        </div>

    </div>
  );
};

export default Success;
