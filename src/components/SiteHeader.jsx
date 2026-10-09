import { Link } from 'react-router-dom';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link to="/" className="brand">The Seedling</Link>
      </div>
    </header>
  );
}
