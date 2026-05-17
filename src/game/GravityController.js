import * as THREE from 'three';

/**
 * Manages the global gravity vector. Restricted to ±Y — Q toggles between
 * "floor" mode (gravity points -Y) and "ceiling" mode (gravity points +Y).
 */
export class GravityController {
  constructor({ strength = 24 } = {}) {
    this.strength = strength;
    this.direction = new THREE.Vector3(0, -1, 0);
    this.vector = this.direction.clone().multiplyScalar(strength);

    this.shiftsRemaining = Infinity;
    this.maxShifts = Infinity;

    this.listeners = new Set();
  }

  setLimit(n) {
    this.maxShifts = n;
    this.shiftsRemaining = n;
  }

  reset() {
    this.setDirection(new THREE.Vector3(0, -1, 0), { silent: true });
    this.shiftsRemaining = this.maxShifts;
  }

  toggle() {
    if (this.shiftsRemaining <= 0) return false;
    this.shiftsRemaining = Math.max(0, this.shiftsRemaining - 1);
    const flipped = new THREE.Vector3(0, -this.direction.y, 0);
    this.setDirection(flipped);
    return true;
  }

  setDirection(dir, { silent = false } = {}) {
    this.direction.copy(dir).normalize();
    this.vector.copy(this.direction).multiplyScalar(this.strength);
    if (!silent) for (const l of this.listeners) l(this.direction);
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  axisLabel() {
    return this.direction.y > 0 ? '+Y' : '-Y';
  }
}
