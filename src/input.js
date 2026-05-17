/**
 * Keyboard + pointer-lock mouse input.
 * Q taps toggle gravity. Space always jumps.
 */

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.state = {
      forward: false,
      back: false,
      left: false,
      right: false,
      boost: false,
    };
    this._mouseDX = 0;
    this._mouseDY = 0;
    this._lockRequested = false;

    this.onJumpPressed = null;
    this.onRespawn = null;
    this.onPause = null;
    this.onGravityToggle = null;

    this._bind();
  }

  _bind() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e));
    window.addEventListener('keyup', (e) => this._onKeyUp(e));
    this.canvas.addEventListener('click', () => {
      if (!this._lockRequested) {
        this.canvas.requestPointerLock?.();
        this._lockRequested = true;
      }
    });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement !== this.canvas) {
        this._lockRequested = false;
      }
    });
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        this._mouseDX += e.movementX || 0;
        this._mouseDY += e.movementY || 0;
      }
    });
  }

  _onKeyDown(e) {
    const code = e.code;
    if (this.keys.has(code)) return; // ignore auto-repeat
    this.keys.add(code);

    this._refreshMovementState();

    if (code === 'KeyQ') {
      this.onGravityToggle?.();
      e.preventDefault();
      return;
    }

    if (code === 'Space') {
      this.onJumpPressed?.();
      e.preventDefault();
    }

    if (code === 'KeyR') this.onRespawn?.();
    if (code === 'Escape') this.onPause?.();
  }

  _onKeyUp(e) {
    this.keys.delete(e.code);
    this._refreshMovementState();
  }

  _refreshMovementState() {
    this.state.forward = this.keys.has('KeyW');
    this.state.back = this.keys.has('KeyS');
    this.state.left = this.keys.has('KeyA');
    this.state.right = this.keys.has('KeyD');
    this.state.boost = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  mouseDelta() {
    const dx = this._mouseDX, dy = this._mouseDY;
    this._mouseDX = 0;
    this._mouseDY = 0;
    return { dx, dy };
  }
}
