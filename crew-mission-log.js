"use strict";
// A mission journal inside the crew stage. It only requests actions through callbacks.
const CrewMissionLog = (() => {
  let dialog = null,
    dialogHost = null,
    previousFocus = null,
    latestOptions = null;
  const instances = new WeakMap();
  const text = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  };
  const tasksFor = (mission, tasks) => {
    const index = new Map((tasks || []).map((t) => [String(t.id), t]));
    return (mission.taskIds || []).map(
      (id) =>
        index.get(String(id)) || {
          id,
          name: "Objective unavailable",
          missing: true,
          done: false,
          skipped: false,
        },
    );
  };
  function status(mission, tasks) {
    const objectives = tasksFor(mission, tasks),
      total = objectives.length,
      done = objectives.filter((t) => !!t.done && !t.skipped).length,
      skipped = objectives.filter((t) => !!t.skipped).length,
      complete = total > 0 && done === total,
      closed =
        total > 0 && !complete && objectives.every((t) => t.done || t.skipped),
      missing = objectives.some((t) => t.missing);
    return {
      key: complete
        ? "complete"
        : closed
          ? "bypassed"
          : missing
            ? "unavailable"
            : "active",
      label: complete
        ? "COMPLETE"
        : closed
          ? "CLOSED / BYPASSED"
          : missing
            ? "OBJECTIVE UNAVAILABLE"
            : "IN PROGRESS",
      complete,
      closed,
      done,
      skipped,
      total,
      rewardEligible: complete,
      earned: complete,
      progress: total ? done / total : 0,
    };
  }
  function normalized(options = {}) {
    const missions = Array.isArray(options.missions) ? options.missions : [],
      tasks = Array.isArray(options.tasks) ? options.tasks : [];
    let selectedId = options.selectedId;
    if (!missions.some((m) => String(m.id) === String(selectedId)))
      selectedId = (
        missions.find(
          (m) =>
            m.type === "MAIN" &&
            !status(m, tasks).complete &&
            !status(m, tasks).closed,
        ) || missions[0]
      )?.id;
    return {
      ...options,
      missions,
      tasks,
      selectedId,
      mode: options.mode === "easy" ? "easy" : "standard",
    };
  }
  function mount(host, options = {}) {
    if (typeof host === "string") host = document.querySelector(host);
    if (!host) return null;
    const prior = instances.get(host),
      state = {
        options: normalized(options),
        filter: prior?.filter || "ALL",
        fullscreen: host === dialogHost,
      };
    instances.set(host, state);
    latestOptions = state.options;
    render(host, state);
    if (dialog?.open && host !== dialogHost) {
      const fullPrior = instances.get(dialogHost);
      const full = {
        options: normalized({
          ...state.options,
          selectedId: state.options.selectedId,
        }),
        filter: fullPrior?.filter || "ALL",
        fullscreen: true,
      };
      instances.set(dialogHost, full);
      render(dialogHost, full);
    }
    return {
      select: (id) => select(host, id),
      refresh: (next) => mount(host, next || state.options),
      get state() {
        return state.options;
      },
    };
  }
  function focusKey(host) {
    const active = document.activeElement;
    return active && host.contains(active) ? active.dataset?.cmlFocus : null;
  }
  function restoreFocus(host, key) {
    if (!key) return;
    const candidate = Array.from(
      host.querySelectorAll("[data-cml-focus]"),
    ).find((n) => n.dataset.cmlFocus === key && !n.disabled);
    candidate?.focus?.();
  }
  function select(host, id) {
    const state = instances.get(host);
    if (
      !state ||
      !state.options.missions.some((m) => String(m.id) === String(id))
    )
      return;
    state.options = { ...state.options, selectedId: id };
    latestOptions = state.options;
    render(host, state);
    state.options.onSelect?.(id);
  }
  function render(host, state) {
    const savedFocus = focusKey(host),
      options = state.options;
    host.replaceChildren();
    host.classList.add("crew-mission-journal");
    host.classList.toggle("cml-inline", !state.fullscreen);
    host.classList.toggle("cml-fullscreen", state.fullscreen);
    const header = text("div", "cml-heading");
    const label = text("div");
    label.append(
      text("span", "cml-eyebrow", "CREW NETWORK / MISSION LOG"),
      text("h3", "cml-title", "CHOOSE YOUR NEXT MOVE"),
    );
    header.append(label);
    if (!state.fullscreen) {
      const expand = text("button", "cml-expand", "↗ EXPAND LOG");
      expand.type = "button";
      expand.dataset.cmlFocus = "expand";
      expand.setAttribute("aria-haspopup", "dialog");
      expand.onclick = () => open(state.options);
      header.append(expand);
    }
    host.append(header);
    const summary = text("div", "cml-summary");
    const completed = options.missions.filter(
      (m) => status(m, options.tasks).complete,
    );
    const xp = completed.reduce((sum, m) => sum + rewardXP(m), 0);
    summary.append(
      text(
        "span",
        "",
        `${completed.length}/${options.missions.length} MISSIONS VERIFIED`,
      ),
      text("span", "cml-earned-xp", `${xp} XP EARNED`),
      text(
        "span",
        "cml-mode",
        options.mode === "easy" ? "EASY CREW TOUR" : "STANDARD CREW TOUR",
      ),
    );
    host.append(summary);
    const browser = text("div", "cml-browser");
    const left = text("section", "cml-list-panel");
    left.setAttribute("aria-label", "Mission selection");
    const filters = text("div", "cml-filters");
    filters.setAttribute("aria-label", "Filter missions");
    for (const filter of ["ALL", "MAIN", "SIDE", "CLOSED"]) {
      const b = text(
        "button",
        state.filter === filter ? "selected" : "",
        filter,
      );
      b.type = "button";
      b.dataset.cmlFocus = "filter-" + filter;
      b.setAttribute("aria-pressed", String(state.filter === filter));
      b.onclick = () => {
        state.filter = filter;
        render(host, state);
      };
      filters.append(b);
    }
    left.append(filters);
    const list = text("div", "cml-list");
    const visible = options.missions.filter(
      (m) =>
        state.filter === "ALL" ||
        (state.filter === "CLOSED"
          ? status(m, options.tasks).complete || status(m, options.tasks).closed
          : m.type === state.filter),
    );
    for (const mission of visible) {
      const stats = status(mission, options.tasks),
        chosen = String(mission.id) === String(options.selectedId);
      const b = text(
        "button",
        "cml-mission-card" +
          (chosen ? " selected" : "") +
          (stats.complete ? " complete" : stats.closed ? " bypassed" : ""),
      );
      b.type = "button";
      b.dataset.cmlFocus = "mission-" + mission.id;
      b.setAttribute("aria-pressed", String(chosen));
      b.setAttribute(
        "aria-label",
        `${mission.type === "SIDE" ? "Side" : "Main"} mission: ${mission.title}. ${stats.label}. ${stats.done} of ${stats.total} objectives verified.`,
      );
      const top = text("div", "cml-card-top");
      top.append(
        text(
          "span",
          "cml-type " + (mission.type === "SIDE" ? "side" : "main"),
          mission.type === "SIDE" ? "SIDE" : "MAIN",
        ),
        text(
          "span",
          "cml-level",
          mission.level !== undefined ? "LV " + mission.level : "CREW",
        ),
      );
      b.append(top, text("strong", "cml-card-title", mission.title));
      const cardBottom = text("div", "cml-card-bottom");
      cardBottom.append(
        text(
          "span",
          stats.complete ? "cml-positive" : stats.closed ? "cml-warning" : "",
          stats.complete
            ? "✓ VERIFIED"
            : stats.closed
              ? "× BYPASSED"
              : `${stats.done}/${stats.total} VERIFIED`,
        ),
        text("span", "", mission.optional ? "OPTIONAL" : "REQUIRED"),
      );
      b.append(cardBottom);
      b.onclick = () => select(host, mission.id);
      list.append(b);
    }
    if (!visible.length)
      list.append(text("p", "cml-empty", "No missions in this view."));
    left.append(list);
    browser.append(left);
    const right = text("section", "cml-detail");
    right.setAttribute("aria-label", "Selected mission details");
    const mission = options.missions.find(
      (m) => String(m.id) === String(options.selectedId),
    );
    if (!mission) {
      right.append(
        text("h4", "", "No assignments yet"),
        text(
          "p",
          "cml-story",
          "Mission control will add your crew assignments here.",
        ),
      );
      browser.append(right);
      host.append(browser);
      restoreFocus(host, savedFocus);
      return;
    }
    const stats = status(mission, options.tasks),
      objectives = tasksFor(mission, options.tasks);
    const detailTop = text("div", "cml-detail-top");
    detailTop.append(
      text(
        "span",
        "cml-type " + (mission.type === "SIDE" ? "side" : "main"),
        mission.type === "SIDE" ? "SIDE MISSION" : "MAIN MISSION",
      ),
      text("span", "cml-state " + stats.key, stats.label),
    );
    right.append(
      detailTop,
      text("h4", "cml-detail-title", mission.title),
      text(
        "p",
        "cml-story",
        mission.description ||
          "Complete the crew objectives below to verify this assignment.",
      ),
    );
    if (mission.optional)
      right.append(
        text(
          "p",
          "cml-optional",
          "OPTIONAL SIDE GOAL\u2003\u2003You may continue the main mission without completing this assignment.",
        ),
      );
    right.append(text("p", "cml-section-label", "OBJECTIVES"));
    const objectivesList = text("ul", "cml-objectives");
    for (const task of objectives) {
      const skipped = !!task.skipped,
        verified = !!task.done && !skipped;
      const item = text(
        "li",
        "cml-objective" +
          (verified ? " done" : "") +
          (skipped ? " skipped" : "") +
          (String(task.id) === String(options.trackedTaskId) ? " tracked" : ""),
      );
      const check = text(
        "span",
        "cml-check",
        verified ? "✓" : skipped ? "−" : "",
      );
      check.setAttribute("role", "checkbox");
      check.setAttribute("aria-checked", String(verified));
      check.setAttribute("aria-readonly", "true");
      check.setAttribute(
        "aria-label",
        `${task.name}: ${verified ? "verified" : skipped ? "bypassed, no XP" : "not completed"}`,
      );
      const description = text("div", "cml-objective-copy");
      description.append(text("span", "cml-objective-name", task.name));
      const detail = task.missing
        ? "Assignment data unavailable"
        : skipped
          ? "BYPASSED\u2003\u2003NO XP"
          : verified
            ? "VERIFIED"
            : task.room
              ? "ROOM / " +
                String(task.room).replace(/[-_]/g, " ").toUpperCase()
              : "NOT COMPLETED";
      description.append(text("small", "", detail));
      if (
        String(task.id) === String(options.trackedTaskId) &&
        !verified &&
        !skipped
      )
        description.append(
          text("small", "cml-track-label", "◆ CURRENTLY TRACKED"),
        );
      item.append(check, description);
      objectivesList.append(item);
    }
    right.append(objectivesList);
    const progress = text("div", "cml-progress");
    const progressLabel = text("div", "cml-progress-label");
    progressLabel.append(
      text("span", "", `${stats.done} OF ${stats.total} OBJECTIVES VERIFIED`),
      text("b", "", Math.round(stats.progress * 100) + "%"),
    );
    const track = text("div", "cml-progress-track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", "Mission verification progress");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    track.setAttribute(
      "aria-valuenow",
      String(Math.round(stats.progress * 100)),
    );
    const fill = text("span");
    fill.style.width = stats.progress * 100 + "%";
    track.append(fill);
    progress.append(progressLabel, track);
    if (stats.skipped)
      progress.append(
        text(
          "p",
          "cml-no-xp",
          `${stats.skipped} objective${stats.skipped === 1 ? " was" : "s were"} bypassed. Skipped work does not earn XP.`,
        ),
      );
    right.append(progress);
    const rewards = text(
      "div",
      "cml-rewards" + (stats.rewardEligible ? " earned" : ""),
    );
    rewards.append(text("p", "cml-section-label", "MISSION REWARDS"));
    const rewardItems = text("div", "cml-reward-items");
    rewardItems.append(
      text("span", "cml-reward-xp", "✦ " + rewardXP(mission) + " XP"),
    );
    if (mission.rewards?.badge)
      rewardItems.append(
        text("span", "cml-reward-badge", mission.rewards.badge),
      );
    rewards.append(
      rewardItems,
      text(
        "small",
        "",
        stats.rewardEligible
          ? "EARNED\u2003\u2003Every required objective was verified."
          : "UNEARNED\u2003\u2003Verify every required objective to earn this reward. Skipped work earns no XP.",
      ),
    );
    right.append(rewards);
    const pending = objectives.filter(
        (t) => !t.done && !t.skipped && !t.missing,
      ),
      actionTask =
        pending.find((t) => String(t.id) === String(options.trackedTaskId)) ||
        pending[0];
    const actions = text("div", "cml-actions");
    const trackButton = text(
      "button",
      "cml-track-button",
      actionTask && String(actionTask.id) === String(options.trackedTaskId)
        ? "◆ OBJECTIVE TRACKED"
        : "◆ TRACK OBJECTIVE",
    );
    trackButton.type = "button";
    trackButton.dataset.cmlFocus = "track";
    trackButton.disabled = !actionTask;
    trackButton.onclick = () => {
      if (actionTask) options.onTrack?.(actionTask.id);
    };
    const startButton = text(
      "button",
      "cml-start-button",
      stats.complete
        ? "✓ MISSION COMPLETE"
        : stats.closed
          ? "MISSION CLOSED"
          : "START / GO TO TASK →",
    );
    startButton.type = "button";
    startButton.dataset.cmlFocus = "start";
    startButton.disabled = !actionTask;
    startButton.onclick = () => {
      if (actionTask) options.onStart?.(actionTask.id);
    };
    actions.append(trackButton, startButton);
    right.append(actions);
    browser.append(right);
    host.append(browser);
    restoreFocus(host, savedFocus);
  }
  function rewardXP(mission) {
    const xp = Number(mission.rewards?.xp);
    return Number.isFinite(xp) ? Math.max(0, Math.floor(xp)) : 0;
  }
  function createDialog() {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.id = "crewMissionLogDialog";
    dialog.setAttribute("aria-labelledby", "crewMissionLogDialogTitle");
    const top = text("div", "cml-dialog-top");
    top.append(text("h2", "", "MISSION JOURNAL"));
    top.querySelector("h2").id = "crewMissionLogDialogTitle";
    const closeButton = text("button", "cml-dialog-close", "CLOSE ×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close mission journal");
    closeButton.onclick = close;
    top.append(closeButton);
    dialogHost = text("div", "cml-dialog-host");
    dialog.append(top, dialogHost);
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    dialog.addEventListener("keydown", (e) => e.stopPropagation());
    dialog.addEventListener("keyup", (e) => e.stopPropagation());
    document.body.append(dialog);
  }
  function open(options) {
    createDialog();
    previousFocus = document.activeElement;
    const supplied = options || latestOptions || {};
    mount(dialogHost, supplied);
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    dialog.querySelector(".cml-mission-card.selected")?.focus?.();
    return api;
  }
  function close() {
    if (!dialog) return;
    if (dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
    if (previousFocus?.isConnected && !previousFocus.disabled)
      previousFocus.focus?.();
  }
  const api = {
    mount,
    open,
    close,
    status,
    doneBadge: (mission, tasks) => status(mission, tasks).label,
    get active() {
      return !!dialog?.open;
    },
    get element() {
      return dialog;
    },
    get options() {
      return latestOptions;
    },
  };
  return api;
})();
