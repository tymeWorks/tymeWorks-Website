"use strict";

import { OBJECT_TYPES } from "./constants.js";

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

  objects.forEach((object) => {
    switch (object.type) {
      case OBJECT_TYPES.GROUND:
        sceneLayer.appendChild(renderGround(object));
        break;

      case OBJECT_TYPES.RIGID_BODY:
        sceneLayer.appendChild(renderRigidBody(object));
        break;

      default:
        console.warn(
          `Renderer does not support object type: ${object.type}`
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

function updateEmptySceneMessage(objects) {
  if (!emptySceneMessage) {
    return;
  }

  const hasBody = objects.some(
    (object) => object.type === OBJECT_TYPES.RIGID_BODY
  );

  /*
   * The hidden property is not consistently applied to SVG groups
   * across browsers, so the display state is controlled explicitly.
   */
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
