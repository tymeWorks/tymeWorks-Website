"use strict";

import { OBJECT_TYPES } from "./constants.js";

import {
  addPointForceAt,
  addRigidBodyAt,
  addSupportAt,
  getModelSnapshot,
  hasRigidBody,
  initializeDefaultModel,
  resetModel,
} from "./model.js";

import { renderModel } from "./renderer.js";

const toolButtons = document.querySelectorAll("[data-tool]");

const activeToolLabel = document.getElementById(
  "active-tool-label"
);

const statusText = document.getElementById("status-text");

const statusIndicator = document.getElementById(
  "status-indicator"
);

const solveButton = document.getElementById("solve-button");
const resetButton = document.getElementById("reset-button");
const fbdButton = document.getElementById("fbd-button");

const sandboxCanvas = document.getElementById(
  "sandbox-canvas"
);

const toolLabels = {
  select: "Select",
  body: "Add Body",
  "pin-support": "Add Pin Support",
  "roller-support": "Add Roller Support",
  force: "Add Force",
  moment: "Add Moment",
  delete: "Delete",
};

const bodyDependentToolNames = new Set([
  "pin-support",
  "roller-support",
  "force",
]);

let activeTool = "select";
let freeBodyDiagramEnabled = false;

initializeApplication();

function initializeApplication() {
  initializeToolButtons();
  initializeActionButtons();
  initializeSceneInteraction();

  initializeDefaultModel();
  renderCurrentModel();

  setActiveTool("select");

  setStatus(
    "Default model loaded. Add supports or forces to begin building the model.",
    "success"
  );
}

function initializeToolButtons() {
  toolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const toolName = button.dataset.tool;

      if (!toolName) {
        return;
      }

      setActiveTool(toolName);
    });
  });
}

function initializeActionButtons() {
  solveButton?.addEventListener(
    "click",
    handleSolve
  );

  resetButton?.addEventListener(
    "click",
    handleReset
  );

  fbdButton?.addEventListener(
    "click",
    toggleFreeBodyDiagram
  );
}

function initializeSceneInteraction() {
  sandboxCanvas?.addEventListener(
    "click",
    handleSceneClick
  );
}

function handleSceneClick(event) {
  const scenePoint = getScenePoint(event);

  if (!scenePoint) {
    setStatus(
      "The selected scene position could not be determined.",
      "error"
    );

    return;
  }

  if (activeTool === "body") {
    placeRigidBody(scenePoint);
    return;
  }

  if (activeTool === "pin-support") {
    placeSupport(
      OBJECT_TYPES.PIN_SUPPORT,
      scenePoint
    );

    return;
  }

  if (activeTool === "roller-support") {
    placeSupport(
      OBJECT_TYPES.ROLLER_SUPPORT,
      scenePoint
    );

    return;
  }

  if (activeTool === "force") {
    placePointForce(scenePoint);
  }
}

function placeRigidBody(scenePoint) {
  const result = addRigidBodyAt(
    scenePoint.x,
    scenePoint.y
  );

  if (!result.ok) {
    setStatus(result.message, "warning");
    return;
  }

  renderCurrentModel();
  setActiveTool("select");
  setStatus(result.message, "success");
}

function placeSupport(
  supportType,
  scenePoint
) {
  const result = addSupportAt(
    supportType,
    scenePoint.x,
    scenePoint.y
  );

  if (!result.ok) {
    setStatus(result.message, "warning");
    return;
  }

  renderCurrentModel();
  setActiveTool("select");
  setStatus(result.message, "success");
}

function placePointForce(scenePoint) {
  const result = addPointForceAt(
    scenePoint.x,
    scenePoint.y
  );

  if (!result.ok) {
    setStatus(result.message, "warning");
    return;
  }

  renderCurrentModel();
  setActiveTool("select");
  setStatus(result.message, "success");
}

function setActiveTool(toolName) {
  if (toolName === "body" && hasRigidBody()) {
    setStatus(
      "Statics Sandbox v0.1 supports only one rigid body. Reset the scene before placing another body.",
      "warning"
    );

    return;
  }

  if (
    bodyDependentToolNames.has(toolName) &&
    !hasRigidBody()
  ) {
    setStatus(
      "Add a rigid body before selecting this tool.",
      "warning"
    );

    return;
  }

  activeTool = toolName;

  toolButtons.forEach((button) => {
    const isActive =
      button.dataset.tool === toolName;

    button.classList.toggle(
      "is-active",
      isActive
    );

    button.setAttribute(
      "aria-pressed",
      String(isActive)
    );
  });

  const readableToolName =
    toolLabels[toolName] ?? toolName;

  if (activeToolLabel) {
    activeToolLabel.textContent =
      `${readableToolName} tool active`;
  }

  setStatus(
    getToolInstruction(toolName),
    "info"
  );
}

function getToolInstruction(toolName) {
  const instructions = {
    select:
      "Select an object in the scene to inspect or move it.",

    body:
      "Click inside the model space to place the single rigid body.",

    "pin-support":
      "Click on the rigid body. The pin support will snap to its bottom edge.",

    "roller-support":
      "Click on the rigid body. The roller support will snap to its bottom edge.",

    force:
      "Click on the rigid body to apply a 10 kN downward point force.",

    moment:
      "Applied-moment placement will be implemented next.",

    delete:
      "Object deletion will be implemented with object selection in Milestone 3.",
  };

  return (
    instructions[toolName] ??
    "Choose a modeling tool."
  );
}

function handleSolve() {
  setStatus(
    "The equilibrium solver has not been connected yet. It is planned for Milestone 5.",
    "warning"
  );
}

function handleReset() {
  const userConfirmed = window.confirm(
    "Reset the sandbox and remove all model objects?"
  );

  if (!userConfirmed) {
    return;
  }

  resetModel();
  renderCurrentModel();
  setActiveTool("select");

  setStatus(
    "The model was reset. The fixed ground remains available.",
    "neutral"
  );
}

function toggleFreeBodyDiagram() {
  freeBodyDiagramEnabled =
    !freeBodyDiagramEnabled;

  fbdButton?.setAttribute(
    "aria-pressed",
    String(freeBodyDiagramEnabled)
  );

  if (freeBodyDiagramEnabled) {
    setStatus(
      "Free-body-diagram mode enabled. Reaction visualization will be added later.",
      "info"
    );

    return;
  }

  setStatus(
    "Free-body-diagram mode disabled.",
    "neutral"
  );
}

function renderCurrentModel() {
  const modelSnapshot = getModelSnapshot();

  renderModel(modelSnapshot);
}

function getScenePoint(event) {
  if (!sandboxCanvas) {
    return null;
  }

  const transformationMatrix =
    sandboxCanvas.getScreenCTM();

  if (!transformationMatrix) {
    return null;
  }

  const svgPoint =
    sandboxCanvas.createSVGPoint();

  svgPoint.x = event.clientX;
  svgPoint.y = event.clientY;

  const transformedPoint =
    svgPoint.matrixTransform(
      transformationMatrix.inverse()
    );

  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
  };
}

function setStatus(
  message,
  type = "neutral"
) {
  if (statusText) {
    statusText.textContent = message;
  }

  if (!statusIndicator) {
    return;
  }

  statusIndicator.className =
    `status-indicator status-${type}`;
}
