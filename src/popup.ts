export {};

type LLMResult = {
  score: number;
  issues: string[];
  suggestions: string[];
  issueKeys?: FindingKey[];
  improvementPrompt?: string;
  spyInsights?: string[];
};

type Locale = "en-US" | "pt-BR";
type ErrorKey = "noActiveTab" | "unableToAnalyze" | "couldNotConnect";
type FindingKey =
  | "singleH1"
  | "enoughH2"
  | "hasH3"
  | "headingHierarchy"
  | "paragraphLength"
  | "clearOpening"
  | "definitions"
  | "questionPhrasing"
  | "lists"
  | "emphasis"
  | "externalLinks"
  | "numericalEvidence"
  | "h1Reinforced"
  | "keywordFocus";
type LLMFitId = "chatgpt" | "copilot" | "claude" | "gemini";

declare const chrome: any;

const DEFAULT_LOCALE: Locale = "en-US";
const LOCALE_STORAGE_KEY = "llm-score-locale";

const UI_COPY: Record<
  Locale,
  {
    reportTitle: string;
    reportSubtitle: string;
    analyzing: string;
    suggestionsTitle: string;
    promptTitle: string;
    promptHelp: string;
    copyPrompt: string;
    copiedPrompt: string;
    spyTitle: string;
    spyHelp: string;
    llmFitTitle: string;
    llmFitHelp: string;
    aboutTitle: string;
    aboutDescription: string;
    aboutNote: string;
    closeButton: string;
    scoreMetricLabel: string;
    issuesMetricLabel: string;
    issuesUnit: string;
    waitingForResults: string;
    greatJob: string;
    scoreLabels: {
      low: string;
      medium: string;
      high: string;
    };
    errors: Record<ErrorKey, string>;
    reviewPrompt: string;
    reviewButton: string;
  }
> = {
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

const LLM_FIT_WEIGHTS: Record<LLMFitId, Partial<Record<FindingKey, number>>> = {
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

async function getActiveTab(): Promise<any | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function requestScore(tabId: number, locale: Locale): Promise<LLMResult | undefined> {
  return (await chrome.tabs.sendMessage(tabId, { type: "GET_SCORE", locale })) as LLMResult | undefined;
}

async function injectContentScript(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["dist/content.js"],
  });
}

function getScoreColor(score: number): string {
  if (score < 50) return "score-red";
  if (score <= 75) return "score-yellow";
  return "score-green";
}

function getStoredLocale(): Locale {
  return localStorage.getItem(LOCALE_STORAGE_KEY) === "pt-BR" ? "pt-BR" : DEFAULT_LOCALE;
}

function setStoredLocale(locale: Locale): void {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

function getScoreLabel(score: number, locale: Locale): string {
  const labels = UI_COPY[locale].scoreLabels;
  if (score < 50) return labels.low;
  if (score <= 75) return labels.medium;
  return labels.high;
}

function getIssuesSummary(count: number, locale: Locale): string {
  if (count === 0) return UI_COPY[locale].greatJob;
  if (locale === "pt-BR") return count === 1 ? "1 ponto precisa de atenção" : `${count} pontos precisam de atenção`;
  return count === 1 ? "1 finding needs attention" : `${count} findings need attention`;
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function calculateLLMFitScores(result: LLMResult): Record<LLMFitId, number> {
  const issueKeys = new Set(result.issueKeys || []);
  const baseScore = result.score;

  return {
    chatgpt: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.chatgpt),
    copilot: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.copilot),
    claude: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.claude),
    gemini: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.gemini),
  };
}

function calculateLLMFitScore(baseScore: number, issueKeys: Set<string>, weights: Partial<Record<FindingKey, number>>): number {
  let totalWeight = 0;
  let penalty = 0;
  for (const key of Object.keys(weights) as FindingKey[]) {
    totalWeight += weights[key] || 0;
    if (issueKeys.has(key)) penalty += weights[key] || 0;
  }

  if (!totalWeight) return clampScore(baseScore);

  const modelSpecificScore = ((totalWeight - penalty) / totalWeight) * 100;
  const blendedScore = modelSpecificScore * 0.82 + baseScore * 0.18;
  return clampScore(blendedScore);
}

function renderLLMFitScores(scores: Partial<Record<LLMFitId, number>>): void {
  for (const id of ["chatgpt", "copilot", "claude", "gemini"] as LLMFitId[]) {
    const value = scores[id];
    const card = document.querySelector<HTMLElement>(`[data-llm="${id}"]`);
    const label = document.getElementById(`${id}-fit`);
    if (card) card.style.setProperty("--fit", String(value || 0));
    if (label) label.textContent = typeof value === "number" ? `${value}%` : "--";
  }
}

