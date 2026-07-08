"use strict";

const DRAFT_KEY = "writerapp.draft";
const PREFS_KEY = "writerapp.prefs";
const FONTS = ["ovo", "muli", "karla", "lusitana"];
const THEMES = ["felt", "purple", "process", "plain", "midnight"];
const SCHEMES = ["auto", "light", "dark"];
const FONT_SIZE_MIN = 10;
const FONT_SIZE_MAX = 32;
const FONT_SIZE_STEP = 2;
const FONT_SIZE_DEFAULT = 14;

const editor = document.getElementById("editor");
const fontSelect = document.getElementById("font-select");
const fontSizeDecrease = document.getElementById("font-size-decrease");
const fontSizeIncrease = document.getElementById("font-size-increase");
const fontSizeValue = document.getElementById("font-size-value");
const backgroundSelect = document.getElementById("background-select");
const schemeSelect = document.getElementById("scheme-select");
const settingsButton = document.getElementById("settings-button");
const settingsPopover = document.getElementById("settings-popover");
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const fileInput = document.getElementById("file-input");
const wordCount = document.getElementById("word-count");
const charCount = document.getElementById("char-count");
const readingTime = document.getElementById("reading-time");
const autosaveStatus = document.getElementById("autosave-status");

const WORDS_PER_MINUTE = 200;
const STATUS_FADE_MS = 2000;

let autosaveTimer = null;
let statusFadeTimer = null;
let fontSize = FONT_SIZE_DEFAULT;

/** Editor appearance ********************************************************/

function setEditorFont(font) {
    editor.classList.remove(...FONTS.map((f) => "font-" + f));
    editor.classList.add("font-" + font);
}

function setEditorFontSize(size) {
    editor.style.fontSize = size + "pt";
}

function updateFontSizeControls() {
    fontSizeValue.textContent = fontSize;
    fontSizeDecrease.disabled = fontSize <= FONT_SIZE_MIN;
    fontSizeIncrease.disabled = fontSize >= FONT_SIZE_MAX;
}

function applyFontSize(size) {
    fontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, size));
    setEditorFontSize(fontSize);
    updateFontSizeControls();
}

function setBackground(theme) {
    document.body.classList.remove(...THEMES.map((t) => "theme-" + t));
    document.body.classList.add("theme-" + theme);
}

// "auto" follows the OS via the prefers-color-scheme media query (no
// attribute); "light"/"dark" set data-scheme on <html> so the higher-
// specificity CSS override in style.css wins regardless of the OS setting.
function setColorScheme(scheme) {
    if (scheme === "light" || scheme === "dark") {
        document.documentElement.setAttribute("data-scheme", scheme);
    } else {
        document.documentElement.removeAttribute("data-scheme");
    }
}

function savePrefs() {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
            font: fontSelect.value,
            fontSize: fontSize,
            background: backgroundSelect.value,
            colorScheme: schemeSelect.value,
        }));
    } catch (err) {
        // Storage may be unavailable (private mode, quota); appearance just
        // won't persist.
    }
}

function restorePrefs() {
    let prefs;
    try {
        prefs = JSON.parse(localStorage.getItem(PREFS_KEY));
    } catch (err) {
        return;
    }
    if (!prefs) {
        return;
    }
    if (FONTS.includes(prefs.font)) {
        fontSelect.value = prefs.font;
        setEditorFont(prefs.font);
    }
    if (prefs.fontSize) {
        applyFontSize(Number(prefs.fontSize));
    }
    if (THEMES.includes(prefs.background)) {
        backgroundSelect.value = prefs.background;
        setBackground(prefs.background);
    }
    if (SCHEMES.includes(prefs.colorScheme)) {
        schemeSelect.value = prefs.colorScheme;
        setColorScheme(prefs.colorScheme);
    }
}

/** Word count ***************************************************************/

