'use client';
import { useState } from 'react';

export default function SubscribeButton({ 
  tier, 
  priceId,
  currency = 'USD'
}: { 
  tier: 'basic' | 'pro' | 'basic-yearly' | 'pro-yearly';
  priceId: string;
  currency?: 'USD' | 'EUR';
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [country, setCountry] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);

  const handleSubscribe = async () => {
    if (!country) {
      alert('Please select your country');
      return;
    }

    if (!termsAccepted) {
      alert('Please accept the Terms and Conditions');
      return;
    }

    if (!riskAccepted) {
      alert('Please acknowledge the trading risks');
      return;
    }

    setLoading(true);
    
    try {
      // Save consent to database
      await fetch('/api/user/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          country, 
          termsAccepted, 
          riskAccepted,
          tier 
        }),
      });

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier, currency }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error starting checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
        <div className="relative">
          {loading ? 'Loading...' : 'Subscribe Now'}
        </div>
      </button>

      {/* Consent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Before You Subscribe</h2>
            
            {/* Country Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="CH">Switzerland</option>
                <option value="AT">Austria</option>
                <option value="SE">Sweden</option>
                <option value="NO">Norway</option>
                <option value="DK">Denmark</option>
                <option value="FI">Finland</option>
                <option value="PL">Poland</option>
                <option value="CZ">Czech Republic</option>
                <option value="HU">Hungary</option>
                <option value="RO">Romania</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croatia</option>
                <option value="SI">Slovenia</option>
                <option value="SK">Slovakia</option>
                <option value="LT">Lithuania</option>
                <option value="LV">Latvia</option>
                <option value="EE">Estonia</option>
                <option value="UA">Ukraine</option>
                <option value="BY">Belarus</option>
                <option value="RU">Russia</option>
                <option value="RS">Serbia</option>
                <option value="BA">Bosnia and Herzegovina</option>
                <option value="MK">North Macedonia</option>
                <option value="AL">Albania</option>
                <option value="MD">Moldova</option>
                <option value="GE">Georgia</option>
                <option value="AM">Armenia</option>
                <option value="AZ">Azerbaijan</option>
                <option value="KZ">Kazakhstan</option>
                <option value="IE">Ireland</option>
                <option value="PT">Portugal</option>
                <option value="GR">Greece</option>
                <option value="CY">Cyprus</option>
                <option value="MT">Malta</option>
                <option value="LU">Luxembourg</option>
                <option value="IS">Iceland</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
                <option value="CN">China</option>
                <option value="TW">Taiwan</option>
                <option value="SG">Singapore</option>
                <option value="HK">Hong Kong</option>
                <option value="MY">Malaysia</option>
                <option value="TH">Thailand</option>
                <option value="VN">Vietnam</option>
                <option value="ID">Indonesia</option>
                <option value="PH">Philippines</option>
                <option value="NZ">New Zealand</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="AR">Argentina</option>
                <option value="CL">Chile</option>
                <option value="CO">Colombia</option>
                <option value="PE">Peru</option>
                <option value="VE">Venezuela</option>
                <option value="IN">India</option>
                <option value="PK">Pakistan</option>
                <option value="BD">Bangladesh</option>
                <option value="TR">Turkey</option>
                <option value="IL">Israel</option>
                <option value="AE">UAE</option>
                <option value="SA">Saudi Arabia</option>
                <option value="QA">Qatar</option>
                <option value="KW">Kuwait</option>
                <option value="EG">Egypt</option>
                <option value="ZA">South Africa</option>
                <option value="NG">Nigeria</option>
                <option value="KE">Kenya</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Terms and Conditions */}
            <div className="mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and agree to the{' '}
                  <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                    Terms and Conditions
                  </a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Risk Acknowledgment */}
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={riskAccepted}
                  onChange={(e) => setRiskAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-red-900 dark:text-red-300 font-medium">
                  I understand that trading involves substantial risk of loss. Market Oracle provides educational analysis and is not responsible for trading decisions or losses. I am solely responsible for my trading activities and outcomes.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubscribe}
                disabled={loading || !country || !termsAccepted || !riskAccepted}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
