type LLMResult = {
  score: number;
  issues: string[];
  suggestions: string[];
  issueKeys: FindingKey[];
  improvementPrompt: string;
  spyInsights: string[];
  pageTitle?: string;
  metaDescription?: string;
  canonical?: string;
  llmsTxt?: {
    exists: boolean;
    url: string;
    status?: number;
  };
  isNoindex?: boolean;
};

type Locale = "en-US" | "pt-BR";
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

type PageMetadata = {
  title: string;
  metaDescription: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
};

const FINDINGS: Record<Locale, Record<FindingKey, { issue: string; suggestion: string }>> = {
  "en-US": {
    singleH1: {
      issue: "Page should have exactly one H1 heading",
      suggestion: "Use a single, clear H1 to define the page topic",
    },
    enoughH2: {
      issue: "Not enough H2 subheadings",
      suggestion: "Add at least two H2 headings to break content into sections",
    },
    hasH3: {
      issue: "Missing H3 detail headings",
      suggestion: "Add at least one H3 heading for deeper structure",
    },
    headingHierarchy: {
      issue: "Heading hierarchy is inconsistent",
      suggestion: "Avoid skipping heading levels, such as H2 directly to H4",
    },
    paragraphLength: {
      issue: "Paragraphs too long",
      suggestion: "Split long paragraphs into shorter, easier-to-read blocks",
    },
    clearOpening: {
      issue: "No clear answer at the beginning",
      suggestion: "Start with a short direct answer in the first paragraph",
    },
    definitions: {
      issue: "Definitions and explanatory language are limited",
      suggestion: "Use clear phrasing like 'is', 'means', or 'refers to' for clarity",
    },
    questionPhrasing: {
      issue: "No question-oriented phrasing found",
      suggestion: "Include at least one relevant question to improve answerability",
    },
    lists: {
      issue: "Missing bullet points",
      suggestion: "Add UL/OL lists to improve fast scanning",
    },
    emphasis: {
      issue: "No emphasized key points",
      suggestion: "Highlight important terms with bold text",
    },
    externalLinks: {
      issue: "No external references detected",
      suggestion: "Add credible external links to support claims",
    },
    numericalEvidence: {
      issue: "No numerical evidence found",
      suggestion: "Include relevant numbers, dates, or statistics where possible",
    },
    metaDescription: {
      issue: "Meta description is missing or weak",
      suggestion: "Add a concise page summary in the meta description",
    },
    titleMatch: {
      issue: "Page title and content focus are misaligned",
      suggestion: "Align the page title with the main H1 topic and page content",
    },
    h1Reinforced: {
      issue: "H1 topic is not reinforced in body content",
      suggestion: "Repeat the main H1 topic naturally in the body text",
    },
    keywordFocus: {
      issue: "Keyword focus appears weak or inconsistent",
      suggestion: "Use core keywords repeatedly but naturally across sections",
    },
    llmsTxt: {
      issue: "LLM indexing file was not found",
      suggestion: "Add an llms.txt file at the domain root to guide AI crawlers and indexing tools",
    },
    noindex: {
      issue: "Page is marked noindex and cannot be indexed by AI crawlers",
      suggestion: "Remove the noindex directive if you want this page to appear in AI search results",
    },
    schemaMarkup: {
      issue: "No structured data (Schema.org) found",
      suggestion: "Add JSON-LD markup to help AI understand your content type and structure",
    },
    faqSchema: {
      issue: "No FAQ or HowTo schema found",
      suggestion: "Add a FAQPage or HowTo JSON-LD block to improve AI snippet eligibility",
    },
    contentFreshness: {
      issue: "No publication or modification date found",
      suggestion: "Add article dates or a <time> element to signal content freshness to AI",
    },
    authorSignal: {
      issue: "No author information detected",
      suggestion: "Add author metadata or a byline to improve content trustworthiness signals",
    },
    semanticStructure: {
      issue: "No semantic HTML5 structure detected",
      suggestion: "Use <article>, <main>, or <section> elements to define content boundaries",
    },
    imageAltText: {
      issue: "Images missing descriptive alt text",
      suggestion: "Add descriptive alt attributes to images for accessibility and AI context",
    },
  },
  "pt-BR": {
    singleH1: {
      issue: "A página deve ter exatamente um título H1",
      suggestion: "Use um único H1 claro para definir o tema da página",
    },
    enoughH2: {
      issue: "Há poucos subtítulos H2",
      suggestion: "Adicione pelo menos dois H2 para dividir o conteúdo em seções",
    },
    hasH3: {
      issue: "Faltam subtítulos H3 de detalhe",
      suggestion: "Adicione pelo menos um H3 para criar uma estrutura mais profunda",
    },
    headingHierarchy: {
      issue: "A hierarquia de títulos está inconsistente",
      suggestion: "Evite pular níveis de título, como ir de H2 direto para H4",
    },
    paragraphLength: {
      issue: "Os parágrafos estão longos demais",
      suggestion: "Divida parágrafos longos em blocos menores e mais fáceis de ler",
    },
    clearOpening: {
      issue: "Não há uma resposta clara no início",
      suggestion: "Comece com uma resposta curta e direta no primeiro parágrafo",
    },
    definitions: {
      issue: "Há pouca linguagem explicativa ou de definição",
      suggestion: "Use frases claras como 'é', 'significa' ou 'refere-se a' para dar clareza",
    },
    questionPhrasing: {
      issue: "Não foram encontradas perguntas no conteúdo",
      suggestion: "Inclua pelo menos uma pergunta relevante para melhorar a respondibilidade",
    },
    lists: {
      issue: "Faltam listas com marcadores",
      suggestion: "Adicione listas UL/OL para facilitar a leitura rapida",
    },
    emphasis: {
      issue: "Não há pontos-chave em destaque",
      suggestion: "Destaque termos importantes com texto em negrito",
    },
    externalLinks: {
      issue: "Não foram detectadas referências externas",
      suggestion: "Adicione links externos confiáveis para sustentar as afirmações",
    },
    numericalEvidence: {
      issue: "Não foram encontrados dados numéricos",
      suggestion: "Inclua números, datas ou estatísticas relevantes quando fizer sentido",
    },
    metaDescription: {
      issue: "A meta description está ausente ou fraca",
      suggestion: "Adicione um resumo curto e claro no meta description",
    },
    titleMatch: {
      issue: "Título da página e foco do conteúdo estão desalinhados",
      suggestion: "Alinhe o título da página com o H1 principal e o conteúdo",
    },
    h1Reinforced: {
      issue: "O tema do H1 não é reforçado no corpo do texto",
      suggestion: "Repita o tema principal do H1 naturalmente ao longo do conteúdo",
    },
    keywordFocus: {
      issue: "O foco de palavras-chave parece fraco ou inconsistente",
      suggestion: "Use palavras-chave centrais de forma repetida, mas natural, nas seções",
    },
    llmsTxt: {
      issue: "Arquivo de indexacao para LLM nao encontrado",
      suggestion: "Adicione um arquivo llms.txt na raiz do dominio para orientar crawlers e ferramentas de IA",
    },
    noindex: {
      issue: "A página está marcada como noindex e não pode ser indexada por crawlers de IA",
      suggestion: "Remova a diretiva noindex se quiser que esta página apareça nos resultados de busca por IA",
    },
    schemaMarkup: {
      issue: "Nenhum dado estruturado (Schema.org) encontrado",
      suggestion: "Adicione marcação JSON-LD para ajudar a IA a entender o tipo e a estrutura do conteúdo",
    },
    faqSchema: {
      issue: "Nenhum schema de FAQ ou HowTo encontrado",
      suggestion: "Adicione um bloco JSON-LD do tipo FAQPage ou HowTo para melhorar a elegibilidade de snippets",
    },
    contentFreshness: {
      issue: "Nenhuma data de publicação ou modificação encontrada",
      suggestion: "Adicione datas de artigo ou um elemento <time> para sinalizar a atualidade do conteúdo",
    },
    authorSignal: {
      issue: "Nenhuma informação de autor detectada",
      suggestion: "Adicione metadados de autor ou uma assinatura para melhorar os sinais de confiabilidade",
    },
    semanticStructure: {
      issue: "Nenhuma estrutura semântica HTML5 detectada",
      suggestion: "Use elementos <article>, <main> ou <section> para delimitar melhor o conteúdo",
    },
    imageAltText: {
      issue: "Imagens sem texto alternativo descritivo",
      suggestion: "Adicione atributos alt descritivos às imagens para acessibilidade e contexto para IA",
    },
  },
};

