const signatureData = {
  sharps: {
    label: "sharps",
    singular: "sharp",
    symbol: "\u266f",
    order: ["F", "C", "G", "D", "A", "E", "B"],
    placements: {
      treble: [57, 84, 48, 75, 102, 66, 93],
      bass: [195, 222, 186, 213, 240, 204, 231],
      alto: [84, 111, 75, 102, 129, 93, 120],
      tenor: [130, 94, 121, 85, 112, 76, 103]
    }
  },
  flats: {
    label: "flats",
    singular: "flat",
    symbol: "\u266d",
    order: ["B", "E", "A", "D", "G", "C", "F"],
    placements: {
      treble: [87, 60, 96, 69, 105, 78, 114],
      bass: [225, 198, 234, 207, 243, 216, 252],
      alto: [117, 90, 126, 99, 135, 108, 144],
      tenor: [99, 72, 108, 81, 117, 90, 126]
    }
  }
};

const GUIDE_MODE_STORAGE_KEY = "keySignatureBuilderGuideMode";
const STAIRS_MOTION_STORAGE_KEY = "keySignatureBuilderStairsMotion";

const state = {
  type: null,
  count: 0,
  clefMode: "grand",
  guideMode: savedGuideModePreference(),
  stairsMotionEnabled: savedStairsMotionPreference()
};

let previousBeadHelperVisible = false;

const mnemonicData = {
  sharps: {
    label: "Sharps",
    order: ["F", "C", "G", "D", "A", "E", "B"],
    parts: [
      { text: "Fat", highlightAt: 1 },
      { text: "Cats", highlightAt: 2 },
      { text: "Get", highlightAt: 3 },
      { text: "Donuts", highlightAt: 4 },
      { text: "After", highlightAt: 5 },
      { text: "Every", highlightAt: 6 },
      { text: "Breakfast", highlightAt: 7 }
    ]
  },
  flats: {
    label: "Flats",
    order: ["B", "E", "A", "D", "G", "C", "F"],
    parts: [
      { text: "Bacon", highlightAt: 1 },
      { text: "Eggs", highlightAt: 2 },
      { text: "And", highlightAt: 3 },
      { text: "Donuts", highlightAt: 4 },
      { text: "Get", highlightAt: 5 },
      { text: "Cats", highlightAt: 6 },
      { text: "Fat", highlightAt: 7 }
    ]
  }
};

const keySignatures = [
  { value: -7, type: "flats", count: 7, major: "Cb Major", minor: "Ab Minor" },
  { value: -6, type: "flats", count: 6, major: "Gb Major", minor: "Eb Minor" },
  { value: -5, type: "flats", count: 5, major: "Db Major", minor: "Bb Minor" },
  { value: -4, type: "flats", count: 4, major: "Ab Major", minor: "F Minor" },
  { value: -3, type: "flats", count: 3, major: "Eb Major", minor: "C Minor" },
  { value: -2, type: "flats", count: 2, major: "Bb Major", minor: "G Minor" },
  { value: -1, type: "flats", count: 1, major: "F Major", minor: "D Minor" },
  { value: 0, type: null, count: 0, major: "C Major", minor: "A Minor" },
  { value: 1, type: "sharps", count: 1, major: "G Major", minor: "E Minor" },
  { value: 2, type: "sharps", count: 2, major: "D Major", minor: "B Minor" },
  { value: 3, type: "sharps", count: 3, major: "A Major", minor: "F# Minor" },
  { value: 4, type: "sharps", count: 4, major: "E Major", minor: "C# Minor" },
  { value: 5, type: "sharps", count: 5, major: "B Major", minor: "G# Minor" },
  { value: 6, type: "sharps", count: 6, major: "F# Major", minor: "D# Minor" },
  { value: 7, type: "sharps", count: 7, major: "C# Major", minor: "A# Minor" }
];

const parallelMinorByMajor = {
  "Cb Major": "Cb Minor",
  "Gb Major": "Gb Minor",
  "Db Major": "Db Minor",
  "Ab Major": "Ab Minor",
  "Eb Major": "Eb Minor",
  "Bb Major": "Bb Minor",
  "F Major": "F Minor",
  "C Major": "C Minor",
  "G Major": "G Minor",
  "D Major": "D Minor",
  "A Major": "A Minor",
  "E Major": "E Minor",
  "B Major": "B Minor",
  "F# Major": "F# Minor",
  "C# Major": "C# Minor"
};

