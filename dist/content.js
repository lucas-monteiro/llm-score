"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const FINDINGS = {
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
        h1Reinforced: {
            issue: "H1 topic is not reinforced in body content",
            suggestion: "Repeat the main H1 topic naturally in the body text",
        },
        keywordFocus: {
            issue: "Keyword focus appears weak or inconsistent",
            suggestion: "Use core keywords repeatedly but naturally across sections",
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
        h1Reinforced: {
            issue: "O tema do H1 não é reforçado no corpo do texto",
            suggestion: "Repita o tema principal do H1 naturalmente ao longo do conteúdo",
        },
        keywordFocus: {
            issue: "O foco de palavras-chave parece fraco ou inconsistente",
            suggestion: "Use palavras-chave centrais de forma repetida, mas natural, nas seções",
        },
    },
};
const PAGE_SETTLE_TIMEOUT_MS = 3000;
const MUTATION_QUIET_MS = 500;
function waitForLoadComplete() {
    if (document.readyState === "complete")
        return Promise.resolve();
    return new Promise((resolve) => {
        window.addEventListener("load", () => resolve(), { once: true });
    });
}
function waitForFontsReady() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            yield ((_a = document.fonts) === null || _a === void 0 ? void 0 : _a.ready);
        }
        catch (_b) {
            // Font loading is a nice-to-have signal; scoring can continue without it.
        }
    });
}
function waitForDomToSettle() {
    return new Promise((resolve) => {
        let settled = false;
        let quietTimer = window.setTimeout(finish, MUTATION_QUIET_MS);
        const timeoutTimer = window.setTimeout(finish, PAGE_SETTLE_TIMEOUT_MS);
        const observer = new MutationObserver(() => {
            window.clearTimeout(quietTimer);
            quietTimer = window.setTimeout(finish, MUTATION_QUIET_MS);
        });
        function finish() {
            if (settled)
                return;
            settled = true;
            window.clearTimeout(quietTimer);
            window.clearTimeout(timeoutTimer);
            observer.disconnect();
            resolve();
        }
        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        }
        else {
            finish();
        }
    });
}
function waitForPageToSettle() {
    return __awaiter(this, void 0, void 0, function* () {
        yield waitForLoadComplete();
        yield waitForFontsReady();
        yield waitForDomToSettle();
    });
}
function normalizeLocale(locale) {
    return locale === "pt-BR" ? "pt-BR" : "en-US";
}
function addFinding(locale, key, issues, suggestions, issueKeys) {
    const finding = FINDINGS[locale][key];
    issues.push(finding.issue);
    suggestions.push(finding.suggestion);
    issueKeys.push(key);
}
function getElementText(element) {
    return ((element === null || element === void 0 ? void 0 : element.textContent) || "").replace(/\s+/g, " ").trim();
}
function limitItems(items, limit) {
    return items.filter(Boolean).slice(0, limit);
}
function buildImprovementPrompt(locale, score, issues, suggestions, context) {
    const issueLines = issues.length ? issues.map((issue) => `- ${issue}`).join("\n") : "- No major issues found";
    const suggestionLines = suggestions.length
        ? suggestions.map((suggestion) => `- ${suggestion}`).join("\n")
        : "- Keep the current strengths and look for opportunities to add more specific answers, examples, and supporting evidence.";
    const headingLines = context.headings.length ? context.headings.map((heading) => `- ${heading}`).join("\n") : "- No headings detected";
    if (locale === "pt-BR") {
        return `Você é um especialista em SEO para IA, AEO e clareza editorial. Reescreva e reorganize esta página para melhorar sua presença nas principais IAs de busca, como ChatGPT, Copilot, Claude e Gemini.

Contexto da página:
- URL: ${context.url}
- Title: ${context.title || "não encontrado"}
- H1: ${context.h1 || "não encontrado"}
- Score atual: ${score}/100
- Parágrafos: ${context.paragraphCount}
- Palavras aproximadas: ${context.wordCount}
- Listas: ${context.listCount}
- Links externos: ${context.externalLinkCount}

Headings atuais:
${headingLines}

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
function buildSpyInsights(locale, context) {
    const insights = [];
    if (context.h1) {
        insights.push(locale === "pt-BR"
            ? `H1 claro para usar como referência: "${context.h1}"`
            : `Clear H1 to use as a reference: "${context.h1}"`);
    }
    if (context.firstParagraph) {
        insights.push(locale === "pt-BR"
            ? `Abertura útil detectada: "${context.firstParagraph}"`
            : `Useful opening detected: "${context.firstParagraph}"`);
    }
    for (const heading of limitItems(context.headings, 3)) {
        insights.push(locale === "pt-BR"
            ? `Boa seção para modelar conteúdo: ${heading}`
            : `Good section to model content after: ${heading}`);
    }
    for (const listSample of limitItems(context.listSamples, 2)) {
        insights.push(locale === "pt-BR"
            ? `Lista bem escaneável encontrada: "${listSample}"`
            : `Scannable list pattern found: "${listSample}"`);
    }
    for (const linkSample of limitItems(context.externalLinkSamples, 2)) {
        insights.push(locale === "pt-BR"
            ? `Referência externa aproveitável: ${linkSample}`
            : `Useful external reference: ${linkSample}`);
    }
    if (context.hasNumbers) {
        insights.push(locale === "pt-BR"
            ? "O conteúdo já usa números/dados. Reaproveite esse padrão para criar respostas mais verificáveis."
            : "The content already uses numbers or data. Reuse this pattern to make answers more verifiable.");
    }
    if (context.hasEmphasis) {
        insights.push(locale === "pt-BR"
            ? "Há termos em destaque. Use esse padrão para marcar benefícios, critérios e diferenciais."
            : "Highlighted terms are present. Reuse this pattern for benefits, criteria, and differentiators.");
    }
    return limitItems(insights, 8);
}
function calculateLLMScore(locale = "en-US") {
    var _a, _b, _c, _d, _e;
    let score = 0;
    const issues = [];
    const suggestions = [];
    const issueKeys = [];
    const h1s = Array.from(document.querySelectorAll("h1"));
    const h2s = Array.from(document.querySelectorAll("h2"));
    const h3s = Array.from(document.querySelectorAll("h3"));
    const paragraphs = Array.from(document.querySelectorAll("p"));
    const bodyText = (((_a = document.body) === null || _a === void 0 ? void 0 : _a.innerText) || "").toLowerCase();
    const links = Array.from(document.querySelectorAll("a[href]"));
    if (h1s.length === 1)
        score += 5;
    else {
        addFinding(locale, "singleH1", issues, suggestions, issueKeys);
    }
    if (h2s.length >= 2)
        score += 5;
    else {
        addFinding(locale, "enoughH2", issues, suggestions, issueKeys);
    }
    if (h3s.length >= 1)
        score += 5;
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
    if (hierarchyValid)
        score += 5;
    else {
        addFinding(locale, "headingHierarchy", issues, suggestions, issueKeys);
    }
    const paragraphLengths = paragraphs.map((p) => (p.textContent || "").trim().length).filter((len) => len > 0);
    const avgParagraphLength = paragraphLengths.length
        ? paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphLengths.length
        : 0;
    if (avgParagraphLength > 0 && avgParagraphLength < 400)
        score += 10;
    else if (avgParagraphLength < 800)
        score += 5;
    else {
        addFinding(locale, "paragraphLength", issues, suggestions, issueKeys);
    }
    const firstParagraph = (((_b = paragraphs[0]) === null || _b === void 0 ? void 0 : _b.textContent) || "").trim().toLowerCase();
    if (firstParagraph.length > 0 && firstParagraph.length < 300)
        score += 10;
    else {
        addFinding(locale, "clearOpening", issues, suggestions, issueKeys);
    }
    if (/\b(is|means|refers|significa)\b|(^|\s)(e|é)(\s|$)|refere-se/.test(bodyText))
        score += 5;
    else {
        addFinding(locale, "definitions", issues, suggestions, issueKeys);
    }
    if (bodyText.includes("?"))
        score += 5;
    else {
        addFinding(locale, "questionPhrasing", issues, suggestions, issueKeys);
    }
    if (document.querySelectorAll("ul, ol").length > 0)
        score += 10;
    else {
        addFinding(locale, "lists", issues, suggestions, issueKeys);
    }
    if (document.querySelectorAll("strong, b").length > 0)
        score += 5;
    else {
        addFinding(locale, "emphasis", issues, suggestions, issueKeys);
    }
    const hasExternalLinks = links.some((link) => {
        const href = link.getAttribute("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("/"))
            return false;
        try {
            const url = new URL(href, window.location.origin);
            return url.origin !== window.location.origin;
        }
        catch (_a) {
            return false;
        }
    });
    if (hasExternalLinks)
        score += 10;
    else {
        addFinding(locale, "externalLinks", issues, suggestions, issueKeys);
    }
    if (/\d/.test(bodyText))
        score += 5;
    else {
        addFinding(locale, "numericalEvidence", issues, suggestions, issueKeys);
    }
    const h1Text = (((_c = h1s[0]) === null || _c === void 0 ? void 0 : _c.textContent) || "").trim().toLowerCase();
    if (h1Text && bodyText.includes(h1Text))
        score += 5;
    else {
        addFinding(locale, "h1Reinforced", issues, suggestions, issueKeys);
    }
    const words = ((_d = bodyText.match(/[a-zÀ-ÿ]{4,}/gi)) === null || _d === void 0 ? void 0 : _d.map((word) => word.toLowerCase())) || [];
    const frequency = new Map();
    for (const word of words)
        frequency.set(word, (frequency.get(word) || 0) + 1);
    const counts = Array.from(frequency.values());
    const highestFrequency = counts.length ? Math.max(...counts) : 0;
    const repetitionRatio = words.length ? highestFrequency / words.length : 0;
    if (highestFrequency >= 3 && repetitionRatio <= 0.08)
        score += 5;
    else {
        addFinding(locale, "keywordFocus", issues, suggestions, issueKeys);
    }
    const finalScore = Math.min(100, Math.max(0, Math.round(score)));
    const externalLinkCount = links.filter((link) => {
        const href = link.getAttribute("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("/"))
            return false;
        try {
            return new URL(href, window.location.origin).origin !== window.location.origin;
        }
        catch (_a) {
            return false;
        }
    }).length;
    const headingsForPrompt = limitItems(headings.map((heading) => `${heading.tagName.toUpperCase()}: ${getElementText(heading)}`), 8);
    const listSamples = limitItems(Array.from(document.querySelectorAll("li")).map((item) => getElementText(item)).filter((text) => text.length >= 12), 4);
    const externalLinkSamples = limitItems(links
        .filter((link) => {
        const href = link.getAttribute("href") || "";
        if (!href || href.startsWith("#") || href.startsWith("/"))
            return false;
        try {
            return new URL(href, window.location.origin).origin !== window.location.origin;
        }
        catch (_a) {
            return false;
        }
    })
        .map((link) => {
        const text = getElementText(link);
        const href = link.getAttribute("href") || "";
        return text ? `${text} (${href})` : href;
    }), 4);
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
        title: document.title.trim(),
        h1: getElementText(h1s[0]),
        headings: headingsForPrompt,
        paragraphCount: paragraphs.length,
        wordCount: ((_e = bodyText.match(/\S+/g)) === null || _e === void 0 ? void 0 : _e.length) || 0,
        listCount: document.querySelectorAll("ul, ol").length,
        externalLinkCount,
        url: window.location.href,
    });
    return { score: finalScore, issues, suggestions, issueKeys, improvementPrompt, spyInsights };
}
const llmScoreWindow = window;
if (!llmScoreWindow.__llmScoreContentScriptLoaded) {
    llmScoreWindow.__llmScoreContentScriptLoaded = true;
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
        if ((message === null || message === void 0 ? void 0 : message.type) !== "GET_SCORE")
            return false;
        const locale = normalizeLocale(message === null || message === void 0 ? void 0 : message.locale);
        waitForPageToSettle()
            .then(() => sendResponse(calculateLLMScore(locale)))
            .catch(() => sendResponse(calculateLLMScore(locale)));
        return true;
    });
}
