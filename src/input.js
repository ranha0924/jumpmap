/**
 * Keyboard + pointer-lock mouse input.
 * Exposes:
 *   state — { forward, back, left, right, jump, boost, gravityMode }
 *   gravityIntent() — Vector3-like {x,y,z} request based on keys held while Q is down
 *   mouseDelta() — consumed each frame
 */
import * as THREE from 'three';

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.state = {
      forward: false,
      back: false,
      left: false,
      right: false,
      jump: false,
      boost: false,
      gravityMode: false,
    };
    this._mouseDX = 0;
    this._mouseDY = 0;
    this._lockRequested = false;

    this.onJumpPressed = null;
    this.onRespawn = null;
    this.onPause = null;
    this.onGravityModeEnter = null;
    this.onGravityModeExit = null;
    this.onGravityCommit = null; // called with a Vector3 axis

    this._gravityPickedAxis = null; // remember last picked axis while Q held

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
    if (this.keys.has(code)) return; // ignore repeat
    this.keys.add(code);

    // Update movement state
    this._refreshMovementState();

    // Gravity mode entry
    if (code === 'KeyQ' && !this.state.gravityMode) {
      this.state.gravityMode = true;
      this._gravityPickedAxis = null;
      this.onGravityModeEnter?.();
      e.preventDefault();
      return;
    }

    // While in gravity mode, capture direction keys to pick an axis
    if (this.state.gravityMode) {
      const axis = this._axisFromKey(code);
      if (axis) {
        this._gravityPickedAxis = axis;
        e.preventDefault();
        return;
      }
    }

    // Jump (only outside gravity mode — Space inside picks gravity-up)
    if (code === 'Space' && !this.state.gravityMode) {
      this.onJumpPressed?.();
      e.preventDefault();
    }

    if (code === 'KeyR') this.onRespawn?.();
    if (code === 'Escape') this.onPause?.();
  }

  _onKeyUp(e) {
    const code = e.code;
    this.keys.delete(code);
    this._refreshMovementState();

    if (code === 'KeyQ') {
      this.state.gravityMode = false;
      this.onGravityModeExit?.(this._gravityPickedAxis);
      this._gravityPickedAxis = null;
    }
  }

  _refreshMovementState() {
    this.state.forward = this.keys.has('KeyW');
    this.state.back = this.keys.has('KeyS');
    this.state.left = this.keys.has('KeyA');
    this.state.right = this.keys.has('KeyD');
    this.state.boost = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  /**
   * Translate a key code (pressed while Q is held) into the gravity-local axis
   * the player wants. We return a vector in **camera-relative** semantic terms
   * (forward / right / up). The caller converts to world axes.
   */
  _axisFromKey(code) {
    switch (code) {
      case 'KeyW': return 'forward';
      case 'KeyS': return 'back';
      case 'KeyA': return 'left';
      case 'KeyD': return 'right';
      case 'Space': return 'up';
      case 'ControlLeft':
      case 'ControlRight': return 'down';
      default: return null;
    }
  }

  mouseDelta() {
    const dx = this._mouseDX, dy = this._mouseDY;
    this._mouseDX = 0;
    this._mouseDY = 0;
    return { dx, dy };
  }
}
