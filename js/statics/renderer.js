"use strict";

import { 
  FORCE_RENDERING,
  OBJECT_TYPES, 
} from "./constants.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const sceneLayer = document.getElementById("scene-layer");
const emptySceneMessage = document.getElementById(
  "empty-scene-message"
);
const objectCount = document.getElementById("object-count");

/**
 * Draws the complete model snapshot.
 */
export function renderModel(modelSnapshot) {
  if (!sceneLayer) {
    throw new Error(
      "The SVG scene layer could not be found."
    );
  }

  sceneLayer.replaceChildren();

  const objects = Array.isArray(modelSnapshot?.objects)
    ? modelSnapshot.objects
    : [];

  const ground = objects.find(
    (object) => object.type === OBJECT_TYPES.GROUND
  );

  const body = objects.find(
    (object) => object.type === OBJECT_TYPES.RIGID_BODY
  );

  if (ground) {
    sceneLayer.appendChild(renderGround(ground));
  }

  if (body) {
    sceneLayer.appendChild(renderRigidBody(body));
  }

    objects.forEach((object) => {
    if (!body || !ground) {
      return;
    }
  
    if (object.type === OBJECT_TYPES.PIN_SUPPORT) {
      sceneLayer.appendChild(
        renderPinSupport(object, body, ground)
      );
    }
  
    if (object.type === OBJECT_TYPES.ROLLER_SUPPORT) {
      sceneLayer.appendChild(
        renderRollerSupport(object, body, ground)
      );
    }
  
    if (object.type === OBJECT_TYPES.POINT_FORCE) {
      sceneLayer.appendChild(
        renderPointForce(object, body)
      );
    }
  });

  updateEmptySceneMessage(objects);
  updateObjectCount(objects);
}

function renderGround(ground) {
  const group = createSvgElement("g");

  group.classList.add(
    "scene-object",
    "scene-ground"
  );

  group.dataset.objectId = ground.id;
  group.dataset.objectType = ground.type;

  const mainLine = createSvgElement("line");

  setAttributes(mainLine, {
    x1: ground.xStart,
    y1: ground.y,
    x2: ground.xEnd,
    y2: ground.y,
  });

  mainLine.classList.add("scene-ground-line");
  group.appendChild(mainLine);

  const hatchSpacing = 24;

  for (
    let x = ground.xStart;
    x <= ground.xEnd;
    x += hatchSpacing
  ) {
    const hatch = createSvgElement("line");

    setAttributes(hatch, {
      x1: x,
      y1: ground.y,
      x2: x - 13,
      y2: ground.y + 16,
    });

    hatch.classList.add("scene-ground-hatch");
    group.appendChild(hatch);
  }

  const label = createSvgElement("text");

  setAttributes(label, {
    x: ground.xStart,
    y: ground.y + 43,
  });

  label.classList.add("scene-ground-label");
  label.textContent = "FIXED GROUND";

  group.appendChild(label);

  return group;
}

function renderRigidBody(body) {
  const group = createSvgElement("g");

  group.classList.add(
    "scene-object",
    "scene-rigid-body"
  );

  group.dataset.objectId = body.id;
  group.dataset.objectType = body.type;

  setAttributes(group, {
    transform:
      `rotate(${body.rotation} ${body.centerX} ${body.centerY})`,
  });

  const rectangle = createSvgElement("rect");

  setAttributes(rectangle, {
    x: body.centerX - body.width / 2,
    y: body.centerY - body.height / 2,
    width: body.width,
    height: body.height,
    rx: 10,
    ry: 10,
  });

  rectangle.classList.add("rigid-body-shape");
  group.appendChild(rectangle);

  const upperLabel = createSvgElement("text");

  setAttributes(upperLabel, {
    x: body.centerX,
    y: body.centerY - 8,
    "text-anchor": "middle",
  });

  upperLabel.classList.add("rigid-body-label");
  upperLabel.textContent = body.label;

  group.appendChild(upperLabel);

  const lowerLabel = createSvgElement("text");

  setAttributes(lowerLabel, {
    x: body.centerX,
    y: body.centerY + 20,
    "text-anchor": "middle",
  });

  lowerLabel.classList.add("rigid-body-subtitle");
  lowerLabel.textContent = "2D rigid object";

  group.appendChild(lowerLabel);

  const centerMarker = createSvgElement("circle");

  setAttributes(centerMarker, {
    cx: body.centerX,
    cy: body.centerY,
    r: 4,
  });

  centerMarker.classList.add("rigid-body-center");
  group.appendChild(centerMarker);

  return group;
}

