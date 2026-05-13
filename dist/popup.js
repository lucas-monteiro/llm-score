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
const REVIEW_DOMAINS_KEY = "llm-score-analyzed-domains";
const UI_COPY = {
    "en-US": {
        reportTitle: "LLM Score",
        reportSubtitle: "See how your site performs for leading AIs",
        analyzing: "Analyzing page",
        suggestionsTitle: "Suggestions",
        promptTitle: "Insights",
        promptHelp: "Use this prompt with your client or content team.",
        copyPrompt: "Copy",
        copiedPrompt: "Copied",
        spyTitle: "Strengths",
        spyHelp: "What this page already does well. Use as a benchmark.",
        llmFitTitle: "AI Fit",
        llmFitHelp: "Independent model-specific estimates for leading AIs",
        aboutTitle: "About LLM Score",
        aboutDescription: "LLM Score evaluates page structure and content quality so anyone can see how well a page is prepared for AI search.",
        aboutNote: "The score is based on headings, paragraphs, lists, emphasis, links and metadata.",
        closeButton: "Close",
        scoreMetricLabel: "Score",
        issuesMetricLabel: "Issues",
        issuesUnit: "found",
        waitingForResults: "Waiting for results",
        greatJob: "Great job! No major suggestions found.",
        reviewPrompt: "Enjoying LLM Score? Leave us a review!",
        reviewButton: "Rate on Chrome Store",
        checklistTitle: "Checklist",
        checklistHelp: "All signals evaluated — pass or fail.",
        exportButton: "Export MD",
        exportCopied: "Copied!",
        snippetHelp: "How AI search would likely present this page.",
        noSnippet: "No description available.",
        rateLabel: "Rate this extension",
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
        promptTitle: "Insights",
        promptHelp: "Use este prompt com seu cliente ou time de conteúdo.",
        copyPrompt: "Copiar",
        copiedPrompt: "Copiado",
        spyTitle: "Fortes",
        spyHelp: "O que esta página já faz bem. Use como referência.",
        llmFitTitle: "AI Fit",
        llmFitHelp: "Estimativas independentes e específicas por modelo",
        aboutTitle: "Sobre LLM Score",
        aboutDescription: "LLM Score avalia a estrutura e a qualidade do conteúdo da página para mostrar como ela está pronta para buscas com IA.",
        aboutNote: "A pontuação considera títulos, parágrafos, listas, ênfase, links e metadados.",
        closeButton: "Fechar",
        scoreMetricLabel: "Pontuação",
        issuesMetricLabel: "Problemas",
        issuesUnit: "encontrados",
        waitingForResults: "Aguardando resultado",
        greatJob: "Muito bom! Nenhuma sugestão importante encontrada.",
        reviewPrompt: "Gostando do LLM Score? Deixe uma avaliação!",
        reviewButton: "Avaliar na Chrome Store",
        checklistTitle: "Checklist",
        checklistHelp: "Todos os sinais avaliados — aprovado ou reprovado.",
        exportButton: "Exportar MD",
        exportCopied: "Copiado!",
        snippetHelp: "Como a busca com IA provavelmente apresentaria esta página.",
        noSnippet: "Sem descrição disponível.",
        rateLabel: "Avaliar extensão",
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
        llmsTxt: 7,
        schemaMarkup: 7,
        faqSchema: 8,
        semanticStructure: 5,
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
        llmsTxt: 6,
        schemaMarkup: 9,
        faqSchema: 7,
        authorSignal: 6,
        contentFreshness: 6,
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
        llmsTxt: 6,
        authorSignal: 7,
        contentFreshness: 6,
        semanticStructure: 5,
        imageAltText: 5,
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
        llmsTxt: 8,
        schemaMarkup: 9,
        faqSchema: 8,
        contentFreshness: 7,
        authorSignal: 6,
        imageAltText: 5,
    },
    perplexity: {
        singleH1: 6,
        enoughH2: 7,
        clearOpening: 9,
        questionPhrasing: 9,
        externalLinks: 7,
        numericalEvidence: 8,
        lists: 6,
        metaDescription: 8,
        llmsTxt: 9,
        schemaMarkup: 5,
        faqSchema: 9,
        contentFreshness: 8,
        authorSignal: 7,
    },
};
const ALL_FINDING_KEYS = [
    "singleH1", "enoughH2", "hasH3", "headingHierarchy",
    "paragraphLength", "clearOpening", "definitions", "questionPhrasing",
    "lists", "emphasis", "externalLinks", "numericalEvidence",
    "metaDescription", "titleMatch", "h1Reinforced", "keywordFocus",
    "llmsTxt", "noindex", "schemaMarkup", "faqSchema",
    "contentFreshness", "authorSignal", "semanticStructure", "imageAltText",
];
const SIGNAL_LABELS = {
    "en-US": {
        singleH1: "Single H1",
        enoughH2: "2+ H2s",
        hasH3: "Has H3",
        headingHierarchy: "Heading order",
        paragraphLength: "Paragraph size",
        clearOpening: "Clear opening",
        definitions: "Definitions",
        questionPhrasing: "Questions",
        lists: "Lists",
        emphasis: "Bold emphasis",
        externalLinks: "External links",
        numericalEvidence: "Numbers/stats",
        metaDescription: "Meta description",
        titleMatch: "Title match",
        h1Reinforced: "H1 reinforced",
        keywordFocus: "Keyword focus",
        llmsTxt: "llms.txt",
        noindex: "Crawlable",
        schemaMarkup: "Schema markup",
        faqSchema: "FAQ/HowTo schema",
        contentFreshness: "Date signals",
        authorSignal: "Author info",
        semanticStructure: "Semantic HTML",
        imageAltText: "Image alt text",
    },
    "pt-BR": {
        singleH1: "H1 único",
        enoughH2: "2+ H2s",
        hasH3: "Tem H3",
        headingHierarchy: "Ordem de títulos",
        paragraphLength: "Tamanho dos parágrafos",
        clearOpening: "Abertura clara",
        definitions: "Definições",
        questionPhrasing: "Perguntas",
        lists: "Listas",
        emphasis: "Negrito",
        externalLinks: "Links externos",
        numericalEvidence: "Números/estatísticas",
        metaDescription: "Meta description",
        titleMatch: "Título alinhado",
        h1Reinforced: "H1 reforçado",
        keywordFocus: "Palavras-chave",
        llmsTxt: "llms.txt",
        noindex: "Rastreável",
        schemaMarkup: "Schema markup",
        faqSchema: "Schema FAQ/HowTo",
        contentFreshness: "Sinais de data",
        authorSignal: "Autoria",
        semanticStructure: "HTML semântico",
        imageAltText: "Alt text de imagens",
    },
};
let currentLocale = getStoredLocale();
let lastResult = null;
let lastFitScores = null;
let lastTabUrl = "";
let lastHostname = "";
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
        perplexity: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.perplexity),
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
    for (const id of ["chatgpt", "copilot", "claude", "gemini", "perplexity"]) {
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
function setChecklistAvailability(available) {
    const tab = document.getElementById("checklist-tab");
    if (tab)
        tab.hidden = !available;
    if (!available) {
        const selectedTab = document.querySelector('[data-tab="checklist-panel"][aria-selected="true"]');
        if (selectedTab)
            selectTab("llm-panel");
    }
}
function renderList(items) {
    const suggestionsEl = document.getElementById("suggestions");
    const showMoreBtn = document.getElementById("show-more-suggestions");
    const showMoreText = document.getElementById("show-more-text");
    if (!suggestionsEl || !showMoreBtn || !showMoreText)
        return;
    suggestionsEl.innerHTML = "";
    const displayLimit = 3;
    const hasMore = items.length > displayLimit;
    let isExpanded = false;
    const renderItems = () => {
        suggestionsEl.innerHTML = "";
        const itemsToShow = isExpanded ? items : items.slice(0, displayLimit);
        for (const suggestion of itemsToShow) {
            const li = document.createElement("li");
            li.textContent = suggestion;
            suggestionsEl.appendChild(li);
        }
    };
    renderItems();
    showMoreBtn.hidden = !hasMore;
    showMoreBtn.classList.toggle("expanded", isExpanded);
    const locale = localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;
    showMoreText.textContent = isExpanded
        ? (locale === "pt-BR" ? "Ver menos" : "Show less")
        : (locale === "pt-BR" ? "Ver mais" : "Show more");
    showMoreBtn.onclick = () => {
        isExpanded = !isExpanded;
        renderItems();
        showMoreBtn.classList.toggle("expanded", isExpanded);
        showMoreText.textContent = isExpanded
            ? (locale === "pt-BR" ? "Ver menos" : "Show less")
            : (locale === "pt-BR" ? "Ver mais" : "Show more");
    };
}
function renderNoindexBanner(visible) {
    const existing = document.getElementById("noindex-banner");
    if (!visible) {
        if (existing)
            existing.remove();
        return;
    }
    if (existing)
        return;
    const banner = document.createElement("div");
    banner.id = "noindex-banner";
    banner.className = "noindex-banner";
    const locale = localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;
    banner.textContent =
        locale === "pt-BR"
            ? "Aviso: esta página está marcada como noindex e pode ser invisível para buscadores de IA."
            : "Warning: this page is marked noindex and may be invisible to AI search crawlers.";
    const meter = document.querySelector(".meter");
    if (meter === null || meter === void 0 ? void 0 : meter.parentNode) {
        meter.parentNode.insertBefore(banner, meter.nextSibling);
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
function renderTrend(current, prev) {
    const el = document.getElementById("score-trend");
    if (!el)
        return;
    if (!prev) {
        el.textContent = "";
        el.className = "score-trend";
        return;
    }
    const delta = current - prev.s;
    if (delta > 0) {
        el.textContent = `↑ +${delta} vs last scan`;
        el.className = "score-trend trend-up";
    }
    else if (delta < 0) {
        el.textContent = `↓ ${delta} vs last scan`;
        el.className = "score-trend trend-down";
    }
    else {
        el.textContent = "= same as last scan";
        el.className = "score-trend trend-flat";
    }
}
function renderChecklist(result) {
    const listEl = document.getElementById("checklist-items");
    if (!listEl)
        return;
    listEl.innerHTML = "";
    if (!result)
        return;
    const issueSet = new Set(result.issueKeys || []);
    const labels = SIGNAL_LABELS[currentLocale];
    for (const key of ALL_FINDING_KEYS) {
        const isPassing = !issueSet.has(key);
        const li = document.createElement("li");
        li.className = `checklist-item ${isPassing ? "pass" : "fail"}`;
        const icon = document.createElement("span");
        icon.className = "checklist-icon";
        icon.textContent = isPassing ? "✓" : "✗";
        const label = document.createElement("span");
        label.className = "checklist-label";
        label.textContent = labels[key];
        label.title = labels[key];
        li.appendChild(icon);
        li.appendChild(label);
        listEl.appendChild(li);
    }
}
function renderSnippetPreview(result, url) {
    const el = document.getElementById("snippet-preview");
    if (!el)
        return;
    let hostname = "";
    try {
        hostname = new URL(url).hostname;
    }
    catch ( /* no-op */_a) { /* no-op */ }
    el.innerHTML = "";
    const card = document.createElement("div");
    card.className = "snippet-card";
    const src = document.createElement("div");
    src.className = "snippet-source";
    src.textContent = hostname;
    const ttl = document.createElement("div");
    ttl.className = "snippet-title";
    ttl.textContent = result.pageTitle || hostname;
    const desc = document.createElement("div");
    desc.className = "snippet-desc";
    desc.textContent = result.metaDescription || UI_COPY[currentLocale].noSnippet;
    card.appendChild(src);
    card.appendChild(ttl);
    card.appendChild(desc);
    el.appendChild(card);
}
function exportMarkdown() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!lastResult)
            return;
        const copy = UI_COPY[currentLocale];
        const url = lastTabUrl || "—";
        const score = lastResult.score;
        const label = getScoreLabel(score, currentLocale);
        const issueCount = lastResult.issues.length;
        const issueLines = lastResult.suggestions.length
            ? lastResult.suggestions.map((s) => `- ${s}`).join("\n")
            : `- ${copy.greatJob}`;
        const fitSection = lastFitScores
            ? ["chatgpt", "copilot", "claude", "gemini", "perplexity"]
                .map((id) => `- **${id.charAt(0).toUpperCase() + id.slice(1)}**: ${lastFitScores[id]}%`)
                .join("\n")
            : "";
        const md = [
            `# LLM Score Report`,
            ``,
            `**URL:** ${url}`,
            `**Score:** ${score}/100 — ${label}`,
            `**Issues:** ${issueCount}`,
            ``,
            `## Suggestions`,
            issueLines,
            fitSection ? `\n## AI Fit\n${fitSection}` : "",
        ]
            .filter((l) => l !== undefined)
            .join("\n");
        yield navigator.clipboard.writeText(md);
    });
}
function initExportButton() {
    const button = document.getElementById("export-markdown");
    const textEl = document.getElementById("export-markdown-text");
    if (!button || !textEl)
        return;
    button.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        yield exportMarkdown();
        const original = textEl.textContent;
        textEl.textContent = UI_COPY[currentLocale].exportCopied;
        window.setTimeout(() => {
            textEl.textContent = original;
        }, 1500);
    }));
}
function getPreviousScore(hostname) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = `llm-h-${hostname}`;
            const data = yield chrome.storage.sync.get(key);
            const entries = data[key] || [];
            return entries[entries.length - 1];
        }
        catch (_a) {
            return undefined;
        }
    });
}
function saveScore(hostname, score) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = `llm-h-${hostname}`;
            const data = yield chrome.storage.sync.get(key);
            const entries = data[key] || [];
            entries.push({ s: score, t: Date.now() });
            if (entries.length > 10)
                entries.splice(0, entries.length - 10);
            yield chrome.storage.sync.set({ [key]: entries });
        }
        catch (_a) {
            // Storage unavailable; score history disabled
        }
    });
}
function updateActionBadge(score) {
    var _a;
    try {
        if ((_a = chrome.action) === null || _a === void 0 ? void 0 : _a.setBadgeText) {
            chrome.action.setBadgeText({ text: String(score) });
            const color = score >= 76 ? "#50fa7b" : score >= 51 ? "#ffb86c" : "#ff5555";
            chrome.action.setBadgeBackgroundColor({ color });
        }
    }
    catch (_b) {
        // Badge API unavailable
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
    setText("about-title", copy.aboutTitle);
    setText("about-description", copy.aboutDescription);
    setText("about-note", copy.aboutNote);
    setText("close-about", copy.closeButton);
    setText("score-metric-label", copy.scoreMetricLabel);
    setText("issues-metric-label", copy.issuesMetricLabel);
    setText("issues-unit", copy.issuesUnit);
    setText("checklist-title", copy.checklistTitle);
    setText("checklist-help", copy.checklistHelp);
    setText("export-markdown-text", copy.exportButton);
    setText("snippet-help", copy.snippetHelp);
    updateLanguageControls(locale);
    const rateLink = document.getElementById("rate-link");
    if (rateLink) {
        rateLink.textContent = copy.rateLabel;
        try {
            rateLink.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`;
        }
        catch (_a) {
            rateLink.href = "https://chrome.google.com/webstore/search/LLM+Score";
        }
    }
}
function renderLoading(locale) {
    const scoreEl = document.getElementById("score");
    const issuesCountEl = document.getElementById("issues-count");
    const scoreMeterEl = document.getElementById("score-meter");
    const trendEl = document.getElementById("score-trend");
    if (scoreEl) {
        scoreEl.textContent = "--";
        scoreEl.className = "";
    }
    if (issuesCountEl)
        issuesCountEl.textContent = "--";
    if (trendEl) {
        trendEl.textContent = "";
        trendEl.className = "score-trend";
    }
    setText("score-label", UI_COPY[locale].analyzing);
    setText("summary-note", UI_COPY[locale].waitingForResults);
    if (scoreMeterEl) {
        scoreMeterEl.className = "";
        scoreMeterEl.style.width = "0";
    }
    renderLLMFitScores({});
    renderNoindexBanner(false);
    setInsightsAvailability(false);
    setSpyAvailability(false);
    setChecklistAvailability(false);
    const snippetEl = document.getElementById("snippet-preview");
    if (snippetEl)
        snippetEl.innerHTML = "";
    renderList([UI_COPY[locale].analyzing]);
}
function renderResult(result) {
    var _a;
    lastResult = result;
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
    const fitScores = calculateLLMFitScores(result);
    lastFitScores = fitScores;
    renderLLMFitScores(fitScores);
    renderNoindexBanner(result.isNoindex === true);
    const hasImprovementInsights = result.suggestions.length > 0 && Boolean((_a = result.improvementPrompt) === null || _a === void 0 ? void 0 : _a.trim());
    setInsightsAvailability(hasImprovementInsights);
    if (hasImprovementInsights)
        renderImprovementPrompt(result.improvementPrompt || "");
    const spyInsights = result.spyInsights || [];
    setSpyAvailability(spyInsights.length > 0);
    renderSpyInsights(spyInsights);
    setChecklistAvailability(true);
    renderChecklist(result);
    renderSnippetPreview(result, lastTabUrl);
    updateActionBadge(result.score);
    const items = result.suggestions.length ? result.suggestions : [UI_COPY[currentLocale].greatJob];
    renderList(items);
}
function renderError(errorKey) {
    const scoreEl = document.getElementById("score");
    const issuesCountEl = document.getElementById("issues-count");
    const scoreLabelEl = document.getElementById("score-label");
    const scoreMeterEl = document.getElementById("score-meter");
    const trendEl = document.getElementById("score-trend");
    if (scoreEl) {
        scoreEl.textContent = "--";
        scoreEl.className = "score-red";
    }
    if (issuesCountEl)
        issuesCountEl.textContent = "--";
    if (trendEl) {
        trendEl.textContent = "";
        trendEl.className = "score-trend";
    }
    if (scoreLabelEl)
        scoreLabelEl.textContent = UI_COPY[currentLocale].errors.unableToAnalyze;
    setText("summary-note", UI_COPY[currentLocale].errors.unableToAnalyze);
    if (scoreMeterEl) {
        scoreMeterEl.className = "score-red";
        scoreMeterEl.style.width = "0";
    }
    renderLLMFitScores({});
    renderNoindexBanner(false);
    setInsightsAvailability(false);
    setSpyAvailability(false);
    setChecklistAvailability(false);
    renderList([UI_COPY[currentLocale].errors[errorKey]]);
}
function setPageUrlText(text) {
    const element = document.getElementById("page-url");
    if (element)
        element.textContent = text;
}
function renderPageInfo(tab) {
    if (!(tab === null || tab === void 0 ? void 0 : tab.url)) {
        setPageUrlText(currentLocale === "pt-BR" ? "Aba ativa sem URL válida." : "Active tab has no valid URL.");
        return;
    }
    try {
        const url = new URL(tab.url);
        setPageUrlText(url.hostname);
    }
    catch (_a) {
        setPageUrlText(tab.url);
    }
}
function clearPageInfo() {
    setPageUrlText(currentLocale === "pt-BR" ? "Aguardando aba ativa..." : "Waiting for active tab...");
}
function loadScore() {
    return __awaiter(this, void 0, void 0, function* () {
        applyLocaleText(currentLocale);
        renderLoading(currentLocale);
        clearPageInfo();
        try {
            const tab = yield getActiveTab();
            if (!(tab === null || tab === void 0 ? void 0 : tab.id))
                return renderError("noActiveTab");
            renderPageInfo(tab);
            if (tab.url) {
                lastTabUrl = tab.url;
                try {
                    lastHostname = new URL(tab.url).hostname;
                }
                catch (_a) {
                    lastHostname = "";
                }
            }
            const prevEntry = lastHostname ? yield getPreviousScore(lastHostname) : undefined;
            let response;
            try {
                response = yield requestScore(tab.id, currentLocale);
            }
            catch (_b) {
                yield injectContentScript(tab.id);
                response = yield requestScore(tab.id, currentLocale);
            }
            if (!response)
                return renderError("unableToAnalyze");
            renderResult(response);
            renderTrend(response.score, prevEntry);
            if (lastHostname) {
                yield saveScore(lastHostname, response.score);
                const domainsCount = trackAnalyzedDomain(lastHostname);
                showReviewToast(response.score, domainsCount);
            }
        }
        catch (_c) {
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
function trackAnalyzedDomain(hostname) {
    if (!hostname)
        return 0;
    try {
        const stored = localStorage.getItem(REVIEW_DOMAINS_KEY);
        const domains = stored ? JSON.parse(stored) : [];
        if (!domains.includes(hostname)) {
            domains.push(hostname);
            localStorage.setItem(REVIEW_DOMAINS_KEY, JSON.stringify(domains));
        }
        return domains.length;
    }
    catch (_a) {
        return 0;
    }
}
function showReviewToast(score, domainsCount) {
    try {
        const locale = localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;
        const copy = UI_COPY[locale];
        const lastToastKey = "llm-score-review-toast-last-shown";
        const lastShown = localStorage.getItem(lastToastKey);
        const now = Date.now();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        if (lastShown && now - parseInt(lastShown) < SEVEN_DAYS_MS)
            return;
        // when called from analysis: require 3+ domains AND score < 70
        if (score !== undefined && domainsCount !== undefined) {
            if (score >= 70 || domainsCount < 3)
                return;
        }
        const existing = document.getElementById("review-toast");
        if (existing)
            existing.remove();
        const toast = document.createElement("div");
        toast.id = "review-toast";
        toast.className = "review-toast";
        const content = document.createElement("div");
        content.className = "review-toast-content";
        const msg = document.createElement("p");
        msg.className = "review-toast-message";
        msg.textContent = copy.reviewPrompt;
        const actions = document.createElement("div");
        actions.className = "review-toast-actions";
        const link = document.createElement("a");
        link.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`;
        link.target = "_blank";
        link.rel = "noopener";
        link.className = "review-toast-button review-button";
        link.textContent = copy.reviewButton;
        const dismissBtn = document.createElement("button");
        dismissBtn.type = "button";
        dismissBtn.className = "review-toast-button dismiss-button";
        dismissBtn.setAttribute("aria-label", "Dismiss");
        dismissBtn.textContent = "×";
        actions.appendChild(link);
        actions.appendChild(dismissBtn);
        content.appendChild(msg);
        content.appendChild(actions);
        toast.appendChild(content);
        document.body.appendChild(toast);
        localStorage.setItem(lastToastKey, now.toString());
        const timeout = window.setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add("fade-out");
                window.setTimeout(() => { if (toast.parentNode)
                    toast.remove(); }, 300);
            }
        }, 8000);
        dismissBtn.addEventListener("click", () => {
            window.clearTimeout(timeout);
            toast.classList.add("fade-out");
            window.setTimeout(() => { if (toast.parentNode)
                toast.remove(); }, 300);
        });
    }
    catch (error) {
        console.debug("Review toast failed (development/test env?):", error);
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
        showReviewToast();
        window.setTimeout(() => {
            button.textContent = UI_COPY[currentLocale].copyPrompt;
        }, 1200);
    }));
}
function initReloadButton() {
    const button = document.getElementById("reload-score");
    if (!button)
        return;
    button.addEventListener("click", () => { loadScore(); });
}
function initAboutModal() {
    const aboutButton = document.getElementById("about-button");
    const closeButton = document.getElementById("close-about");
    const backdrop = document.getElementById("about-modal-backdrop");
    function closeAbout() { if (backdrop)
        backdrop.hidden = true; }
    function openAbout() { if (backdrop)
        backdrop.hidden = false; }
    if (aboutButton)
        aboutButton.addEventListener("click", openAbout);
    if (closeButton)
        closeButton.addEventListener("click", closeAbout);
    if (backdrop) {
        backdrop.addEventListener("click", (event) => {
            if (event.target === backdrop)
                closeAbout();
        });
    }
}
function initTabs() {
    const tabs = document.querySelectorAll("[data-tab]");
    for (const tab of tabs) {
        tab.addEventListener("click", () => {
            const panelId = tab.dataset.tab;
            if (panelId === "llm-panel" ||
                panelId === "insights-panel" ||
                panelId === "spy-panel" ||
                panelId === "checklist-panel") {
                selectTab(panelId);
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    initLanguageSelector();
    initPromptCopy();
    initReloadButton();
    initAboutModal();
    initTabs();
    initExportButton();
    loadScore();
});
export {};
