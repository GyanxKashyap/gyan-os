export interface Geometry { x: number; y: number; w: number; h: number }
export interface Viewport { width: number; height: number }

export function viewport(): Viewport {
  return { width: window.innerWidth, height: window.visualViewport?.height ?? window.innerHeight }
}

export function workspaceBounds(view: Viewport = viewport()): Geometry {
  return { x: 8, y: 42, w: Math.max(1, view.width - 16), h: Math.max(1, view.height - 130) }
}

export function fitWindow(rect: Geometry, view: Viewport = viewport()): Geometry {
  const bounds = workspaceBounds(view)
  const w = Math.min(bounds.w, Math.max(340, rect.w))
  const h = Math.min(bounds.h, Math.max(240, rect.h))
  return {
    w, h,
    x: Math.max(bounds.x, Math.min(rect.x, bounds.x + bounds.w - w)),
    y: Math.max(bounds.y, Math.min(rect.y, bounds.y + bounds.h - h)),
  }
}
