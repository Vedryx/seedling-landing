import { Link, Navigate, useLocation } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import { POLICIES, POLICY_LINKS } from '../content/policies.jsx';

export function PolicyPage({ slug }) {
  const policy = POLICIES.find((p) => p.slug === slug);

  return (
    <>
      <SiteHeader />
      <main>
        <div className="page-head">
          <div className="wrap">
            <h1>{policy.title}</h1>
            <nav aria-label="Policies">
              <ul className="toc">
                {POLICY_LINKS.filter((p) => p.slug !== slug).map((p) => (
                  <li key={p.slug}><Link to={`/${p.slug}`}>{p.title}</Link></li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {policy.sections.map((section, i) => (
          <section key={i} className="policy" aria-label={section.heading}>
            <div className="wrap">
              {section.heading && <h2>{section.heading}</h2>}
              <ul>{section.items.map((item, j) => <li key={j}>{item}</li>)}</ul>
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}

// Old links (/policies#refunds etc.) go to the matching new page.
const LEGACY = {
  terms: 'terms-and-conditions',
  privacy: 'privacy-policy',
  refunds: 'refunds-and-cancellations',
  contact: 'contact-us',
};

export function LegacyPolicies() {
  const { hash } = useLocation();
  return <Navigate to={`/${LEGACY[hash.slice(1)] || 'terms-and-conditions'}`} replace />;
}
