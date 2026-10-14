import { Link } from 'react-router-dom';
import { BUSINESS, CONTACT } from '../config.js';
import { POLICY_LINKS } from '../content/policies.jsx';

export default function SiteFooter({ ask = 'Questions before booking? WhatsApp me:' }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="footer__ask">
          {ask} <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappLabel}</a>
        </p>
        <nav aria-label="Policies">
          <ul className="footer__links">
            {POLICY_LINKS.map(({ slug, title }) => (
              <li key={slug}><Link to={`/${slug}`}>{title}</Link></li>
            ))}
          </ul>
        </nav>
        <p className="footer__legal">© {new Date().getFullYear()} The Seedling is run by {BUSINESS.legalName}.</p>
      </div>
    </footer>
  );
}
