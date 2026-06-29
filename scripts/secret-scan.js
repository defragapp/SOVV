#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.open-next',
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.wrangler',
  '.turbo',
]);

const SKIP_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
]);

const TEXT_EXTENSIONS = new Set([
  '',
  '.cjs',
  '.css',
  '.env',
  '.example',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.sh',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const SECRET_PATTERNS = [
  { name: 'GitHub personal access token', regex: /ghp_[A-Za-z0-9_]{30,}/g },
  { name: 'GitHub fine-grained token', regex: /github_pat_[A-Za-z0-9_]{30,}/g },
  { name: 'Cloudflare API token', regex: /cfat_[A-Za-z0-9_-]{20,}/g },
  { name: 'Stripe secret key', regex: /sk_(live|test)_[A-Za-z0-9]{16,}/g },
  { name: 'R2 or AWS access key assignment', regex: /(R2|AWS)[A-Z0-9_]*(ACCESS_KEY_ID|ACCESS_KEY)\s*[:=]\s*["']?[A-Z0-9]{16,}/gi },
  { name: 'R2 or AWS secret key assignment', regex: /(R2|AWS)[A-Z0-9_]*(SECRET_ACCESS_KEY|SECRET_KEY)\s*[:=]\s*["']?[A-Za-z0-9/+]{24,}/gi },
  { name: 'OpenAI API key', regex: /sk-proj-[A-Za-z0-9_-]{20,}/g },
  { name: 'Anthropic API key', regex: /sk-ant-[A-Za-z0-9_-]{20,}/g },
];

function isProbablyTextFile(filePath) {
  const base = path.basename(filePath);
  if (SKIP_FILES.has(base)) return false;
  if (base.startsWith('.env')) return true;
  return TEXT_EXTENSIONS.has(path.extname(filePath));
}

function shouldSkipDirectory(dirName) {
  return SKIP_DIRS.has(dirName);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!shouldSkipDirectory(entry.name)) {
        walk(path.join(dir, entry.name), files);
      }
      continue;
    }

    if (entry.isFile()) {
      const fullPath = path.join(dir, entry.name);
      if (isProbablyTextFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function isPlaceholder(value) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === '' ||
    normalized.includes('example') ||
    normalized.includes('placeholder') ||
    normalized.includes('your_') ||
    normalized.includes('change_me') ||
    normalized.includes('changeme') ||
    normalized.includes('dummy') ||
    normalized.includes('test-value') ||
    normalized.includes('<') ||
    normalized.includes('...')
  );
}

function scanEnvFile(relativePath, content, findings) {
  if (!path.basename(relativePath).startsWith('.env')) return;

  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const match = trimmed.match(/^([A-Z0-9_]+)\s*=\s*(.+)$/i);
    if (!match) return;

    const [, key, rawValue] = match;
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    const sensitiveName = /(SECRET|TOKEN|KEY|PASSWORD|PRIVATE|WEBHOOK)/i.test(key);
    if (sensitiveName && !isPlaceholder(value)) {
      findings.push({
        file: relativePath,
        line: index + 1,
        type: '.env file contains a real-looking sensitive value',
      });
    }
  });
}

const findings = [];

for (const filePath of walk(ROOT)) {
  const relativePath = path.relative(ROOT, filePath);
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    continue;
  }

  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(content)) !== null) {
      const line = content.slice(0, match.index).split(/\r?\n/).length;
      findings.push({ file: relativePath, line, type: pattern.name });
    }
  }

  scanEnvFile(relativePath, content, findings);
}

if (findings.length > 0) {
  console.error('Potential secrets found. Values are intentionally not printed.');
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.type}`);
  }
  process.exit(1);
}

console.log('Secret scan passed: no obvious committed secrets found.');