const enharmonicPairs = {
  "C# Major": "Db Major",
  "Db Major": "C# Major",
  "F# Major": "Gb Major",
  "Gb Major": "F# Major",
  "B Major": "Cb Major",
  "Cb Major": "B Major"
};

const elements = {
  builderCard: document.querySelector(".builder-card"),
  staffLines: document.querySelector("#staffLines"),
  clefLayer: document.querySelector("#clefLayer"),
  accidentalLayer: document.querySelector("#accidentalLayer"),
  staffSvg: document.querySelector("#staffSvg"),
  stateLabel: document.querySelector("#stateLabel"),
  keyComboButton: document.querySelector("#keyComboButton"),
  parallelButton: document.querySelector("#parallelButton"),
  parallelPopover: document.querySelector("#parallelPopover"),
  parallelMajorOption: document.querySelector("#parallelMajorOption"),
  parallelMajorDetail: document.querySelector("#parallelMajorDetail"),
  parallelMinorOption: document.querySelector("#parallelMinorOption"),
  parallelMinorDetail: document.querySelector("#parallelMinorDetail"),
  enharmonicButton: document.querySelector("#enharmonicButton"),
  majorKeyLabel: document.querySelector("#majorKeyLabel"),
  minorKeyLabel: document.querySelector("#minorKeyLabel"),
  keySliderPopover: document.querySelector("#keySliderPopover"),
  signatureSlider: document.querySelector("#signatureSlider"),
  keyTickGrid: document.querySelector("#keyTickGrid"),
  staffSidebar: document.querySelector(".staff-sidebar"),
  phoneRelativeGuideSlot: document.querySelector("#phoneRelativeGuideSlot"),
  relativeGuide: document.querySelector("#relativeGuide"),
  relativeGuideExample: document.querySelector("#relativeGuideExample"),
  relativeGuideHint: document.querySelector("#relativeGuideHint"),
  mnemonicPanel: document.querySelector("#mnemonicPanel"),
  learningNote: document.querySelector(".learning-note"),
  guideModeToggle: document.querySelector("#guideModeToggle"),
  guideHelper: document.querySelector("#guideHelper"),
  guideMessage: document.querySelector("#guideMessage"),
  guideExample: document.querySelector("#guideExample"),
  clefModeButtons: document.querySelectorAll(".clef-mode-button"),
  removeSharp: document.querySelector("#removeSharp"),
  addSharp: document.querySelector("#addSharp"),
  removeFlat: document.querySelector("#removeFlat"),
  addFlat: document.querySelector("#addFlat"),
  resetSignature: document.querySelector("#resetSignature")
};

const STAFF = {
  xStart: 82,
  xEnd: 704,
  gap: 18,
  accidentalStartX: 168,
  accidentalGap: 36,
  modes: {
    grand: {
      viewBoxHeight: 300,
      staves: [
        { name: "treble", topY: 54, clef: "&#119070;", clefX: 115, clefY: 127 },
        { name: "bass", topY: 174, clef: "&#119074;", clefX: 115, clefY: 230.75 }
      ]
    },
    alto: {
      viewBoxHeight: 220,
      staves: [
        { name: "alto", topY: 74, clef: "&#119073;", clefX: 116, clefY: 145 }
      ]
    },
    tenor: {
      viewBoxHeight: 220,
      staves: [
        { name: "tenor", topY: 74, clef: "&#119073;", clefX: 116, clefY: 127 }
      ]
    }
  }
};

