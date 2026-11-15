"use strict";
// Button cards share one value/change interface. No native select or listbox is used.
function mountTapChoices(root, options, value, onPick) {
  if (!root) return;
  root.classList.add("tap-choices");
  root.setAttribute("role", "radiogroup");
  if (!Object.getOwnPropertyDescriptor(root, "value")?.get) {
    let selected = root.value || "";
    Object.defineProperty(root, "value", {
      configurable: true,
      get() {
        return selected;
      },
      set(v) {
        selected = String(v);
        root.querySelectorAll("[data-choice]").forEach((b) => {
          const yes = b.dataset.choice === selected;
          b.setAttribute("aria-checked", String(yes));
          b.classList.toggle("selected", yes);
        });
      },
    });
  }
  root.replaceChildren();
  for (const option of options) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "tap-choice";
    b.dataset.choice = String(option.id);
    b.setAttribute("role", "radio");
    const title = document.createElement("b");
    title.textContent = option.name;
    b.append(title);
    if (option.description) {
      const description = document.createElement("small");
      description.textContent = option.description;
      b.append(description);
    }
    b.onclick = () => {
      root.value = String(option.id);
      if (onPick) onPick(String(option.id));
      else root.dispatchEvent(new Event("change", { bubbles: true }));
    };
    b.onkeydown = (e) => {
      if (
        ![
          "ArrowRight",
          "ArrowDown",
          "ArrowLeft",
          "ArrowUp",
          "Home",
          "End",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      const all = [...root.querySelectorAll("[data-choice]")],
        i = all.indexOf(b),
        next =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? all.length - 1
              : (i +
                  (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) +
                  all.length) %
                all.length;
      all[next].focus();
      all[next].click();
    };
    root.append(b);
  }
  root.value = String(value ?? "");
}
