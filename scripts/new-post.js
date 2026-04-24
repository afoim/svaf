#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const name = process.argv[2];
if (!name) {
	console.error('Usage: pnpm new-post <name>');
	process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10);

const dir = resolve('src/content/posts', name);
const file = join(dir, 'index.md');

if (existsSync(file)) {
	console.error(`Already exists: ${file}`);
	process.exit(1);
}

mkdirSync(dir, { recursive: true });

const content = `---
title: ${name}
published: ${date}
description: 
image: ""
draft: false
---
`;

writeFileSync(file, content, 'utf8');
console.log(`Created: ${file}`);