type LLMScoreWindow = Window & typeof globalThis & { __llmScoreContentScriptLoaded?: boolean };

const PAGE_SETTLE_TIMEOUT_MS = 3000;
const MUTATION_QUIET_MS = 500;

function waitForLoadComplete(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve();

  return new Promise((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

async function waitForFontsReady(): Promise<void> {
  try {
    await document.fonts?.ready;
  } catch {
    // Font loading is a nice-to-have signal; scoring can continue without it.
  }
}

function waitForDomToSettle(): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    let quietTimer = window.setTimeout(finish, MUTATION_QUIET_MS);
    const timeoutTimer = window.setTimeout(finish, PAGE_SETTLE_TIMEOUT_MS);

    const observer = new MutationObserver(() => {
      window.clearTimeout(quietTimer);
      quietTimer = window.setTimeout(finish, MUTATION_QUIET_MS);
    });

    function finish(): void {
      if (settled) return;
      settled = true;
      window.clearTimeout(quietTimer);
      window.clearTimeout(timeoutTimer);
      observer.disconnect();
      resolve();
    }

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    } else {
      finish();
    }
  });
}

async function waitForPageToSettle(): Promise<void> {
  await waitForLoadComplete();
  await waitForFontsReady();
  await waitForDomToSettle();
}