function init() {
  document.body.appendChild(elements.keySliderPopover);
  document.body.appendChild(elements.parallelPopover);
  elements.guideModeToggle.checked = state.guideMode;
  drawStaff();
  renderKeyTickGrid();
  elements.keyComboButton.addEventListener("click", toggleKeySliderPopover);
  elements.parallelButton.addEventListener("click", toggleParallelPopover);
  elements.parallelMajorOption.addEventListener("click", () => applyParallelConversion("major"));
  elements.parallelMinorOption.addEventListener("click", () => applyParallelConversion("minor"));
  elements.enharmonicButton.addEventListener("click", applyEnharmonicConversion);
  elements.signatureSlider.addEventListener("pointerdown", handleSignatureSliderPointer);
  elements.signatureSlider.addEventListener("keydown", handleSignatureSliderKeydown);
  elements.keyTickGrid.addEventListener("click", handleKeyTickClick);
  document.addEventListener("click", closeKeySliderPopoverFromOutside);
  document.addEventListener("click", closeParallelPopoverFromOutside);
  document.addEventListener("keydown", closeKeySliderPopoverWithEscape);
  document.addEventListener("keydown", closeParallelPopoverWithEscape);
  window.addEventListener("resize", positionOpenKeySliderPopover);
  window.addEventListener("scroll", positionOpenKeySliderPopover, true);
  window.addEventListener("resize", positionOpenParallelPopover);
  window.addEventListener("scroll", positionOpenParallelPopover, true);
  window.addEventListener("resize", syncRelativeGuidePlacement);
  elements.clefModeButtons.forEach((button) => {
    button.addEventListener("click", () => setClefMode(button.dataset.clefMode));
  });
  elements.relativeGuide.addEventListener("click", toggleStairsMotion);
  elements.relativeGuide.addEventListener("keydown", handleRelativeGuideKeydown);
  elements.guideModeToggle.addEventListener("change", () => {
    state.guideMode = elements.guideModeToggle.checked;
    saveGuideModePreference(state.guideMode);
    render();
  });
  elements.removeSharp.addEventListener("click", () => decrementAccidental("sharps"));
  elements.addSharp.addEventListener("click", () => incrementAccidental("sharps"));
  elements.removeFlat.addEventListener("click", () => decrementAccidental("flats"));
  elements.addFlat.addEventListener("click", () => incrementAccidental("flats"));
  elements.resetSignature.addEventListener("click", resetSignature);
  render();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove("is-initializing", "guide-mode-start-on");
    });
  });
}

function syncRelativeGuidePlacement() {
  const usePhoneSlot = window.innerWidth <= 440;
  const target = usePhoneSlot ? elements.phoneRelativeGuideSlot : elements.staffSidebar;
  if (!target || elements.relativeGuide.parentElement === target) return;
  target.appendChild(elements.relativeGuide);
}

function setClefMode(mode) {
  if (!STAFF.modes[mode]) return;
  state.clefMode = mode;
  render();
}

function savedGuideModePreference() {
  try {
    const saved = localStorage.getItem(GUIDE_MODE_STORAGE_KEY);
    if (saved === null) return true;
    return saved === "true";
  } catch {
    return true;
  }
}

function saveGuideModePreference(isEnabled) {
  try {
    localStorage.setItem(GUIDE_MODE_STORAGE_KEY, String(isEnabled));
  } catch {
    // If storage is unavailable, Guide Mode still works for the current session.
  }
}

function savedStairsMotionPreference() {
  try {
    const saved = localStorage.getItem(STAIRS_MOTION_STORAGE_KEY);
    if (saved !== null) return saved === "true";
  } catch {
    // Fall back to the motion preference below.
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function saveStairsMotionPreference(isEnabled) {
  try {
    localStorage.setItem(STAIRS_MOTION_STORAGE_KEY, String(isEnabled));
  } catch {
    // If storage is unavailable, the toggle still works for the current session.
  }
}

function toggleStairsMotion() {
  state.stairsMotionEnabled = !state.stairsMotionEnabled;
  saveStairsMotionPreference(state.stairsMotionEnabled);
  render();
}

function handleRelativeGuideKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  toggleStairsMotion();
}

function toggleKeySliderPopover() {
  setParallelPopoverOpen(false);
  setKeySliderPopoverOpen(elements.keySliderPopover.hidden);
}

function closeKeySliderPopoverFromOutside(event) {
  if (event.target.closest(".key-display") || event.target.closest(".key-slider-popover")) return;
  setKeySliderPopoverOpen(false);
}

function closeKeySliderPopoverWithEscape(event) {
  if (event.key === "Escape") setKeySliderPopoverOpen(false);
}

function setKeySliderPopoverOpen(isOpen) {
  elements.keySliderPopover.hidden = !isOpen;
  elements.keyComboButton.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) positionKeySliderPopover();
}

function positionKeySliderPopover() {
  const buttonRect = elements.keyComboButton.getBoundingClientRect();
  const popoverWidth = window.innerWidth <= 440 ? window.innerWidth - 24 : Math.min(560, window.innerWidth - 36);
  const centerX = buttonRect.left + buttonRect.width / 2;
  const safeLeft = Math.min(window.innerWidth - 18 - popoverWidth / 2, Math.max(18 + popoverWidth / 2, centerX));
  elements.keySliderPopover.style.setProperty("--popover-left", `${safeLeft}px`);
  elements.keySliderPopover.style.setProperty("--popover-top", `${buttonRect.bottom + 8}px`);
}

