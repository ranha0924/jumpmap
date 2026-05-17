import * as THREE from 'three';

/**
 * Manages the global gravity vector and 6-direction switching.
 * Gravity is always axis-aligned (±X, ±Y, ±Z) per GDD.
 */
export class GravityController {
  constructor({ strength = 22 } = {}) {
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

  /**
   * Snap an arbitrary vector to the nearest axis-aligned unit direction.
   */
  static snapToAxis(v) {
    const ax = Math.abs(v.x), ay = Math.abs(v.y), az = Math.abs(v.z);
    if (ax >= ay && ax >= az) return new THREE.Vector3(Math.sign(v.x) || 1, 0, 0);
    if (ay >= ax && ay >= az) return new THREE.Vector3(0, Math.sign(v.y) || 1, 0);
    return new THREE.Vector3(0, 0, Math.sign(v.z) || 1);
  }

  trySetDirection(dir) {
    const snapped = GravityController.snapToAxis(dir);
    // No-op if same direction (don't waste a charge)
    if (snapped.equals(this.direction)) return false;
    if (this.shiftsRemaining <= 0) return false;
    this.shiftsRemaining = Math.max(0, this.shiftsRemaining - 1);
    this.setDirection(snapped);
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
    const d = this.direction;
    if (d.x !== 0) return d.x > 0 ? '+X' : '-X';
    if (d.y !== 0) return d.y > 0 ? '+Y' : '-Y';
    return d.z > 0 ? '+Z' : '-Z';
  }
}