function normalizeLocale(locale: unknown): Locale {
  return locale === "pt-BR" ? "pt-BR" : "en-US";
}

function addFinding(locale: Locale, key: FindingKey, issues: string[], suggestions: string[], issueKeys: FindingKey[]): void {
  const finding = FINDINGS[locale][key];
  issues.push(finding.issue);
  suggestions.push(finding.suggestion);
  issueKeys.push(key);
}

function getElementText(element: Element | undefined): string {
  return (element?.textContent || "").replace(/\s+/g, " ").trim();
}

function getMetaContent(attribute: string): string {
  const meta = document.querySelector<HTMLMetaElement>(`meta[name='${attribute}'], meta[property='${attribute}']`);
  return meta?.content?.trim() || "";
}

function getPageMetadata(): PageMetadata {
  return {
    title: document.title.trim(),
    metaDescription: getMetaContent("description") || getMetaContent("og:description"),
    canonical: document.querySelector<HTMLLinkElement>("link[rel='canonical']")?.href || undefined,
    ogTitle: getMetaContent("og:title"),
    ogDescription: getMetaContent("og:description"),
  };
}

function checkNoindex(): boolean {
  const robotsMeta = document.querySelector<HTMLMetaElement>(
    'meta[name="robots"], meta[name="googlebot"]',
  );
  if (robotsMeta) {
    return (robotsMeta.content || "").toLowerCase().includes("noindex");
  }
  return false;
}

async function checkLlmsTxt(): Promise<{ exists: boolean; url: string; status?: number }> {
  const url = new URL("/llms.txt", window.location.origin).href;

  try {
    let response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      credentials: "omit",
    });

    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        credentials: "omit",
      });
    }

    const contentType = response.headers.get("content-type") || "";
    const looksLikeHtmlFallback = contentType.includes("text/html") && response.url !== url;

    return {
      exists: response.ok && !looksLikeHtmlFallback,
      url,
      status: response.status,
    };
  } catch {
    return {
      exists: false,
      url,
    };
  }
}

const H1_STOP_WORDS = new Set([
  "como", "para", "com", "que", "uma", "por", "mais", "seus", "suas",
  "este", "essa", "isso", "dos", "das", "num", "numa", "nem", "sem",
  "the", "and", "for", "with", "that", "this", "from", "are", "was",
  "will", "have", "has", "been", "not", "but", "they", "their", "you",
  "your", "can", "its", "our",
]);

function getKeywords(text: string): string[] {
  return (text.match(/[a-zÀ-ÿ]{4,}/gi) || [])
    .map((w) => w.toLowerCase())
    .filter((w) => !H1_STOP_WORDS.has(w));
}

function limitItems(items: string[], limit: number): string[] {
  return items.filter(Boolean).slice(0, limit);
}

