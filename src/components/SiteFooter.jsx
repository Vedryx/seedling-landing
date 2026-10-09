import { Link } from 'react-router-dom';
import { CONTACT } from '../config.js';

const LINKS = [
  ['terms', 'Terms'],
  ['privacy', 'Privacy'],
  ['refunds', 'Refunds'],
  ['contact', 'Contact'],
];

export default function SiteFooter({ ask = 'Questions before booking? WhatsApp me:' }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="footer__ask">
          {ask} <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappLabel}</a>
        </p>
        <nav aria-label="Policies">
          <ul className="footer__links">
            {LINKS.map(([id, label]) => (
              <li key={id}><Link to={`/policies#${id}`}>{label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
