/** Unified Pointer Events gesture layer — one path for Pencil / touch / mouse.
 *
 *  Touch:  1 finger = tool stroke · 2-finger drag = orbit · pinch = zoom ·
 *          2-finger twist = roll · 3-finger drag = pan ·
 *          2-finger tap = undo · 3-finger tap = redo
 *  Pencil: always the tool; touches are ignored while the Pencil is down
 *          (palm rejection). Pressure/tilt forwarded on every point.
 *  Mouse:  LMB = tool · right-drag / MMB = orbit (shift = pan) ·
 *          wheel = zoom · shift+wheel = pan
 */

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
  tiltX: number;
  tiltY: number;
  t: number;
  pointerType: string;
}

export interface GestureHandlers {
  /** Return false to reject the stroke (e.g. gizmo owns this pointer). */
  strokeStart(p: StrokePoint): boolean;
  strokeMove(p: StrokePoint): void;
  strokeEnd(p: StrokePoint): void;
  strokeCancel(): void;
  orbit(dx: number, dy: number): void;
  dolly(factor: number): void;
  roll(dAngle: number): void;
  pan(dx: number, dy: number): void;
  tapUndo(): void;
  tapRedo(): void;
}

interface Ptr {
  id: number;
  type: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  downT: number;
}

const TAP_MS = 300;
const TAP_MOVE = 14;
const STROKE_CANCEL_MS = 260;
const STROKE_CANCEL_DIST = 24;

export class PointerGestures {
  private ptrs = new Map<number, Ptr>();
  private strokeId: number | null = null;
  private strokeIsTouch = false;
  private strokeStartT = 0;
  private strokePath = 0;
  private navCount = 0; // 2 or 3 while a touch nav gesture is active
  private navMoved = false;
  private maxTouches = 0;
  private gestureStartT = 0;
  private penDown = false;
  // two-finger disambiguation: decaying accumulators of pinch (finger-distance
  // change) vs travel (midpoint movement) decide which intent dominates, and
  // roll only engages after a deliberate cumulative twist
  private pinchAccum = 0;
  private travelAccum = 0;
  private twistAccum = 0;
  private rollEngaged = false;

  private resetNavIntent(): void {
    this.pinchAccum = 0;
    this.travelAccum = 0;
    this.twistAccum = 0;
    this.rollEngaged = false;
  }

  constructor(
    private el: HTMLElement,
    private h: GestureHandlers
  ) {
    el.addEventListener('pointerdown', this.onDown);
    el.addEventListener('pointermove', this.onMove);
    el.addEventListener('pointerup', this.onUp);
    el.addEventListener('pointercancel', this.onCancel);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
    // Safari pinch-zoom of the page
    el.addEventListener('gesturestart' as never, ((e: Event) => e.preventDefault()) as never);
    el.addEventListener('gesturechange' as never, ((e: Event) => e.preventDefault()) as never);
  }

