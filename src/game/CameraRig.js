import * as THREE from 'three';

/**
 * Third-person camera that follows the player and aligns its "up"
 * to the inverse of the current gravity. Mouse rotates yaw/pitch
 * in a gravity-relative frame.
 */
export class CameraRig {
  constructor(camera, { distance = 6.5, height = 2.0 } = {}) {
    this.camera = camera;
    this.distance = distance;
    this.height = height;

    // Yaw/pitch in the gravity-local frame
    this.yaw = 0;
    this.pitch = 0.35;

    this.minPitch = -0.4;
    this.maxPitch = 1.25;

    this.mouseSensitivity = 0.0028;

    // Current "world up" the camera uses — slerps to -gravity
    this.currentUp = new THREE.Vector3(0, 1, 0);
    this.targetUp = new THREE.Vector3(0, 1, 0);

    // Screen-right / screen-forward projected onto the player's movement
    // plane. Refreshed each frame from camera.matrixWorld after lookAt.
    this.screenRight = new THREE.Vector3(1, 0, 0);
    this.screenForward = new THREE.Vector3(0, 0, -1);

    // Reference frame (yaw=0 direction) anchored to player's forward.
    // We rotate the frame with the up vector during gravity shifts.
    this.frameRight = new THREE.Vector3(1, 0, 0);
    this.frameForward = new THREE.Vector3(0, 0, -1);
  }

  setGravityDirection(gravityDir) {
    const newUp = gravityDir.clone().multiplyScalar(-1).normalize();
    if (newUp.equals(this.targetUp)) return;

    // Rotate frame vectors so the player's heading doesn't randomly snap.
    // For antipodal flips (180°), force the rotation axis to be the current
    // "right" so the camera does a clean forward-roll, not a roll around
    // the view axis (which is what setFromUnitVectors would arbitrarily pick).
    let q;
    if (this.targetUp.dot(newUp) < -0.999) {
      const right = new THREE.Vector3().crossVectors(this.frameForward, this.targetUp).normalize();
      q = new THREE.Quaternion().setFromAxisAngle(right, Math.PI);
    } else {
      q = new THREE.Quaternion().setFromUnitVectors(this.targetUp, newUp);
    }
    this.frameRight.applyQuaternion(q).normalize();
    this.frameForward.applyQuaternion(q).normalize();

    this.targetUp.copy(newUp);
  }

  addMouse(dx, dy) {
    this.yaw -= dx * this.mouseSensitivity;
    this.pitch -= dy * this.mouseSensitivity;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
  }

  update(playerPos, dt) {
    // Slerp current up toward target up (visual smoothing)
    const slerpRate = 1 - Math.exp(-dt * 8);
    const q = new THREE.Quaternion().setFromUnitVectors(this.currentUp, this.targetUp);
    const qSlerp = new THREE.Quaternion().slerp(q, slerpRate);
    this.currentUp.applyQuaternion(qSlerp).normalize();

    // Build basis from current up and yaw
    const up = this.currentUp;
    const yawQ = new THREE.Quaternion().setFromAxisAngle(up, this.yaw);
    const forward = this.frameForward.clone().applyQuaternion(yawQ).normalize();
    const right = new THREE.Vector3().crossVectors(forward, up).normalize();

    // Pitch around right axis
    const pitchQ = new THREE.Quaternion().setFromAxisAngle(right, this.pitch);
    const camDir = forward.clone().applyQuaternion(pitchQ).normalize();

    // Position camera behind & above
    const offset = camDir.clone().multiplyScalar(-this.distance)
      .addScaledVector(up, this.height);

    this.camera.position.copy(playerPos).add(offset);
    this.camera.up.copy(up);
    this.camera.lookAt(playerPos);
    this.camera.updateMatrixWorld(true);

    // Read screen basis directly from the camera matrix (column 0 = camera
    // local +X = screen right; column 2 = camera local +Z = screen back).
    // This guarantees the movement keys match what the user actually sees,
    // independent of any cross-product sign mistake.
    const tmp = new THREE.Vector3();
    this.camera.matrixWorld.extractBasis(this.screenRight, tmp, this.screenForward);
    this.screenForward.negate(); // local -Z is "into the screen"

    // Project both onto plane perpendicular to up
    const upAlongR = this.screenRight.dot(up);
    this.screenRight.addScaledVector(up, -upAlongR).normalize();
    const upAlongF = this.screenForward.dot(up);
    this.screenForward.addScaledVector(up, -upAlongF).normalize();
  }
}
