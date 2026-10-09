import { useEffect, useRef, useState } from 'react';
import SiteHeader from '../components/SiteHeader.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import SampleNote from '../components/SampleNote.jsx';
import BookingSheet from '../components/BookingSheet.jsx';
import { SESSION } from '../config.js';
import { track } from '../lib/analytics.js';

const ANSWERS = [
  ['What’s the point of it?', 'In my view, it checks whether your child’s learning is paying off: whether the problem-solving school teaches actually shows up when they face something new. You either get reassurance that it does, or you find out what to work on.'],
  ['Will my child feel tested?', 'No marks, no ranking and no comparison with other children. Children just see puzzles.'],
  ['Who runs it?', 'I’m Aashish, a project manager from Pune, not a teacher or a psychologist. I watch closely and describe plainly what I see.'],
];

const BOOK_LABEL = `Book your child’s session · ${SESSION.priceLabel}`;

// Version B: "Find out what your child does when they get stuck."
export default function Landing() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const heroCtaRef = useRef(null);
  const openBooking = (source) => {
    track('booking_sheet_opened', { source });
    setBookingOpen(true);
  };

  // Phones: show the sticky "Book" bar once the main button has scrolled above the viewport.
  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero" aria-labelledby="headline">
          <div className="wrap hero__inner">
            <h1 id="headline" className="hero__title">Find out what your child does when they get stuck.</h1>
            <p className="hero__sub">
              A one-hour session in Pune for children in Classes 2 to 8. Afterwards you get a one-page note on six things I saw, and one thing to try at home that evening.
            </p>

            <SampleNote />

            <ul className="facts" aria-label="Session details">
              <li>{SESSION.dates}</li>
              <li>{SESSION.venue}</li>
              <li>{SESSION.priceLabel}</li>
              <li>{SESSION.capacity}</li>
            </ul>

            <div className="hero__cta">
              <button ref={heroCtaRef} type="button" className="btn btn--peach" onClick={() => openBooking('hero')}>
                {BOOK_LABEL}
              </button>
              <p className="hero__reassure">Secure payment via Cashfree. Full refund if you cancel 48 hours before.</p>
            </div>
          </div>
        </section>

        <section className="section" aria-label="Common questions">
          <div className="wrap">
            <ul className="answers">
              {ANSWERS.map(([q, a]) => (
                <li key={q}>
                  <h2>{q}</h2>
                  <p>{a}</p>
                </li>
              ))}
            </ul>
            <div className="cta">
              <button type="button" className="btn btn--brown" onClick={() => openBooking('bottom')}>{BOOK_LABEL}</button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Phones only (hidden from 720px in CSS) */}
      <div className={`sticky-book${stickyVisible ? ' is-visible' : ''}`}>
        <button type="button" className="btn btn--peach btn--slim" onClick={() => openBooking('sticky')}>
          {SESSION.priceLabel} · Book your child’s session
        </button>
      </div>

      <BookingSheet open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
