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
