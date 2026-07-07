"use strict";

const DRAFT_KEY = "writerapp.draft";
const PREFS_KEY = "writerapp.prefs";
const FONTS = ["ovo", "muli", "karla", "lusitana"];
const THEMES = ["felt", "purple", "process", "plain"];

const editor = document.getElementById("editor");
const fontSelect = document.getElementById("font-select");
const fontSizeInput = document.getElementById("font-size");
const backgroundSelect = document.getElementById("background-select");
const settingsButton = document.getElementById("settings-button");
const settingsPopover = document.getElementById("settings-popover");
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");
const fileInput = document.getElementById("file-input");
const wordCount = document.getElementById("word-count");
const charCount = document.getElementById("char-count");
const autosaveStatus = document.getElementById("autosave-status");

let autosaveTimer = null;

/** Editor appearance ********************************************************/

function setEditorFont(font) {
    editor.classList.remove(...FONTS.map((f) => "font-" + f));
    editor.classList.add("font-" + font);
}

function setEditorFontSize(size) {
    editor.style.fontSize = size + "pt";
}

function setBackground(theme) {
    document.body.classList.remove(...THEMES.map((t) => "theme-" + t));
    document.body.classList.add("theme-" + theme);
}

function savePrefs() {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({
            font: fontSelect.value,
            fontSize: fontSizeInput.value,
            background: backgroundSelect.value,
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
        fontSizeInput.value = prefs.fontSize;
        setEditorFontSize(prefs.fontSize);
    }
    if (THEMES.includes(prefs.background)) {
        backgroundSelect.value = prefs.background;
        setBackground(prefs.background);
    }
}

/** Word count ***************************************************************/

function countWords(text) {
    const trimmed = text.trim();
    return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

function updateCounts() {
    const text = editor.value;
    wordCount.textContent = countWords(text);
    charCount.textContent = text.length;
}

/** Autosave *****************************************************************/

function autosaveDraft() {
    try {
        localStorage.setItem(DRAFT_KEY, editor.value);
        const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
        autosaveStatus.textContent = "Draft autosaved at " + time;
    } catch (err) {
        autosaveStatus.textContent =
            "Autosave unavailable — save your work to a file";
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
        autosaveStatus.textContent = "Draft restored from this browser";
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

fontSizeInput.addEventListener("change", function () {
    setEditorFontSize(fontSizeInput.value);
    savePrefs();
});

backgroundSelect.addEventListener("change", function () {
    setBackground(backgroundSelect.value);
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

restorePrefs();
restoreDraft();
updateCounts();
