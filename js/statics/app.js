"use strict";

const toolButtons = document.querySelectorAll("[data-tool]");

const activeToolLabel = document.getElementById("active-tool-label");
const statusText = document.getElementById("status-text");
const statusIndicator = document.getElementById("status-indicator");

const solveButton = document.getElementById("solve-button");
const resetButton = document.getElementById("reset-button");
const fbdButton = document.getElementById("fbd-button");

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

  setActiveTool("select");

  setStatus(
    "Ready. Add a rigid body to begin building the model.",
    "neutral"
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
  fbdButton?.addEventListener("click", toggleFreeBodyDiagram);
}

function setActiveTool(toolName) {
  activeTool = toolName;

  toolButtons.forEach((button) => {
    const isActive = button.dataset.tool === toolName;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const readableToolName = toolLabels[toolName] ?? toolName;

  if (activeToolLabel) {
    activeToolLabel.textContent = `${readableToolName} tool active`;
  }

  setStatus(getToolInstruction(toolName), "info");
}

function getToolInstruction(toolName) {
  const instructions = {
    select: "Select an object in the scene to inspect or move it.",
    body: "Click inside the model space to add a rigid body.",
    "pin-support":
      "Select a rigid body and choose where to attach the pin support.",
    "roller-support":
      "Select a rigid body and choose where to attach the roller support.",
    force:
      "Select a rigid body and choose the point where the force will act.",
    moment:
      "Select a rigid body and choose where the applied moment will be shown.",
    delete: "Select an object to remove it from the model.",
  };

  return instructions[toolName] ?? "Choose a modeling tool.";
}

function handleSolve() {
  setStatus(
    "The equilibrium solver has not been connected yet. This will be implemented in Milestone 5.",
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

  setActiveTool("select");

  setStatus(
    "The scene is already empty. Nothing was removed.",
    "neutral"
  );
}

function toggleFreeBodyDiagram() {
  freeBodyDiagramEnabled = !freeBodyDiagramEnabled;

  fbdButton?.setAttribute(
    "aria-pressed",
    String(freeBodyDiagramEnabled)
  );

  if (freeBodyDiagramEnabled) {
    setStatus(
      "Free-body-diagram mode enabled. Reaction visualization will be added in a later milestone.",
      "info"
    );

    return;
  }

  setStatus("Free-body-diagram mode disabled.", "neutral");
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
