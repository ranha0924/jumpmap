import * as THREE from 'three';

const PLATFORM_COLORS = {
  default: 0xf5e9c8,
  spawn:   0x8ee87f,
  goal:    0xff64d9,
  hint:    0xc89cff,
  hazard:  0xff5050,
  ceiling: 0xb8e0ff,
  wall:    0xd9b878,
};

export class LevelLoader {
  constructor(scene) {
    this.scene = scene;
    this.platforms = [];
    this.meshes = [];
    this.goal = null;
    this.spawn = new THREE.Vector3(0, 2, 0);
    this.shiftLimit = Infinity;
    this.name = '';
    this.skyColor = 0x0a0a1e;
  }

  clear() {
    for (const m of this.meshes) {
      this.scene.remove(m);
      m.geometry?.dispose();
      m.material?.dispose?.();
    }
    this.platforms = [];
    this.meshes = [];
    this.goal = null;
  }

  load(level) {
    this.clear();
    this.name = level.name || 'Untitled';
    this.spawn.fromArray(level.spawn || [0, 2, 0]);
    this.shiftLimit = level.shiftLimit ?? Infinity;
    this.skyColor = level.skyColor ?? 0x0a0a1e;

    for (const box of level.boxes || []) {
      this._addBox(box);
    }

    if (level.goal) {
      this._addGoal(level.goal);
    }
  }

  _addBox(box) {
    const pos = new THREE.Vector3().fromArray(box.pos);
    const size = new THREE.Vector3().fromArray(box.size);
    const halfSize = size.clone().multiplyScalar(0.5);
    const min = pos.clone().sub(halfSize);
    const max = pos.clone().add(halfSize);
    const type = box.type || 'default';

    const colorHex = PLATFORM_COLORS[type] || PLATFORM_COLORS.default;

    const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.meshes.push(mesh);

    // Edge wireframe for visual clarity
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
    );
    edges.position.copy(pos);
    this.scene.add(edges);
    this.meshes.push(edges);

    this.platforms.push({ min, max, type, pos, size });
  }

  _addGoal(goal) {
    const pos = new THREE.Vector3().fromArray(goal.pos);
    const radius = goal.radius ?? 0.9;

    const ringGeo = new THREE.TorusGeometry(radius, 0.08, 12, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xff64d9,
      emissive: 0xff64d9,
      emissiveIntensity: 1.2,
      metalness: 0.3,
    });

    const group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = (i * Math.PI) / 3;
      ring.rotation.y = (i * Math.PI) / 4;
      group.add(ring);
    }

    const innerGeo = new THREE.SphereGeometry(radius * 0.55, 16, 12);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
    });
    group.add(new THREE.Mesh(innerGeo, innerMat));

    group.position.copy(pos);
    this.scene.add(group);
    this.meshes.push(group);

    this.goal = { pos, radius, mesh: group };
  }

  update(dt, time) {
    if (this.goal) {
      this.goal.mesh.rotation.y += dt * 0.8;
      this.goal.mesh.rotation.x += dt * 0.4;
      this.goal.mesh.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
    }
  }
}
