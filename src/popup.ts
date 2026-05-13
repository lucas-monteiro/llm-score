export {};

type LLMResult = {
  score: number;
  issues: string[];
  suggestions: string[];
  issueKeys?: FindingKey[];
  improvementPrompt?: string;
  spyInsights?: string[];
  pageTitle?: string;
  metaDescription?: string;
  isNoindex?: boolean;
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
  | "metaDescription"
  | "titleMatch"
  | "h1Reinforced"
  | "keywordFocus"
  | "llmsTxt"
  | "noindex"
  | "schemaMarkup"
  | "faqSchema"
  | "contentFreshness"
  | "authorSignal"
  | "semanticStructure"
  | "imageAltText";
type LLMFitId = "chatgpt" | "copilot" | "claude" | "gemini" | "perplexity";
type TabPanelId = "llm-panel" | "insights-panel" | "spy-panel" | "checklist-panel";
type ScoreEntry = { s: number; t: number };

declare const chrome: any;

const DEFAULT_LOCALE: Locale = "en-US";
const LOCALE_STORAGE_KEY = "llm-score-locale";
const REVIEW_DOMAINS_KEY = "llm-score-analyzed-domains";

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
    scoreLabels: { low: string; medium: string; high: string };
    errors: Record<ErrorKey, string>;
    reviewPrompt: string;
    reviewButton: string;
    checklistTitle: string;
    checklistHelp: string;
    exportButton: string;
    exportCopied: string;
    snippetHelp: string;
    noSnippet: string;
    rateLabel: string;
  }
