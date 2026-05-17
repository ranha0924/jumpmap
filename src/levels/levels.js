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

  // -------------------------------------------------------------------------
  // 3-2 · 좁은 발판 — precision: tiny floating pads, flip mid-air to alternate
  // floor↔ceiling pads, no continuous surface
  // -------------------------------------------------------------------------
  {
    id: '3-2',
    name: '3-2 · 좁은 발판',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    skyColor: 0x0a0a1e,
    boxes: [
      // Spawn floor (small): x = -1.5 to 1.5
      { pos: [0, 0, 0], size: [3, 1, 3], type: 'spawn' },
      // Ceiling pad B: x = 1 to 7
      { pos: [4, 4.5, 0], size: [6, 0.5, 2], type: 'ceiling' },
      // Floor pad C: x = 5 to 8 (overlaps B at 5-7)
      { pos: [6.5, 0, 0], size: [3, 1, 3] },
      // Ceiling pad D: x = 6 to 12 (overlaps C at 6-8)
      { pos: [9, 4.5, 0], size: [6, 0.5, 2], type: 'ceiling' },
      // Floor pad E: x = 10 to 13 (overlaps D at 10-12)
      { pos: [11.5, 0, 0], size: [3, 1, 3] },
      // Ceiling pad F: x = 11 to 17 (overlaps E at 11-13)
      { pos: [14, 4.5, 0], size: [6, 0.5, 2], type: 'ceiling' },
      // Goal floor: x = 15.5 to 18.5 (overlaps F at 15.5-17)
      { pos: [17, 0, 0], size: [3, 1, 3], type: 'goal' },
    ],
    goal: { pos: [17, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 3-3 · 두 다리 — parallel floor / ceiling bridges with offset gaps, must
  // alternate sides at every gap
  // -------------------------------------------------------------------------
  {
    id: '3-3',
    name: '3-3 · 두 다리',
    spawn: [0, 1.5, 0],
    shiftLimit: 6,
    skyColor: 0x0c0a20,
    boxes: [
      // Floor segments (top y=0.5)
      { pos: [2, 0, 0], size: [4, 1, 4], type: 'spawn' },   // A: x = 0-4
      { pos: [10, 0, 0], size: [4, 1, 4] },                 // B: x = 8-12
      { pos: [18, 0, 0], size: [4, 1, 4] },                 // C: x = 16-20
      { pos: [26, 0, 0], size: [4, 1, 4], type: 'goal' },   // D: x = 24-28
      // Ceiling segments (bottom y=4.5) — cover the floor gaps
      { pos: [6, 5, 0], size: [8, 1, 4], type: 'ceiling' }, // a: x = 2-10
      { pos: [14, 5, 0], size: [8, 1, 4], type: 'ceiling' },// b: x = 10-18
      { pos: [22, 5, 0], size: [8, 1, 4], type: 'ceiling' },// c: x = 18-26
    ],
    goal: { pos: [26, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 4-1 · 가속 슬라롬 — long corridor, tight alternating obstacles
  // -------------------------------------------------------------------------
  {
    id: '4-1',
    name: '4-1 · 가속 슬라롬',
    spawn: [0, 1.5, 0],
    shiftLimit: 9,
    skyColor: 0x100828,
    boxes: [
      // Continuous floor and ceiling
      { pos: [13, 0, 0], size: [30, 1, 4], type: 'spawn' },
      { pos: [13, 8, 0], size: [30, 1, 4], type: 'ceiling' },
      // Ground obstacles (top y=4.5, just above max jump y=4.0 — must flip)
      { pos: [4, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },
      { pos: [12, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },
      { pos: [20, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },
      // Ceiling stalactites (bottom y=3.5)
      { pos: [8, 5.75, 0], size: [1, 4.5, 4], type: 'wall' },
      { pos: [16, 5.75, 0], size: [1, 4.5, 4], type: 'wall' },
      { pos: [24, 5.75, 0], size: [1, 4.5, 4], type: 'wall' },
      // Goal pad
      { pos: [27, 0.6, 0], size: [2, 0.2, 3], type: 'goal' },
    ],
    goal: { pos: [27, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 4-2 · 함정 천장 — ceiling only exists in patches; flipping in wrong spot
  // sends you into the void
  // -------------------------------------------------------------------------
  {
    id: '4-2',
    name: '4-2 · 함정 천장',
    spawn: [0, 1.5, 0],
    shiftLimit: Infinity,
    skyColor: 0x18062a,
    boxes: [
      // Long continuous floor
      { pos: [15, 0, 0], size: [34, 1, 4], type: 'spawn' },
      // Walls blocking floor progression (top y=4.5, unjumpable — max jump
      // reaches ball top y=4.0)
      { pos: [8, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },
      { pos: [18, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },
      { pos: [28, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },
      // Ceiling patches only above wall regions, at low height so flip-fall
      // trajectory still lands on the patch even at rolling speed
      { pos: [8, 7, 0], size: [8, 1, 4], type: 'ceiling' },  // x = 4-12
      { pos: [18, 7, 0], size: [8, 1, 4], type: 'ceiling' }, // x = 14-22
      { pos: [28, 7, 0], size: [8, 1, 4], type: 'ceiling' }, // x = 24-32
      // Visual hint pads — "flip here"
      { pos: [6, 0.6, 0], size: [2, 0.2, 3], type: 'hint' },
      { pos: [16, 0.6, 0], size: [2, 0.2, 3], type: 'hint' },
      { pos: [26, 0.6, 0], size: [2, 0.2, 3], type: 'hint' },
      // Goal
      { pos: [31, 0.6, 0], size: [2, 0.2, 3], type: 'goal' },
    ],
    goal: { pos: [31, 1.5, 0], radius: 0.9 },
  },

  // -------------------------------------------------------------------------
  // 4-3 · 거꾸로 미로 — open chamber, goal pillar in center is unreachable
  // from the floor (walled off); navigate ceiling around stalactites
  // -------------------------------------------------------------------------
  {
    id: '4-3',
    name: '4-3 · 거꾸로 미로',
    spawn: [-8, 1.5, -8],
    shiftLimit: Infinity,
    skyColor: 0x0a0420,
    boxes: [
      // Floor plate (entire chamber)
      { pos: [0, 0, 0], size: [24, 1, 24], type: 'spawn' },
      // Ceiling plate (entire chamber, bottom y=9.5)
      { pos: [0, 10, 0], size: [24, 1, 24], type: 'ceiling' },
      // Walls boxing off the central pillar from floor approach (top y=4.5)
      { pos: [0, 2.25, -4], size: [10, 4.5, 1], type: 'wall' }, // north
      { pos: [0, 2.25,  4], size: [10, 4.5, 1], type: 'wall' }, // south
      { pos: [-4, 2.25, 0], size: [1, 4.5, 10], type: 'wall' }, // west
      { pos: [ 4, 2.25, 0], size: [1, 4.5, 10], type: 'wall' }, // east
      // Goal pillar dead-center, top y=8 (clearance below ceiling so the
      // ball doesn't wedge when rolling on the ceiling above it)
      { pos: [0, 4, 0], size: [2, 8, 2], type: 'goal' },
      // Stalactites forming partial maze on the ceiling (block ceiling movement)
      { pos: [-6, 7.5,  6], size: [3, 4, 3], type: 'wall' },
      { pos: [ 6, 7.5, -6], size: [3, 4, 3], type: 'wall' },
      { pos: [-3, 7.5, -8], size: [2, 4, 2], type: 'wall' },
      { pos: [ 8, 7.5,  3], size: [2, 4, 2], type: 'wall' },
      { pos: [-8, 7.5,  0], size: [2, 4, 2], type: 'wall' },
    ],
    // Trigger sits at the pillar top — fires once the player navigates the
    // ceiling maze to the chamber center
    goal: { pos: [0, 8.5, 0], radius: 1.2 },
  },

  // -------------------------------------------------------------------------
  // 5-1 · 종합 챌린지 — multi-section gauntlet, limited shifts
  // -------------------------------------------------------------------------
  {
    id: '5-1',
    name: '5-1 · 종합 챌린지',
    spawn: [0, 1.5, 0],
    shiftLimit: 10,
    skyColor: 0x1a0426,
    boxes: [
      // ===== Section A: precision pads (x ≈ 0 - 8) =====
      { pos: [0, 0, 0], size: [3, 1, 3], type: 'spawn' },        // A: x = -1.5 to 1.5
      { pos: [4, 4.5, 0], size: [6, 0.5, 2], type: 'ceiling' },  // B ceiling: x = 1 to 7
      { pos: [6.5, 0, 0], size: [3, 1, 3] },                     // C: x = 5 to 8

      // ===== Section B: slalom corridor (x ≈ 8 - 24) =====
      { pos: [16, 0, 0], size: [16, 1, 4] },                     // floor x = 8 to 24
      { pos: [16, 8, 0], size: [16, 1, 4], type: 'ceiling' },    // ceiling bottom y=7.5
      { pos: [12, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },   // ground obstacle 1
      { pos: [20, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },   // ground obstacle 2
      { pos: [16, 5.75, 0], size: [1, 4.5, 4], type: 'wall' },   // ceiling stalactite

      // ===== Section C: trap ceiling + final pillar (x ≈ 24 - 38) =====
      { pos: [31, 0, 0], size: [14, 1, 4] },                     // floor x = 24 to 38
      { pos: [28, 2.25, 0], size: [1, 4.5, 4], type: 'wall' },   // wall (top y=4.5, unjumpable)
      { pos: [31, 7, 0], size: [8, 1, 4], type: 'ceiling' },     // ceiling patch x = 27-35
      { pos: [26, 0.6, 0], size: [2, 0.2, 3], type: 'hint' },    // hint
      // Final goal pillar — jumpable from adjacent floor (top y=2.5)
      { pos: [36, 1.25, 0], size: [2, 2.5, 2], type: 'goal' },
    ],
    goal: { pos: [36, 3.0, 0], radius: 1.0 },
  },
];
