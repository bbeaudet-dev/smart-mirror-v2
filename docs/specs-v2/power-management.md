# Raspberry Pi Power Management (v2)

## Goals

Reduce idle resource use while keeping quick, motion-activated responsiveness.

## Strategies

- Display
  - Enable DPMS/screen blanking after inactivity; wake on motion.
- Camera
  - Lower FPS/resolution when idle; stop capture after idle window.
- Services
  - Pause Insights/AI jobs when idle; resume on motion.
- Scheduling
  - Define active hours; cron windows for heavier tasks.
- Networking/Monitoring
  - Wi‑Fi power save, log CPU/temp, provide quick restart commands.

## Milestones

1. DPMS/blanking with motion wake hooks.
2. Camera duty cycling tied to motion detector state.
3. Suspend Insights job during idle; resume on activity.
4. Active hours and optional cron windows.
