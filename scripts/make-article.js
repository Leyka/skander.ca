const path = require('node:path');
const fs = require('node:fs');
const kebabCase = require('lodash/kebabCase');
const capitalize = require('lodash/capitalize');

const [, , ...titleRaw] = process.argv;

// Set: Article Path
const rootDir = path.resolve(__dirname, '..');
const allArticlesDir = path.join(rootDir, 'src', 'articles');

const article = `${kebabCase(titleRaw)}`;
const articlePath = path.join(allArticlesDir, article, `${article}.md`);
if (fs.existsSync(articlePath)) {
  console.error(`Error: Article already exists at ${articlePath}`);
  process.exit(1);
}

// Set: Content
const title = titleRaw.map(capitalize).join(' ');
const content = `---
title: ${title}
---

`;

// Write: file
fs.mkdirSync(path.join(allArticlesDir, article));
fs.writeFileSync(articlePath, content);
console.log(`Created article: ${articlePath}`);
