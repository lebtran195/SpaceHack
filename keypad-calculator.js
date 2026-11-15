"use strict";
// A real keypad above the current engineering dialog. All math uses the safe parser.
const CalculatorPad = (() => {
  let dialog = null,
    session = null,
    lastFocus = null;
  const buttonSpecs = [
    ["C", "Clear", "clear"],
    ["⌫", "Backspace", "back"],
    ["√", "Square root", "sqrt"],
    ["(", "Open parenthesis", "("],
    [")", "Close parenthesis", ")"],
    ["7", "7", "7"],
    ["8", "8", "8"],
    ["9", "9", "9"],
    ["÷", "Divide", "/"],
    ["×", "Multiply", "*"],
    ["4", "4", "4"],
    ["5", "5", "5"],
    ["6", "6", "6"],
    ["−", "Subtract", "-"],
    ["+", "Add", "+"],
    ["1", "1", "1"],
    ["2", "2", "2"],
    ["3", "3", "3"],
    ["+/−", "Change sign", "sign"],
    ["=", "Equals", "equals"],
    ["0", "0", "0"],
    [".", "Decimal point", "."],
  ];
  function create() {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.id = "keypadCalculator";
    dialog.className = "keypad-calculator";
    dialog.setAttribute("aria-labelledby", "calculatorPadTitle");
    dialog.innerHTML =
      '<div class="calculator-pad-heading"><h2 id="calculatorPadTitle">POCKET CALCULATOR</h2><button type="button" class="calculator-pad-close" aria-label="Close calculator">✕</button></div><p class="calculator-pad-help">Tap the keys to work out your answer.</p><div class="calculator-pad-screen"><label for="calculatorPadExpression">YOUR CALCULATION</label><input id="calculatorPadExpression" type="text" readonly aria-label="Calculator expression" autocomplete="off"><output id="calculatorPadResult" aria-live="polite">Ready</output></div><div id="calculatorPadKeys" class="calculator-pad-keys"></div><p id="calculatorPadError" class="calculator-pad-error" role="status"></p><button id="calculatorPadApply" type="button" class="calculator-pad-apply" disabled>USE RESULT ↑</button><p id="calculatorPadUnit" class="calculator-pad-unit"></p>';
    document.body.append(dialog);
    for (const [label, aria, action] of buttonSpecs) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.calculatorKey = action;
      button.setAttribute("aria-label", aria);
      if (["+", "-", "*", "/", "equals"].includes(action))
        button.className = "calculator-pad-operator";
      if (action === "equals") button.classList.add("calculator-pad-equals");
      button.addEventListener("click", () => press(action));
      dialog.querySelector("#calculatorPadKeys").append(button);
    }
    dialog.querySelector(".calculator-pad-close").onclick = close;
    dialog.querySelector("#calculatorPadApply").onclick = useResult;
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    dialog.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Tab") return;
      if (e.key === "Enter" && e.target.closest?.("button")) return;
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        press("equals");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        press("back");
      } else if (e.key === "Delete") {
        e.preventDefault();
        press("clear");
      } else if (/^[0-9.()+\-*/]$/.test(e.key)) {
        e.preventDefault();
        press(e.key);
      }
    });
    dialog.addEventListener("keyup", (e) => e.stopPropagation());
    dialog.addEventListener("click", (e) => e.stopPropagation());
  }
  function current() {
    return session;
  }
  function paint(error = "") {
    if (!session) return;
    dialog.querySelector("#calculatorPadExpression").value = session.expression;
    dialog.querySelector("#calculatorPadResult").textContent =
      session.result === null
        ? "Tap = to calculate"
        : "= " + format(session.result);
    dialog.querySelector("#calculatorPadError").textContent = error;
    dialog.querySelector("#calculatorPadApply").disabled =
      session.result === null;
    dialog.querySelector("#calculatorPadUnit").textContent = session.unit
      ? "Result will be copied in " +
        session.unit +
        ". Review it before submitting."
      : "Use result copies the number into your answer. It does not submit the answer.";
  }
  function format(n) {
    return String(Number(Number(n).toPrecision(12)));
  }
  function open(options = {}) {
    create();
    const target = options.target;
    if (!target || !("value" in target))
      throw new Error("Choose an answer field before opening the calculator.");
    lastFocus = document.activeElement;
    session = {
      target,
      unit: String(options.unit || ""),
      expression: String(options.expression || ""),
      result: null,
      evaluated: false,
    };
    if (session.expression.length > 180) session.expression = "";
    paint();
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    dialog.querySelector('[data-calculator-key="7"]').focus();
    return api;
  }
  function close() {
    if (!dialog) return;
    const target = session?.target;
    session = null;
    if (dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
    if (lastFocus?.isConnected && !lastFocus.disabled) lastFocus.focus();
    else if (target?.isConnected && !target.disabled) target.focus();
  }
  function press(action) {
    if (!session) return;
    const s = session;
    let expression = s.expression;
    if (action === "clear") {
      s.expression = "";
      s.result = null;
      s.evaluated = false;
      paint();
      return;
    }
    if (action === "equals") {
      evaluate();
      return;
    }
    if (action === "back") {
      s.expression = expression.slice(0, -1);
      s.result = null;
      s.evaluated = false;
      paint();
      return;
    }
    if (s.evaluated) {
      if (/^[0-9.]$/.test(action)) expression = "";
      else expression = s.result === null ? expression : format(s.result);
      s.evaluated = false;
    }
    s.result = null;
    if (action === "sign") {
      expression =
        expression.startsWith("-(") && expression.endsWith(")")
          ? expression.slice(2, -1)
          : "-(" + (expression || "0") + ")";
    } else if (action === "sqrt") {
      expression =
        expression && /[\d)]$/.test(expression)
          ? "sqrt(" + expression + ")"
          : expression + "sqrt(";
    } else if (/^[0-9]$/.test(action)) {
      if (expression.endsWith(")")) expression += "*";
      expression += action;
    } else if (action === ".") {
      const last = expression.match(/(\d*\.?\d*)$/)?.[1] || "";
      if (last.includes(".")) {
        paint("That number already has a decimal point.");
        return;
      }
      if (!last) expression += (expression.endsWith(")") ? "*" : "") + "0";
      expression += ".";
    } else if (["+", "-", "*", "/"].includes(action)) {
      if (!expression) {
        if (action === "-") expression = "-";
        else {
          paint("Start with a number or square root.");
          return;
        }
      } else if (/[+*/-]$/.test(expression)) {
        expression = expression.slice(0, -1) + action;
      } else expression += action;
    } else if (action === "(") {
      expression += (/[\d)]$/.test(expression) ? "*" : "") + "(";
    } else if (action === ")") {
      const opened = (expression.match(/\(/g) || []).length,
        closed = (expression.match(/\)/g) || []).length;
      if (opened <= closed) {
        paint("There is no open parenthesis to close.");
        return;
      }
      expression += ")";
    } else return;
    if (expression.length > 180) {
      paint("The calculation is full. Clear or remove a few keys.");
      return;
    }
    s.expression = expression;
    paint();
  }
  function evaluate() {
    if (!session) return null;
    try {
      const value = EngineeringCalculator.evaluate(session.expression);
      if (!Number.isFinite(value))
        throw new Error(
          "Use a finite result. Check division and square roots.",
        );
      session.result = value;
      session.evaluated = true;
      paint();
      return value;
    } catch (error) {
      session.result = null;
      session.evaluated = false;
      paint(error.message || "Check your calculation.");
      return null;
    }
  }
  function useResult() {
    if (!session || session.result === null) return false;
    const { target, result } = session;
    if (!target.isConnected || target.disabled) {
      paint(
        "This answer field is no longer available. Close the calculator and return to the current task.",
      );
      return false;
    }
    target.value = format(result);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.dispatchEvent(new Event("change", { bubbles: true }));
    close();
    if (target.isConnected && !target.disabled) target.focus();
    return true;
  }
  const api = {
    open,
    close,
    press,
    evaluate,
    useResult,
    get active() {
      return !!session && !!dialog?.open;
    },
    get state() {
      return current();
    },
    get element() {
      return dialog;
    },
  };
  return api;
})();
// Retain the original attachment hook while replacing its typing-only workpad with a keypad launcher.
const originalAttachEngineeringCalculator = attachEngineeringCalculator;
attachEngineeringCalculator = function (prefix = "") {
  originalAttachEngineeringCalculator(prefix);
  const target = document.getElementById(prefix + "engineeringAnswer"),
    form = document.getElementById(prefix + "calculatorForm");
  if (!target || !form) return;
  const holder = form.closest(".calculator-pad");
  if (!holder) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "calculator-keypad-launch";
  button.textContent = "OPEN CALCULATOR";
  button.setAttribute("aria-haspopup", "dialog");
  button.addEventListener("click", () => {
    const unit =
      target
        .closest(".engineering-answer")
        ?.querySelector("label span")
        ?.textContent?.replace(/[()]/g, "")
        .trim() || "";
    CalculatorPad.open({ target, unit });
  });
  const note = document.createElement("small");
  note.textContent =
    "Tap numbers and operators. Use result copies your work into the answer field.";
  const replacement = document.createElement("div");
  replacement.className = "calculator-pad";
  replacement.append(button, note);
  holder.replaceWith(replacement);
};
