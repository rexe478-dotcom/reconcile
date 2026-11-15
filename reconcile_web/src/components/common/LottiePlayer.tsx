import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

export interface LottiePlayerHandle {
  play: () => void;
  pause: () => void;
  stop: () => void;
  goToAndStop: (frame: number) => void;
  goToAndPlay: (frame: number) => void;
  getCurrentFrame: () => number;
}

export interface LottiePlayerProps {
  /** Directly passed Bodymovin animation JSON object */
  animationData?: any;
  /** URL to fetch Bodymovin animation JSON */
  src?: string;
  /** Whether animation loops automatically (default true) */
  loop?: boolean;
  /** Whether animation plays automatically (default true) */
  autoplay?: boolean;
  /** Playback speed multiplier (default 1) */
  speed?: number;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Fallback node when loading or if rendering fails */
  fallback?: React.ReactNode;
  /** Callback triggered when non-looping animation reaches the end */
  onComplete?: () => void;
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
  /** Accessible label */
  ariaLabel?: string;
}

// --- Bodymovin Evaluation Math ---

function bezierVal(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function solveCubicBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let t = x;
  for (let i = 0; i < 8; i++) {
    const currentX = bezierVal(0, x1, x2, 1, t);
    const diff = currentX - x;
    if (Math.abs(diff) < 1e-5) break;
    const mt = 1 - t;
    const dX = 3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2);
    if (Math.abs(dX) < 1e-6) break;
    t -= diff / dX;
    t = Math.max(0, Math.min(1, t));
  }
  return bezierVal(0, y1, y2, 1, t);
}

function easeProgress(progress: number, outTan: any, inTan: any): number {
  if (!outTan || !inTan) return progress;
  const x1 = Array.isArray(outTan.x) ? outTan.x[0] : (outTan.x ?? 0);
  const y1 = Array.isArray(outTan.y) ? outTan.y[0] : (outTan.y ?? 0);
  const x2 = Array.isArray(inTan.x) ? inTan.x[0] : (inTan.x ?? 1);
  const y2 = Array.isArray(inTan.y) ? inTan.y[0] : (inTan.y ?? 1);
  return solveCubicBezier(x1, y1, x2, y2, progress);
}

function interpolateValues(start: any, end: any, progress: number): any {
  if (typeof start === 'number') {
    const e = typeof end === 'number' ? end : start;
    return start + (e - start) * progress;
  }
  if (Array.isArray(start)) {
    return start.map((sVal, idx) => {
      const eVal = Array.isArray(end) && end[idx] !== undefined ? end[idx] : sVal;
      return typeof sVal === 'number' ? sVal + (eVal - sVal) * progress : sVal;
    });
  }
  return start;
}

function evalProp(prop: any, frame: number, defaultVal: any = 0): any {
  if (!prop) return defaultVal;
  // If static property
  if (prop.a === 0 || !Array.isArray(prop.k) || (prop.k.length > 0 && typeof prop.k[0] !== 'object')) {
    return prop.k !== undefined ? prop.k : defaultVal;
  }
  const kfs = prop.k;
  if (!kfs || kfs.length === 0) return defaultVal;

  // Before first keyframe
  if (frame <= kfs[0].t) {
    return kfs[0].s !== undefined ? kfs[0].s : defaultVal;
  }

  // Bracket lookup
  for (let i = 0; i < kfs.length; i++) {
    const kf = kfs[i];
    const nextKf = kfs[i + 1];
    if (!nextKf || frame < nextKf.t) {
      if (!nextKf) {
        return kf.s !== undefined ? (kf.e !== undefined ? kf.e : kf.s) : defaultVal;
      }
      const t0 = kf.t;
      const t1 = nextKf.t;
      if (t1 <= t0) return kf.s ?? defaultVal;
      const rawProgress = Math.max(0, Math.min(1, (frame - t0) / (t1 - t0)));
      const eased = easeProgress(rawProgress, kf.o, kf.i);
      const start = kf.s;
      const end = kf.e !== undefined ? kf.e : nextKf.s;
      return interpolateValues(start, end, eased);
    }
  }
  return defaultVal;
}

