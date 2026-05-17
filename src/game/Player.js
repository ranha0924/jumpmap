import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const TMP_V1 = new THREE.Vector3();
const TMP_V2 = new THREE.Vector3();
const TMP_V3 = new THREE.Vector3();

/**
 * Sphere player with custom physics.
 * Tries to load a GLB at the given path; falls back to a procedural sphere mesh.
 */
export class Player {
  constructor({ radius = 0.5, mass = 1.0 } = {}) {
    this.radius = radius;
    this.mass = mass;

    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.spawn = new THREE.Vector3();

    this.grounded = false;
    this.groundNormal = new THREE.Vector3(0, 1, 0);

    this.maxSpeed = 9;
    this.acceleration = 60;
    this.airAcceleration = 18;
    this.groundFriction = 8;
    this.jumpImpulse = 11;

    this.object = new THREE.Group();
    this._buildFallbackMesh();
  }

  _buildFallbackMesh() {
    const geo = new THREE.SphereGeometry(this.radius, 32, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xe8e0ff,
      metalness: 0.5,
      roughness: 0.25,
      emissive: 0x4a2d8f,
      emissiveIntensity: 0.25,
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Add visual "stripes" so rotation is visible
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xff64d9,
      emissive: 0xff64d9,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.5,
    });
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(this.radius * 1.001, this.radius * 0.06, 8, 32),
        stripeMat
      );
      ring.rotation.x = (i * Math.PI) / 3;
      ring.rotation.y = (i * Math.PI) / 4;
      this.mesh.add(ring);
    }

    this.object.add(this.mesh);

    // Subtle glow sphere
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius * 1.4, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x8c64ff, transparent: true, opacity: 0.08 })
    );
    this.object.add(glow);
  }

  async loadGLB(url) {
    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(url);
      const replacement = gltf.scene;

      // Auto-scale to match radius
      const box = new THREE.Box3().setFromObject(replacement);
      const size = box.getSize(new THREE.Vector3()).length();
      if (size > 0) {
        const scale = (this.radius * 2 * Math.sqrt(3)) / size;
        replacement.scale.setScalar(scale);
      }
      replacement.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      this.object.remove(this.mesh);
      this.mesh = replacement;
      this.object.add(this.mesh);
      return true;
    } catch (e) {
      // Fallback already in place; silent unless dev needs it
      return false;
    }
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.spawn.copy(this.position);
    this.velocity.set(0, 0, 0);
    this.object.position.copy(this.position);
  }

  respawn() {
    this.position.copy(this.spawn);
    this.velocity.set(0, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.mesh.quaternion.identity();
  }

  jump(gravityDir) {
    if (!this.grounded) return false;
    // Impulse opposite to current gravity
    TMP_V1.copy(gravityDir).multiplyScalar(-this.jumpImpulse);
    // Replace gravity-axis component of velocity to ensure consistent jump height
    const along = this.velocity.dot(gravityDir);
    this.velocity.sub(TMP_V2.copy(gravityDir).multiplyScalar(along));
    this.velocity.add(TMP_V1);
    this.grounded = false;
    return true;
  }

  /**
   * Apply input as acceleration in the camera-relative horizontal plane,
   * where "horizontal" is perpendicular to current gravity.
   */
  applyInput(input, camForward, gravityDir, dt) {
    // Project camera forward onto plane perpendicular to gravity
    const fwd = TMP_V1.copy(camForward);
    const fwdAlong = fwd.dot(gravityDir);
    fwd.sub(TMP_V2.copy(gravityDir).multiplyScalar(fwdAlong));
    if (fwd.lengthSq() < 1e-6) {
      // Camera looking straight along gravity; pick arbitrary perpendicular
      fwd.set(1, 0, 0);
      const a = fwd.dot(gravityDir);
      fwd.sub(TMP_V2.copy(gravityDir).multiplyScalar(a));
    }
    fwd.normalize();
    const right = TMP_V2.crossVectors(fwd, gravityDir).normalize();

    const wishDir = TMP_V3.set(0, 0, 0);
    if (input.forward) wishDir.add(fwd);
    if (input.back) wishDir.sub(fwd);
    if (input.right) wishDir.add(right);
    if (input.left) wishDir.sub(right);

    const accel = this.grounded ? this.acceleration : this.airAcceleration;

    if (wishDir.lengthSq() > 0) {
      wishDir.normalize();
      const wishSpeed = this.maxSpeed * (input.boost ? 1.5 : 1.0);

      // Component of current velocity in wish direction
      const currentSpeed = this.velocity.dot(wishDir);
      const addSpeed = wishSpeed - currentSpeed;
      if (addSpeed > 0) {
        const accelSpeed = Math.min(accel * dt, addSpeed);
        this.velocity.addScaledVector(wishDir, accelSpeed);
      }
    } else if (this.grounded) {
      // Ground friction on perpendicular-to-gravity plane only
      const vAlong = this.velocity.dot(gravityDir);
      const vPlanar = TMP_V3.copy(this.velocity).sub(
        TMP_V2.copy(gravityDir).multiplyScalar(vAlong)
      );
      const speed = vPlanar.length();
      if (speed > 0.01) {
        const drop = Math.min(speed, this.groundFriction * dt);
        vPlanar.multiplyScalar((speed - drop) / speed);
        this.velocity.copy(vPlanar).addScaledVector(gravityDir, vAlong);
      }
    }
  }

  /**
   * Integrate velocity and resolve collisions against an array of AABB platforms.
   * Each platform: { min: Vector3, max: Vector3, type, userData }
   */
  step(dt, gravity, platforms, onPlatformTouch) {
    // Apply gravity
    this.velocity.addScaledVector(gravity, dt);

    // Clamp insane speeds
    const maxV = 40;
    const sp = this.velocity.length();
    if (sp > maxV) this.velocity.multiplyScalar(maxV / sp);

    // Integrate
    this.position.addScaledVector(this.velocity, dt);

    // Visual roll: rotate around the axis perpendicular to motion (in gravity plane)
    const gDir = TMP_V1.copy(gravity).normalize();
    const vPerp = TMP_V2.copy(this.velocity).sub(
      TMP_V3.copy(gDir).multiplyScalar(this.velocity.dot(gDir))
    );
    const planarSpeed = vPerp.length();
    if (planarSpeed > 0.01) {
      const axis = TMP_V3.crossVectors(gDir, vPerp).normalize();
      const angle = (planarSpeed * dt) / this.radius;
      const q = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      this.mesh.quaternion.premultiply(q);
    }

    // Collision resolution
    this.grounded = false;
    this.groundNormal.set(0, 0, 0);

    for (let iter = 0; iter < 3; iter++) {
      let collided = false;
      for (const plat of platforms) {
        const hit = this._resolveSphereAABB(plat);
        if (hit) {
          collided = true;
          if (onPlatformTouch) onPlatformTouch(plat, hit);
        }
      }
      if (!collided) break;
    }

    // Sync mesh
    this.object.position.copy(this.position);

    // Out of bounds → respawn
    if (this.position.length() > 500) this.respawn();
  }

  _resolveSphereAABB(plat) {
    const { min, max } = plat;
    const p = this.position;
    // Closest point on AABB to sphere center
    const cx = Math.max(min.x, Math.min(p.x, max.x));
    const cy = Math.max(min.y, Math.min(p.y, max.y));
    const cz = Math.max(min.z, Math.min(p.z, max.z));

    const dx = p.x - cx;
    const dy = p.y - cy;
    const dz = p.z - cz;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq >= this.radius * this.radius) return null;

    let normal;
    let penetration;
    if (distSq > 1e-8) {
      const dist = Math.sqrt(distSq);
      normal = new THREE.Vector3(dx / dist, dy / dist, dz / dist);
      penetration = this.radius - dist;
    } else {
      // Center inside AABB — push out along axis of least penetration
      const px = Math.min(p.x - min.x, max.x - p.x);
      const py = Math.min(p.y - min.y, max.y - p.y);
      const pz = Math.min(p.z - min.z, max.z - p.z);
      if (px < py && px < pz) {
        normal = new THREE.Vector3(p.x - (min.x + max.x) * 0.5 > 0 ? 1 : -1, 0, 0);
        penetration = px + this.radius;
      } else if (py < pz) {
        normal = new THREE.Vector3(0, p.y - (min.y + max.y) * 0.5 > 0 ? 1 : -1, 0);
        penetration = py + this.radius;
      } else {
        normal = new THREE.Vector3(0, 0, p.z - (min.z + max.z) * 0.5 > 0 ? 1 : -1);
        penetration = pz + this.radius;
      }
    }

    // Push out
    this.position.addScaledVector(normal, penetration);

    // Remove velocity component into the surface
    const into = this.velocity.dot(normal);
    if (into < 0) this.velocity.addScaledVector(normal, -into);

    // Grounded if normal points opposite to gravity (within tolerance)
    // We just store the strongest "up" normal here; caller compares to gravity.
    this.groundNormal.add(normal);

    return { normal, penetration };
  }

  finalizeGrounded(gravityDir) {
    if (this.groundNormal.lengthSq() > 0) {
      this.groundNormal.normalize();
      // Up direction = -gravity
      const up = TMP_V1.copy(gravityDir).multiplyScalar(-1);
      if (this.groundNormal.dot(up) > 0.6) {
        this.grounded = true;
      }
    }
  }
}