function buildImprovementPrompt(
  locale: Locale,
  score: number,
  issues: string[],
  suggestions: string[],
  context: {
    title: string;
    h1: string;
    headings: string[];
    paragraphCount: number;
    wordCount: number;
    listCount: number;
    externalLinkCount: number;
    url: string;
    metaDescription: string;
    canonical?: string;
    llmsTxtUrl: string;
    hasLlmsTxt: boolean;
  },
): string {
  const issueLines = issues.length ? issues.map((issue) => `- ${issue}`).join("\n") : "- No major issues found";
  const suggestionLines = suggestions.length
    ? suggestions.map((suggestion) => `- ${suggestion}`).join("\n")
    : "- Keep the current strengths and look for opportunities to add more specific answers, examples, and supporting evidence.";
  const headingLines = context.headings.length ? context.headings.map((heading) => `- ${heading}`).join("\n") : "- No headings detected";
  const metaLines = [
    context.title ? `- Title: ${context.title}` : "- Title not found",
    context.metaDescription ? `- Meta description: ${context.metaDescription}` : "- Meta description not found",
    context.canonical ? `- Canonical: ${context.canonical}` : "- Canonical missing",
    context.hasLlmsTxt ? `- llms.txt: found at ${context.llmsTxtUrl}` : `- llms.txt: not found at ${context.llmsTxtUrl}`,
  ].join("\n");

  if (locale === "pt-BR") {
    return `Você é um especialista em SEO para IA, AEO e clareza editorial. Reescreva e reorganize esta página para melhorar sua presença nas principais IAs de busca, como ChatGPT, Copilot, Claude e Gemini.

Contexto da página:
- URL: ${context.url}
- Title: ${context.title || "não encontrado"}
- H1: ${context.h1 || "não encontrado"}
- Meta description: ${context.metaDescription || "não encontrado"}
- Canonical: ${context.canonical || "não encontrado"}
- Score atual: ${score}/100
- Parágrafos: ${context.paragraphCount}
- Palavras aproximadas: ${context.wordCount}
- Listas: ${context.listCount}
- Links externos: ${context.externalLinkCount}

Headings atuais:
${headingLines}

Meta atual:
${metaLines}

Problemas encontrados:
${issueLines}

Sugestões prioritárias:
${suggestionLines}

Tarefa:
1. Proponha uma estrutura de H1, H2 e H3 mais clara.
2. Escreva uma abertura curta com resposta direta ao tema principal.
3. Sugira blocos de conteúdo em formato de perguntas e respostas.
4. Inclua listas, dados, exemplos e links de referência quando fizer sentido.
5. Preserve a intenção comercial da página e evite promessas não comprovadas.
6. Entregue uma versão prática que possa ser aplicada pelo time de conteúdo.`;
  }

  return `You are an AI search optimization, AEO, and editorial clarity specialist. Rewrite and reorganize this page to improve its visibility in leading AI search experiences such as ChatGPT, Copilot, Claude, and Gemini.

Page context:
- URL: ${context.url}
- Title: ${context.title || "not found"}
- H1: ${context.h1 || "not found"}
- Current score: ${score}/100
- Paragraphs: ${context.paragraphCount}
- Approximate words: ${context.wordCount}
- Lists: ${context.listCount}
- External links: ${context.externalLinkCount}

Current headings:
${headingLines}

Page metadata:
${metaLines}

Detected issues:
${issueLines}

Priority suggestions:
${suggestionLines}

Task:
1. Propose a clearer H1, H2, and H3 structure.
2. Write a short opening that directly answers the main topic.
3. Suggest question-and-answer content blocks.
4. Add lists, evidence, examples, and reference links where useful.
5. Preserve the page's commercial intent and avoid unsupported claims.
6. Deliver a practical version the content team can apply.`;
}

