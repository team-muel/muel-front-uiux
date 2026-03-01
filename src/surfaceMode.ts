export type SurfaceMode = 'white' | 'monotone';

export const SURFACE_MODE_POLICY: SurfaceMode = 'white';

export function applySurfaceMode(mode: SurfaceMode) {
  document.documentElement.setAttribute('data-surface', mode);
  document.body.setAttribute('data-surface', mode);
}
