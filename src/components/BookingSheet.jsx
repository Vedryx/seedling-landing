import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SESSION } from '../config.js';
import { preloadCashfree, startCheckout } from '../lib/payments.js';
import { track } from '../lib/analytics.js';

const EMPTY = { parentName: '', phone: '', email: '', childName: '', childClass: '' };

function validate(v) {
  const errors = {};
  if (!v.parentName.trim()) errors.parentName = 'Please enter your name.';
  if (!/^[6-9]\d{9}$/.test(v.phone)) errors.phone = 'Please enter a 10-digit mobile number.';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = 'Please check the email address.';
  if (!v.childName.trim()) errors.childName = 'Please enter your child’s first name.';
  if (!v.childClass) errors.childClass = 'Please choose a class.';
  return errors;
}

// Strips +91 / leading 0 / spaces so "+91 98765 43210" becomes "9876543210".
function normalisePhone(raw) {
  const digits = raw.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Collects the details Cashfree needs (customer phone is mandatory) plus the
 * child's first name and class, then starts Cashfree checkout.
 * Bottom sheet on phones, centred dialog from 720px.
 */
export default function BookingSheet({ open, onClose }) {
  const dialogRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      preloadCashfree();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const update = (field) => (e) => {
    const value = field === 'phone' ? e.target.value.replace(/[^\d+\s-]/g, '') : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const booking = { ...values, phone: normalisePhone(values.phone), email: values.email.trim() };
    const found = validate(booking);
    setErrors(found);
    if (Object.keys(found).length) {
      track('booking_form_invalid', { fields: Object.keys(found) }); // field names only, never values
      dialogRef.current?.querySelector(`[name="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }
    setStatus('submitting');
    setMessage('');
    track('checkout_started', { child_class: Number(booking.childClass), has_email: Boolean(booking.email) });
    try {
      await startCheckout({ ...booking, version: SESSION.version });
      // Cashfree redirects away; if it returns here the parent is still on the page.
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setMessage(err.message);
      track('checkout_failed', { reason: err.message });
    }
  }

  const fieldProps = (name) => ({
    id: `book-${name}`,
    name,
    value: values[name],
    onChange: update(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `book-${name}-error` : undefined,
  });

  const errorFor = (name) =>
    errors[name] && <p className="field__error" id={`book-${name}-error`}>{errors[name]}</p>;

  return (
    <dialog
      ref={dialogRef}
      className="sheet"
      aria-labelledby="book-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === dialogRef.current) onClose(); }}
    >
      <form className="sheet__inner" onSubmit={handleSubmit} noValidate>
        <div className="sheet__head">
          <h2 id="book-title" className="sheet__title">Book your child’s session</h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="sheet__meta">{SESSION.dates} · {SESSION.priceLabel}</p>

        <div className="field">
          <label htmlFor="book-parentName">Your name</label>
          <input {...fieldProps('parentName')} autoComplete="name" />
          {errorFor('parentName')}
        </div>
        <div className="field">
          <label htmlFor="book-phone">WhatsApp number</label>
          <input {...fieldProps('phone')} type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile number" />
          {errorFor('phone')}
        </div>
        <div className="field">
          <label htmlFor="book-email">Email <span className="field__optional">(optional, for the receipt)</span></label>
          <input {...fieldProps('email')} type="email" inputMode="email" autoComplete="email" />
          {errorFor('email')}
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="book-childName">Child’s first name</label>
            <input {...fieldProps('childName')} autoComplete="off" />
            {errorFor('childName')}
          </div>
          <div className="field field--class">
            <label htmlFor="book-childClass">Class</label>
            <select {...fieldProps('childClass')}>
              <option value="" disabled>Choose</option>
              {SESSION.classes.map((c) => <option key={c} value={c}>Class {c}</option>)}
            </select>
            {errorFor('childClass')}
          </div>
        </div>

        {status === 'error' && <p className="sheet__alert" role="alert">{message}</p>}

        <button className="btn btn--brown sheet__submit" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Opening secure payment…' : `Pay ${SESSION.priceLabel}`}
        </button>
        <p className="sheet__reassure">
          Secure payment via Cashfree. Full refund if you cancel 48 hours before.{' '}
          <Link to="/policies#refunds" onClick={onClose}>Refund policy</Link>
        </p>
      </form>
    </dialog>
  );
}
