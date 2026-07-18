"use strict";

import {
  BODY_GROUND_CLEARANCE,
  DEFAULT_BODY,
  DEFAULT_GROUND,
  OBJECT_TYPES,
  SCENE_MARGIN,
  SCENE_SIZE,
} from "./constants.js";

import {
  createGround,
  createRigidBody,
} from "./objects.js";

const state = {
  objects: [],
  selectedObjectId: null,
};

/**
 * Loads the default scene displayed when the application first opens.
 */
export function initializeDefaultModel() {
  state.objects = [
    createGround(DEFAULT_GROUND),
    createRigidBody(DEFAULT_BODY),
  ];

  state.selectedObjectId = null;
}

/**
 * Clears user-created model objects while preserving the fixed ground.
 */
export function resetModel() {
  state.objects = [
    createGround(DEFAULT_GROUND),
  ];

  state.selectedObjectId = null;
}

/**
 * Adds the single rigid body supported by Statics Sandbox v0.1.
 */
export function addRigidBodyAt(requestedX, requestedY) {
  if (!Number.isFinite(requestedX) || !Number.isFinite(requestedY)) {
    return {
      ok: false,
      message: "The rigid-body position is invalid.",
    };
  }

  if (hasRigidBody()) {
    return {
      ok: false,
      message:
        "Statics Sandbox v0.1 supports only one rigid body.",
    };
  }

  const ground = getGround();

  if (!ground) {
    return {
      ok: false,
      message:
        "The rigid body cannot be placed because the ground reference is missing.",
    };
  }

  const halfWidth = DEFAULT_BODY.width / 2;
  const halfHeight = DEFAULT_BODY.height / 2;

  const minimumX = SCENE_MARGIN + halfWidth;
  const maximumX =
    SCENE_SIZE.width - SCENE_MARGIN - halfWidth;

  const minimumY = SCENE_MARGIN + halfHeight;
  const maximumY =
    ground.y -
    BODY_GROUND_CLEARANCE -
    halfHeight;

  const centerX = clamp(
    requestedX,
    minimumX,
    maximumX
  );

  const centerY = clamp(
    requestedY,
    minimumY,
    maximumY
  );

  const rigidBody = createRigidBody({
    ...DEFAULT_BODY,
    centerX,
    centerY,
  });

  state.objects.push(rigidBody);

  return {
    ok: true,
    object: cloneObject(rigidBody),
    message: "Rigid body added to the model.",
  };
}

export function hasRigidBody() {
  return state.objects.some(
    (object) => object.type === OBJECT_TYPES.RIGID_BODY
  );
}

export function getGround() {
  const ground = state.objects.find(
    (object) => object.type === OBJECT_TYPES.GROUND
  );

  return ground ? cloneObject(ground) : null;
}

/**
 * Returns a defensive snapshot so rendering code cannot accidentally
 * mutate the physical model.
 */
export function getModelSnapshot() {
  return {
    objects: state.objects.map(cloneObject),
    selectedObjectId: state.selectedObjectId,
  };
}

function cloneObject(object) {
  return { ...object };
}

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}