function positionOpenKeySliderPopover() {
  if (!elements.keySliderPopover.hidden) positionKeySliderPopover();
}

function toggleParallelPopover() {
  setKeySliderPopoverOpen(false);
  setParallelPopoverOpen(elements.parallelPopover.hidden);
}

function closeParallelPopoverFromOutside(event) {
  if (event.target.closest(".parallel-control")) return;
  setParallelPopoverOpen(false);
}

function closeParallelPopoverWithEscape(event) {
  if (event.key === "Escape") setParallelPopoverOpen(false);
}

function setParallelPopoverOpen(isOpen) {
  elements.parallelPopover.hidden = !isOpen;
  elements.parallelButton.setAttribute("aria-expanded", String(isOpen));
  elements.parallelPopover.classList.toggle("phone-side-popover", isOpen && window.innerWidth <= 440);
  if (isOpen) positionParallelPopover();
}

function positionOpenParallelPopover() {
  if (!elements.parallelPopover.hidden) positionParallelPopover();
}

function positionParallelPopover() {
  const buttonRect = elements.parallelButton.getBoundingClientRect();
  const popover = elements.parallelPopover;
  const isPhone = window.innerWidth <= 440;
  const margin = isPhone ? 8 : 12;
  const gap = isPhone ? 8 : 10;

  popover.classList.toggle("phone-side-popover", isPhone);

  const popoverRect = popover.getBoundingClientRect();
  let left;
  let top;

  if (isPhone) {
    left = buttonRect.right + gap;
    if (left + popoverRect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - margin - popoverRect.width);
    }
    top = buttonRect.top + buttonRect.height / 2 - popoverRect.height / 2;
    top = Math.max(margin, Math.min(top, window.innerHeight - margin - popoverRect.height));
    const arrowTop = buttonRect.top + buttonRect.height / 2 - top;
    popover.style.setProperty("--parallel-arrow-top", `${arrowTop}px`);
  } else {
    left = buttonRect.left + buttonRect.width / 2 - popoverRect.width / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - margin - popoverRect.width));
    top = buttonRect.top - popoverRect.height - gap;
    if (top < margin) top = buttonRect.bottom + gap;
    popover.style.removeProperty("--parallel-arrow-top");
  }

  popover.style.setProperty("--parallel-popover-left", `${left}px`);
  popover.style.setProperty("--parallel-popover-top", `${top}px`);
}

function handleSignatureSliderPointer(event) {
  event.preventDefault();
  elements.signatureSlider.focus();
  updateSignatureSliderFromPointer(event);
  elements.signatureSlider.setPointerCapture(event.pointerId);
  elements.signatureSlider.addEventListener("pointermove", updateSignatureSliderFromPointer);
  elements.signatureSlider.addEventListener("pointerup", stopSignatureSliderDrag, { once: true });
  elements.signatureSlider.addEventListener("pointercancel", stopSignatureSliderDrag, { once: true });
}

function updateSignatureSliderFromPointer(event) {
  const rect = elements.signatureSlider.getBoundingClientRect();
  const percent = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const selectedIndex = Math.round(percent * (keySignatures.length - 1));
  setSignatureFromSliderValue(selectedIndex - 7);
}

function stopSignatureSliderDrag(event) {
  elements.signatureSlider.releasePointerCapture(event.pointerId);
  elements.signatureSlider.removeEventListener("pointermove", updateSignatureSliderFromPointer);
}

function handleSignatureSliderKeydown(event) {
  const currentValue = signatureSliderValue();
  let nextValue = currentValue;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue -= 1;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue += 1;
  if (event.key === "Home") nextValue = -7;
  if (event.key === "End") nextValue = 7;
  if (nextValue === currentValue) return;
  event.preventDefault();
  setSignatureFromSliderValue(Math.min(7, Math.max(-7, nextValue)));
}

function setSignatureFromSliderValue(value) {
  if (value === 0) {
    state.type = null;
    state.count = 0;
  } else if (value > 0) {
    state.type = "sharps";
    state.count = value;
  } else {
    state.type = "flats";
    state.count = Math.abs(value);
  }
  render();
}

function signatureForMinorKey(minorKey) {
  return keySignatures.find((signature) => signature.minor === minorKey) || null;
}

function signatureForMajorKey(majorKey) {
  return keySignatures.find((signature) => signature.major === majorKey) || null;
}