  private point(e: PointerEvent): StrokePoint {
    const r = this.el.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      pressure: e.pointerType === 'mouse' ? 1 : e.pressure,
      tiltX: e.tiltX,
      tiltY: e.tiltY,
      t: e.timeStamp,
      pointerType: e.pointerType
    };
  }

  private touches(): Ptr[] {
    return [...this.ptrs.values()].filter((p) => p.type === 'touch');
  }

  private onDown = (e: PointerEvent): void => {
    try {
      this.el.setPointerCapture?.(e.pointerId);
    } catch {
      // synthetic events (tests) have no active pointer to capture
    }
    const p: Ptr = {
      id: e.pointerId,
      type: e.pointerType,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      downT: e.timeStamp
    };

    if (e.pointerType === 'pen') {
      this.ptrs.set(e.pointerId, p);
      this.penDown = true;
      if (this.strokeId === null && this.navCount === 0) {
        if (this.h.strokeStart(this.point(e))) {
          this.strokeId = e.pointerId;
          this.strokeIsTouch = false;
          this.strokeStartT = e.timeStamp;
          this.strokePath = 0;
        }
      }
      return;
    }

    if (e.pointerType === 'mouse') {
      this.ptrs.set(e.pointerId, p);
      if (e.button === 0 && this.strokeId === null) {
        if (this.h.strokeStart(this.point(e))) {
          this.strokeId = e.pointerId;
          this.strokeIsTouch = false;
          this.strokeStartT = e.timeStamp;
          this.strokePath = 0;
        }
      }
      // button 1 (MMB) / 2 (RMB): nav handled in move via buttons bitmask
      return;
    }

    // touch — palm rejection while Pencil is down
    if (this.penDown) return;
    this.ptrs.set(e.pointerId, p);
    const touches = this.touches();
    const n = touches.length;
    this.maxTouches = Math.max(this.maxTouches, n);
    if (n === 1) {
      this.gestureStartT = e.timeStamp;
      if (this.strokeId === null && this.navCount === 0) {
        if (this.h.strokeStart(this.point(e))) {
          this.strokeId = e.pointerId;
          this.strokeIsTouch = true;
          this.strokeStartT = e.timeStamp;
          this.strokePath = 0;
        }
      }
    } else if (n >= 2) {
      // young, short tool stroke gets cancelled in favor of navigation
      if (this.strokeIsTouch && this.strokeId !== null) {
        const young =
          e.timeStamp - this.strokeStartT < STROKE_CANCEL_MS &&
          this.strokePath < STROKE_CANCEL_DIST;
        if (young) {
          this.strokeId = null;
          this.h.strokeCancel();
        }
      }
      if (this.strokeId === null) {
        this.navCount = Math.min(3, n);
        this.navMoved = false;
        this.resetNavIntent();
      }
    }
  };

  private onMove = (e: PointerEvent): void => {
    const p = this.ptrs.get(e.pointerId);

    // mouse nav: right or middle button drag
    if (e.pointerType === 'mouse' && p && this.strokeId !== e.pointerId) {
      if (e.buttons & (2 | 4)) {
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        if (e.shiftKey) this.h.pan(dx, dy);
        else this.h.orbit(dx, dy);
      }
      p.x = e.clientX;
      p.y = e.clientY;
      return;
    }

    if (!p) return;
    const prev = { x: p.x, y: p.y };
    // coalesced events give full Pencil sampling rate
    const events =
      this.strokeId === e.pointerId && 'getCoalescedEvents' in e
        ? e.getCoalescedEvents()
        : [e];

    if (this.strokeId === e.pointerId) {
      for (const ce of events.length ? events : [e]) {
        const sp = this.point(ce as PointerEvent);
        this.strokePath += Math.hypot(ce.clientX - p.x, ce.clientY - p.y);
        p.x = ce.clientX;
        p.y = ce.clientY;
        this.h.strokeMove(sp);
      }
      return;
    }

    p.x = e.clientX;
    p.y = e.clientY;

    if (p.type === 'touch' && this.navCount >= 2) {
      const touches = this.touches();
      if (touches.length < 2) return;
      // deadzone so multi-finger taps don't jiggle the camera
      const worst = Math.max(
        ...touches.map((t) => Math.hypot(t.x - t.startX, t.y - t.startY))
      );
      if (!this.navMoved && worst < 6 && e.timeStamp - this.gestureStartT < 150) {
        return;
      }
      this.navMoved = true;

      if (this.navCount >= 3 && touches.length >= 3) {
        const dx = (p.x - prev.x);
        const dy = (p.y - prev.y);
        this.h.pan(dx, dy);
        return;
      }

      const [a, b] = touches;
      const curDist = Math.hypot(a.x - b.x, a.y - b.y);
      const curAng = Math.atan2(b.y - a.y, b.x - a.x);
      // previous frame values reconstructed from this pointer's prev position
      const prevAx = a.id === p.id ? prev.x : a.x;
      const prevAy = a.id === p.id ? prev.y : a.y;
      const prevBx = b.id === p.id ? prev.x : b.x;
      const prevBy = b.id === p.id ? prev.y : b.y;
      const prevDist = Math.hypot(prevAx - prevBx, prevAy - prevBy);
      const prevAng = Math.atan2(prevBy - prevAy, prevBx - prevAx);

      // each event carries one pointer's movement; the midpoint moves half that.
      const midDx = (p.x - prev.x) / 2;
      const midDy = (p.y - prev.y) / 2;

      // ---- intent: a natural pinch always drifts and twists a little, so
      // orbit/roll must not fire at full strength during a zoom. Decaying
      // accumulators compare finger-distance change against midpoint travel.
      const distDelta = Math.abs(curDist - prevDist);
      this.pinchAccum = this.pinchAccum * 0.9 + distDelta;
      this.travelAccum = this.travelAccum * 0.9 + Math.hypot(midDx, midDy);
      const pinchDominant = this.pinchAccum > 1.5 * this.travelAccum + 6;

      // zoom: always live (spread = zoom in), it's what both intents expect
      if (prevDist > 20 && curDist > 20) {
        this.h.dolly(prevDist / curDist);
      }

      // orbit: grab-the-world (content follows the fingers), heavily damped
      // while the pinch dominates so zooming doesn't tumble the model
      const orbitScale = pinchDominant ? 0.12 : 1;
      this.h.orbit(-midDx * orbitScale, -midDy * orbitScale);

      // roll: only after a deliberate cumulative twist (~12°) — incidental
      // angle jitter during a pinch must never tilt the horizon
      let dAng = curAng - prevAng;
      if (dAng > Math.PI) dAng -= 2 * Math.PI;
      if (dAng < -Math.PI) dAng += 2 * Math.PI;
      if (Math.abs(dAng) < 0.3) {
        this.twistAccum += dAng;
        if (!this.rollEngaged && Math.abs(this.twistAccum) > 0.21 && !pinchDominant) {
          this.rollEngaged = true;
          this.h.roll(-this.twistAccum); // apply the buffered twist for continuity
        } else if (this.rollEngaged) {
          this.h.roll(-dAng);
        }
      }
    }
  };

  private onUp = (e: PointerEvent): void => {
    const p = this.ptrs.get(e.pointerId);
    this.ptrs.delete(e.pointerId);
    if (e.pointerType === 'pen') this.penDown = false;
    if (!p) return;

    if (this.strokeId === e.pointerId) {
      this.strokeId = null;
      this.h.strokeEnd(this.point(e));
      this.maxTouches = 0;
      return;
    }

    if (p.type === 'touch') {
      const remaining = this.touches().length;
      if (remaining === 0) {
        // multi-finger tap?
        const dur = e.timeStamp - this.gestureStartT;
        const moved = Math.hypot(p.x - p.startX, p.y - p.startY);
        if (
          this.maxTouches >= 2 &&
          dur < TAP_MS &&
          moved < TAP_MOVE &&
          !this.navMoved
        ) {
          if (this.maxTouches === 2) this.h.tapUndo();
          else this.h.tapRedo();
        }
        this.navCount = 0;
        this.navMoved = false;
        this.maxTouches = 0;
        this.resetNavIntent();
      } else if (remaining < this.navCount) {
        this.navCount = remaining >= 2 ? remaining : 0;
      }
    }
  };

  private onCancel = (e: PointerEvent): void => {
    if (e.pointerType === 'pen') this.penDown = false;
    if (this.strokeId === e.pointerId) {
      this.strokeId = null;
      this.h.strokeCancel();
    }
    this.ptrs.delete(e.pointerId);
    if (this.touches().length === 0) {
      this.navCount = 0;
      this.navMoved = false;
      this.maxTouches = 0;
      this.resetNavIntent();
    }
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();
    let dy = e.deltaY;
    let dx = e.deltaX;
    if (e.deltaMode === 1) {
      dy *= 33;
      dx *= 33;
    }
    if (e.shiftKey) {
      this.h.pan(-dx, -dy);
    } else {
      // ctrlKey = trackpad pinch (browser synthesizes wheel+ctrl)
      const speed = e.ctrlKey ? 0.01 : 0.0016;
      this.h.dolly(Math.exp(dy * speed));
    }
  };
}