function renderPinSupport(
  support,
  body,
  ground
) {
  const anchor = convertBodyLocalPointToScene(
    body,
    support.localX,
    support.localY
  );

  const group = createSupportGroup(support);

  const triangleApexY = Math.max(
    anchor.y + 8,
    ground.y - 50
  );

  const triangleBaseY = ground.y - 2;
  const triangleHalfWidth = 28;

  group.appendChild(
    createLine(
      anchor.x,
      anchor.y,
      anchor.x,
      triangleApexY,
      "support-stem"
    )
  );

  const triangle = createSvgElement("path");

  setAttributes(triangle, {
    d: [
      `M ${anchor.x} ${triangleApexY}`,
      `L ${anchor.x - triangleHalfWidth} ${triangleBaseY}`,
      `L ${anchor.x + triangleHalfWidth} ${triangleBaseY}`,
      "Z",
    ].join(" "),
  });

  triangle.classList.add("support-pin-shape");
  group.appendChild(triangle);

  group.appendChild(
    createLine(
      anchor.x - triangleHalfWidth - 8,
      triangleBaseY,
      anchor.x + triangleHalfWidth + 8,
      triangleBaseY,
      "support-base-line"
    )
  );

  group.appendChild(createSupportAnchor(anchor));

  return group;
}

function renderRollerSupport(
  support,
  body,
  ground
) {
  const anchor = convertBodyLocalPointToScene(
    body,
    support.localX,
    support.localY
  );

  const group = createSupportGroup(support);

  const plateY = Math.max(
    anchor.y + 8,
    ground.y - 35
  );

  const plateHalfWidth = 28;
  const rollerRadius = 7;
  const rollerCenterY = ground.y - rollerRadius;

  group.appendChild(
    createLine(
      anchor.x,
      anchor.y,
      anchor.x,
      plateY,
      "support-stem"
    )
  );

  group.appendChild(
    createLine(
      anchor.x - plateHalfWidth,
      plateY,
      anchor.x + plateHalfWidth,
      plateY,
      "support-roller-plate"
    )
  );

  [-17, 0, 17].forEach((offsetX) => {
    const roller = createSvgElement("circle");

    setAttributes(roller, {
      cx: anchor.x + offsetX,
      cy: rollerCenterY,
      r: rollerRadius,
    });

    roller.classList.add("support-roller-wheel");
    group.appendChild(roller);
  });

  group.appendChild(createSupportAnchor(anchor));

  return group;
}