function countWords(text) {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

function formatReadingTime(words) {
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    return minutes + " min read";
}

function updateCounts() {
    const text = editor.value;
    const words = countWords(text);
    wordCount.textContent = words;
    charCount.textContent = text.length;
    readingTime.textContent = words > 0 ? " · " + formatReadingTime(words) : "";
}

/** Autosave *****************************************************************/

// Shows a brief status message in the status bar. Transient messages
// (the common case) fade out on their own after STATUS_FADE_MS; persistent
// ones (like a storage error) stay visible until replaced.
function showStatus(message, transient) {
    clearTimeout(statusFadeTimer);
    autosaveStatus.textContent = message;
    autosaveStatus.classList.add("visible");
    if (transient) {
        statusFadeTimer = setTimeout(function () {
            autosaveStatus.classList.remove("visible");
        }, STATUS_FADE_MS);
    }
}

function autosaveDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, editor.value);
        showStatus("Saved ✓", true);
    } catch (err) {
        showStatus("Autosave unavailable — save your work to a file", false);
    }
}

function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(autosaveDraft, 500);
}

function restoreDraft() {
    let draft = null;
    try {
        draft = localStorage.getItem(DRAFT_KEY);
    } catch (err) {
        return;
    }
    if (draft) {
        editor.value = draft;
        showStatus("Draft restored", true);
    }
}

/** Save and load files ******************************************************/

function saveToFile() {
    const blob = new Blob([editor.value], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "MyAmbiWriterFile.txt";
    link.click();
    URL.revokeObjectURL(url);
}

function loadFromFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        editor.value = event.target.result;
        updateCounts();
        autosaveDraft();
    };
    reader.onerror = function () {
        alert("Could not read " + file.name + ".");
    };
    reader.readAsText(file);
}

/** Distraction-free writing mode ********************************************/

function enterWritingMode() {
    document.body.classList.add("writing");
}

function exitWritingMode() {
    document.body.classList.remove("writing");
}

/** Settings popover ***********************************************************/

function openSettings() {
    settingsPopover.hidden = false;
    settingsButton.setAttribute("aria-expanded", "true");
    // The popover has its own focus target; don't let the chrome fade while
    // it's open.
    exitWritingMode();
}

function closeSettings() {
    settingsPopover.hidden = true;
    settingsButton.setAttribute("aria-expanded", "false");
}

function toggleSettings() {
    if (settingsPopover.hidden) {
        openSettings();
    } else {
        closeSettings();
    }
}

/** Wiring *******************************************************************/

fontSelect.addEventListener("change", function () {
    setEditorFont(fontSelect.value);
    savePrefs();
});

fontSizeDecrease.addEventListener("click", function () {
    applyFontSize(fontSize - FONT_SIZE_STEP);
    savePrefs();
});

fontSizeIncrease.addEventListener("click", function () {
    applyFontSize(fontSize + FONT_SIZE_STEP);
    savePrefs();
});

backgroundSelect.addEventListener("change", function () {
    setBackground(backgroundSelect.value);
    savePrefs();
});

schemeSelect.addEventListener("change", function () {
    setColorScheme(schemeSelect.value);
    savePrefs();
});

settingsButton.addEventListener("click", function (event) {
    event.stopPropagation();
    toggleSettings();
});

document.addEventListener("click", function (event) {
    if (!settingsPopover.hidden && !settingsPopover.contains(event.target)) {
        closeSettings();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !settingsPopover.hidden) {
        closeSettings();
        settingsButton.focus();
    }
});

saveButton.addEventListener("click", saveToFile);

document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        saveToFile();
    }
});

loadButton.addEventListener("click", function () {
    fileInput.click();
});

fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) {
        return;
    }
    if (editor.value.trim() !== "" &&
        !confirm("Loading " + file.name + " will replace your current text. Continue?")) {
        fileInput.value = "";
        return;
    }
    loadFromFile(file);
    fileInput.value = "";
});

editor.addEventListener("input", function () {
    updateCounts();
    scheduleAutosave();
    enterWritingMode();
});

editor.addEventListener("keydown", enterWritingMode);
editor.addEventListener("blur", exitWritingMode);
document.addEventListener("mousemove", exitWritingMode);
document.addEventListener("touchstart", exitWritingMode);

updateFontSizeControls();
restorePrefs();
restoreDraft();
updateCounts();
