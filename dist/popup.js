var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DEFAULT_LOCALE = "en-US";
const LOCALE_STORAGE_KEY = "llm-score-locale";
const UI_COPY = {
    "en-US": {
        reportTitle: "LLM Score",
        reportSubtitle: "See how your site performs for leading AIs",
        analyzing: "Analyzing page",
        suggestionsTitle: "Suggestions",
        promptTitle: "Improvement insights",
        promptHelp: "Use this prompt with your client or content team.",
        copyPrompt: "Copy",
        copiedPrompt: "Copied",
        spyTitle: "Spy",
        spyHelp: "What this page already does well for your client to reuse.",
        llmFitTitle: "Top 4 AI search fit",
        llmFitHelp: "Independent model-specific estimates for leading AIs",
        scoreMetricLabel: "Score",
        issuesMetricLabel: "Issues",
        issuesUnit: "found",
        waitingForResults: "Waiting for results",
        greatJob: "Great job! No major suggestions found.",
        scoreLabels: {
            low: "Needs attention",
            medium: "Getting there",
            high: "LLM friendly",
        },
        errors: {
            noActiveTab: "No active tab found.",
            unableToAnalyze: "Unable to analyze this page.",
            couldNotConnect: "Could not connect to the page. Try reloading the tab.",
        },
    },
    "pt-BR": {
        reportTitle: "LLM Score",
        reportSubtitle: "Saiba a performance do seu site para as principais IAs",
        analyzing: "Analisando página",
        suggestionsTitle: "Sugestões",
        promptTitle: "Insights de melhoria",
        promptHelp: "Use este prompt com seu cliente ou time de conteúdo.",
        copyPrompt: "Copiar",
        copiedPrompt: "Copiado",
        spyTitle: "Espionar",
        spyHelp: "O que esta página já faz bem para seu cliente usar como referência.",
        llmFitTitle: "Busca nas 4 principais IAs",
        llmFitHelp: "Estimativas independentes e específicas por modelo",
        scoreMetricLabel: "Pontuação",
        issuesMetricLabel: "Problemas",
        issuesUnit: "encontrados",
        waitingForResults: "Aguardando resultado",
        greatJob: "Muito bom! Nenhuma sugestão importante encontrada.",
        scoreLabels: {
            low: "Precisa de atenção",
            medium: "No caminho certo",
            high: "Amigável para LLM",
        },
        errors: {
            noActiveTab: "Nenhuma aba ativa encontrada.",
            unableToAnalyze: "Não foi possível analisar esta página.",
            couldNotConnect: "Não foi possível conectar com a página. Recarregue a aba e tente novamente.",
        },
    },
};
const LLM_FIT_WEIGHTS = {
    chatgpt: {
        singleH1: 8,
        enoughH2: 7,
        headingHierarchy: 7,
        clearOpening: 9,
        definitions: 8,
        questionPhrasing: 6,
        lists: 5,
        h1Reinforced: 6,
        keywordFocus: 7,
    },
    copilot: {
        singleH1: 5,
        enoughH2: 8,
        hasH3: 5,
        headingHierarchy: 7,
        clearOpening: 7,
        lists: 9,
        emphasis: 6,
        numericalEvidence: 8,
        keywordFocus: 6,
    },
    claude: {
        paragraphLength: 8,
        clearOpening: 7,
        definitions: 8,
        externalLinks: 9,
        numericalEvidence: 7,
        headingHierarchy: 6,
        h1Reinforced: 5,
        keywordFocus: 5,
    },
    gemini: {
        singleH1: 6,
        enoughH2: 6,
        clearOpening: 8,
        questionPhrasing: 7,
        externalLinks: 8,
        numericalEvidence: 9,
        lists: 5,
        keywordFocus: 7,
    },
};
let currentLocale = getStoredLocale();
function getActiveTab() {
    return __awaiter(this, void 0, void 0, function* () {
        const [tab] = yield chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    });
}
function requestScore(tabId, locale) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield chrome.tabs.sendMessage(tabId, { type: "GET_SCORE", locale }));
    });
}
function injectContentScript(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield chrome.scripting.executeScript({
            target: { tabId },
            files: ["dist/content.js"],
        });
    });
}
function getScoreColor(score) {
    if (score < 50)
        return "score-red";
    if (score <= 75)
        return "score-yellow";
    return "score-green";
}
function getStoredLocale() {
    return localStorage.getItem(LOCALE_STORAGE_KEY) === "pt-BR" ? "pt-BR" : DEFAULT_LOCALE;
}
function setStoredLocale(locale) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
function getScoreLabel(score, locale) {
    const labels = UI_COPY[locale].scoreLabels;
    if (score < 50)
        return labels.low;
    if (score <= 75)
        return labels.medium;
    return labels.high;
}
function getIssuesSummary(count, locale) {
    if (count === 0)
        return UI_COPY[locale].greatJob;
    if (locale === "pt-BR")
        return count === 1 ? "1 ponto precisa de atenção" : `${count} pontos precisam de atenção`;
    return count === 1 ? "1 finding needs attention" : `${count} findings need attention`;
}
function clampScore(score) {
    return Math.min(100, Math.max(0, Math.round(score)));
}
function calculateLLMFitScores(result) {
    const issueKeys = new Set(result.issueKeys || []);
    const baseScore = result.score;
    return {
        chatgpt: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.chatgpt),
        copilot: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.copilot),
        claude: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.claude),
        gemini: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.gemini),
    };
}
function calculateLLMFitScore(baseScore, issueKeys, weights) {
    let totalWeight = 0;
    let penalty = 0;
    for (const key of Object.keys(weights)) {
        totalWeight += weights[key] || 0;
        if (issueKeys.has(key))
            penalty += weights[key] || 0;
    }
    if (!totalWeight)
        return clampScore(baseScore);
    const modelSpecificScore = ((totalWeight - penalty) / totalWeight) * 100;
    const blendedScore = modelSpecificScore * 0.82 + baseScore * 0.18;
    return clampScore(blendedScore);
}
function renderLLMFitScores(scores) {
    for (const id of ["chatgpt", "copilot", "claude", "gemini"]) {
        const value = scores[id];
        const card = document.querySelector(`[data-llm="${id}"]`);
        const label = document.getElementById(`${id}-fit`);
        if (card)
            card.style.setProperty("--fit", String(value || 0));
        if (label)
            label.textContent = typeof value === "number" ? `${value}%` : "--";
    }
}
function setText(id, text) {
    const element = document.getElementById(id);
    if (element)
        element.textContent = text;
}
function renderImprovementPrompt(text) {
    const promptEl = document.getElementById("improvement-prompt");
    if (promptEl)
        promptEl.textContent = text;
}
function selectTab(panelId) {
    const tabs = document.querySelectorAll("[data-tab]");
    const panels = document.querySelectorAll(".tab-panel");
    for (const tab of tabs) {
        const selected = tab.dataset.tab === panelId;
        tab.setAttribute("aria-selected", String(selected));
    }
    for (const panel of panels) {
        panel.hidden = panel.id !== panelId;
    }
}
function setInsightsAvailability(available) {
    const tab = document.getElementById("insights-tab");
    if (tab)
        tab.hidden = !available;
    if (!available) {
        selectTab("llm-panel");
        renderImprovementPrompt("");
    }
}
function setSpyAvailability(available) {
    const tab = document.getElementById("spy-tab");
    if (tab)
        tab.hidden = !available;
    if (!available) {
        const selectedTab = document.querySelector('[data-tab="spy-panel"][aria-selected="true"]');
        if (selectedTab)
            selectTab("llm-panel");
        renderSpyInsights([]);
    }
}
function renderList(items) {
    const suggestionsEl = document.getElementById("suggestions");
    if (!suggestionsEl)
        return;
    suggestionsEl.innerHTML = "";
    for (const suggestion of items) {
        const li = document.createElement("li");
        li.textContent = suggestion;
        suggestionsEl.appendChild(li);
    }
}
function renderSpyInsights(items) {
    const listEl = document.getElementById("spy-insights");
    if (!listEl)
        return;
    listEl.innerHTML = "";
    for (const item of items) {
        const li = document.createElement("li");
        li.textContent = item;
        listEl.appendChild(li);
    }
}
function updateLanguageControls(locale) {
    const buttons = document.querySelectorAll("[data-locale]");
    for (const button of buttons) {
        button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
    }
}
function applyLocaleText(locale) {
    const copy = UI_COPY[locale];
    document.documentElement.lang = locale;
    setText("report-title", copy.reportTitle);
    setText("report-subtitle", copy.reportSubtitle);
    setText("suggestions-title", copy.suggestionsTitle);
    setText("prompt-title", copy.promptTitle);
    setText("prompt-help", copy.promptHelp);
    setText("copy-prompt", copy.copyPrompt);
    setText("spy-title", copy.spyTitle);
    setText("spy-help", copy.spyHelp);
    setText("llm-fit-title", copy.llmFitTitle);
    setText("llm-fit-help", copy.llmFitHelp);
    setText("score-metric-label", copy.scoreMetricLabel);
    setText("issues-metric-label", copy.issuesMetricLabel);
    setText("issues-unit", copy.issuesUnit);
    updateLanguageControls(locale);
}
function renderLoading(locale) {
    const scoreEl = document.getElementById("score");
    const issuesCountEl = document.getElementById("issues-count");
    const scoreMeterEl = document.getElementById("score-meter");
    if (scoreEl) {
        scoreEl.textContent = "--";
        scoreEl.className = "";
    }
    if (issuesCountEl)
        issuesCountEl.textContent = "--";
    setText("score-label", UI_COPY[locale].analyzing);
    setText("summary-note", UI_COPY[locale].waitingForResults);
    if (scoreMeterEl) {
        scoreMeterEl.className = "";
        scoreMeterEl.style.width = "0";
    }
    renderLLMFitScores({});
    setInsightsAvailability(false);
    setSpyAvailability(false);
    renderList([UI_COPY[locale].analyzing]);
}
function renderResult(result) {
    var _a;
    const scoreEl = document.getElementById("score");
    const issuesCountEl = document.getElementById("issues-count");
    const scoreLabelEl = document.getElementById("score-label");
    const scoreMeterEl = document.getElementById("score-meter");
    if (!scoreEl)
        return;
    scoreEl.textContent = String(result.score);
    scoreEl.className = getScoreColor(result.score);
    if (issuesCountEl)
        issuesCountEl.textContent = String(result.issues.length);
    if (scoreLabelEl)
        scoreLabelEl.textContent = getScoreLabel(result.score, currentLocale);
    setText("summary-note", getIssuesSummary(result.issues.length, currentLocale));
    if (scoreMeterEl) {
        scoreMeterEl.className = getScoreColor(result.score);
        scoreMeterEl.style.width = `${result.score}%`;
    }
    renderLLMFitScores(calculateLLMFitScores(result));
    const hasImprovementInsights = result.suggestions.length > 0 && Boolean((_a = result.improvementPrompt) === null || _a === void 0 ? void 0 : _a.trim());
    setInsightsAvailability(hasImprovementInsights);
    if (hasImprovementInsights)
        renderImprovementPrompt(result.improvementPrompt || "");
    const spyInsights = result.spyInsights || [];
    setSpyAvailability(spyInsights.length > 0);
    renderSpyInsights(spyInsights);
    const items = result.suggestions.length ? result.suggestions : [UI_COPY[currentLocale].greatJob];
    renderList(items);
}
function renderError(errorKey) {
    const scoreEl = document.getElementById("score");
    const issuesCountEl = document.getElementById("issues-count");
    const scoreLabelEl = document.getElementById("score-label");
    const scoreMeterEl = document.getElementById("score-meter");
    if (scoreEl) {
        scoreEl.textContent = "--";
        scoreEl.className = "score-red";
    }
    if (issuesCountEl)
        issuesCountEl.textContent = "--";
    if (scoreLabelEl)
        scoreLabelEl.textContent = UI_COPY[currentLocale].errors.unableToAnalyze;
    setText("summary-note", UI_COPY[currentLocale].errors.unableToAnalyze);
    if (scoreMeterEl) {
        scoreMeterEl.className = "score-red";
        scoreMeterEl.style.width = "0";
    }
    renderLLMFitScores({});
    setInsightsAvailability(false);
    setSpyAvailability(false);
    renderList([UI_COPY[currentLocale].errors[errorKey]]);
}
function loadScore() {
    return __awaiter(this, void 0, void 0, function* () {
        applyLocaleText(currentLocale);
        renderLoading(currentLocale);
        try {
            const tab = yield getActiveTab();
            if (!(tab === null || tab === void 0 ? void 0 : tab.id))
                return renderError("noActiveTab");
            let response;
            try {
                response = yield requestScore(tab.id, currentLocale);
            }
            catch (_a) {
                yield injectContentScript(tab.id);
                response = yield requestScore(tab.id, currentLocale);
            }
            if (!response)
                return renderError("unableToAnalyze");
            renderResult(response);
        }
        catch (_b) {
            renderError("couldNotConnect");
        }
    });
}
function initLanguageSelector() {
    const buttons = document.querySelectorAll("[data-locale]");
    for (const button of buttons) {
        button.addEventListener("click", () => {
            const locale = button.dataset.locale === "pt-BR" ? "pt-BR" : DEFAULT_LOCALE;
            if (locale === currentLocale)
                return;
            currentLocale = locale;
            setStoredLocale(locale);
            loadScore();
        });
    }
}
function initPromptCopy() {
    const button = document.getElementById("copy-prompt");
    const promptEl = document.getElementById("improvement-prompt");
    if (!button || !promptEl)
        return;
    button.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const text = promptEl.textContent || "";
        if (!text.trim())
            return;
        yield navigator.clipboard.writeText(text);
        button.textContent = UI_COPY[currentLocale].copiedPrompt;
        window.setTimeout(() => {
            button.textContent = UI_COPY[currentLocale].copyPrompt;
        }, 1200);
    }));
}
function initTabs() {
    const tabs = document.querySelectorAll("[data-tab]");
    for (const tab of tabs) {
        tab.addEventListener("click", () => {
            const panelId = tab.dataset.tab;
            if (panelId === "llm-panel" || panelId === "insights-panel" || panelId === "spy-panel") {
                selectTab(panelId);
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    initLanguageSelector();
    initPromptCopy();
    initTabs();
    loadScore();
});
export {};
