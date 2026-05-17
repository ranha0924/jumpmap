/**
 * Level data. Coordinates are in world units (1 unit ≈ 1m).
 * box: { pos: [x,y,z], size: [w,h,d], type }
 * types: default, spawn, goal, hint, hazard, ceiling, wall
 *
 * Player sphere has radius 0.5. Default gravity is -Y.
 */

export const LEVELS = [
  // -------------------------------------------------------------------------
  // STAGE 1-1: 첫 걸음 — 그냥 점프로 도착
  // -------------------------------------------------------------------------
  {
    id: '1-1',
    name: '1-1 · 첫 걸음',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    skyColor: 0x0a0a1e,
    boxes: [
      { pos: [0, 0, 0], size: [6, 1, 6], type: 'spawn' },
      { pos: [6, 0, 0], size: [4, 1, 4] },
      { pos: [11, 0.5, 0], size: [3, 2, 3] },
      { pos: [15, 1.5, 0], size: [3, 4, 3], type: 'goal' },
    ],
    goal: { pos: [15, 4.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // STAGE 1-2: 첫 중력 전환 — 천장 도달
  // -------------------------------------------------------------------------
  {
    id: '1-2',
    name: '1-2 · 위가 아래다',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    boxes: [
      { pos: [0, 0, 0], size: [6, 1, 6], type: 'spawn' },
      // Tall wall — cannot jump over
      { pos: [5, 4, 0], size: [1, 8, 6], type: 'wall' },
      // Continuous ceiling spanning the whole stage (the new "floor" after flip)
      { pos: [6, 10, 0], size: [20, 1, 6], type: 'ceiling' },
      // Small goal accent patch on the ceiling beyond the wall (visual only)
      { pos: [14, 9.6, 0], size: [3, 0.1, 3], type: 'goal' },
    ],
    goal: { pos: [14, 8.0, 0], radius: 1.1 },
  },

  // -------------------------------------------------------------------------
  // STAGE 1-3: 옆 벽이 바닥이다
  // -------------------------------------------------------------------------
  {
    id: '1-3',
    name: '1-3 · 옆 벽도 바닥',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    boxes: [
      { pos: [0, 0, 0], size: [6, 1, 6], type: 'spawn' },
      // Side wall to the right, will become floor when gravity → +X
      { pos: [9, 4, 0], size: [1, 9, 6], type: 'wall' },
      // Small goal patch at the top of the wall (visual marker)
      { pos: [9, 8.6, 0], size: [1, 0.2, 3], type: 'goal' },
    ],
    // Goal trigger at the wall's upper edge — reach it by rolling up the
    // wall surface (i.e., shift gravity to +X so the wall becomes the floor)
    goal: { pos: [8.3, 8.0, 0], radius: 1.0 },
  },

  // -------------------------------------------------------------------------
  // STAGE 2-1: 콤보 - 점프 후 공중에서 전환
  // -------------------------------------------------------------------------
  {
    id: '2-1',
    name: '2-1 · 공중 전환',
    spawn: [0, 1.5, 0],
    shiftLimit: 4,
    boxes: [
      { pos: [0, 0, 0], size: [5, 1, 5], type: 'spawn' },
      { pos: [7, 2, 0], size: [3, 0.5, 3] },
      // Side wall to roll along
      { pos: [11, 4, 0], size: [0.8, 6, 3], type: 'wall' },
      // High platform
      { pos: [11, 8.5, 0], size: [3, 0.5, 3] },
      // Far away goal — easier from the high platform
      { pos: [16, 8.25, 0], size: [3, 1, 3], type: 'goal' },
    ],
    goal: { pos: [16, 9.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // STAGE 2-2: 6면 큐브
  // -------------------------------------------------------------------------
  {
    id: '2-2',
    name: '2-2 · 큐브의 내부',
    spawn: [0, -4, 0],
    shiftLimit: 6,
    skyColor: 0x1a0a2e,
    boxes: (() => {
      // Hollow cube walls (6 thin slabs) with goal on the ceiling (top wall)
      const half = 6, t = 0.5;
      return [
        // Floor (spawn)
        { pos: [0, -half - t / 2, 0], size: [half * 2, t, half * 2], type: 'spawn' },
        // Ceiling
        { pos: [0,  half + t / 2, 0], size: [half * 2, t, half * 2], type: 'ceiling' },
        // -X wall
        { pos: [-half - t / 2, 0, 0], size: [t, half * 2, half * 2], type: 'wall' },
        // +X wall (with a hint patch where goal sits)
        { pos: [ half + t / 2, 0, 0], size: [t, half * 2, half * 2], type: 'wall' },
        // -Z wall
        { pos: [0, 0, -half - t / 2], size: [half * 2, half * 2, t], type: 'wall' },
        // +Z wall — goal patch
        { pos: [0, 0,  half + t / 2], size: [half * 2, half * 2, t], type: 'goal' },
        // Small floating obstacle in the middle for variety
        { pos: [0, 0, 0], size: [2, 0.5, 2], type: 'hint' },
      ];
    })(),
    goal: { pos: [0, 0, 5.5], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // STAGE 3-1: 중력 미로 (제한된 전환)
  // -------------------------------------------------------------------------
  {
    id: '3-1',
    name: '3-1 · 중력 미로',
    spawn: [0, 1.5, 0],
    shiftLimit: 5,
    skyColor: 0x14062a,
    boxes: [
      { pos: [0, 0, 0], size: [4, 1, 4], type: 'spawn' },
      // Vertical shaft going up — climb by gravity→up then surface change
      { pos: [4, 2, 0], size: [0.5, 6, 4], type: 'wall' },     // right wall
      { pos: [-4, 2, 0], size: [0.5, 6, 4], type: 'wall' },    // left wall
      { pos: [0, 5.5, 0], size: [4, 0.5, 4], type: 'ceiling' },// top of shaft
      // Horizontal tunnel along +Z at top
      { pos: [0, 4.5, 4], size: [4, 0.5, 4] },                 // floor of tunnel
      { pos: [0, 8.5, 4], size: [4, 0.5, 4], type: 'ceiling' },// roof of tunnel
      // Goal pedestal at end of tunnel
      { pos: [0, 5.25, 9], size: [4, 1, 3], type: 'goal' },
    ],
    goal: { pos: [0, 6.5, 9], radius: 0.9 },
  },
];
