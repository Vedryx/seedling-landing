import { Link } from 'react-router-dom';
import { BUSINESS, CONTACT, SESSION } from '../config.js';

const whatsapp = <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappLabel}</a>;
const email = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;
const operator = <>The Seedling is run by <strong>{BUSINESS.legalName}</strong></>;

// One entry per policy page. Titles match what Cashfree's website review looks for.
export const POLICIES = [
  {
    slug: 'contact-us',
    title: 'Contact us',
    sections: [
      {
        items: [
          <>{operator}.</>,
          ...(BUSINESS.gstin ? [<>GSTIN: {BUSINESS.gstin}</>] : []),
          ...(BUSINESS.registeredEmail
            ? [<>Business email: <a href={`mailto:${BUSINESS.registeredEmail}`}>{BUSINESS.registeredEmail}</a></>]
            : []),
          <>For bookings and questions, WhatsApp or call: {whatsapp}</>,
          <>Email: {email}</>,
          <>We reply {BUSINESS.responseTime}.</>,
          <>Session venue: {SESSION.venue}.</>,
        ],
      },
    ],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms and conditions',
    sections: [
      {
        heading: 'Who we are',
        items: [
          <>{operator} (“we”, “us”). By booking a session you agree to these terms.</>,
        ],
      },
      {
        heading: 'The service',
        items: [
          <>A one-hour, in-person session in Pune for children in Classes 2 to 8, with up to 8 children per session.</>,
          <>Afterwards the parent receives a one-page written note on what we observed, and one thing to try at home.</>,
          <>Price: {SESSION.priceLabel} per child, paid in Indian rupees (INR) through Cashfree when you book.</>,
          <>Dates: {SESSION.dates}. Venue: {SESSION.venue}.</>,
          <>Nothing is shipped. The service is delivered in person, and the note is sent on WhatsApp or by email.</>,
        ],
      },
      {
        heading: 'Booking',
        items: [
          <>Your booking is confirmed once payment succeeds. We message you on WhatsApp within 24 hours to confirm your slot.</>,
          <>Please give accurate contact details. We can’t confirm a slot if we can’t reach you.</>,
          <>If a session is full, we offer another slot or a full refund.</>,
        ],
      },
      {
        heading: 'On the day',
        items: [
          <>A parent or guardian drops off and collects the child.</>,
          <>Please tell us beforehand about anything we should know, such as allergies or medical needs.</>,
        ],
      },
      {
        heading: 'What the session is not',
        items: [
          <>The session is an observation. It isn’t a psychological, medical or educational assessment, and it isn’t a diagnosis.</>,
          <>The note describes what we saw in one hour and is shared for the parent’s information only.</>,
        ],
      },
      {
        heading: 'Liability and law',
        items: [
          <>Our total liability for any booking is limited to the amount you paid for it.</>,
          <>These terms are governed by the laws of India. Courts in Pune, Maharashtra have jurisdiction.</>,
        ],
      },
      {
        items: [
          <>Cancellations and refunds: see our <Link to="/refunds-and-cancellations">refunds and cancellations policy</Link>.</>,
        ],
      },
    ],
  },
  {
    slug: 'refunds-and-cancellations',
    title: 'Refunds and cancellations',
    sections: [
      {
        heading: 'If you cancel',
        items: [
          <>Full refund if you cancel at least 48 hours before your session.</>,
          <>Cancellations made less than 48 hours before the session are not refunded.</>,
          <>To cancel, WhatsApp {whatsapp} or email {email} with your name and payment reference.</>,
        ],
      },
      {
        heading: 'Rescheduling',
        items: [
          <>You can move to the other session date, if a place is free, when you ask at least 48 hours before your session.</>,
        ],
      },
      {
        heading: 'If we cancel',
        items: [
          <>Full refund if we cancel or reschedule the session and the new time doesn’t suit you.</>,
        ],
      },
      {
        heading: 'How refunds are paid',
        items: [
          <>Refunds go back to the original payment method within {BUSINESS.refundDays} of approval.</>,
          <>If your payment failed but money left your account, it is usually reversed automatically by your bank or Cashfree. If not, contact us with the payment reference.</>,
        ],
      },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy policy',
    sections: [
      {
        items: [
          <>{operator}, which is responsible for the data described here.</>,
          <>When you book we collect your name, WhatsApp number and, if you give it, your email, plus your child’s first name and class.</>,
          <>We use them only to arrange the session and send your note.</>,
          <>Payments are processed by Cashfree. We never see or store your card or bank details.</>,
          <>Nothing is shared or sold.</>,
          <>Notes are deleted after 3 months.</>,
        ],
      },
    ],
  },
  {
    slug: 'shipping-and-delivery',
    title: 'Shipping and delivery',
    sections: [
      {
        items: [
          <>The Seedling is an in-person service. No physical goods are shipped.</>,
          <>The session takes place at {SESSION.venue} on the date confirmed with you.</>,
          <>Your one-page note is delivered on WhatsApp or by email after the session.</>,
        ],
      },
    ],
  },
];

export const POLICY_LINKS = POLICIES.map(({ slug, title }) => ({ slug, title }));
