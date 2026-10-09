import { useState } from 'react';
import { track } from '../lib/analytics.js';

const OBSERVATIONS = [
  ['How she started', 'She picked up a piece within a few seconds and began with the largest one.'],
  ['Asking for help', 'At 40 seconds she asked me for the answer. She never asked for a hint.'],
  ['Ways she tried', 'She tried two different approaches before settling on one.'],
  ['Keeping going', 'She stayed with the problem through most of the task.'],
  ['After a setback', 'When a piece didn’t fit, she repeated the same move three times, paused, then changed it.'],
  ['Explaining her thinking', 'When asked, she explained the step that worked: “I turned it the other way.”'],
];

// Phones/tablets (<960px): shows the top of the note with a "read the full note" button.
// Desktop: always shown in full (handled in CSS).
export default function SampleNote() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`note-peek${open ? ' is-open' : ''}`}>
      <article className="note" id="sample-note" aria-label="Sample observation note">
        <header className="note__band">
          <span className="note__sample">SAMPLE</span>
          <span className="note__dot" aria-hidden="true">·</span>
          <span className="note__kind">Observation note</span>
        </header>
        <div className="note__body">
          <p className="note__who">
            <span className="note__name">Meera (sample)</span>
            <span className="note__meta">Class 4 · One-hour session</span>
          </p>
          <dl className="note__obs">
            {OBSERVATIONS.map(([term, text]) => (
              <div key={term}><dt>{term}</dt><dd>{text}</dd></div>
            ))}
          </dl>
          <div className="note__try">
            <p className="note__try-label">One thing to try at home tonight</p>
            <p className="note__try-text">When she says she doesn’t know how to start, wait fifteen seconds before you help.</p>
          </div>
          <footer className="note__foot">
            <p>This note describes what I saw in one hour. It isn’t an assessment or a diagnosis.</p>
            <p className="note__sign">Aashish</p>
          </footer>
        </div>
      </article>
      <button
        className="note-peek__toggle"
        type="button"
        aria-controls="sample-note"
        aria-expanded={open}
        onClick={() => { setOpen(true); track('sample_note_expanded'); }}
      >
        Read the full sample note
      </button>
    </div>
  );
}
