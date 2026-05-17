import * as THREE from 'three';

import { Player } from './game/Player.js';
import { GravityController } from './game/GravityController.js';
import { CameraRig } from './game/CameraRig.js';
import { LevelLoader } from './game/LevelLoader.js';
import { HUD } from './ui/HUD.js';
import { Input } from './input.js';
import { LEVELS } from './levels/levels.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.hud = new HUD();
    this.input = new Input(this.canvas);

    this._initRenderer();
    this._initScene();
    this.player = new Player({ radius: 0.5 });
    this.scene.add(this.player.object);

    this.gravity = new GravityController({ strength: 24 });
    this.cameraRig = new CameraRig(this.camera);
    this.levelLoader = new LevelLoader(this.scene);

    this.currentLevelIndex = 0;
    this.elapsed = 0;
    this.bestTimes = this._loadBestTimes();

    this.cleared = false;

    this._bindInput();
    this._bindGravityIndicator();
    this._buildMenu();

    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1e);
    this.scene.fog = new THREE.Fog(0x0a0a1e, 30, 120);

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 500);
    this.camera.position.set(0, 5, 10);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 200 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.6, sizeAttenuation: true, transparent: true, opacity: 0.7,
    })));

    // Lights
    const hemi = new THREE.HemisphereLight(0xb8c4ff, 0x202030, 0.6);
    this.scene.add(hemi);

    this.sun = new THREE.DirectionalLight(0xffffff, 1.4);
    this.sun.position.set(20, 30, 15);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.left = -40;
    this.sun.shadow.camera.right = 40;
    this.sun.shadow.camera.top = 40;
    this.sun.shadow.camera.bottom = -40;
    this.sun.shadow.camera.near = 0.5;
    this.sun.shadow.camera.far = 120;
    this.sun.shadow.bias = -0.0005;
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    const fill = new THREE.DirectionalLight(0x8c64ff, 0.4);
    fill.position.set(-8, 6, -10);
    this.scene.add(fill);
  }

  _bindInput() {
    this.input.onJumpPressed = () => {
      if (this.cleared) {
        this._nextStage();
        return;
      }
      this.player.jump(this.gravity.direction);
    };

    this.input.onRespawn = () => this._respawn();

    this.input.onPause = () => this._togglePause();

    this.input.onGravityToggle = () => {
      if (this.cleared || this.paused) return;
      const ok = this.gravity.toggle();
      this.hud.toast(ok ? '↕ 중력 반전!' : '전환 횟수 소진');
    };
  }

  _bindGravityIndicator() {
    this.gravity.onChange(() => {
      this.hud.setGravity(this.gravity.axisLabel());
      this.hud.setShifts(this.gravity.shiftsRemaining);
      this.cameraRig.setGravityDirection(this.gravity.direction);
    });
  }

  _loadLevel(idx) {
    this.currentLevelIndex = idx;
    const level = LEVELS[idx];
    this.levelLoader.load(level);
    this.scene.background = new THREE.Color(level.skyColor ?? 0x0a0a1e);
    this.scene.fog.color.set(level.skyColor ?? 0x0a0a1e);

    this.player.setPosition(...level.spawn);
    this.gravity.setLimit(level.shiftLimit ?? Infinity);
    this.gravity.reset();
    this.cameraRig.setGravityDirection(this.gravity.direction);
    this.cameraRig.currentUp.set(0, 1, 0);
    this.cameraRig.targetUp.set(0, 1, 0);
    this.cameraRig.frameForward.set(0, 0, -1);
    this.cameraRig.frameRight.set(1, 0, 0);
    this.cameraRig.yaw = 0;

    this.hud.setStageName(level.name);
    this.hud.setGravity(this.gravity.axisLabel());
    this.hud.setShifts(this.gravity.shiftsRemaining);
    this.hud.hideGoal();

    this.elapsed = 0;
    this.cleared = false;
  }

  _respawn() {
    this.player.respawn();
    this.gravity.reset();
    this.cameraRig.setGravityDirection(this.gravity.direction);
    this.hud.toast('리스폰');
  }

  _nextStage() {
    const next = (this.currentLevelIndex + 1) % LEVELS.length;
    this._loadLevel(next);
  }

  _bestTimeKey(level) {
    return `gravity-shift:best:${level.id}`;
  }

  _loadBestTimes() {
    const out = {};
    for (const lv of LEVELS) {
      const v = localStorage.getItem(this._bestTimeKey(lv));
      if (v != null) out[lv.id] = parseFloat(v);
    }
    return out;
  }

  _recordBest(level, time) {
    const prev = this.bestTimes[level.id];
    if (prev == null || time < prev) {
      this.bestTimes[level.id] = time;
      try { localStorage.setItem(this._bestTimeKey(level), time.toFixed(2)); } catch {}
    }
  }

  _checkGoal() {
    const goal = this.levelLoader.goal;
    if (!goal) return;
    const d = this.player.position.distanceTo(goal.pos);
    if (d < goal.radius + this.player.radius && !this.cleared) {
      this.cleared = true;
      const level = LEVELS[this.currentLevelIndex];
      this._recordBest(level, this.elapsed);
      this.hud.showGoal();
    }
  }

  _buildMenu() {
    const list = document.getElementById('stage-list');
    list.innerHTML = '';
    LEVELS.forEach((lv, idx) => {
      const card = document.createElement('div');
      card.className = 'stage-card';
      const best = this.bestTimes[lv.id];
      card.innerHTML = `
        <div class="num">${lv.id}</div>
        <div class="name">${lv.name.split('·')[1]?.trim() || lv.name}</div>
        ${best != null ? `<div class="best">⏱ ${best.toFixed(2)}s</div>` : ''}
      `;
      card.addEventListener('click', () => {
        this._loadLevel(idx);
        this._showGame();
      });
      list.appendChild(card);
    });

    // Pause menu buttons
    document.querySelectorAll('#pause button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'resume') this._togglePause();
        if (action === 'respawn') { this._respawn(); this._togglePause(); }
        if (action === 'menu') this._showMenu();
      });
    });
  }

  _showMenu() {
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('pause').classList.add('hidden');
    this._buildMenu(); // refresh best times
    this.paused = true;
  }

  _showGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    this.paused = false;
  }

  _togglePause() {
    if (document.getElementById('menu').classList.contains('hidden') === false) return;
    const pause = document.getElementById('pause');
    const wasHidden = pause.classList.contains('hidden');
    pause.classList.toggle('hidden', !wasHidden);
    this.paused = wasHidden;
    if (this.paused) {
      document.exitPointerLock?.();
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  async start() {
    // Try to load optional GLB; fall back to procedural sphere silently.
    await this.player.loadGLB('./public/models/sphere.glb');

    document.getElementById('loading').classList.add('hidden');
    this._showMenu();
    this._loadLevel(0);

    let last = performance.now();
    const loop = (now) => {
      const rawDt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this._tick(rawDt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _tick(rawDt) {
    const { dx, dy } = this.input.mouseDelta();
    if (!this.paused) this.cameraRig.addMouse(dx, dy);

    if (!this.paused) {
      const dt = rawDt;

      const camFwd = this.cameraRig.getForwardOnPlane();
      this.player.applyInput(this.input.state, camFwd, this.gravity.direction, dt);

      // Physics step
      this.player.step(dt, this.gravity.vector, this.levelLoader.platforms);
      this.player.finalizeGrounded(this.gravity.direction);

      // Camera follows
      this.cameraRig.update(this.player.position, rawDt);

      // Shadow camera follows the player
      this.sun.position.set(
        this.player.position.x + 20,
        this.player.position.y + 30,
        this.player.position.z + 15
      );
      this.sun.target.position.copy(this.player.position);

      // Level animation
      this.levelLoader.update(dt, performance.now() / 1000);

      if (!this.cleared) {
        this.elapsed += dt;
        this.hud.setTime(this.elapsed);
        this._checkGoal();
      }
    } else {
      // Even paused, render with current camera
      this.cameraRig.update(this.player.position, rawDt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

const game = new Game();
window.__game = game; // debug handle
game.start();
