"use strict";
// Always-visible remaining budget, so players can judge whether a paid skip is affordable.
(() => {
  const badge = document.createElement("div");
  badge.id = "budgetBadge";
  badge.setAttribute("role", "status");
  badge.setAttribute("aria-live", "off");
  const label = document.createElement("span");
  label.textContent = "BUDGET LEFT";
  const value = document.createElement("strong");
  badge.append(label, value);

  // A manual popover lives in the browser's top layer, so dialog borders and overflow cannot clip it.
  const usePopover = typeof badge.showPopover === "function";
  if (usePopover) badge.setAttribute("popover", "manual");
  document.body.append(badge);
  let lastTop = null;

  function remaining() {
    if (
      typeof currentScreen === "undefined" ||
      typeof MAX_BUDGET === "undefined"
    )
      return null;
    if (currentScreen === "build") {
      try {
        return MAX_BUDGET - currentDesign().cost;
      } catch (e) {
        return null;
      }
    }
    if (
      (currentScreen === "flight" || currentScreen === "result") &&
      typeof design !== "undefined" &&
      design
    ) {
      return MAX_BUDGET - design.cost;
    }
    return null;
  }

  function topDialog() {
    const open = [...document.querySelectorAll("dialog[open]")];
    return open.length ? open[open.length - 1] : null;
  }

  function show(visible) {
    if (usePopover) {
      const isOpen = badge.matches(":popover-open");
      const top = topDialog();
      if (!visible) {
        if (isOpen) badge.hidePopover();
        lastTop = null;
        return;
      }
      // Re-open whenever a new dialog appears so the badge stays above it in the top layer.
      if (!isOpen || top !== lastTop) {
        if (isOpen) badge.hidePopover();
        badge.showPopover();
        lastTop = top;
      }
    } else {
      badge.hidden = !visible;
      const host = topDialog() || document.body;
      if (visible && badge.parentNode !== host) host.append(badge);
    }
  }

  function update() {
    const left = remaining();
    if (left === null || !Number.isFinite(left)) {
      show(false);
      return;
    }
    value.textContent = left < 0 ? "over by " + cash(-left) : cash(left);
    badge.classList.toggle("low", left < (MAX_BUDGET || 1) * 0.05);
    show(true);
  }

  setInterval(update, 300);
  update();
})();
