const {
  SoftBodyBubbleEngine,
  computeFieldMetrics
} = require('../../utils/soft-body-bubble-engine.js');

Component({
  properties: {
    bubbles: {
      type: Array,
      value: []
    },
    selectedMap: {
      type: Object,
      value: {}
    }
  },

  data: {
    fieldHeightRpx: 760,
    canvasWidth: 300,
    canvasHeight: 400
  },

  lifetimes: {
    attached() {
      this._applyMetrics();
    },
    detached() {
      this._destroyCanvasLoop();
    },
    ready() {
      this._scheduleInit(0);
    }
  },

  observers: {
    bubbles(bubbles) {
      if (!bubbles || !bubbles.length) return;
      if (this._engine) {
        this._engine.initFromConfigs(bubbles);
        if (this._canvasNode) {
          this._engine.bindCanvas(this._canvasNode);
        }
        this._syncSelection();
        return;
      }
      this._scheduleInit(0);
    },
    selectedMap() {
      this._syncSelection();
    }
  },

  methods: {
    getWindowInfo() {
      if (wx.getWindowInfo) return wx.getWindowInfo();
      return wx.getSystemInfoSync();
    },

    _applyMetrics() {
      const metrics = computeFieldMetrics(this.getWindowInfo());
      this._metrics = metrics;
      this.setData({
        fieldHeightRpx: metrics.fieldHeightRpx,
        canvasWidth: Math.floor(metrics.width),
        canvasHeight: Math.floor(metrics.height)
      });
    },

    _syncSelection() {
      if (!this._engine) return;
      this._engine.setSelectedMap(this.properties.selectedMap);
      this._engine.setPressingKey(this._pressingKey || '');
    },

    _destroyCanvasLoop() {
      if (this._rafId != null) {
        if (this._canvasNode && this._canvasNode.cancelAnimationFrame) {
          this._canvasNode.cancelAnimationFrame(this._rafId);
        } else {
          clearTimeout(this._rafId);
        }
      }
      this._rafId = null;
      this._running = false;
    },

    _scheduleInit(retry) {
      if (this._canvasReady) return;
      const delay = retry === 0 ? 50 : 100;
      if (this._initTimer) clearTimeout(this._initTimer);
      this._initTimer = setTimeout(() => this._initCanvas(retry), delay);
    },

    _initCanvas(retry) {
      if (this._canvasReady) return;

      const metrics = this._metrics || computeFieldMetrics(this.getWindowInfo());
      const query = this.createSelectorQuery().in(this);
      query.select('#bubbleCanvas')
        .fields({ node: true, size: true })
        .exec(res => {
          const item = res && res[0];
          if (!item || !item.node) {
            if (retry < 10) this._scheduleInit(retry + 1);
            return;
          }

          let cssWidth = item.width;
          let cssHeight = item.height;
          if (!cssWidth || cssWidth < 10) cssWidth = metrics.width;
          if (!cssHeight || cssHeight < 10) cssHeight = metrics.height;

          if ((!cssWidth || !cssHeight) && retry < 10) {
            this._scheduleInit(retry + 1);
            return;
          }

          const canvas = item.node;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            if (retry < 10) this._scheduleInit(retry + 1);
            return;
          }

          const dpr = this.getWindowInfo().pixelRatio || 2;
          canvas.width = Math.floor(cssWidth * dpr);
          canvas.height = Math.floor(cssHeight * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          this._canvasNode = canvas;
          this._ctx = ctx;
          this._cssWidth = cssWidth;
          this._cssHeight = cssHeight;
          this._lastTime = Date.now();
          this._canvasReady = true;

          this.setData({
            canvasWidth: Math.floor(cssWidth),
            canvasHeight: Math.floor(cssHeight)
          });

          this._engine = new SoftBodyBubbleEngine({
            width: cssWidth,
            height: cssHeight,
            windowWidth: metrics.windowWidth
          });

          const bubbles = this.properties.bubbles || [];
          if (bubbles.length) {
            this._engine.initFromConfigs(bubbles);
            this._engine.bindCanvas(canvas);
            this._syncSelection();
          }

          this._running = true;
          this._loop();
        });
    },

    _loop() {
      if (!this._running || !this._engine || !this._ctx) return;

      const now = Date.now();
      const dt = Math.min((now - this._lastTime) / 1000, 0.032);
      this._lastTime = now;

      this._engine.step(dt);

      const ctx = this._ctx;
      ctx.clearRect(0, 0, this._cssWidth, this._cssHeight);
      this._engine.render(ctx);

      if (this._canvasNode && this._canvasNode.requestAnimationFrame) {
        this._rafId = this._canvasNode.requestAnimationFrame(() => this._loop());
      } else {
        this._rafId = setTimeout(() => this._loop(), 16);
      }
    },

    _getTouchPoint(e) {
      const touch = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      if (!touch) return null;
      return { x: touch.x, y: touch.y };
    },

    onTouchStart(e) {
      if (!this._engine) return;
      const pt = this._getTouchPoint(e);
      if (!pt) return;
      const key = this._engine.hitTest(pt.x, pt.y);
      this._pressingKey = key || '';
      this._engine.setPressingKey(this._pressingKey);
    },

    onTouchMove(e) {
      if (!this._engine || !this._pressingKey) return;
      const pt = this._getTouchPoint(e);
      if (!pt) return;
      if (!this._engine.hitTest(pt.x, pt.y)) {
        this._pressingKey = '';
        this._engine.setPressingKey('');
      }
    },

    onTouchEnd(e) {
      if (!this._engine) return;
      const pt = this._getTouchPoint(e);
      const key = pt ? this._engine.hitTest(pt.x, pt.y) : this._pressingKey;
      this._pressingKey = '';
      this._engine.setPressingKey('');
      if (key) {
        this.triggerEvent('toggle', { key });
      }
    }
  }
});
