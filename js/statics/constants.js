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
