const $expr = document.getElementById("expr");
const $result = document.getElementById("result");
const $equals = document.getElementById("equals");

// Insert text into the input field
function insertText(txt) {
  const start = $expr.selectionStart;
  const end = $expr.selectionEnd;
  const before = $expr.value.slice(0, start);
  const after = $expr.value.slice(end);
  $expr.value = before + txt + after;
  const caret = start + txt.length;
  $expr.focus();
  $expr.setSelectionRange(caret, caret);
}

// For function buttons like sin(, cos(, etc.
function wrapIfFunc(token) {
  if (!token.endsWith("(")) return token;
  return token;
}

// Delete a single character or selected text
function delChar() {
  const start = $expr.selectionStart;
  const end = $expr.selectionEnd;
  if (start !== end) {
    const before = $expr.value.slice(0, start);
    const after = $expr.value.slice(end);
    $expr.value = before + after;
    $expr.setSelectionRange(start, start);
    return;
  }
  if (start > 0) {
    const before = $expr.value.slice(0, start - 1);
    const after = $expr.value.slice(start);
    $expr.value = before + after;
    $expr.setSelectionRange(start - 1, start - 1);
  }
  $expr.focus();
}

// Calculate expression directly in browser
async function calculate() {
  const expr = $expr.value.trim();
  if (!expr) {
    $result.textContent = "= 0";
    return;
  }

  try {
    // Convert human-friendly input into valid JS
    let safeExpr = expr
      .replace(/x/g, '*')
      .replace(/÷/g, '/')
      .replace(/pi/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/%/g, '/100');

    const result = Function(`"use strict"; return (${safeExpr})`)();

    if (isNaN(result) || result === undefined) {
      $result.textContent = "Error";
    } else {
      $result.textContent = "= " + result;
    }
  } catch (e) {
    $result.textContent = "Error";
  }
}

// Button actions
document.querySelectorAll("button[data-insert]").forEach(btn => {
  btn.addEventListener("click", () => insertText(btn.getAttribute("data-insert")));
});

document.querySelectorAll("button[data-func]").forEach(btn => {
  btn.addEventListener("click", () => insertText(wrapIfFunc(btn.getAttribute("data-func"))));
});

document.querySelector("button[data-action='clear']").addEventListener("click", () => {
  $expr.value = "";
  $result.textContent = "= 0";
  $expr.focus();
});

document.querySelector("button[data-action='del']").addEventListener("click", delChar);
$equals.addEventListener("click", calculate);

// Keyboard shortcuts
$expr.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    calculate();
  }
});

// Live auto-calculate after short delay
$expr.addEventListener("input", () => {
  clearTimeout($expr._t);
  $expr._t = setTimeout(calculate, 300);
});

// Focus input when loaded
$expr.focus();