function setText(id: string, text: string): void {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function renderImprovementPrompt(text: string): void {
  const promptEl = document.getElementById("improvement-prompt");
  if (promptEl) promptEl.textContent = text;
}

function selectTab(panelId: "llm-panel" | "insights-panel" | "spy-panel"): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
  const panels = document.querySelectorAll<HTMLElement>(".tab-panel");

  for (const tab of tabs) {
    const selected = tab.dataset.tab === panelId;
    tab.setAttribute("aria-selected", String(selected));
  }

  for (const panel of panels) {
    panel.hidden = panel.id !== panelId;
  }
}

function setInsightsAvailability(available: boolean): void {
  const tab = document.getElementById("insights-tab");
  if (tab) tab.hidden = !available;
  if (!available) {
    selectTab("llm-panel");
    renderImprovementPrompt("");
  }
}

function setSpyAvailability(available: boolean): void {
  const tab = document.getElementById("spy-tab");
  if (tab) tab.hidden = !available;
  if (!available) {
    const selectedTab = document.querySelector<HTMLButtonElement>('[data-tab="spy-panel"][aria-selected="true"]');
    if (selectedTab) selectTab("llm-panel");
    renderSpyInsights([]);
  }
}

function renderList(items: string[]): void {
  const suggestionsEl = document.getElementById("suggestions");
  const showMoreBtn = document.getElementById("show-more-suggestions");
  const showMoreText = document.getElementById("show-more-text");
  if (!suggestionsEl || !showMoreBtn || !showMoreText) return;

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
  const locale = (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) || DEFAULT_LOCALE;
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

function renderSpyInsights(items: string[]): void {
  const listEl = document.getElementById("spy-insights");
  if (!listEl) return;

  listEl.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  }
}

function updateLanguageControls(locale: Locale): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-locale]");
  for (const button of buttons) {
    button.setAttribute("aria-pressed", String(button.dataset.locale === locale));
  }
}

function applyLocaleText(locale: Locale): void {
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
  updateLanguageControls(locale);
}

function renderLoading(locale: Locale): void {
  const scoreEl = document.getElementById("score");
  const issuesCountEl = document.getElementById("issues-count");
  const scoreMeterEl = document.getElementById("score-meter");
  if (scoreEl) {
    scoreEl.textContent = "--";
    scoreEl.className = "";
  }
  if (issuesCountEl) issuesCountEl.textContent = "--";
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

function renderResult(result: LLMResult): void {
  const scoreEl = document.getElementById("score");
  const issuesCountEl = document.getElementById("issues-count");
  const scoreLabelEl = document.getElementById("score-label");
  const scoreMeterEl = document.getElementById("score-meter");
  if (!scoreEl) return;

  scoreEl.textContent = String(result.score);
  scoreEl.className = getScoreColor(result.score);
  if (issuesCountEl) issuesCountEl.textContent = String(result.issues.length);
  if (scoreLabelEl) scoreLabelEl.textContent = getScoreLabel(result.score, currentLocale);
  setText("summary-note", getIssuesSummary(result.issues.length, currentLocale));
  if (scoreMeterEl) {
    scoreMeterEl.className = getScoreColor(result.score);
    scoreMeterEl.style.width = `${result.score}%`;
  }
  renderLLMFitScores(calculateLLMFitScores(result));
  const hasImprovementInsights = result.suggestions.length > 0 && Boolean(result.improvementPrompt?.trim());
  setInsightsAvailability(hasImprovementInsights);
  if (hasImprovementInsights) renderImprovementPrompt(result.improvementPrompt || "");
  const spyInsights = result.spyInsights || [];
  setSpyAvailability(spyInsights.length > 0);
  renderSpyInsights(spyInsights);

  const items = result.suggestions.length ? result.suggestions : [UI_COPY[currentLocale].greatJob];
  renderList(items);
}

function renderError(errorKey: ErrorKey): void {
  const scoreEl = document.getElementById("score");
  const issuesCountEl = document.getElementById("issues-count");
  const scoreLabelEl = document.getElementById("score-label");
  const scoreMeterEl = document.getElementById("score-meter");
  if (scoreEl) {
    scoreEl.textContent = "--";
    scoreEl.className = "score-red";
  }
  if (issuesCountEl) issuesCountEl.textContent = "--";
  if (scoreLabelEl) scoreLabelEl.textContent = UI_COPY[currentLocale].errors.unableToAnalyze;
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

function setPageUrlText(text: string): void {
  const element = document.getElementById("page-url");
  if (element) element.textContent = text;
}

function renderPageInfo(tab: any): void {
  if (!tab?.url) {
    setPageUrlText(currentLocale === "pt-BR" ? "Aba ativa sem URL válida." : "Active tab has no valid URL.");
    return;
  }

  try {
    const url = new URL(tab.url);
    setPageUrlText(url.hostname);
  } catch {
    setPageUrlText(tab.url);
  }
}

function clearPageInfo(): void {
  setPageUrlText(currentLocale === "pt-BR" ? "Aguardando aba ativa..." : "Waiting for active tab...");
}

async function loadScore(): Promise<void> {
  applyLocaleText(currentLocale);
  renderLoading(currentLocale);
  clearPageInfo();

  try {
    const tab = await getActiveTab();
    if (!tab?.id) return renderError("noActiveTab");
    renderPageInfo(tab);

    let response: LLMResult | undefined;
    try {
      response = await requestScore(tab.id, currentLocale);
    } catch {
      await injectContentScript(tab.id);
      response = await requestScore(tab.id, currentLocale);
    }

    if (!response) return renderError("unableToAnalyze");
    renderResult(response);
  } catch {
    renderError("couldNotConnect");
  }
}

function initLanguageSelector(): void {
  const buttons = document.querySelectorAll<HTMLButtonElement>("[data-locale]");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      const locale = button.dataset.locale === "pt-BR" ? "pt-BR" : DEFAULT_LOCALE;
      if (locale === currentLocale) return;

      currentLocale = locale;
      setStoredLocale(locale);
      loadScore();
    });
  }
}