> = {
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

const ALL_FINDING_KEYS: FindingKey[] = [
  "singleH1", "enoughH2", "hasH3", "headingHierarchy",
  "paragraphLength", "clearOpening", "definitions", "questionPhrasing",
  "lists", "emphasis", "externalLinks", "numericalEvidence",
  "metaDescription", "titleMatch", "h1Reinforced", "keywordFocus",
  "llmsTxt", "noindex", "schemaMarkup", "faqSchema",
  "contentFreshness", "authorSignal", "semanticStructure", "imageAltText",
];

const SIGNAL_LABELS: Record<Locale, Record<FindingKey, string>> = {
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
let lastResult: LLMResult | null = null;
let lastFitScores: Record<LLMFitId, number> | null = null;
let lastTabUrl = "";
let lastHostname = "";

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
    perplexity: calculateLLMFitScore(baseScore, issueKeys, LLM_FIT_WEIGHTS.perplexity),
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
  for (const id of ["chatgpt", "copilot", "claude", "gemini", "perplexity"] as LLMFitId[]) {
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

function selectTab(panelId: TabPanelId): void {
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

function setChecklistAvailability(available: boolean): void {
  const tab = document.getElementById("checklist-tab");
  if (tab) tab.hidden = !available;
  if (!available) {
    const selectedTab = document.querySelector<HTMLButtonElement>('[data-tab="checklist-panel"][aria-selected="true"]');
    if (selectedTab) selectTab("llm-panel");
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

function renderNoindexBanner(visible: boolean): void {
  const existing = document.getElementById("noindex-banner");
  if (!visible) {
    if (existing) existing.remove();
    return;
  }
  if (existing) return;

  const banner = document.createElement("div");
  banner.id = "noindex-banner";
  banner.className = "noindex-banner";
  const locale = (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) || DEFAULT_LOCALE;
  banner.textContent =
    locale === "pt-BR"
      ? "Aviso: esta página está marcada como noindex e pode ser invisível para buscadores de IA."
      : "Warning: this page is marked noindex and may be invisible to AI search crawlers.";

  const meter = document.querySelector(".meter");
  if (meter?.parentNode) {
    meter.parentNode.insertBefore(banner, meter.nextSibling);
  }
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

function renderTrend(current: number, prev: ScoreEntry | undefined): void {
  const el = document.getElementById("score-trend");
  if (!el) return;

  if (!prev) {
    el.textContent = "";
    el.className = "score-trend";
    return;
  }

  const delta = current - prev.s;
  if (delta > 0) {
    el.textContent = `↑ +${delta} vs last scan`;
    el.className = "score-trend trend-up";
  } else if (delta < 0) {
    el.textContent = `↓ ${delta} vs last scan`;
    el.className = "score-trend trend-down";
  } else {
    el.textContent = "= same as last scan";
    el.className = "score-trend trend-flat";
  }
}

function renderChecklist(result: LLMResult | null): void {
  const listEl = document.getElementById("checklist-items");
  if (!listEl) return;

  listEl.innerHTML = "";
  if (!result) return;

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

function renderSnippetPreview(result: LLMResult, url: string): void {
  const el = document.getElementById("snippet-preview");
  if (!el) return;

  let hostname = "";
  try { hostname = new URL(url).hostname; } catch { /* no-op */ }

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

async function exportMarkdown(): Promise<void> {
  if (!lastResult) return;

  const copy = UI_COPY[currentLocale];
  const url = lastTabUrl || "—";
  const score = lastResult.score;
  const label = getScoreLabel(score, currentLocale);
  const issueCount = lastResult.issues.length;

  const issueLines = lastResult.suggestions.length
    ? lastResult.suggestions.map((s) => `- ${s}`).join("\n")
    : `- ${copy.greatJob}`;

  const fitSection = lastFitScores
    ? (["chatgpt", "copilot", "claude", "gemini", "perplexity"] as LLMFitId[])
        .map((id) => `- **${id.charAt(0).toUpperCase() + id.slice(1)}**: ${lastFitScores![id]}%`)
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

  await navigator.clipboard.writeText(md);
}

function initExportButton(): void {
  const button = document.getElementById("export-markdown");
  const textEl = document.getElementById("export-markdown-text");
  if (!button || !textEl) return;

  button.addEventListener("click", async () => {
    await exportMarkdown();
    const original = textEl.textContent;
    textEl.textContent = UI_COPY[currentLocale].exportCopied;
    window.setTimeout(() => {
      textEl.textContent = original;
    }, 1500);
  });
}

async function getPreviousScore(hostname: string): Promise<ScoreEntry | undefined> {
  try {
    const key = `llm-h-${hostname}`;
    const data = await chrome.storage.sync.get(key);
    const entries: ScoreEntry[] = data[key] || [];
    return entries[entries.length - 1];
  } catch {
    return undefined;
  }
}

async function saveScore(hostname: string, score: number): Promise<void> {
  try {
    const key = `llm-h-${hostname}`;
    const data = await chrome.storage.sync.get(key);
    const entries: ScoreEntry[] = data[key] || [];
    entries.push({ s: score, t: Date.now() });
    if (entries.length > 10) entries.splice(0, entries.length - 10);
    await chrome.storage.sync.set({ [key]: entries });
  } catch {
    // Storage unavailable; score history disabled
  }
}

function updateActionBadge(score: number): void {
  try {
    if (chrome.action?.setBadgeText) {
      chrome.action.setBadgeText({ text: String(score) });
      const color = score >= 76 ? "#50fa7b" : score >= 51 ? "#ffb86c" : "#ff5555";
      chrome.action.setBadgeBackgroundColor({ color });
    }
  } catch {
    // Badge API unavailable
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
  setText("checklist-title", copy.checklistTitle);
  setText("checklist-help", copy.checklistHelp);
  setText("export-markdown-text", copy.exportButton);
  setText("snippet-help", copy.snippetHelp);
  updateLanguageControls(locale);

  const rateLink = document.getElementById("rate-link") as HTMLAnchorElement | null;
  if (rateLink) {
    rateLink.textContent = copy.rateLabel;
    try {
      rateLink.href = `https://chrome.google.com/webstore/detail/${chrome.runtime.id}/reviews`;
    } catch {
      rateLink.href = "https://chrome.google.com/webstore/search/LLM+Score";
    }
  }
}

function renderLoading(locale: Locale): void {
  const scoreEl = document.getElementById("score");
  const issuesCountEl = document.getElementById("issues-count");
  const scoreMeterEl = document.getElementById("score-meter");
  const trendEl = document.getElementById("score-trend");
  if (scoreEl) {
    scoreEl.textContent = "--";
    scoreEl.className = "";
  }
  if (issuesCountEl) issuesCountEl.textContent = "--";
  if (trendEl) { trendEl.textContent = ""; trendEl.className = "score-trend"; }
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
  if (snippetEl) snippetEl.innerHTML = "";
  renderList([UI_COPY[locale].analyzing]);
}

function renderResult(result: LLMResult): void {
  lastResult = result;
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
  const fitScores = calculateLLMFitScores(result);
  lastFitScores = fitScores;
  renderLLMFitScores(fitScores);
  renderNoindexBanner(result.isNoindex === true);
  const hasImprovementInsights = result.suggestions.length > 0 && Boolean(result.improvementPrompt?.trim());
  setInsightsAvailability(hasImprovementInsights);
  if (hasImprovementInsights) renderImprovementPrompt(result.improvementPrompt || "");
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

function renderError(errorKey: ErrorKey): void {
  const scoreEl = document.getElementById("score");
  const issuesCountEl = document.getElementById("issues-count");
  const scoreLabelEl = document.getElementById("score-label");
  const scoreMeterEl = document.getElementById("score-meter");
  const trendEl = document.getElementById("score-trend");
  if (scoreEl) {
    scoreEl.textContent = "--";
    scoreEl.className = "score-red";
  }
  if (issuesCountEl) issuesCountEl.textContent = "--";
  if (trendEl) { trendEl.textContent = ""; trendEl.className = "score-trend"; }
  if (scoreLabelEl) scoreLabelEl.textContent = UI_COPY[currentLocale].errors.unableToAnalyze;
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

    if (tab.url) {
      lastTabUrl = tab.url;
      try { lastHostname = new URL(tab.url).hostname; } catch { lastHostname = ""; }
    }

    const prevEntry = lastHostname ? await getPreviousScore(lastHostname) : undefined;

    let response: LLMResult | undefined;
    try {
      response = await requestScore(tab.id, currentLocale);
    } catch {
      await injectContentScript(tab.id);
      response = await requestScore(tab.id, currentLocale);
    }

    if (!response) return renderError("unableToAnalyze");

    renderResult(response);
    renderTrend(response.score, prevEntry);
    if (lastHostname) {
      await saveScore(lastHostname, response.score);
      const domainsCount = trackAnalyzedDomain(lastHostname);
      showReviewToast(response.score, domainsCount);
    }
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

function trackAnalyzedDomain(hostname: string): number {
  if (!hostname) return 0;
  try {
    const stored = localStorage.getItem(REVIEW_DOMAINS_KEY);
    const domains: string[] = stored ? JSON.parse(stored) : [];
    if (!domains.includes(hostname)) {
      domains.push(hostname);
      localStorage.setItem(REVIEW_DOMAINS_KEY, JSON.stringify(domains));
    }
    return domains.length;
  } catch {
    return 0;
  }
}

function showReviewToast(score?: number, domainsCount?: number): void {
  try {
    const locale = (localStorage.getItem(LOCALE_STORAGE_KEY) as Locale) || DEFAULT_LOCALE;
    const copy = UI_COPY[locale];
    const lastToastKey = "llm-score-review-toast-last-shown";
    const lastShown = localStorage.getItem(lastToastKey);
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    if (lastShown && now - parseInt(lastShown) < SEVEN_DAYS_MS) return;

    // when called from analysis: require 3+ domains AND score < 70
    if (score !== undefined && domainsCount !== undefined) {
      if (score >= 70 || domainsCount < 3) return;
    }

    const existing = document.getElementById("review-toast");
    if (existing) existing.remove();

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
        window.setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
      }
    }, 8000);

    dismissBtn.addEventListener("click", () => {
      window.clearTimeout(timeout);
      toast.classList.add("fade-out");
      window.setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    });
  } catch (error) {
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
    showReviewToast();
    window.setTimeout(() => {
      button.textContent = UI_COPY[currentLocale].copyPrompt;
    }, 1200);
  });
}

function initReloadButton(): void {
  const button = document.getElementById("reload-score");
  if (!button) return;
  button.addEventListener("click", () => { loadScore(); });
}

function initAboutModal(): void {
  const aboutButton = document.getElementById("about-button");
  const closeButton = document.getElementById("close-about");
  const backdrop = document.getElementById("about-modal-backdrop");

  function closeAbout(): void { if (backdrop) backdrop.hidden = true; }
  function openAbout(): void { if (backdrop) backdrop.hidden = false; }

  if (aboutButton) aboutButton.addEventListener("click", openAbout);
  if (closeButton) closeButton.addEventListener("click", closeAbout);
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
      const panelId = tab.dataset.tab as TabPanelId | undefined;
      if (
        panelId === "llm-panel" ||
        panelId === "insights-panel" ||
        panelId === "spy-panel" ||
        panelId === "checklist-panel"
      ) {
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
