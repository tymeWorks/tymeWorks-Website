"use strict";

import {
  addRigidBodyAt,
  getModelSnapshot,
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
    "Default model loaded. The body and ground are ready for inspection.",
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
  solveButton?.addEventListener("click", handleSolve);
  resetButton?.addEventListener("click", handleReset);
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
  if (activeTool !== "body") {
    return;
  }

  const scenePoint = getScenePoint(event);

  if (!scenePoint) {
    setStatus(
      "The selected scene position could not be determined.",
      "error"
    );

    return;
  }

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

function setActiveTool(toolName) {
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
      "Pin-support placement will be implemented in the next part of Milestone 2.",

    "roller-support":
      "Roller-support placement will be implemented in the next part of Milestone 2.",

    force:
      "Force placement will be implemented after support objects.",

    moment:
      "Applied-moment placement will be implemented after support objects.",

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
    "Reset the sandbox and remove the rigid body?"
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

  const svgPoint = sandboxCanvas.createSVGPoint();

  svgPoint.x = event.clientX;
  svgPoint.y = event.clientY;

  const transformedPoint = svgPoint.matrixTransform(
    transformationMatrix.inverse()
  );

  return {
    x: transformedPoint.x,
    y: transformedPoint.y,
  };
}

function setStatus(message, type = "neutral") {
  if (statusText) {
    statusText.textContent = message;
  }

  if (!statusIndicator) {
    return;
  }

  statusIndicator.className =
    `status-indicator status-${type}`;
}
