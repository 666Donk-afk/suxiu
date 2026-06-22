/**
 * Interest Bubble Engine - 轻量 Canvas 气泡
 * 紧密布局 + 选中放大 + 邻居轻量推开（无软体物理）
 */
const SIZE_RPX = {
  small: 108,
  medium: 164,
  large: 252
};

const CONFIG = {
  selectedScale: 1.28,
  pressScale: 0.96,
  scaleSpeed: 9,
  pushSpeed: 11,
  layoutGap: 2,
  pushGap: 3,
  boundPad: 2,
  floatAmp: 1.5,
  floatSpeed: 1.1,
  layoutIterations: 80,
  packAngleSteps: 32,
  pushPasses: 6
};

function rpxToPx(rpx, windowWidth) {
  return rpx * (windowWidth || 375) / 750;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function isFiniteNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function safeNum(v, fallback) {
  return isFiniteNum(v) ? v : fallback;
}

class SimpleBubble {
  constructor(options) {
    this.key = options.key;
    this.label = options.label || '';
    this.cover = options.cover;
    this.sizeType = options.sizeType;
    this.zIndex = options.zIndex || 1;
    this.floatPhase = options.floatPhase || 0;

    this.restX = safeNum(options.x, 0);
    this.restY = safeNum(options.y, 0);
    this.cx = this.restX;
    this.cy = this.restY;
    this.offsetX = 0;
    this.offsetY = 0;
    this.targetOffsetX = 0;
    this.targetOffsetY = 0;
    this.baseRadius = Math.max(1, safeNum(options.radius, 24));

    this.selected = false;
    this.pressing = false;
    this.scale = 1;
    this.targetScale = 1;
    this.floatY = 0;

    this.coverImage = null;
    this.coverReady = false;
  }

  get radius() {
    return this.baseRadius * this.scale;
  }

  get targetScaleValue() {
    if (this.selected) return CONFIG.selectedScale;
    if (this.pressing) return CONFIG.pressScale;
    return 1;
  }

  setSelection(selected) {
    this.selected = !!selected;
    this.targetScale = this.targetScaleValue;
  }

  setPressing(pressing) {
    this.pressing = !!pressing;
    if (!this.selected) {
      this.targetScale = this.targetScaleValue;
    }
  }

  updateScale(dt) {
    this.targetScale = this.targetScaleValue;
    const diff = this.targetScale - this.scale;
    if (Math.abs(diff) > 0.002) {
      this.scale += diff * Math.min(1, CONFIG.scaleSpeed * dt);
    } else {
      this.scale = this.targetScale;
    }
  }

  updateOffset(dt) {
    const lerp = Math.min(1, CONFIG.pushSpeed * dt);
    this.offsetX += (this.targetOffsetX - this.offsetX) * lerp;
    this.offsetY += (this.targetOffsetY - this.offsetY) * lerp;
    this.cx = this.restX + this.offsetX;
    this.cy = this.restY + this.offsetY;
  }

  updateFloat(time) {
    this.floatY = Math.sin(time * CONFIG.floatSpeed + this.floatPhase) * CONFIG.floatAmp;
  }

  isAnimating() {
    return Math.abs(this.scale - this.targetScale) > 0.004
      || Math.abs(this.offsetX - this.targetOffsetX) > 0.4
      || Math.abs(this.offsetY - this.targetOffsetY) > 0.4;
  }

  contains(x, y) {
    const dy = y - (this.cy + this.floatY);
    const dx = x - this.cx;
    return Math.hypot(dx, dy) <= this.radius;
  }

  loadCover(canvas, onReady) {
    if (!this.cover || this.coverImage) return;
    const image = canvas.createImage();
    image.onload = () => {
      this.coverImage = image;
      this.coverReady = true;
      if (onReady) onReady();
    };
    image.onerror = () => {
      this.coverReady = false;
    };
    image.src = this.cover;
  }
}

class SoftBodyBubbleEngine {
  constructor(options) {
    this.width = Math.max(1, safeNum(options.width, 300));
    this.height = Math.max(1, safeNum(options.height, 400));
    this.windowWidth = safeNum(options.windowWidth, 375);
    this.bubbles = [];
    this.time = 0;
    this._canvas = null;
    this._dirty = true;
  }

  initFromConfigs(configs) {
    this.bubbles = (configs || []).map(cfg => {
      const diameterRpx = SIZE_RPX[cfg.sizeType] || SIZE_RPX.medium;
      const radius = rpxToPx(diameterRpx / 2, this.windowWidth);
      const xRatio = clamp(safeNum(cfg.xRatio, 0.5), 0.06, 0.94);
      const yRatio = clamp(safeNum(cfg.yRatio, 0.5), 0.08, 0.92);
      return new SimpleBubble({
        key: cfg.key,
        label: cfg.label,
        cover: cfg.cover,
        sizeType: cfg.sizeType,
        zIndex: safeNum(cfg.zIndex, 1),
        floatPhase: safeNum(cfg.floatDelay, 0),
        x: xRatio * this.width,
        y: yRatio * this.height,
        radius
      });
    });
    this.bubbles.sort((a, b) => a.zIndex - b.zIndex);
    this._packCircles();
    this._fitClusterToCanvas();
    this._resolveLayout();
    this.bubbles.forEach(b => {
      b.restX = b.cx;
      b.restY = b.cy;
    });
    this._dirty = true;
  }

  _packCenter() {
    return {
      x: this.width * 0.5,
      y: this.height * 0.5
    };
  }

  _fitsInBounds(x, y, radius) {
    const pad = CONFIG.boundPad;
    const edgeR = radius * CONFIG.selectedScale;
    return x - edgeR >= pad
      && x + edgeR <= this.width - pad
      && y - edgeR >= pad
      && y + edgeR <= this.height - pad;
  }

  _packCircles() {
    const gap = CONFIG.layoutGap;
    const center = this._packCenter();
    const sorted = [...this.bubbles].sort((a, b) => b.baseRadius - a.baseRadius);

    if (!sorted.length) return;

    sorted[0].cx = center.x;
    sorted[0].cy = center.y;

    for (let i = 1; i < sorted.length; i++) {
      const bubble = sorted[i];
      let best = null;
      let bestScore = Infinity;

      for (let j = 0; j < i; j++) {
        const anchor = sorted[j];
        const orbit = anchor.baseRadius + bubble.baseRadius + gap;
        const steps = Math.max(CONFIG.packAngleSteps, Math.ceil(orbit * 0.28));

        for (let s = 0; s < steps; s++) {
          const angle = (s / steps) * Math.PI * 2;
          const tx = anchor.cx + Math.cos(angle) * orbit;
          const ty = anchor.cy + Math.sin(angle) * orbit;

          if (!this._fitsInBounds(tx, ty, bubble.baseRadius)) continue;

          let overlap = 0;
          for (let k = 0; k < i; k++) {
            const other = sorted[k];
            const dx = tx - other.cx;
            const dy = ty - other.cy;
            const dist = Math.hypot(dx, dy) || 0.001;
            const minD = other.baseRadius + bubble.baseRadius + gap;
            if (dist < minD) overlap += (minD - dist);
          }

          const distToCenter = Math.hypot(tx - center.x, ty - center.y);
          const score = overlap * 1000 + distToCenter;
          if (score < bestScore) {
            bestScore = score;
            best = { x: tx, y: ty };
          }
        }
      }

      if (best) {
        bubble.cx = best.x;
        bubble.cy = best.y;
      } else {
        bubble.cx = center.x;
        bubble.cy = center.y;
      }
    }
  }

  _clusterBounds() {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.bubbles.forEach(b => {
      const r = b.baseRadius;
      minX = Math.min(minX, b.cx - r);
      maxX = Math.max(maxX, b.cx + r);
      minY = Math.min(minY, b.cy - r);
      maxY = Math.max(maxY, b.cy + r);
    });

    return { minX, maxX, minY, maxY };
  }

  _fitClusterToCanvas() {
    const { minX, maxX, minY, maxY } = this._clusterBounds();
    const boxW = Math.max(1, maxX - minX);
    const boxH = Math.max(1, maxY - minY);
    const pad = CONFIG.boundPad;
    const targetW = this.width - pad * 2;
    const targetH = this.height - pad * 2;
    const scale = Math.min(targetW / boxW, targetH / boxH, 1.22);

    if (scale <= 1.04) return;

    const boxCx = (minX + maxX) * 0.5;
    const boxCy = (minY + maxY) * 0.5;
    const center = this._packCenter();

    this.bubbles.forEach(b => {
      b.cx = center.x + (b.cx - boxCx) * scale;
      b.cy = center.y + (b.cy - boxCy) * scale;
    });
  }

  _separatePairs() {
    const gap = CONFIG.layoutGap;
    for (let i = 0; i < this.bubbles.length; i++) {
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const a = this.bubbles[i];
        const b = this.bubbles[j];
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.001) dist = 0.001;
        const minDist = a.baseRadius + b.baseRadius + gap;
        const pen = minDist - dist;
        if (pen <= 0) continue;

        const nx = dx / dist;
        const ny = dy / dist;
        const half = pen * 0.5;
        a.cx -= nx * half;
        a.cy -= ny * half;
        b.cx += nx * half;
        b.cy += ny * half;
      }
    }
  }

  _clampToBounds() {
    const pad = CONFIG.boundPad;
    const maxW = this.width;
    const maxH = this.height;

    this.bubbles.forEach(b => {
      const r = b.baseRadius * CONFIG.selectedScale;
      if (b.cx - r < pad) b.cx = pad + r;
      if (b.cx + r > maxW - pad) b.cx = maxW - pad - r;
      if (b.cy - r < pad) b.cy = pad + r;
      if (b.cy + r > maxH - pad) b.cy = maxH - pad - r;
    });
  }

  _resolveLayout() {
    for (let iter = 0; iter < CONFIG.layoutIterations; iter++) {
      this._separatePairs();
      this._clampToBounds();
    }
  }

  _computePushTargets() {
    const n = this.bubbles.length;
    const xs = new Float32Array(n);
    const ys = new Float32Array(n);
    const rs = new Float32Array(n);
    const fixed = new Array(n);

    for (let i = 0; i < n; i++) {
      const b = this.bubbles[i];
      xs[i] = b.restX;
      ys[i] = b.restY;
      rs[i] = b.radius;
      fixed[i] = b.selected;
    }

    const gap = CONFIG.pushGap;
    const pad = CONFIG.boundPad;
    const maxW = this.width;
    const maxH = this.height;

    for (let pass = 0; pass < CONFIG.pushPasses; pass++) {
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = xs[j] - xs[i];
          const dy = ys[j] - ys[i];
          let dist = Math.hypot(dx, dy);
          if (dist < 0.001) dist = 0.001;
          const minDist = rs[i] + rs[j] + gap;
          const pen = minDist - dist;
          if (pen <= 0) continue;

          const nx = dx / dist;
          const ny = dy / dist;

          if (fixed[i] && fixed[j]) continue;

          if (fixed[i] && !fixed[j]) {
            xs[j] += nx * pen;
            ys[j] += ny * pen;
          } else if (!fixed[i] && fixed[j]) {
            xs[i] -= nx * pen;
            ys[i] -= ny * pen;
          } else {
            const half = pen * 0.5;
            xs[i] -= nx * half;
            ys[i] -= ny * half;
            xs[j] += nx * half;
            ys[j] += ny * half;
          }
        }
      }

      for (let i = 0; i < n; i++) {
        if (fixed[i]) continue;
        const r = rs[i];
        if (xs[i] - r < pad) xs[i] = pad + r;
        if (xs[i] + r > maxW - pad) xs[i] = maxW - pad - r;
        if (ys[i] - r < pad) ys[i] = pad + r;
        if (ys[i] + r > maxH - pad) ys[i] = maxH - pad - r;
      }
    }

    const targets = new Array(n);
    for (let i = 0; i < n; i++) {
      const b = this.bubbles[i];
      targets[i] = {
        ox: fixed[i] ? 0 : xs[i] - b.restX,
        oy: fixed[i] ? 0 : ys[i] - b.restY
      };
    }
    return targets;
  }

  _updatePushOffsets() {
    const hasExpanded = this.bubbles.some(b => b.scale > 1.004);
    const targets = hasExpanded
      ? this._computePushTargets()
      : this.bubbles.map(() => ({ ox: 0, oy: 0 }));

    this.bubbles.forEach((b, i) => {
      b.targetOffsetX = targets[i].ox;
      b.targetOffsetY = targets[i].oy;
    });
  }

  bindCanvas(canvas, onDirty) {
    this._canvas = canvas;
    this.bubbles.forEach(b => {
      b.loadCover(canvas, () => {
        this._dirty = true;
        if (onDirty) onDirty();
      });
    });
  }

  setSelectedMap(selectedMap) {
    this.bubbles.forEach(b => {
      b.setSelection(!!(selectedMap && selectedMap[b.key]));
    });
    this._updatePushOffsets();
    this._dirty = true;
  }

  setPressingKey(key) {
    this.bubbles.forEach(b => {
      b.setPressing(b.key === key && !b.selected);
    });
    this._dirty = true;
  }

  hitTest(x, y) {
    const sorted = [...this.bubbles].sort((a, b) => {
      if (a.selected !== b.selected) return a.selected ? 1 : -1;
      return b.zIndex - a.zIndex;
    });
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (sorted[i].contains(x, y)) return sorted[i].key;
    }
    return null;
  }

  step(dt) {
    this.time += dt;
    let animating = false;

    this.bubbles.forEach(b => {
      b.updateScale(dt);
      if (b.isAnimating()) animating = true;
    });

    this._updatePushOffsets();

    this.bubbles.forEach(b => {
      b.updateOffset(dt);
      b.updateFloat(this.time);
      if (b.isAnimating()) animating = true;
    });

    this._dirty = this._dirty || animating;
    return this._dirty;
  }

  needsRender() {
    return this._dirty;
  }

  markRendered() {
    this._dirty = false;
  }

  _drawBubble(ctx, bubble) {
    const r = bubble.radius;
    const cx = bubble.cx;
    const cy = bubble.cy + bubble.floatY;
    if (!isFiniteNum(cx) || !isFiniteNum(cy) || !isFiniteNum(r) || r <= 0) return;

    const grad = ctx.createRadialGradient(
      cx - r * 0.28,
      cy - r * 0.32,
      Math.max(0.5, r * 0.05),
      cx,
      cy,
      Math.max(r + 1, r * 1.15)
    );

    if (bubble.selected) {
      grad.addColorStop(0, 'rgba(255, 245, 238, 0.92)');
      grad.addColorStop(0.45, 'rgba(253, 210, 190, 0.55)');
      grad.addColorStop(1, 'rgba(160, 48, 31, 0.38)');
    } else {
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
      grad.addColorStop(0.5, 'rgba(255, 249, 240, 0.38)');
      grad.addColorStop(1, 'rgba(160, 48, 31, 0.14)');
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    if (bubble.selected && bubble.coverReady && bubble.coverImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = 0.72;
      const imgR = r * 1.15;
      ctx.drawImage(bubble.coverImage, cx - imgR, cy - imgR, imgR * 2, imgR * 2);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bubble.selected
      ? 'rgba(253, 236, 236, 0.22)'
      : 'rgba(255, 255, 255, 0.28)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = bubble.selected
      ? 'rgba(255, 255, 255, 0.82)'
      : 'rgba(255, 255, 255, 0.58)';
    ctx.lineWidth = bubble.selected ? 2.2 : 1.6;
    ctx.stroke();

    if (bubble.selected) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(160, 48, 31, 0.35)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    ctx.fillStyle = bubble.selected ? 'rgba(255, 255, 255, 0.96)' : 'rgba(124, 36, 24, 0.88)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = clamp(r * 0.26, 11, 16);
    ctx.font = `${bubble.selected ? '600' : '500'} ${fontSize}px sans-serif`;
    ctx.shadowColor = bubble.selected ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = bubble.selected ? 4 : 2;
    ctx.fillText(bubble.label, cx, cy);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  render(ctx) {
    const sorted = [...this.bubbles].sort((a, b) => {
      if (a.selected !== b.selected) return a.selected ? 1 : -1;
      const boostA = a.pressing ? 50 : 0;
      const boostB = b.pressing ? 50 : 0;
      return (a.zIndex + boostA) - (b.zIndex + boostB);
    });

    sorted.forEach(bubble => this._drawBubble(ctx, bubble));
    this.markRendered();
  }
}

function computeFieldMetrics(windowInfo) {
  const windowWidth = windowInfo.windowWidth || 375;
  const windowHeight = windowInfo.windowHeight || 667;
  const aspect = windowHeight / windowWidth;
  const fieldHeightRpx = Math.round(Math.min(860, Math.max(720, 720 + (aspect - 1.78) * 120)));
  const width = Math.max(1, Math.floor(windowWidth));
  const height = Math.max(1, rpxToPx(fieldHeightRpx, windowWidth));

  return { fieldWidthRpx: 750, fieldHeightRpx, width, height, windowWidth };
}

module.exports = {
  SoftBodyBubbleEngine,
  SimpleBubble,
  SIZE_RPX,
  computeFieldMetrics,
  rpxToPx
};
