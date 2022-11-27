const path = require('node:path');
const fs = require('node:fs');
const kebabCase = require('lodash/kebabCase');
const capitalize = require('lodash/capitalize');

const [, , ...titleRaw] = process.argv;

// Set: Article Path
const rootDir = path.resolve(__dirname, '..');
const articlesDir = path.join(rootDir, 'src', 'articles');
const articleFile = `${kebabCase(titleRaw)}.md`;
const articlePath = path.join(articlesDir, articleFile);
if (fs.existsSync(articlePath)) {
  console.error(`Error: Article with file name "${articleFile}" already exists`);
  process.exit(1);
}

// Set: Content
const title = titleRaw.map(capitalize).join(' ');
const content = `---
title: ${title}
---

`;

// Write: file
fs.writeFileSync(articlePath, content);
console.log(`Created article: ${articlePath}`);