function showReviewToast(): void {
  try {
    const locale = (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) || DEFAULT_LOCALE;
    const copy = UI_COPY[locale];
    const EXTENSION_ID = "hmmijfckjpbhblgkakijegcfelkjilhj";
    
    // Check if toast should be shown (at most once per day)
    const lastToastKey = "llm-score-review-toast-last-shown";
    const lastShown = localStorage.getItem(lastToastKey);
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    
    if (lastShown && now - parseInt(lastShown) < ONE_DAY_MS) {
      return; // Toast shown recently, skip
    }
    
    // Remove existing toast if present
    const existing = document.getElementById("review-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "review-toast";
    toast.className = "review-toast";
    toast.innerHTML = `
      <div class="review-toast-content">
        <p class="review-toast-message">${copy.reviewPrompt}</p>
        <div class="review-toast-actions">
          <a href="https://chrome.google.com/webstore/detail/${EXTENSION_ID}" target="_blank" rel="noopener" class="review-toast-button review-button">
            ${copy.reviewButton}
          </a>
          <button type="button" class="review-toast-button dismiss-button" aria-label="Dismiss">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(toast);
    localStorage.setItem(lastToastKey, now.toString());

    // Auto-dismiss after 8 seconds
    const timeout = window.setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.add("fade-out");
        window.setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      }
    }, 8000);

    // Dismiss button
    const dismissBtn = toast.querySelector(".dismiss-button");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", () => {
        window.clearTimeout(timeout);
        toast.classList.add("fade-out");
        window.setTimeout(() => {
          if (toast.parentNode) toast.remove();
        }, 300);
      });
    }
  } catch (error) {
    // Silent fallback: toast failed but don't break the copy functionality
    console.debug("Review toast failed (development/test env?):", error);
  }
}

function initPromptCopy(): void {
  const button = document.getElementById("copy-prompt");
  const promptEl = document.getElementById("improvement-prompt");
  if (!button || !promptEl) return;

  button.addEventListener("click", async () => {
    const text = promptEl.textContent || "";
    if (!text.trim()) return;

    await navigator.clipboard.writeText(text);
    button.textContent = UI_COPY[currentLocale].copiedPrompt;
    
    // Show review toast after successful copy
    showReviewToast();
    
    window.setTimeout(() => {
      button.textContent = UI_COPY[currentLocale].copyPrompt;
    }, 1200);
  });
}

function initReloadButton(): void {
  const button = document.getElementById("reload-score");
  if (!button) return;

  button.addEventListener("click", () => {
    loadScore();
  });
}

function initAboutModal(): void {
  const aboutButton = document.getElementById("about-button");
  const closeButton = document.getElementById("close-about");
  const backdrop = document.getElementById("about-modal-backdrop");

  function closeAbout(): void {
    if (backdrop) backdrop.hidden = true;
  }

  function openAbout(): void {
    if (backdrop) backdrop.hidden = false;
  }

  if (aboutButton) {
    aboutButton.addEventListener("click", openAbout);
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeAbout);
  }

  if (backdrop) {
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeAbout();
    });
  }
}

function initTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>("[data-tab]");
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
  initReloadButton();
  initAboutModal();
  initTabs();
  loadScore();
});
