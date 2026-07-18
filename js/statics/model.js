"use strict";

import {
  BODY_GROUND_CLEARANCE,
  DEFAULT_BODY,
  DEFAULT_GROUND,
  DEFAULT_POINT_FORCE,
  LOAD_PLACEMENT,
  OBJECT_TYPES,
  SCENE_MARGIN,
  SCENE_SIZE,
  SUPPORT_PLACEMENT,
} from "./constants.js";

import {
  createGround,
  createPinSupport,
  createPointForce,
  createRigidBody,
  createRollerSupport,
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

  const ground = getGroundInternal();

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

/**
 * Adds a support to the bottom edge of the rigid body.
 *
 * The user may click anywhere inside the body. The support will snap to
 * the bottom edge at the corresponding local x coordinate.
 */
export function addSupportAt(
  supportType,
  requestedX,
  requestedY
) {
  if (!Number.isFinite(requestedX) || !Number.isFinite(requestedY)) {
    return {
      ok: false,
      message: "The support position is invalid.",
    };
  }

  const body = getRigidBodyInternal();

  if (!body) {
    return {
      ok: false,
      message:
        "Add a rigid body before placing a support.",
    };
  }

  const localPoint = convertScenePointToBodyLocal(
    body,
    requestedX,
    requestedY
  );

  const halfWidth = body.width / 2;
  const halfHeight = body.height / 2;
  const tolerance = SUPPORT_PLACEMENT.bodyHitTolerance;

  const pointIsNearBody =
    Math.abs(localPoint.x) <= halfWidth + tolerance &&
    Math.abs(localPoint.y) <= halfHeight + tolerance;

  if (!pointIsNearBody) {
    return {
      ok: false,
      message:
        "Click on the rigid body to attach the support.",
    };
  }

  const attachmentLocalX = clamp(
    localPoint.x,
    -halfWidth,
    halfWidth
  );

  const attachmentLocalY = halfHeight;

  if (
    hasNearbySupport(
      body.id,
      attachmentLocalX
    )
  ) {
    return {
      ok: false,
      message:
        "Another support is already too close to this position.",
    };
  }

  const commonProperties = {
    bodyId: body.id,
    localX: attachmentLocalX,
    localY: attachmentLocalY,
  };

  let support;

  if (supportType === OBJECT_TYPES.PIN_SUPPORT) {
    support = createPinSupport({
      id: createSequentialId("pin"),
      ...commonProperties,
    });
  } else if (
    supportType === OBJECT_TYPES.ROLLER_SUPPORT
  ) {
    support = createRollerSupport({
      id: createSequentialId("roller"),
      ...commonProperties,
      normalAngle: 90,
    });
  } else {
    return {
      ok: false,
      message: "The requested support type is not supported.",
    };
  }

  state.objects.push(support);

  return {
    ok: true,
    object: cloneObject(support),
    message:
      supportType === OBJECT_TYPES.PIN_SUPPORT
        ? "Pin support attached to the rigid body."
        : "Roller support attached to the rigid body.",
  };
}



/**
 * Adds a concentrated force at a point on the rigid body.
 */
export function addPointForceAt(
  requestedX,
  requestedY
) {
  if (
    !Number.isFinite(requestedX) ||
    !Number.isFinite(requestedY)
  ) {
    return {
      ok: false,
      message: "The force position is invalid.",
    };
  }

  const body = getRigidBodyInternal();

  if (!body) {
    return {
      ok: false,
      message:
        "Add a rigid body before placing a force.",
    };
  }

  const localPoint = convertScenePointToBodyLocal(
    body,
    requestedX,
    requestedY
  );

  const halfWidth = body.width / 2;
  const halfHeight = body.height / 2;
  const tolerance =
    LOAD_PLACEMENT.bodyHitTolerance;

  const pointIsNearBody =
    Math.abs(localPoint.x) <= halfWidth + tolerance &&
    Math.abs(localPoint.y) <= halfHeight + tolerance;

  if (!pointIsNearBody) {
    return {
      ok: false,
      message:
        "Click on the rigid body to apply the force.",
    };
  }

  const force = createPointForce({
    id: createSequentialId("force"),
    bodyId: body.id,

    localX: clamp(
      localPoint.x,
      -halfWidth,
      halfWidth
    ),

    localY: clamp(
      localPoint.y,
      -halfHeight,
      halfHeight
    ),

    ...DEFAULT_POINT_FORCE,
  });

  state.objects.push(force);

  return {
    ok: true,
    object: cloneObject(force),
    message:
      "A 10 kN downward point force was added.",
  };
}




export function hasRigidBody() {
  return Boolean(getRigidBodyInternal());
}

export function getGround() {
  const ground = getGroundInternal();

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

function getGroundInternal() {
  return state.objects.find(
    (object) => object.type === OBJECT_TYPES.GROUND
  );
}

function getRigidBodyInternal() {
  return state.objects.find(
    (object) => object.type === OBJECT_TYPES.RIGID_BODY
  );
}

function hasNearbySupport(bodyId, localX) {
  return state.objects.some((object) => {
    const isSupport =
      object.type === OBJECT_TYPES.PIN_SUPPORT ||
      object.type === OBJECT_TYPES.ROLLER_SUPPORT;

    if (!isSupport || object.bodyId !== bodyId) {
      return false;
    }

    return (
      Math.abs(object.localX - localX) <
      SUPPORT_PLACEMENT.minimumSpacing
    );
  });
}

function createSequentialId(prefix) {
  const matchingObjects = state.objects.filter(
    (object) => object.id.startsWith(`${prefix}-`)
  );

  let sequenceNumber = matchingObjects.length + 1;
  let candidateId = `${prefix}-${sequenceNumber}`;

  while (
    state.objects.some(
      (object) => object.id === candidateId
    )
  ) {
    sequenceNumber += 1;
    candidateId = `${prefix}-${sequenceNumber}`;
  }

  return candidateId;
}

/**
 * Converts an SVG scene coordinate into the body's local coordinate system.
 */
function convertScenePointToBodyLocal(
  body,
  sceneX,
  sceneY
) {
  const angleRadians =
    (body.rotation * Math.PI) / 180;

  const cosine = Math.cos(angleRadians);
  const sine = Math.sin(angleRadians);

  const deltaX = sceneX - body.centerX;
  const deltaY = sceneY - body.centerY;

  return {
    x: deltaX * cosine + deltaY * sine,
    y: -deltaX * sine + deltaY * cosine,
  };
}

function cloneObject(object) {
  const clone = { ...object };

  if (Array.isArray(object.reactionDirections)) {
    clone.reactionDirections = [
      ...object.reactionDirections,
    ];
  }

  return clone;
}

function clamp(value, minimum, maximum) {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}
