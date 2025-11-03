# Calendar Integration & Insights Engine (v2)

## Goals

- Replace mock calendar with live Google Calendar.
- Periodic Insights that synthesize multi-signal context into tips.

## Requirements

- Calendar
  - Device flow OAuth on Pi or browser OAuth during setup.
  - Server-side caching (memory + file) and normalization.
  - Primary calendar support first; exposed via `/api/calendar/events`.
- Insights
  - Inputs: weather, location, date/time, calendar, clothing detection, recent interactions.
  - Cadence: every 5–30 minutes and on triggers (first morning motion).
  - Output: short recommendation string with source metadata.
  - Rate limiting and change-detection to skip redundant calls.

## Technical Notes

- Calendar tokens stored securely server-side with refresh handling.
- Insights endpoint `/api/insights/run` (manual) + scheduled job.
- Insights UI panel; optional TTS readout policy-controlled.

## Milestones

1. Implement Google Calendar auth + caching; replace mock client.
2. Normalize events for UI and Insights consumption.
3. Implement Insights job, storage and UI panel.
4. Rate limit and trigger-based execution.
