const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const exts = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function walk(dir) {
  const res = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      res.push(...walk(p));
    } else if (exts.includes(path.extname(name))) {
      res.push(p);
    }
  }
  return res;
}

function readImports(file) {
  const content = fs.readFileSync(file, 'utf8');
  const imports = new Set();
  // static import
  const re = /import\s+[^'";]+['"]([^'"\n]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) imports.add(m[1]);
  // commonjs require
  const re2 = /require\(['"]([^'"\n]+)['"]\)/g;
  while ((m = re2.exec(content)) !== null) imports.add(m[1]);
  return Array.from(imports);
}

function resolveImport(fromFile, imp) {
  if (!imp.startsWith('.')) return null; // external
  const base = path.resolve(path.dirname(fromFile), imp);
  // try file with extensions
  for (const e of exts) {
    const p = base + e;
    if (fs.existsSync(p)) return path.normalize(p);
  }
  // try index files
  for (const e of exts) {
    const p = path.join(base, 'index' + e);
    if (fs.existsSync(p)) return path.normalize(p);
  }
  // try the exact path
  if (fs.existsSync(base)) return path.normalize(base);
  return null;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('src directory not found');
    process.exit(2);
  }
  const files = walk(SRC).map(p => path.normalize(p));

  const importsMap = new Map();
  for (const f of files) {
    importsMap.set(f, new Set());
  }

  for (const f of files) {
    const imps = readImports(f);
    for (const imp of imps) {
      const resolved = resolveImport(f, imp);
      if (resolved && importsMap.has(resolved)) {
        importsMap.get(f).add(resolved);
      }
    }
  }

  // build reverse map (incoming)
  const incoming = new Map();
  for (const f of files) incoming.set(f, new Set());
  for (const [from, tos] of importsMap.entries()) {
    for (const to of tos) incoming.get(to).add(from);
  }

  const roots = new Set([
    path.normalize(path.join(SRC, 'main.tsx')),
    path.normalize(path.join(SRC, 'main.ts')),
    path.normalize(path.join(SRC, 'index.tsx')),
    path.normalize(path.join(SRC, 'App.tsx')),
    path.normalize(path.join(ROOT, 'bot.ts')),
    path.normalize(path.join(ROOT, 'server.ts')),
  ]);

  const candidates = [];
  for (const f of files) {
    // only consider components and pages folders
    if (!f.includes(path.join('src', 'components')) && !f.includes(path.join('src', 'pages'))) continue;
    const inc = incoming.get(f);
    // if no incoming imports and not an explicit root, candidate for removal
    if ((!inc || inc.size === 0) && !roots.has(f)) candidates.push(f);
  }

  if (candidates.length === 0) {
    console.log('No unused files found under src/components or src/pages (by static import analysis).');
    return;
  }

  console.log('Possible unused files (static analysis). Review before deleting:');
  for (const c of candidates) console.log('-', path.relative(ROOT, c));
}

main();