function renderPointForce(force, body) {
  const anchor = convertBodyLocalPointToScene(
    body,
    force.localX,
    force.localY
  );

  const angleRadians =
    (force.angle * Math.PI) / 180;

  /*
   * Physical y is positive upward, while SVG y is positive downward.
   */
  const direction = {
    x: Math.cos(angleRadians),
    y: -Math.sin(angleRadians),
  };

  const perpendicular = {
    x: -direction.y,
    y: direction.x,
  };

  const tail = {
    x:
      anchor.x -
      direction.x *
        FORCE_RENDERING.arrowLength,

    y:
      anchor.y -
      direction.y *
        FORCE_RENDERING.arrowLength,
  };

  const arrowBase = {
    x:
      anchor.x -
      direction.x *
        FORCE_RENDERING.arrowHeadLength,

    y:
      anchor.y -
      direction.y *
        FORCE_RENDERING.arrowHeadLength,
  };

  const group = createSvgElement("g");

  group.classList.add(
    "scene-object",
    "scene-point-force"
  );

  group.dataset.objectId = force.id;
  group.dataset.objectType = force.type;

  group.appendChild(
    createLine(
      tail.x,
      tail.y,
      arrowBase.x,
      arrowBase.y,
      "force-shaft"
    )
  );

  const arrowHead = createSvgElement("polygon");

  const firstBasePoint = {
    x:
      arrowBase.x +
      perpendicular.x *
        FORCE_RENDERING.arrowHeadHalfWidth,

    y:
      arrowBase.y +
      perpendicular.y *
        FORCE_RENDERING.arrowHeadHalfWidth,
  };

  const secondBasePoint = {
    x:
      arrowBase.x -
      perpendicular.x *
        FORCE_RENDERING.arrowHeadHalfWidth,

    y:
      arrowBase.y -
      perpendicular.y *
        FORCE_RENDERING.arrowHeadHalfWidth,
  };

  setAttributes(arrowHead, {
    points: [
      `${anchor.x},${anchor.y}`,
      `${firstBasePoint.x},${firstBasePoint.y}`,
      `${secondBasePoint.x},${secondBasePoint.y}`,
    ].join(" "),
  });

  arrowHead.classList.add("force-arrow-head");
  group.appendChild(arrowHead);

  const applicationPoint =
    createSvgElement("circle");

  setAttributes(applicationPoint, {
    cx: anchor.x,
    cy: anchor.y,
    r: 5,
  });

  applicationPoint.classList.add(
    "force-application-point"
  );

  group.appendChild(applicationPoint);

  const label = createSvgElement("text");

  setAttributes(label, {
    x: tail.x + perpendicular.x * 18,
    y: tail.y + perpendicular.y * 18,
    "text-anchor": "middle",
  });

  label.classList.add("force-label");
  label.textContent =
    `${force.magnitude} ${force.unit}`;

  group.appendChild(label);

  return group;
}





function createSupportGroup(support) {
  const group = createSvgElement("g");

  group.classList.add(
    "scene-object",
    "scene-support"
  );

  group.dataset.objectId = support.id;
  group.dataset.objectType = support.type;

  return group;
}

function createSupportAnchor(anchor) {
  const marker = createSvgElement("circle");

  setAttributes(marker, {
    cx: anchor.x,
    cy: anchor.y,
    r: 5,
  });

  marker.classList.add("support-anchor");

  return marker;
}

function createLine(
  x1,
  y1,
  x2,
  y2,
  className
) {
  const line = createSvgElement("line");

  setAttributes(line, {
    x1,
    y1,
    x2,
    y2,
  });

  line.classList.add(className);

  return line;
}

function convertBodyLocalPointToScene(
  body,
  localX,
  localY
) {
  const angleRadians =
    (body.rotation * Math.PI) / 180;

  const cosine = Math.cos(angleRadians);
  const sine = Math.sin(angleRadians);

  return {
    x:
      body.centerX +
      localX * cosine -
      localY * sine,

    y:
      body.centerY +
      localX * sine +
      localY * cosine,
  };
}

function updateEmptySceneMessage(objects) {
  if (!emptySceneMessage) {
    return;
  }

  const hasBody = objects.some(
    (object) => object.type === OBJECT_TYPES.RIGID_BODY
  );

  emptySceneMessage.style.display = hasBody ? "none" : "";

  emptySceneMessage.setAttribute(
    "aria-hidden",
    String(hasBody)
  );
}

function updateObjectCount(objects) {
  if (!objectCount) {
    return;
  }

  const modelObjectCount = objects.filter(
    (object) => object.type !== OBJECT_TYPES.GROUND
  ).length;

  objectCount.textContent =
    modelObjectCount === 1
      ? "1 model object"
      : `${modelObjectCount} model objects`;
}

function createSvgElement(elementName) {
  return document.createElementNS(
    SVG_NAMESPACE,
    elementName
  );
}

function setAttributes(element, attributes) {
  Object.entries(attributes).forEach(
    ([attributeName, value]) => {
      element.setAttribute(attributeName, String(value));
    }
  );
}
