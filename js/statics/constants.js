"use strict";

/**
 * Shared constants for the Statics Sandbox.
 *
 * Numerical values and default object dimensions should be defined here
 * instead of being scattered throughout the application.
 */

export const OBJECT_TYPES = Object.freeze({
  GROUND: "ground",
  RIGID_BODY: "rigid-body",
  PIN_SUPPORT: "pin-support",
  ROLLER_SUPPORT: "roller-support",
  POINT_FORCE: "point-force",
});

export const SCENE_SIZE = Object.freeze({
  width: 1200,
  height: 700,
});

export const DEFAULT_GROUND = Object.freeze({
  id: "ground-1",
  xStart: 100,
  xEnd: 1100,
  y: 600,
});

export const DEFAULT_BODY = Object.freeze({
  id: "body-1",
  centerX: 600,
  centerY: 445,
  width: 320,
  height: 150,
  rotation: 0,
  label: "Rigid body",
});

export const SCENE_MARGIN = 40;

export const BODY_GROUND_CLEARANCE = 45;

export const SUPPORT_PLACEMENT = Object.freeze({
  bodyHitTolerance: 18,
  minimumSpacing: 42,
});

export const LOAD_PLACEMENT = Object.freeze({
  bodyHitTolerance: 18,
});

export const DEFAULT_POINT_FORCE = Object.freeze({
  magnitude: 10,
  angle: -90,
  unit: "kN",
});

export const FORCE_RENDERING = Object.freeze({
  arrowLength: 120,
  arrowHeadLength: 18,
  arrowHeadHalfWidth: 8,
});
