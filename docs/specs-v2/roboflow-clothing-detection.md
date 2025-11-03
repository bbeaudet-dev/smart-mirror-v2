# Roboflow Clothing Detection (v2)

## Goal

Reintroduce clothing detection with a simple, swappable model and clear docs.

## Requirements

- Start with a hosted public Roboflow model; no custom training initially.
- One function: `detectClothing(frame)` → normalized attributes + confidences.
- Sample at modest cadence; low-res frames; cache last N results.
- Document keys, endpoints, and how to swap models.

## Technical Notes

- Optionally proxy via server endpoint `/api/vision/clothing` for key safety.
- Normalize outputs (e.g., outerwear, tops, bottoms, footwear, formality, weather-fit).

## Milestones

1. Wire basic detection call and normalization.
2. Integrate into Insights input pipeline.
3. Sampling/caching policy.
4. Documentation for swapping models and providing keys.
