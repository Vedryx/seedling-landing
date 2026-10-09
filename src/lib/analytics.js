import { SESSION } from '../config.js';

const KEY = import.meta.env.VITE_POSTHOG_KEY;
let client = null;
let queue = [];

// PostHog: pageviews (incl. SPA route changes), web vitals, errors and,
// if turned on in the PostHog project, session replay with every input masked.
// Loaded lazily so it doesn't slow down the first paint. Events fired before
// it loads are queued. Never pass names, phone numbers or emails into track().
export function initAnalytics() {
  if (!KEY || client || queue === null) return;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || '/ingest', // /ingest is proxied by vercel.json (avoids ad blockers)
      ui_host: 'https://us.posthog.com',
      defaults: '2026-08-30',
      capture_pageview: 'history_change',
      person_profiles: 'identified_only',
      capture_exceptions: true,
      session_recording: { maskAllInputs: true },
    });
    posthog.register({ landing_version: SESSION.version });
    client = posthog;
    queue.forEach(([event, properties]) => client.capture(event, properties));
    queue = [];
  }).catch(() => { queue = null; }); // blocked or offline: drop analytics quietly
}

export function track(event, properties) {
  if (!KEY) return;
  if (client) client.capture(event, properties);
  else queue?.push([event, properties]);
}
