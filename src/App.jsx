import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import ThankYou from './pages/ThankYou.jsx';
import { PolicyPage, LegacyPolicies } from './pages/Policies.jsx';
import { POLICY_LINKS } from './content/policies.jsx';

// Scroll to #hash targets or to the top on route change.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/thank-you" element={<ThankYou />} />
        {POLICY_LINKS.map(({ slug }) => (
          <Route key={slug} path={`/${slug}`} element={<PolicyPage slug={slug} />} />
        ))}
        <Route path="/policies" element={<LegacyPolicies />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
