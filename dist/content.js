function calculateLLMScore() {
    var _a, _b, _c;
    let score = 0;
    const issues = [];
    const suggestions = [];
    const h1s = Array.from(document.querySelectorAll("h1"));
    const h2s = Array.from(document.querySelectorAll("h2"));
    const h3s = Array.from(document.querySelectorAll("h3"));
    const paragraphs = Array.from(document.querySelectorAll("p"));
    const bodyText = (((_a = document.body) === null || _a === void 0 ? void 0 : _a.innerText) || "").toLowerCase();
    if (h1s.length === 1)
        score += 5;
    else {
        issues.push("Page should have exactly one H1 heading");
        suggestions.push("Use a single, clear H1 to define the page topic");
    }
    if (h2s.length >= 2)
        score += 5;
    else {
        issues.push("Not enough H2 subheadings");
        suggestions.push("Add at least two H2 headings to break content into sections");
    }
    if (h3s.length >= 1)
        score += 5;
    else {
        issues.push("Missing H3 detail headings");
        suggestions.push("Add at least one H3 heading for deeper structure");
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
        issues.push("Heading hierarchy is inconsistent");
        suggestions.push("Avoid skipping heading levels (e.g., H2 directly to H4)");
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
        issues.push("Paragraphs too long");
        suggestions.push("Split long paragraphs into shorter, easier-to-read blocks");
    }
    const firstParagraph = (((_b = paragraphs[0]) === null || _b === void 0 ? void 0 : _b.textContent) || "").trim().toLowerCase();
    if (firstParagraph.length > 0 && firstParagraph.length < 300)
        score += 10;
    else {
        issues.push("No clear answer at the beginning");
        suggestions.push("Start with a short direct answer in the first paragraph");
    }
    if (/\b(is|means|refers)\b/.test(bodyText))
        score += 5;
    else {
        issues.push("Definitions and explanatory language are limited");
        suggestions.push("Use clear phrasing like 'is', 'means', or 'refers to' for clarity");
    }
    if (bodyText.includes("?"))
        score += 5;
    else {
        issues.push("No question-oriented phrasing found");
        suggestions.push("Include at least one relevant question to improve answerability");
    }
    if (document.querySelectorAll("ul, ol").length > 0)
        score += 10;
    else {
        issues.push("Missing bullet points");
        suggestions.push("Add UL/OL lists to improve fast scanning");
    }
    if (document.querySelectorAll("strong, b").length > 0)
        score += 5;
    else {
        issues.push("No emphasized key points");
        suggestions.push("Highlight important terms with bold text");
    }
    const links = Array.from(document.querySelectorAll("a[href]"));
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
        issues.push("No external references detected");
        suggestions.push("Add credible external links to support claims");
    }
    if (/\d/.test(bodyText))
        score += 5;
    else {
        issues.push("No numerical evidence found");
        suggestions.push("Include relevant numbers, dates, or statistics where possible");
    }
    const h1Text = (((_c = h1s[0]) === null || _c === void 0 ? void 0 : _c.textContent) || "").trim().toLowerCase();
    if (h1Text && bodyText.includes(h1Text))
        score += 5;
    else {
        issues.push("H1 topic is not reinforced in body content");
        suggestions.push("Repeat the main H1 topic naturally in the body text");
    }
    const words = bodyText.match(/\b[a-z]{4,}\b/g) || [];
    const frequency = new Map();
    for (const word of words)
        frequency.set(word, (frequency.get(word) || 0) + 1);
    const counts = Array.from(frequency.values());
    const highestFrequency = counts.length ? Math.max(...counts) : 0;
    const repetitionRatio = words.length ? highestFrequency / words.length : 0;
    if (highestFrequency >= 3 && repetitionRatio <= 0.08)
        score += 5;
    else {
        issues.push("Keyword focus appears weak or inconsistent");
        suggestions.push("Use core keywords repeatedly but naturally across sections");
    }
    return { score: Math.min(100, Math.max(0, Math.round(score))), issues, suggestions };
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if ((message === null || message === void 0 ? void 0 : message.type) === "GET_SCORE")
        sendResponse(calculateLLMScore());
    return false;
});
export {};
