var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getScoreColor(score) {
    if (score < 50)
        return "score-red";
    if (score <= 75)
        return "score-yellow";
    return "score-green";
}
function renderResult(result) {
    const scoreEl = document.getElementById("score");
    const suggestionsEl = document.getElementById("suggestions");
    if (!scoreEl || !suggestionsEl)
        return;
    scoreEl.textContent = String(result.score);
    scoreEl.className = `score-value ${getScoreColor(result.score)}`;
    suggestionsEl.innerHTML = "";
    const items = result.suggestions.length ? result.suggestions : ["Great job! No major suggestions found."];
    for (const suggestion of items) {
        const li = document.createElement("li");
        li.textContent = suggestion;
        suggestionsEl.appendChild(li);
    }
}
function renderError(message) {
    const scoreEl = document.getElementById("score");
    const suggestionsEl = document.getElementById("suggestions");
    if (scoreEl) {
        scoreEl.textContent = "--";
        scoreEl.className = "score-value score-red";
    }
    if (suggestionsEl) {
        suggestionsEl.innerHTML = "";
        const li = document.createElement("li");
        li.textContent = message;
        suggestionsEl.appendChild(li);
    }
}
function loadScore() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [tab] = yield chrome.tabs.query({ active: true, currentWindow: true });
            if (!(tab === null || tab === void 0 ? void 0 : tab.id))
                return renderError("No active tab found.");
            const response = (yield chrome.tabs.sendMessage(tab.id, { type: "GET_SCORE" }));
            if (!response)
                return renderError("Unable to analyze this page.");
            renderResult(response);
        }
        catch (_a) {
            renderError("Could not connect to the page. Try reloading the tab.");
        }
    });
}
document.addEventListener("DOMContentLoaded", loadScore);
export {};