function parallelMajorChoice() {
  const current = currentKeySignature();
  const parallelMinor = parallelMinorByMajor[current.major];
  return {
    source: current.major,
    target: parallelMinor,
    signature: parallelMinor ? signatureForMinorKey(parallelMinor) : null
  };
}

function parallelMinorChoice() {
  const current = currentKeySignature();
  const parallelMajor = current.minor.replace(" Minor", " Major");
  return {
    source: current.minor,
    target: parallelMajor,
    signature: signatureForMajorKey(parallelMajor)
  };
}

function enharmonicTargetSignature() {
  const current = currentKeySignature();
  const targetMajor = enharmonicPairs[current.major];
  if (!targetMajor) return null;
  return keySignatures.find((signature) => signature.major === targetMajor) || null;
}

function applyParallelConversion(sourceKind) {
  const choice = sourceKind === "major" ? parallelMajorChoice() : parallelMinorChoice();
  if (!choice.signature) return;
  setParallelPopoverOpen(false);
  setSignatureFromSliderValue(choice.signature.value);
}

function applyEnharmonicConversion() {
  const target = enharmonicTargetSignature();
  if (!target) return;
  setSignatureFromSliderValue(target.value);
}

function renderKeyTickGrid() {
  elements.keyTickGrid.innerHTML = `
    <div class="key-column-highlight" aria-hidden="true"></div>
    <div class="key-tick-row-label major-row-label">Major</div>
    <div class="key-tick-row-label minor-row-label">Minor</div>
    ${keySignatures.map((signature, index) => keyTickButton(signature, "major", index)).join("")}
    ${keySignatures.map((signature, index) => keyTickButton(signature, "minor", index)).join("")}
  `;
}

function keyTickButton(signature, keyKind, index) {
  const keyName = signature[keyKind].replace(keyKind === "major" ? " Major" : " Minor", "");
  const tickPercent = index / (keySignatures.length - 1);
  return `
    <button class="key-tick-label ${keyKind}-tick" style="--tick-percent: ${tickPercent};" type="button" data-value="${signature.value}" aria-label="${signature[keyKind]}">
      ${keyName}
    </button>
  `;
}

function handleKeyTickClick(event) {
  const tick = event.target.closest(".key-tick-label");
  if (!tick) return;
  setSignatureFromSliderValue(Number(tick.dataset.value));
}

function drawStaff() {
  const lines = [];
  const clefs = [];
  const mode = STAFF.modes[state.clefMode];
  elements.staffSvg.setAttribute("viewBox", `0 0 760 ${mode.viewBoxHeight}`);
  mode.staves.forEach((staff) => {
    for (let i = 0; i < 5; i += 1) {
      const y = staff.topY + i * STAFF.gap;
      lines.push(`<line class="staff-line" x1="${STAFF.xStart}" y1="${y}" x2="${STAFF.xEnd}" y2="${y}" />`);
    }
    if (staff.name === "bass") {
      clefs.push(`<text class="clef-symbol clef-bass" x="${staff.clefX}" y="${staff.clefY}">${staff.clef}</text>`);
      return;
    }
    clefs.push(`<text class="clef-symbol clef-${staff.name}" x="${staff.clefX}" y="${staff.clefY}">${staff.clef}</text>`);
  });
  elements.staffLines.innerHTML = lines.join("");
  elements.clefLayer.innerHTML = clefs.join("");
}

function incrementAccidental(type) {
  if (state.type && state.type !== type) {
    render(true);
    return;
  }
  if (state.count >= 7) return;
  state.type = type;
  state.count += 1;
  render();
}

function decrementAccidental(type) {
  if (state.type !== type || state.count <= 0) return;
  state.count -= 1;
  if (state.count === 0) state.type = null;
  render();
}

function resetSignature() {
  state.type = null;
  state.count = 0;
  render();
}

function render(warning = false) {
  syncRelativeGuidePlacement();
  drawStaff();
  renderAccidentals();
  renderStatus();
  renderConversions();
  renderButtons();
  renderGuide();
  renderHint();
  renderBeadHelperConfetti();
  renderSignatureSlider();
  renderSelectedKeyTick();
  renderClefModeButtons();
  elements.learningNote.classList.toggle("warn", warning);
}

