#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const errors = [];
const warnings = [];

console.log("🔍 Validating LLM Score extension...\n");

// Check manifest.json
const manifestPath = path.join(__dirname, "..", "manifest.json");
if (!fs.existsSync(manifestPath)) {
  errors.push("manifest.json not found");
} else {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    
    if (!manifest.manifest_version) errors.push("manifest_version missing");
    if (!manifest.name) errors.push("name missing in manifest");
    if (!manifest.version) errors.push("version missing in manifest");
    if (!manifest.description) warnings.push("description missing in manifest");
    if (!manifest.permissions) warnings.push("permissions array missing");
    if (!manifest.action?.default_popup) warnings.push("action.default_popup missing");
    
    console.log(`✓ manifest.json: v${manifest.version}, "${manifest.name}"`);
  } catch (e) {
    errors.push(`manifest.json is invalid JSON: ${e.message}`);
  }
}

// Check package.json
const packagePath = path.join(__dirname, "..", "package.json");
if (!fs.existsSync(packagePath)) {
  errors.push("package.json not found");
} else {
  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    console.log(`✓ package.json: v${pkg.version}`);
  } catch (e) {
    errors.push(`package.json is invalid JSON: ${e.message}`);
  }
}

// Check required files
const requiredFiles = [
  "popup.html",
  "styles.css",
  "tsconfig.json",
  "dist/popup.js",
  "dist/content.js"
];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, "..", file);
  if (!fs.existsSync(filePath)) {
    errors.push(`Required file missing: ${file}`);
  } else {
    console.log(`✓ ${file}`);
  }
}

// Check icons directory
const iconsDir = path.join(__dirname, "..", "icons");
if (!fs.existsSync(iconsDir)) {
  warnings.push("icons directory missing (recommended for Chrome Store)");
} else {
  const iconFiles = fs.readdirSync(iconsDir);
  console.log(`✓ icons/ contains ${iconFiles.length} file(s)`);
}

// Summary
console.log("\n" + "=".repeat(50));
if (errors.length === 0 && warnings.length === 0) {
  console.log("✅ All validations passed!");
  process.exit(0);
} else {
  if (errors.length > 0) {
    console.error(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach(e => console.error(`   • ${e}`));
  }
  if (warnings.length > 0) {
    console.warn(`\n⚠️  WARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.warn(`   • ${w}`));
  }
  console.log("\n" + "=".repeat(50));
  process.exit(errors.length > 0 ? 1 : 0);
}
