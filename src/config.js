// Session details shown across the site. Change them here only.
export const SESSION = {
  version: 'b',
  price: 799,
  priceLabel: '₹799',
  dates: '24th & 25th October 2026',
  venue: 'Society Club house, Masulkar colony, Pimpri, Pune',
  capacity: 'Up to 8 children per session',
  classes: [2, 3, 4, 5, 6, 7, 8],
};

// The legal entity that owns the Cashfree account and sells the session.
// Must match the Cashfree KYC.
export const BUSINESS = {
  legalName: 'Vedryx Technologies LLP',
  address: 'K-603, Mahindra Royale, Kharalwadi, Pimpri, Pune, Maharashtra 411018',
  gstin: '', // not GST-registered
  registeredEmail: '', // same contact as The Seedling, so not shown twice
  responseTime: 'within 24 hours, 10am to 7pm, Monday to Saturday',
  refundDays: '5 to 7 working days',
};

export const CONTACT = {
  whatsappLabel: '+91-7069344301',
  whatsappUrl: 'https://wa.me/917069344301',
  email: 'theseedling.edu@gmail.com',
};

export const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