function renderAccidentals() {
  if (!state.type || state.count === 0) {
    elements.accidentalLayer.innerHTML = "";
    return;
  }

  const data = signatureData[state.type];
  const items = [];
  const guideIndex = guideHighlightIndex();
  STAFF.modes[state.clefMode].staves.forEach((staff) => {
    data.order.slice(0, state.count).forEach((letter, index) => {
      const x = STAFF.accidentalStartX + index * STAFF.accidentalGap;
      const y = data.placements[staff.name][index];
      items.push(accidentalSvg(x, y, data.symbol, `${letter}${data.symbol}`, staff.name, index === guideIndex));
    });
  });
  elements.accidentalLayer.innerHTML = items.join("");
}

function renderClefModeButtons() {
  elements.clefModeButtons.forEach((button) => {
    const isSelected = button.dataset.clefMode === state.clefMode;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function accidentalSvg(x, y, symbol, label, clef, isGuideHighlight = false) {
  return `
    <g class="accidental-group ${isGuideHighlight ? "guide-highlighted-accidental" : ""}" aria-label="${clef} ${label}">
      ${isGuideHighlight ? `<ellipse class="guide-accidental-glow" cx="${x}" cy="${y}" rx="19" ry="24"></ellipse>` : ""}
      <text class="accidental-symbol" x="${x}" y="${y}">${symbol}</text>
    </g>
  `;
}

function guideHighlightIndex() {
  if (!state.guideMode || !state.type || state.count === 0) return -1;
  if (state.type === "sharps") return state.count - 1;
  if (state.type === "flats" && state.count >= 2) return state.count - 2;
  return -1;
}

function renderGuide() {
  elements.guideModeToggle.checked = state.guideMode;
  elements.builderCard.classList.toggle("guide-mode-active", state.guideMode);
  elements.guideHelper.hidden = !state.guideMode;
  elements.guideHelper.closest(".staff-stage").classList.toggle("guide-active", state.guideMode);
  if (!state.guideMode) return;

  const guide = currentGuideContent();
  elements.guideMessage.textContent = guide.message;
  elements.guideExample.textContent = guide.example;
  elements.guideExample.hidden = !guide.example;
}

function currentGuideContent() {
  const keySignature = currentKeySignature();
  if (state.count === 0) {
    return {
      message: "No sharps or flats: this is C Major.",
      example: ""
    };
  }

  if (state.type === "sharps") {
    const lastSharp = `${signatureData.sharps.order[state.count - 1]}#`;
    return {
      message: "Raise the last sharp by a half step to find the Major Key.",
      example: `Last sharp: ${lastSharp} \u2192 ${keySignature.major}`
    };
  }

  if (state.count === 1) {
    return {
      message: "One flat is F Major.",
      example: ""
    };
  }

  const secondLastFlat = `${signatureData.flats.order[state.count - 2]}b`;
  return {
    message: "For flats, use the second-last flat to find the Major Key.",
    example: `Second-last flat: ${secondLastFlat} \u2192 ${keySignature.major}`
  };
}

function renderStatus() {
  const keySignature = currentKeySignature();
  elements.stateLabel.classList.toggle("zero-signature", state.count === 0);
  if (state.count === 0) {
    elements.stateLabel.textContent = "0 Sharps / Flats";
    elements.majorKeyLabel.textContent = `Major Key: ${keySignature.major}`;
    elements.minorKeyLabel.textContent = `Minor Key: ${keySignature.minor}`;
    renderRelativeGuide(keySignature);
    return;
  }

  const data = signatureData[state.type];
  elements.stateLabel.textContent = state.count === 1 ? `1 ${data.singular}` : `${state.count} ${data.label}`;
  elements.majorKeyLabel.textContent = `Major Key: ${keySignature.major}`;
  elements.minorKeyLabel.textContent = `Minor Key: ${keySignature.minor}`;
  renderRelativeGuide(keySignature);
}

function renderConversions() {
  const enharmonicTarget = enharmonicTargetSignature();
  renderParallelOptions();
  elements.parallelButton.title = "Choose a parallel conversion";
  elements.parallelButton.setAttribute("aria-label", "Choose a parallel conversion");
  updateConversionButton(
    elements.enharmonicButton,
    enharmonicTarget,
    enharmonicTarget
      ? `Switch to enharmonic key signature: ${enharmonicTarget.major} / ${enharmonicTarget.minor}`
      : "No supported enharmonic key in this range"
  );
}

function renderParallelOptions() {
  const majorChoice = parallelMajorChoice();
  const minorChoice = parallelMinorChoice();
  updateParallelOption(elements.parallelMajorOption, elements.parallelMajorDetail, majorChoice);
  updateParallelOption(elements.parallelMinorOption, elements.parallelMinorDetail, minorChoice);
}

function updateParallelOption(button, detailElement, choice) {
  const label = `Parallel of ${choice.source} \u2192 ${choice.target}`;
  detailElement.textContent = label;
  button.disabled = !choice.signature;
  button.title = choice.signature ? label : `${label}. Not available in this range.`;
  button.setAttribute("aria-label", button.title);
  button.classList.toggle("unavailable", !choice.signature);
}

function updateConversionButton(button, targetSignature, label) {
  button.disabled = !targetSignature;
  button.title = label;
  button.setAttribute("aria-label", label);
}

function renderRelativeGuide(keySignature = currentKeySignature()) {
  elements.relativeGuide.hidden = false;
  elements.relativeGuide.classList.toggle("is-hidden", !state.guideMode);
  elements.relativeGuide.classList.toggle("motion-paused", !state.stairsMotionEnabled);
  elements.relativeGuide.setAttribute("aria-hidden", String(!state.guideMode));
  elements.relativeGuide.setAttribute("aria-pressed", String(state.stairsMotionEnabled));
  elements.relativeGuide.tabIndex = state.guideMode ? 0 : -1;
  elements.relativeGuideHint.textContent = state.stairsMotionEnabled ? "Tap to pause" : "Tap to start";
  elements.relativeGuideExample.textContent = `${keySignature.major} \u2193 3 = ${keySignature.minor}`;
}

function currentKeySignature() {
  return keySignatures.find((signature) => signature.value === signatureSliderValue()) || keySignatures.find((signature) => signature.value === 0);
}

function renderSignatureSlider() {
  const keySignature = currentKeySignature();
  const value = signatureSliderValue();
  const colors = selectedKeyColors(value);
  const selectedPercent = (value + 7) / (keySignatures.length - 1);
  elements.signatureSlider.setAttribute("aria-valuenow", String(value));
  elements.signatureSlider.setAttribute("aria-valuetext", `${keySignature.major} / ${keySignature.minor}`);
  elements.keySliderPopover.style.setProperty("--selected-percent", String(selectedPercent));
  elements.keySliderPopover.style.setProperty("--selected-bg", colors.background);
  elements.keySliderPopover.style.setProperty("--selected-text", colors.text);
  elements.keySliderPopover.style.setProperty("--selected-thumb", colors.thumb);
}

function renderSelectedKeyTick() {
  const value = signatureSliderValue();
  const selectedPercent = (value + 7) / (keySignatures.length - 1);
  elements.keySliderPopover.style.setProperty("--selected-percent", String(selectedPercent));
  elements.keyTickGrid.querySelectorAll(".key-tick-label").forEach((tick) => {
    tick.classList.toggle("selected", Number(tick.dataset.value) === value);
  });
}

function signatureSliderValue() {
  if (!state.type || state.count === 0) return 0;
  return state.type === "sharps" ? state.count : -state.count;
}

function selectedKeyColors(value) {
  if (value === 0) {
    return {
      background: "linear-gradient(180deg, #ffffff, #f7f1e8)",
      text: "#625564",
      thumb: "#fffefa"
    };
  }

  const strength = Math.min(7, Math.abs(value));
  if (value < 0) {
    const lightness = 96 - strength * 3.1;
    return {
      background: `linear-gradient(180deg, hsl(203 100% ${Math.min(97, lightness + 4)}%), hsl(203 92% ${lightness}%))`,
      text: "#305f80",
      thumb: `hsl(203 92% ${Math.max(70, lightness - 5)}%)`
    };
  }

  const lightness = 95 - strength * 3;
  return {
    background: `linear-gradient(180deg, hsl(160 62% ${Math.min(97, lightness + 4)}%), hsl(160 55% ${lightness}%))`,
    text: "#285f50",
    thumb: `hsl(160 55% ${Math.max(68, lightness - 5)}%)`
  };
}

function renderHint() {
  const sharpCount = state.type === "sharps" ? state.count : 0;
  const flatCount = state.type === "flats" ? state.count : 0;
  elements.mnemonicPanel.innerHTML = `
    ${mnemonicCard("sharps", sharpCount, state.type === "sharps")}
    ${mnemonicCard("flats", flatCount, state.type === "flats")}
  `;
}

function mnemonicCard(type, count, active = false) {
  const data = mnemonicData[type];
  const showBeadHelper = type === "flats" && shouldShowBeadHelper();
  return `
    <article class="mnemonic-card mnemonic-${type} ${active ? "active" : ""} ${showBeadHelper ? "show-bead-helper" : ""}">
      <h3>${data.label}</h3>
      <div class="mnemonic-words" aria-label="${data.label} mnemonic">
        ${data.parts.map((part) => mnemonicWord(part, count)).join("")}
      </div>
      ${showBeadHelper ? beadHelperMarkup() : ""}
    </article>
  `;
}

function shouldShowBeadHelper() {
  return state.guideMode && state.type === "flats" && state.count === 4;
}

function renderBeadHelperConfetti() {
  const showBeadHelper = shouldShowBeadHelper();
  if (showBeadHelper && !previousBeadHelperVisible) {
    triggerBeadConfetti();
  }
  previousBeadHelperVisible = showBeadHelper;
}

function triggerBeadConfetti() {
  const helper = document.querySelector(".bead-helper");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!helper || reduceMotion) return;

  helper.querySelectorAll(".bead-confetti-piece").forEach((piece) => piece.remove());

  const pieces = [
    { dx: -18, dy: -36, rotate: -32, color: "#bfe4ff", shape: "dot" },
    { dx: -6, dy: -42, rotate: 18, color: "#ffe57d", shape: "dash" },
    { dx: 10, dy: -38, rotate: 42, color: "#ef4b76", shape: "dot" },
    { dx: 22, dy: -30, rotate: -18, color: "#aee6d5", shape: "dash" },
    { dx: -24, dy: -22, rotate: 28, color: "#ffd8c7", shape: "dot" },
    { dx: 18, dy: -18, rotate: 70, color: "#e2d8ff", shape: "dash" }
  ];

  pieces.forEach((piece, index) => {
    const confetti = document.createElement("span");
    confetti.className = `bead-confetti-piece bead-confetti-${piece.shape}`;
    confetti.style.setProperty("--confetti-x", `${piece.dx}px`);
    confetti.style.setProperty("--confetti-y", `${piece.dy}px`);
    confetti.style.setProperty("--confetti-rotate", `${piece.rotate}deg`);
    confetti.style.setProperty("--confetti-color", piece.color);
    confetti.style.setProperty("--confetti-delay", `${index * 32}ms`);
    helper.append(confetti);
  });

  window.setTimeout(() => {
    helper.querySelectorAll(".bead-confetti-piece").forEach((piece) => piece.remove());
  }, 1300);
}

function beadHelperMarkup() {
  return `
    <div class="bead-helper" aria-live="polite">
      <div class="bead-helper-bubble">
        <span class="bead-helper-beads" aria-hidden="true">
          <span></span><span></span><span></span><span></span>
        </span>
        <span class="bead-helper-text">
          The first 4 flats also spell
          <span class="bead-word" aria-label="BEAD">
            <span>B</span><span>E</span><span>A</span><span>D</span>
          </span><span class="bead-period">.</span>
        </span>
      </div>
      <img class="bead-helper-cat" src="assets/bead-helper-cat-transparent.png" alt="A tiny BEAD helper cat" />
    </div>
  `;
}

function mnemonicWord(part, count) {
  const isCollected = part.highlightAt && count >= part.highlightAt;
  const classes = [
    "mnemonic-word",
    isCollected ? "collected" : ""
  ].filter(Boolean).join(" ");
  return `<span class="${classes}">${part.text}</span>`;
}

function renderButtons() {
  const atLimit = state.count >= 7;
  elements.addSharp.disabled = atLimit || state.type === "flats";
  elements.addFlat.disabled = atLimit || state.type === "sharps";
  elements.removeSharp.disabled = state.type !== "sharps" || state.count === 0;
  elements.removeFlat.disabled = state.type !== "flats" || state.count === 0;
  elements.resetSignature.disabled = state.count === 0;

  elements.addSharp.title = state.type === "flats" ? "Reset first to switch accidental type." : "Add the next sharp.";
  elements.addFlat.title = state.type === "sharps" ? "Reset first to switch accidental type." : "Add the next flat.";
  elements.removeSharp.title = state.type === "sharps" ? "Remove the last sharp." : "No sharps to remove.";
  elements.removeFlat.title = state.type === "flats" ? "Remove the last flat." : "No flats to remove.";
}

init();
