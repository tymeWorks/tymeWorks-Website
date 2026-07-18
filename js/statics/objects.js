"use strict";

import { OBJECT_TYPES } from "./constants.js";

/**
 * Creates a fixed-ground reference object.
 */
export function createGround({
  id,
  xStart,
  xEnd,
  y,
}) {
  validateIdentifier(id);
  validateFiniteNumber(xStart, "Ground start position");
  validateFiniteNumber(xEnd, "Ground end position");
  validateFiniteNumber(y, "Ground vertical position");

  if (xEnd <= xStart) {
    throw new Error(
      "Ground end position must be greater than its start position."
    );
  }

  return {
    id,
    type: OBJECT_TYPES.GROUND,
    xStart,
    xEnd,
    y,
  };
}

/**
 * Creates a two-dimensional rigid rectangular body.
 */
export function createRigidBody({
  id,
  centerX,
  centerY,
  width,
  height,
  rotation = 0,
  label = "Rigid body",
}) {
  validateIdentifier(id);
  validateFiniteNumber(centerX, "Rigid-body x position");
  validateFiniteNumber(centerY, "Rigid-body y position");
  validatePositiveNumber(width, "Rigid-body width");
  validatePositiveNumber(height, "Rigid-body height");
  validateFiniteNumber(rotation, "Rigid-body rotation");

  return {
    id,
    type: OBJECT_TYPES.RIGID_BODY,
    centerX,
    centerY,
    width,
    height,
    rotation,
    label: String(label),
  };
}

/**
 * Creates a pin support connected to a rigid body.
 *
 * localX and localY are measured in the local coordinate system
 * of the connected rigid body.
 */
export function createPinSupport({
  id,
  bodyId,
  localX,
  localY,
}) {
  validateIdentifier(id);
  validateIdentifier(bodyId);
  validateFiniteNumber(localX, "Pin-support local x position");
  validateFiniteNumber(localY, "Pin-support local y position");

  return {
    id,
    type: OBJECT_TYPES.PIN_SUPPORT,
    bodyId,
    localX,
    localY,
    reactionDirections: [0, 90],
    label: "Pin support",
  };
}

/**
 * Creates a frictionless roller support connected to a rigid body.
 *
 * The normal angle uses the physical convention:
 * zero degrees points in the positive x direction and positive angles
 * are measured counterclockwise.
 */
export function createRollerSupport({
  id,
  bodyId,
  localX,
  localY,
  normalAngle = 90,
}) {
  validateIdentifier(id);
  validateIdentifier(bodyId);
  validateFiniteNumber(localX, "Roller-support local x position");
  validateFiniteNumber(localY, "Roller-support local y position");
  validateFiniteNumber(normalAngle, "Roller-support normal angle");

  return {
    id,
    type: OBJECT_TYPES.ROLLER_SUPPORT,
    bodyId,
    localX,
    localY,
    normalAngle,
    label: "Roller support",
  };
}

/**
 * Creates a concentrated force connected to a rigid body.
 *
 * The angle follows the physical convention:
 * zero degrees points in the positive x direction and positive angles
 * are measured counterclockwise.
 */
export function createPointForce({
  id,
  bodyId,
  localX,
  localY,
  magnitude,
  angle,
  unit = "kN",
}) {
  validateIdentifier(id);
  validateIdentifier(bodyId);
  validateFiniteNumber(localX, "Force local x position");
  validateFiniteNumber(localY, "Force local y position");
  validatePositiveNumber(magnitude, "Force magnitude");
  validateFiniteNumber(angle, "Force angle");

  return {
    id,
    type: OBJECT_TYPES.POINT_FORCE,
    bodyId,
    localX,
    localY,
    magnitude,
    angle,
    unit: String(unit),
    label: "Point force",
  };
}

function validateIdentifier(id) {
  if (typeof id !== "string" || id.trim() === "") {
    throw new TypeError("Every model object must have a valid ID.");
  }
}

function validateFiniteNumber(value, propertyName) {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${propertyName} must be a finite number.`);
  }
}

function validatePositiveNumber(value, propertyName) {
  validateFiniteNumber(value, propertyName);

  if (value <= 0) {
    throw new RangeError(`${propertyName} must be greater than zero.`);
  }
}
