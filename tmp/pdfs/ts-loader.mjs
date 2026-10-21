import ts from 'typescript';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const target = path.join(root, 'src', specifier.slice(2));
    for (const candidate of [target + '.ts', target + '.tsx', path.join(target, 'index.ts'), path.join(target, 'index.tsx')]) {
      try { await readFile(candidate); return { url: new URL(`file://${candidate}`).href, shortCircuit: true }; } catch {}
    }
  }
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = await readFile(new URL(url), 'utf8');
    return { format: 'module', shortCircuit: true, source: ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText };
  }
  return nextLoad(url, context);
}
