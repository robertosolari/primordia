// Rilevamento dispositivo e profilo qualità: su mobile riduciamo il costo
// di rendering per tenere il frame rate fluido.
export const IS_MOBILE =
  window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window;

export const QUALITY = IS_MOBILE
  ? {
      pixelRatioCap: 1.5,
      antialias: false,
      membraneSegments: [26, 20],
      planktonCount: 400,
      depthCreatures: 8,
    }
  : {
      pixelRatioCap: 2,
      antialias: true,
      membraneSegments: [40, 32],
      planktonCount: 900,
      depthCreatures: 14,
    };
