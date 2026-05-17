/**
 * Level data. All puzzles solvable with ±Y gravity only.
 *
 * box: { pos:[x,y,z], size:[w,h,d], type }
 * types: default, spawn, goal, hint, hazard, ceiling, wall
 *
 * Player sphere radius is 0.5. Default gravity is -Y.
 * Max jump height ≈ 2.5 units above the standing surface.
 */

export const LEVELS = [
  // -------------------------------------------------------------------------
  // 1-1 · 첫 걸음 — no flip needed, learn movement/jump
  // -------------------------------------------------------------------------
  {
    id: '1-1',
    name: '1-1 · 첫 걸음',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    skyColor: 0x0a0a1e,
    boxes: [
      { pos: [0, 0, 0], size: [5, 1, 5], type: 'spawn' },
      { pos: [5, 0.5, 0], size: [3, 2, 3] },         // top y=1.5
      { pos: [9, 1, 0], size: [3, 3, 3], type: 'goal' }, // top y=2.5
    ],
    goal: { pos: [9, 3.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 1-2 · 위가 아래다 — first flip, walk on the ceiling across a wall
  // -------------------------------------------------------------------------
  {
    id: '1-2',
    name: '1-2 · 위가 아래다',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    boxes: [
      { pos: [0, 0, 0], size: [5, 1, 5], type: 'spawn' },
      // Tall wall blocking the way — top y=8 (well above jump height)
      { pos: [5, 4, 0], size: [1, 8, 6], type: 'wall' },
      // Continuous ceiling overhead spanning the whole stage
      { pos: [5, 11, 0], size: [18, 1, 6], type: 'ceiling' },
      // Landing floor on the far side
      { pos: [10, 0, 0], size: [5, 1, 5], type: 'goal' },
    ],
    goal: { pos: [10, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 1-3 · 더 높이 — flip up, walk over, flip down onto a too-tall pedestal
  // -------------------------------------------------------------------------
  {
    id: '1-3',
    name: '1-3 · 더 높이',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    boxes: [
      { pos: [0, 0, 0], size: [5, 1, 5], type: 'spawn' },
      // Goal pedestal — top y=6, too high to jump from spawn (max ≈ 3.5)
      { pos: [5, 3, 0], size: [3, 6, 3], type: 'goal' },
      // Ceiling above the whole area — bottom y=9.5
      { pos: [3, 10, 0], size: [11, 1, 5], type: 'ceiling' },
    ],
    goal: { pos: [5, 7.5, 0], radius: 1.0 },
  },

  // -------------------------------------------------------------------------
  // 2-1 · 천장 다리 — long gap crossed via the ceiling
  // -------------------------------------------------------------------------
  {
    id: '2-1',
    name: '2-1 · 천장 다리',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    boxes: [
      { pos: [0, 0, 0], size: [5, 1, 5], type: 'spawn' },
      // Goal island, unreachable by jump (gap is 10+ units wide)
      { pos: [15, 0, 0], size: [5, 1, 5], type: 'goal' },
      // Ceiling bridge connecting both sides — bottom y=9.5
      { pos: [7.5, 10, 0], size: [22, 1, 5], type: 'ceiling' },
    ],
    goal: { pos: [15, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 2-2 · 양면 통로 — thread through alternating floor/ceiling obstacles
  // -------------------------------------------------------------------------
  {
    id: '2-2',
    name: '2-2 · 양면 통로',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    skyColor: 0x140a2a,
    boxes: [
      // Continuous floor through the corridor
      { pos: [9, 0, 0], size: [22, 1, 4], type: 'spawn' },
      // Continuous ceiling — bottom y=9.5
      { pos: [9, 10, 0], size: [22, 1, 4], type: 'ceiling' },
      // Ground obstacles (block the floor route)
      { pos: [5, 2, 0], size: [1, 3, 4], type: 'wall' },
      { pos: [11, 2, 0], size: [1, 3, 4], type: 'wall' },
      // Ceiling stalactites (block the ceiling route, at different x's)
      { pos: [8, 8, 0], size: [1, 3, 4], type: 'wall' },
      { pos: [14, 8, 0], size: [1, 3, 4], type: 'wall' },
      // Goal pad at the end (visual)
      { pos: [18, 0.6, 0], size: [2, 0.2, 3], type: 'goal' },
    ],
    goal: { pos: [18, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 3-1 · 반전 3회 — limited shifts, forced ceiling↔floor switching
  // -------------------------------------------------------------------------
  {
    id: '3-1',
    name: '3-1 · 반전 3회',
    spawn: [0, 1.5, 0],
    shiftLimit: 3,
    skyColor: 0x14062a,
    boxes: [
      // Floor A — spawn
      { pos: [0, 0, 0], size: [5, 1, 4], type: 'spawn' },
      // Wall 1 — top y=7, unjumpable
      { pos: [5, 3.5, 0], size: [1, 7, 4], type: 'wall' },
      // Mid floor B — between the walls
      { pos: [8, 0, 0], size: [5, 1, 4] },
      // Wall 2
      { pos: [11, 3.5, 0], size: [1, 7, 4], type: 'wall' },
      // Ceiling segment 1 — covers spawn through past wall 1 (x = -2 to 7)
      { pos: [2.5, 9.5, 0], size: [9, 1, 4], type: 'ceiling' },
      // Gap in ceiling (x = 7 to 9) — forces a flip down onto floor B
      // Ceiling segment 2 — covers past wall 2 (x = 9 to 14)
      { pos: [11.5, 9.5, 0], size: [5, 1, 4], type: 'ceiling' },
      // Goal pad embedded on ceiling 2 (visual marker for the target)
      { pos: [12.5, 9.0, 0], size: [2, 0.1, 3], type: 'goal' },
    ],
    // Goal triggers while rolling on ceiling 2 — no 4th flip needed
    goal: { pos: [12.5, 8.5, 0], radius: 1.0 },
  },
];
