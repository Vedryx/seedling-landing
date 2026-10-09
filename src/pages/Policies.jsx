import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { CONTACT } from '../config.js';

const SECTIONS = [
  { id: 'terms', title: 'Terms', items: [
    'The session is an observation. It isn’t a psychological, medical or educational assessment, and it isn’t a diagnosis.',
    'A parent or guardian drops off and collects the child.',
  ] },
  { id: 'privacy', title: 'Privacy', items: [
    'Only your child’s first name and class are used.',
    'They are used only for the session and your note.',
    'Nothing is shared.',
    'Notes are deleted after 3 months.',
    // DEVELOPER: if the Meta Pixel is enabled, add a line saying the site uses it to measure visits from ads.
  ] },
  { id: 'refunds', title: 'Refunds', items: [
    'Full refund if you cancel at least 48 hours before your session.',
    'Full refund if the session is cancelled or rescheduled.',
  ] },
  { id: 'contact', title: 'Contact', items: [
    <>WhatsApp: <a href={CONTACT.whatsappUrl}>{CONTACT.whatsappLabel}</a></>,
    <>Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></>,
  ] },
];

export default function Policies() {
  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-head">
          <div className="wrap">
            <h1>Terms, privacy and refunds</h1>
            <nav aria-label="On this page">
              <ul className="toc">
                {SECTIONS.map(({ id, title }) => (
                  <li key={id}><Link to={`#${id}`}>{title}</Link></li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {SECTIONS.map(({ id, title, items }) => (
          <section key={id} className="policy" id={id} aria-labelledby={`${id}-h`}>
            <div className="wrap">
              <h2 id={`${id}-h`}>{title}</h2>
              <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