function buildSpyInsights(
  locale: Locale,
  context: {
    h1: string;
    headings: string[];
    listSamples: string[];
    externalLinkSamples: string[];
    hasNumbers: boolean;
    hasEmphasis: boolean;
    firstParagraph: string;
  },
): string[] {
  const insights: string[] = [];

  if (context.h1) {
    insights.push(
      locale === "pt-BR"
        ? `H1 claro para usar como referência: "${context.h1}"`
        : `Clear H1 to use as a reference: "${context.h1}"`,
    );
  }

  if (context.firstParagraph) {
    insights.push(
      locale === "pt-BR"
        ? `Abertura útil detectada: "${context.firstParagraph}"`
        : `Useful opening detected: "${context.firstParagraph}"`,
    );
  }

  for (const heading of limitItems(context.headings, 3)) {
    insights.push(
      locale === "pt-BR"
        ? `Boa seção para modelar conteúdo: ${heading}`
        : `Good section to model content after: ${heading}`,
    );
  }

  for (const listSample of limitItems(context.listSamples, 2)) {
    insights.push(
      locale === "pt-BR"
        ? `Lista bem escaneável encontrada: "${listSample}"`
        : `Scannable list pattern found: "${listSample}"`,
    );
  }

  for (const linkSample of limitItems(context.externalLinkSamples, 2)) {
    insights.push(
      locale === "pt-BR"
        ? `Referência externa aproveitável: ${linkSample}`
        : `Useful external reference: ${linkSample}`,
    );
  }

  if (context.hasNumbers) {
    insights.push(
      locale === "pt-BR"
        ? "O conteúdo já usa números/dados. Reaproveite esse padrão para criar respostas mais verificáveis."
        : "The content already uses numbers or data. Reuse this pattern to make answers more verifiable.",
    );
  }

  if (context.hasEmphasis) {
    insights.push(
      locale === "pt-BR"
        ? "Há termos em destaque. Use esse padrão para marcar benefícios, critérios e diferenciais."
        : "Highlighted terms are present. Reuse this pattern for benefits, criteria, and differentiators.",
    );
  }

  return limitItems(insights, 8);
}

function parseJsonLdSchemas(): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [];
  for (const script of document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent || "");
      if (data && typeof data === "object") schemas.push(data as Record<string, unknown>);
    } catch {
      // invalid JSON-LD, skip
    }
  }
  return schemas;
}

