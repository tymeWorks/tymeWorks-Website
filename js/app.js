"use strict";

document.addEventListener("DOMContentLoaded", () => {
  updateFooterYear();
  initializeSmoothNavigation();
});

function updateFooterYear() {
  const yearElement = document.getElementById("year");

  if (!yearElement) {
    return;
  }

  yearElement.textContent = new Date().getFullYear();
}

function initializeSmoothNavigation() {
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}
