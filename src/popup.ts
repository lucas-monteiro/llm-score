export {};

type LLMResult = {
  score: number;
  issues: string[];
  suggestions: string[];
};

declare const chrome: any;

function getScoreColor(score: number): string {
  if (score < 50) return "score-red";
  if (score <= 75) return "score-yellow";
  return "score-green";
}

function renderResult(result: LLMResult): void {
  const scoreEl = document.getElementById("score");
  const suggestionsEl = document.getElementById("suggestions");
  if (!scoreEl || !suggestionsEl) return;

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

function renderError(message: string): void {
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

async function loadScore(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return renderError("No active tab found.");

    const response = (await chrome.tabs.sendMessage(tab.id, { type: "GET_SCORE" })) as LLMResult | undefined;
    if (!response) return renderError("Unable to analyze this page.");
    renderResult(response);
  } catch {
    renderError("Could not connect to the page. Try reloading the tab.");
  }
}

document.addEventListener("DOMContentLoaded", loadScore);
