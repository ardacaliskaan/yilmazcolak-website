// components/contact/ContactForm.js
'use client';

import { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
      {/* Anti-autofill sarılığı ve placeholder netliği için küçük CSS */}
      <style jsx>{`
        input::placeholder, textarea::placeholder { opacity: 1; }
        /* Chrome autofill sarısı giderme */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset;
          box-shadow: 0 0 0px 1000px #ffffff inset;
          -webkit-text-fill-color: #111827; /* gray-900 */
        }
      `}</style>

      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Bize Yazın</h2>
        <p className="text-gray-700">Hukuki sorularınızı buradan iletebilirsiniz. 24 saat içinde size geri dönüş yapacağız.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2">
            Ad Soyad *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            placeholder="Adınızı ve soyadınızı yazın"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
              E-posta *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
              placeholder="0555 000 00 00"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-2">
            Konu *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
          >
            <option value="" className="text-gray-500">Konu seçiniz</option>
            <option value="aile-hukuku">Aile Hukuku</option>
            <option value="ceza-hukuku">Ceza Hukuku</option>
            <option value="is-hukuku">İş Hukuku</option>
            <option value="ticaret-hukuku">Ticaret Hukuku</option>
            <option value="idare-hukuku">İdare Hukuku</option>
            <option value="gayrimenkul-hukuku">Gayrimenkul Hukuku</option>
            <option value="miras-hukuku">Miras Hukuku</option>
            <option value="sigorta-hukuku">Sigorta Hukuku</option>
            <option value="icra-iflas">İcra İflas</option>
            <option value="diger">Diğer</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-2">
            Mesajınız *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 bg-white text-gray-900 placeholder-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none"
            placeholder="Hukuki sorununuzu detaylı bir şekilde açıklayın..."
          />
        </div>

        {/* Privacy */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Gizlilik Bildirimi:</span> Bu form aracılığıyla paylaştığınız tüm bilgiler avukatlık meslek sırrı kapsamında korunmaktadır.
            </p>
          </div>
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-amber-600 hover:to-orange-700 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 outline-none transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gönderiliyor...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Mesajı Gönder
              </span>
            )}
          </button>
        </div>

        {/* Status */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              Mesajınız başarıyla gönderildi! 24 saat içinde size geri dönüş yapacağız.
            </p>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">
              Mesaj gönderilemedi. Lütfen telefon ile iletişime geçin.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