function colorToString(c: any, alpha: number = 1): string {
  if (typeof c === 'string') return c;
  if (!Array.isArray(c) || c.length < 3) return 'transparent';
  const isFloat = c[0] <= 1 && c[1] <= 1 && c[2] <= 1;
  const r = Math.round(isFloat ? c[0] * 255 : c[0]);
  const g = Math.round(isFloat ? c[1] * 255 : c[1]);
  const b = Math.round(isFloat ? c[2] * 255 : c[2]);
  const a = c.length > 3 ? (isFloat ? c[3] : c[3] / 255) * alpha : alpha;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, a))})`;
}

// --- Canvas Shape Renderer ---

interface ShapePathItem {
  type: 'rc' | 'el' | 'sh';
  data: any;
  frame: number;
}

function estimatePathLength(shape: ShapePathItem): number {
  if (shape.type === 'el') {
    const size = evalProp(shape.data.s, shape.frame, [0, 0]);
    const rx = Math.abs(size[0] / 2);
    const ry = Math.abs(size[1] / 2);
    return Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  }
  if (shape.type === 'rc') {
    const size = evalProp(shape.data.s, shape.frame, [0, 0]);
    return 2 * (Math.abs(size[0]) + Math.abs(size[1]));
  }
  if (shape.type === 'sh') {
    const pathData = shape.data.ks ? evalProp(shape.data.ks, shape.frame, shape.data.ks.k) : shape.data;
    const v = pathData?.v;
    if (!v || v.length < 2) return 100;
    let len = 0;
    for (let k = 1; k < v.length; k++) {
      const dx = v[k][0] - v[k - 1][0];
      const dy = v[k][1] - v[k - 1][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    if (pathData?.c) {
      const dx = v[0][0] - v[v.length - 1][0];
      const dy = v[0][1] - v[v.length - 1][1];
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.max(1, len);
  }
  return 100;
}

function buildShapePath(ctx: CanvasRenderingContext2D, shape: ShapePathItem) {
  const { type, data, frame } = shape;
  if (type === 'rc') {
    const pos = evalProp(data.p, frame, [0, 0]);
    const size = evalProp(data.s, frame, [0, 0]);
    const r = evalProp(data.r, frame, 0);
    const w = size[0];
    const h = size[1];
    const x = pos[0] - w / 2;
    const y = pos[1] - h / 2;
    if (typeof (ctx as any).roundRect === 'function' && r > 0) {
      (ctx as any).roundRect(x, y, w, h, Math.min(r, Math.abs(w / 2), Math.abs(h / 2)));
    } else {
      ctx.rect(x, y, w, h);
    }
  } else if (type === 'el') {
    const pos = evalProp(data.p, frame, [0, 0]);
    const size = evalProp(data.s, frame, [0, 0]);
    const rx = Math.max(0.001, Math.abs(size[0] / 2));
    const ry = Math.max(0.001, Math.abs(size[1] / 2));
    ctx.ellipse(pos[0], pos[1], rx, ry, 0, 0, Math.PI * 2);
  } else if (type === 'sh') {
    const pathData = data.ks ? evalProp(data.ks, frame, data.ks.k) : data;
    const v = pathData?.v;
    const i = pathData?.i;
    const o = pathData?.o;
    const c = pathData?.c;
    if (v && v.length > 0) {
      ctx.moveTo(v[0][0], v[0][1]);
      for (let k = 1; k < v.length; k++) {
        const cp1x = v[k - 1][0] + (o?.[k - 1]?.[0] ?? 0);
        const cp1y = v[k - 1][1] + (o?.[k - 1]?.[1] ?? 0);
        const cp2x = v[k][0] + (i?.[k]?.[0] ?? 0);
        const cp2y = v[k][1] + (i?.[k]?.[1] ?? 0);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, v[k][0], v[k][1]);
      }
      if (c) {
        const last = v.length - 1;
        const cp1x = v[last][0] + (o?.[last]?.[0] ?? 0);
        const cp1y = v[last][1] + (o?.[last]?.[1] ?? 0);
        const cp2x = v[0][0] + (i?.[0]?.[0] ?? 0);
        const cp2y = v[0][1] + (i?.[0]?.[1] ?? 0);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, v[0][0], v[0][1]);
        ctx.closePath();
      }
    }
  }
}

function renderGroup(ctx: CanvasRenderingContext2D, group: any, frame: number) {
  if (!group || !Array.isArray(group.it)) return;
  const items = group.it;

  // Extract group transform
  const tr = items.find((item: any) => item.ty === 'tr');
  const gp = tr?.p ? evalProp(tr.p, frame, [0, 0]) : [0, 0];
  const ga = tr?.a ? evalProp(tr.a, frame, [0, 0]) : [0, 0];
  const gs = tr?.s ? evalProp(tr.s, frame, [100, 100]) : [100, 100];
  const gr = tr?.r ? evalProp(tr.r, frame, 0) : 0;
  const go = tr?.o ? evalProp(tr.o, frame, 100) : 100;

  if (go <= 0) return;

  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, go / 100));

  // AE Transform Order: Translate(pos) -> Rotate -> Scale -> Translate(-anchor)
  ctx.translate(gp[0] || 0, gp[1] || 0);
  if (gr !== 0) {
    ctx.rotate((gr * Math.PI) / 180);
  }
  ctx.scale((gs[0] ?? 100) / 100, (gs[1] ?? 100) / 100);
  ctx.translate(-(ga[0] || 0), -(ga[1] || 0));

  // Find trim path in group if present
  const tm = items.find((item: any) => item.ty === 'tm');
  let trimStart = 0;
  let trimEnd = 100;
  let trimOffset = 0;
  if (tm) {
    trimStart = evalProp(tm.s, frame, 0);
    trimEnd = evalProp(tm.e, frame, 100);
    trimOffset = evalProp(tm.o, frame, 0);
  }

  // Iterate sequential items
  let activePaths: ShapePathItem[] = [];
  let pathLengthSum = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.ty === 'gr') {
      renderGroup(ctx, item, frame);
    } else if (item.ty === 'rc' || item.ty === 'el' || item.ty === 'sh') {
      const shapeItem: ShapePathItem = { type: item.ty, data: item, frame };
      activePaths.push(shapeItem);
      pathLengthSum += estimatePathLength(shapeItem);
    } else if (item.ty === 'fl') {
      if (activePaths.length > 0) {
        const fillColor = evalProp(item.c, frame, [0, 0, 0, 1]);
        const fillOpacity = evalProp(item.o, frame, 100);
        ctx.save();
        ctx.beginPath();
        for (const p of activePaths) {
          buildShapePath(ctx, p);
        }
        ctx.fillStyle = colorToString(fillColor, fillOpacity / 100);
        ctx.fill();
        ctx.restore();
      }
    } else if (item.ty === 'st') {
      if (activePaths.length > 0) {
        const strokeColor = evalProp(item.c, frame, [0, 0, 0, 1]);
        const strokeWidth = evalProp(item.w, frame, 1);
        const strokeOpacity = evalProp(item.o, frame, 100);

        ctx.save();
        ctx.beginPath();
        for (const p of activePaths) {
          buildShapePath(ctx, p);
        }

        ctx.strokeStyle = colorToString(strokeColor, strokeOpacity / 100);
        ctx.lineWidth = Math.max(0.1, strokeWidth);
        ctx.lineCap = item.lc === 2 ? 'round' : item.lc === 3 ? 'square' : 'butt';
        ctx.lineJoin = item.lj === 2 ? 'round' : item.lj === 3 ? 'bevel' : 'miter';

        // Check for dashes in stroke definition
        if (Array.isArray(item.d)) {
          const dashItem = item.d.find((d: any) => d.n === 'd');
          const gapItem = item.d.find((d: any) => d.n === 'g');
          const offsetItem = item.d.find((d: any) => d.n === 'o');
          const dVal = dashItem ? evalProp(dashItem.v, frame, 0) : 0;
          const gVal = gapItem ? evalProp(gapItem.v, frame, dVal) : dVal;
          const oVal = offsetItem ? evalProp(offsetItem.v, frame, 0) : 0;
          if (dVal > 0) {
            ctx.setLineDash([dVal, gVal]);
            ctx.lineDashOffset = -oVal;
          }
        } else if (tm && (trimStart > 0 || trimEnd < 100)) {
          // Apply Trim Path stroke segment
          const s = Math.max(0, Math.min(100, trimStart));
          const e = Math.max(0, Math.min(100, trimEnd));
          if (e > s) {
            const segLen = ((e - s) / 100) * pathLengthSum;
            const fullLen = pathLengthSum;
            ctx.setLineDash([Math.max(0.1, segLen), fullLen]);
            ctx.lineDashOffset = -((s / 100) * fullLen + (trimOffset / 360) * fullLen);
            ctx.stroke();
          }
          ctx.restore();
          continue;
        }

        ctx.stroke();
        ctx.restore();
      }
    }
  }

  ctx.restore();
}

function renderLayer(ctx: CanvasRenderingContext2D, layer: any, frame: number) {
  if (!layer || layer.ty !== 4) return;
  // Check in/out frames
  if (frame < (layer.ip ?? 0) || frame > (layer.op ?? 99999)) return;

  const ks = layer.ks || {};
  const lp = ks.p ? evalProp(ks.p, frame, [0, 0]) : [0, 0];
  const la = ks.a ? evalProp(ks.a, frame, [0, 0]) : [0, 0];
  const ls = ks.s ? evalProp(ks.s, frame, [100, 100]) : [100, 100];
  const lr = ks.r ? evalProp(ks.r, frame, 0) : 0;
  const lo = ks.o ? evalProp(ks.o, frame, 100) : 100;

  if (lo <= 0) return;

  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, lo / 100));

  // Transform order
  ctx.translate(lp[0] || 0, lp[1] || 0);
  if (lr !== 0) {
    ctx.rotate((lr * Math.PI) / 180);
  }
  ctx.scale((ls[0] ?? 100) / 100, (ls[1] ?? 100) / 100);
  ctx.translate(-(la[0] || 0), -(la[1] || 0));

  // Shapes in layer
  if (Array.isArray(layer.shapes)) {
    for (const shape of layer.shapes) {
      if (shape.ty === 'gr') {
        renderGroup(ctx, shape, frame);
      }
    }
  }

  ctx.restore();
}

export const LottiePlayer = forwardRef<LottiePlayerHandle, LottiePlayerProps>(
  (
    {
      animationData: propData,
      src,
      loop = true,
      autoplay = true,
      speed = 1,
      className = '',
      style = {},
      fallback,
      onComplete,
      onClick,
      ariaLabel = 'Lottie animation',
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [data, setData] = useState<any>(propData || null);
    const [loadError, setLoadError] = useState(false);

    // Playback state refs for rAF loop
    const frameRef = useRef<number>(0);
    const isPlayingRef = useRef<boolean>(autoplay);
    const lastTimestampRef = useRef<number | null>(null);
    const rafIdRef = useRef<number | null>(null);

    // Fetch animation data if `src` is provided
    useEffect(() => {
      if (propData) {
        setData(propData);
        setLoadError(false);
        return;
      }
      if (src) {
        let isCancelled = false;
        fetch(src)
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
          })
          .then((json) => {
            if (!isCancelled) {
              setData(json);
              setLoadError(false);
            }
          })
          .catch((err) => {
            console.warn('LottiePlayer failed to load JSON src:', src, err);
            if (!isCancelled) setLoadError(true);
          });
        return () => {
          isCancelled = true;
        };
      }
    }, [propData, src]);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      play: () => {
        isPlayingRef.current = true;
        lastTimestampRef.current = null;
      },
      pause: () => {
        isPlayingRef.current = false;
      },
      stop: () => {
        isPlayingRef.current = false;
        frameRef.current = data?.ip || 0;
        drawFrame(frameRef.current);
      },
      goToAndStop: (f: number) => {
        isPlayingRef.current = false;
        frameRef.current = f;
        drawFrame(f);
      },
      goToAndPlay: (f: number) => {
        frameRef.current = f;
        isPlayingRef.current = true;
        lastTimestampRef.current = null;
      },
      getCurrentFrame: () => frameRef.current,
    }));

    // Primary draw function
    const drawFrame = (frame: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !data) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
      const animW = data.w || 300;
      const animH = data.h || 300;

      // Fit to current canvas display size
      const rect = canvas.getBoundingClientRect();
      const displayW = rect.width > 0 ? rect.width : animW;
      const displayH = rect.height > 0 ? rect.height : animH;

      // Synchronize internal canvas buffer with device pixel ratio
      const targetPixelW = Math.round(displayW * dpr);
      const targetPixelH = Math.round(displayH * dpr);
      if (canvas.width !== targetPixelW || canvas.height !== targetPixelH) {
        canvas.width = targetPixelW;
        canvas.height = targetPixelH;
      }

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale to viewport and apply high DPI ratio
      ctx.scale(dpr, dpr);
      const scaleX = displayW / animW;
      const scaleY = displayH / animH;
      // Preserve aspect ratio with center fit
      const uniformScale = Math.min(scaleX, scaleY);
      const offsetX = (displayW - animW * uniformScale) / 2;
      const offsetY = (displayH - animH * uniformScale) / 2;

      ctx.translate(offsetX, offsetY);
      ctx.scale(uniformScale, uniformScale);

      // Render layers from bottom (background) to top (foreground)
      if (Array.isArray(data.layers)) {
        for (let i = data.layers.length - 1; i >= 0; i--) {
          renderLayer(ctx, data.layers[i], frame);
        }
      }

      ctx.restore();
    };

    // Animation loop
    useEffect(() => {
      if (!data) return;
      isPlayingRef.current = autoplay;
      frameRef.current = data.ip || 0;
      lastTimestampRef.current = null;

      const fps = data.fr || 60;
      const totalFrames = (data.op || 120) - (data.ip || 0);

      const animate = (timestamp: number) => {
        if (!isPlayingRef.current) {
          rafIdRef.current = requestAnimationFrame(animate);
          return;
        }

        if (lastTimestampRef.current === null) {
          lastTimestampRef.current = timestamp;
        }

        const deltaMs = timestamp - lastTimestampRef.current;
        lastTimestampRef.current = timestamp;

        // Advance frames based on actual elapsed time and speed
        const deltaFrames = (deltaMs / 1000) * fps * speed;
        let nextFrame = frameRef.current + deltaFrames;

        const maxFrame = data.op || 120;
        const minFrame = data.ip || 0;

        if (nextFrame >= maxFrame) {
          if (loop) {
            nextFrame = minFrame + ((nextFrame - minFrame) % totalFrames);
          } else {
            nextFrame = maxFrame - 0.001;
            isPlayingRef.current = false;
            if (onComplete) {
              onComplete();
            }
          }
        }

        frameRef.current = nextFrame;
        drawFrame(nextFrame);
        rafIdRef.current = requestAnimationFrame(animate);
      };

      // Draw initial static frame
      drawFrame(frameRef.current);
      rafIdRef.current = requestAnimationFrame(animate);

      return () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
      };
    }, [data, loop, autoplay, speed, onComplete]);

    // Handle container resize
    useEffect(() => {
      const container = containerRef.current;
      if (!container || typeof ResizeObserver === 'undefined') return;

      const ro = new ResizeObserver(() => {
        drawFrame(frameRef.current);
      });
      ro.observe(container);
      return () => ro.disconnect();
    }, [data]);

    if (loadError) {
      return (
        <div className={`flex items-center justify-center ${className}`} style={style}>
          {fallback || (
            <svg
              className="w-12 h-12 text-[#3D5438]/40 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
        </div>
      );
    }

    return (
      <div
        ref={containerRef}
        className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
        style={style}
        onClick={onClick}
        role="img"
        aria-label={ariaLabel}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    );
  }
);

LottiePlayer.displayName = 'LottiePlayer';