async function calculateLLMScore(locale: Locale = "en-US"): Promise<LLMResult> {
  let score = 0;
  const issues: string[] = [];
  const suggestions: string[] = [];
  const issueKeys: FindingKey[] = [];

  const h1s = Array.from(document.querySelectorAll("h1"));
  const h2s = Array.from(document.querySelectorAll("h2"));
  const h3s = Array.from(document.querySelectorAll("h3"));
  const paragraphs = Array.from(document.querySelectorAll("p"));
  const bodyText = (document.body?.innerText || "").toLowerCase();
  const links = Array.from(document.querySelectorAll("a[href]"));

  if (h1s.length === 1) score += 5;
  else {
    addFinding(locale, "singleH1", issues, suggestions, issueKeys);
  }

  if (h2s.length >= 2) score += 5;
  else {
    addFinding(locale, "enoughH2", issues, suggestions, issueKeys);
  }

  if (h3s.length >= 1) score += 5;
  else {
    addFinding(locale, "hasH3", issues, suggestions, issueKeys);
  }

  const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  let hierarchyValid = true;
  let previousLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName.slice(1));
    if (previousLevel && level > previousLevel + 1) {
      hierarchyValid = false;
      break;
    }
    previousLevel = level;
  }

  if (hierarchyValid) score += 5;
  else {
    addFinding(locale, "headingHierarchy", issues, suggestions, issueKeys);
  }

  const metadata = getPageMetadata();
  const normalizedTitle = metadata.title.toLowerCase();
  const normalizedH1 = getElementText(h1s[0]).toLowerCase();
  const descriptionLength = metadata.metaDescription.length;

  if (descriptionLength >= 40 && descriptionLength <= 160) score += 5;
  else {
    addFinding(locale, "metaDescription", issues, suggestions, issueKeys);
  }

  if (normalizedTitle && normalizedH1 && normalizedTitle.includes(normalizedH1)) {
    score += 5;
  } else {
    addFinding(locale, "titleMatch", issues, suggestions, issueKeys);
  }

  const paragraphLengths = paragraphs.map((p) => (p.textContent || "").trim().length).filter((len) => len > 0);
  const avgParagraphLength = paragraphLengths.length
    ? paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length
    : 0;

  if (avgParagraphLength > 0 && avgParagraphLength < 400) score += 10;
  else if (avgParagraphLength < 800) score += 5;
  else {
    addFinding(locale, "paragraphLength", issues, suggestions, issueKeys);
  }

  const firstParagraph = (paragraphs[0]?.textContent || "").trim().toLowerCase();
  if (firstParagraph.length >= 50 && firstParagraph.length < 300) score += 10;
  else {
    addFinding(locale, "clearOpening", issues, suggestions, issueKeys);
  }

  const hasDefinitions =
    /\b\w+\s+(is|are)\s+(a|an|the)\s+\w+/i.test(bodyText) ||
    /\b(means|refers to|is defined as|known as|also called|é um|é uma|é o|é a|significa|refere-se a|é chamado)\b/i.test(bodyText);
  if (hasDefinitions) score += 5;
  else {
    addFinding(locale, "definitions", issues, suggestions, issueKeys);
  }

  if (/[a-zÀ-ÿ]{2,}[^.!?]{12,}\?/i.test(bodyText)) score += 5;
  else {
    addFinding(locale, "questionPhrasing", issues, suggestions, issueKeys);
  }

  if (document.querySelectorAll("ul, ol").length > 0) score += 5;
  else {
    addFinding(locale, "lists", issues, suggestions, issueKeys);
  }

  const llmsTxt = await checkLlmsTxt();
  if (llmsTxt.exists) score += 5;
  else {
    addFinding(locale, "llmsTxt", issues, suggestions, issueKeys);
  }

  if (document.querySelectorAll("strong, b").length > 0) score += 5;
  else {
    addFinding(locale, "emphasis", issues, suggestions, issueKeys);
  }

  const externalLinks = links.filter((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("/")) return false;
    try {
      const url = new URL(href, window.location.origin);
      return url.origin !== window.location.origin;
    } catch {
      return false;
    }
  });

  if (externalLinks.length > 0) score += 10;
  else {
    addFinding(locale, "externalLinks", issues, suggestions, issueKeys);
  }

  const hasNumericalEvidence =
    /\d+(\.\d+)?(%|k\b|M\b|B\b|mil\b|milhão|billion|million)/i.test(bodyText) ||
    /\d+\s*(estudos|pesquisas|usuários|clientes|empresas|anos|meses|dias|horas|países|pessoas|casos)/i.test(bodyText) ||
    Array.from(document.querySelectorAll("p")).some((p) => /\d{2,}/.test(p.textContent || ""));
  if (hasNumericalEvidence) score += 5;
  else {
    addFinding(locale, "numericalEvidence", issues, suggestions, issueKeys);
  }

  const h1Text = getElementText(h1s[0]).toLowerCase();
  if (h1Text) {
    const h1Keywords = getKeywords(h1Text);
    if (h1Keywords.length === 0) {
      score += 5;
    } else {
      const matchCount = h1Keywords.filter((kw) => bodyText.includes(kw)).length;
      if (matchCount / h1Keywords.length >= 0.6) score += 5;
      else addFinding(locale, "h1Reinforced", issues, suggestions, issueKeys);
    }
  } else {
    addFinding(locale, "h1Reinforced", issues, suggestions, issueKeys);
  }

  const schemas = parseJsonLdSchemas();

  if (schemas.length > 0) score += 10;
  else addFinding(locale, "schemaMarkup", issues, suggestions, issueKeys);

  const hasFaqSchema = schemas.some((s) => {
    const type = s["@type"];
    const types = Array.isArray(type) ? type : [type];
    return types.some((t) => t === "FAQPage" || t === "HowTo");
  });
  if (hasFaqSchema) score += 5;
  else addFinding(locale, "faqSchema", issues, suggestions, issueKeys);

  const hasDateElement = document.querySelector("time[datetime]") !== null;
  const hasArticleDate = Boolean(getMetaContent("article:modified_time") || getMetaContent("article:published_time"));
  const hasSchemaDate = schemas.some((s) => s["dateModified"] || s["datePublished"]);
  if (hasDateElement || hasArticleDate || hasSchemaDate) score += 5;
  else addFinding(locale, "contentFreshness", issues, suggestions, issueKeys);

  const hasAuthorMeta = Boolean(getMetaContent("author"));
  const hasAuthorLink = document.querySelector('a[rel="author"]') !== null;
  const hasAuthorElement = document.querySelector('[class*="author"], [itemprop="author"]') !== null;
  const hasSchemaAuthor = schemas.some((s) => Boolean(s["author"]));
  if (hasAuthorMeta || hasAuthorLink || hasAuthorElement || hasSchemaAuthor) score += 5;
  else addFinding(locale, "authorSignal", issues, suggestions, issueKeys);

  if (document.querySelector('article, main, [role="main"]') !== null) score += 5;
  else addFinding(locale, "semanticStructure", issues, suggestions, issueKeys);

  const images = Array.from(document.querySelectorAll("img"));
  if (images.length > 0) {
    const imagesWithAlt = images.filter((img) => (img.getAttribute("alt") || "").trim().length > 0);
    if (imagesWithAlt.length / images.length >= 0.7) score += 5;
    else addFinding(locale, "imageAltText", issues, suggestions, issueKeys);
  }

  const words = bodyText.match(/[a-zÀ-ÿ]{4,}/gi)?.map((word) => word.toLowerCase()) || [];
  const frequency = new Map<string, number>();
  for (const word of words) frequency.set(word, (frequency.get(word) || 0) + 1);
  const counts = Array.from(frequency.values());
  const highestFrequency = counts.length ? Math.max(...counts) : 0;
  const repetitionRatio = words.length ? highestFrequency / words.length : 0;

  if (highestFrequency >= 3 && repetitionRatio <= 0.08) score += 5;
  else {
    addFinding(locale, "keywordFocus", issues, suggestions, issueKeys);
  }

  const isNoindex = checkNoindex();
  if (isNoindex) {
    score = Math.max(0, score - 15);
    addFinding(locale, "noindex", issues, suggestions, issueKeys);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));
  const externalLinkCount = externalLinks.length;
  const headingsForPrompt = limitItems(
    headings.map((heading) => `${heading.tagName.toUpperCase()}: ${getElementText(heading)}`),
    8,
  );
  const listSamples = limitItems(
    Array.from(document.querySelectorAll("li")).map((item) => getElementText(item)).filter((text) => text.length >= 12),
    4,
  );
  const externalLinkSamples = limitItems(
    externalLinks.map((link) => {
      const text = getElementText(link);
      const href = link.getAttribute("href") || "";
      return text ? `${text} (${href})` : href;
    }),
    4,
  );
  const spyInsights = buildSpyInsights(locale, {
    h1: getElementText(h1s[0]),
    headings: headingsForPrompt,
    listSamples,
    externalLinkSamples,
    hasNumbers: /\d/.test(bodyText),
    hasEmphasis: document.querySelectorAll("strong, b").length > 0,
    firstParagraph: getElementText(paragraphs[0]).slice(0, 180),
  });
  const improvementPrompt = buildImprovementPrompt(locale, finalScore, issues, suggestions, {
    title: metadata.title,
    h1: getElementText(h1s[0]),
    headings: headingsForPrompt,
    paragraphCount: paragraphs.length,
    wordCount: bodyText.match(/\S+/g)?.length || 0,
    listCount: document.querySelectorAll("ul, ol").length,
    externalLinkCount,
    url: window.location.href,
    metaDescription: metadata.metaDescription,
    canonical: metadata.canonical,
    llmsTxtUrl: llmsTxt.url,
    hasLlmsTxt: llmsTxt.exists,
  });

  return {
    score: finalScore,
    issues,
    suggestions,
    issueKeys,
    improvementPrompt,
    spyInsights,
    pageTitle: metadata.title,
    metaDescription: metadata.metaDescription,
    canonical: metadata.canonical,
    llmsTxt,
    isNoindex,
  };
}

const llmScoreWindow = window as LLMScoreWindow;

if (!llmScoreWindow.__llmScoreContentScriptLoaded) {
  llmScoreWindow.__llmScoreContentScriptLoaded = true;

  chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: (result: LLMResult) => void) => {
    if (message?.type !== "GET_SCORE") return false;

    const locale = normalizeLocale(message?.locale);

    waitForPageToSettle()
      .then(() => calculateLLMScore(locale))
      .then((result) => sendResponse(result))
      .catch(() => {
        calculateLLMScore(locale).then((result) => sendResponse(result));
      });

    return true;
  });
}

/*
  LLM Score v1.0.0
  © 2026 LLM Score. Todos os direitos reservados.
*/
