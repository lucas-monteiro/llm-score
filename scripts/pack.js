#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

console.log("📦 Packing LLM Score extension...\n");

const rootDir = path.join(__dirname, "..");
const outputPath = path.join(rootDir, "llm-score.zip");

// Create output stream
const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  const sizeKb = (archive.pointer() / 1024).toFixed(2);
  console.log(`✅ Package created: llm-score.zip (${sizeKb} KB)`);
  console.log("\nNext steps:");
  console.log("1. Go to https://chrome.google.com/webstore/devconsole/");
  console.log("2. Select your extension");
  console.log("3. Upload the llm-score.zip file");
  console.log("4. Fill in the details and publish");
});

archive.on("error", (err) => {
  console.error("❌ Error creating package:", err);
  process.exit(1);
});

archive.pipe(output);

// Add files to archive
const filesToArchive = [
  "manifest.json",
  "popup.html",
  "styles.css",
  "dist/popup.js",
  "dist/content.js"
];

const directories = [
  "icons"
];

// Add files
for (const file of filesToArchive) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    archive.file(filePath, { name: file });
    console.log(`✓ ${file}`);
  } else {
    console.warn(`⚠️  Missing: ${file}`);
  }
}

// Add directories
for (const dir of directories) {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    archive.directory(dirPath, dir);
    console.log(`✓ ${dir}/`);
  }
}

archive.finalize();
