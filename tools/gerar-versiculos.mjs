// Gera src/assets/data/versiculos.json com APENAS os versículos citados
// na confissão de fé — a Bíblia completa (3,8 MB) não vai para o repositório.
//
// Uso:  node tools/gerar-versiculos.mjs caminho/para/BLIVRE.json
//
// Onde obter o ficheiro: https://github.com/damarals/biblias (versões de
// domínio público: BLIVRE, ALM1911, TB). Para trocar de tradução basta
// correr este comando com outro ficheiro e voltar a publicar.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { interpretar } from './referencias.js';

const origem = process.argv[2];
if (!origem) {
  console.error('Falta o caminho para o JSON da Bíblia.');
  process.exit(1);
}

const biblia = JSON.parse(readFileSync(origem, 'utf-8'));
const pagina = readFileSync('src/quem-somos/no-que-cremos.md', 'utf-8');

// recolhe as chaves de todos os versículos citados
const chaves = new Set();
for (const bloco of pagina.matchAll(/<p class="creed__refs">([\s\S]*?)<\/p>/g)) {
  for (const parte of interpretar(bloco[1])) {
    if (parte.tipo === 'referencia') parte.chaves.forEach((c) => chaves.add(c));
  }
}

const versiculos = {};
const emFalta = [];
for (const chave of chaves) {
  const [livro, capitulo, versiculo] = chave.split('.').map(Number);
  const texto = biblia[livro - 1]?.chapters?.[capitulo - 1]?.[versiculo - 1];
  if (texto) versiculos[chave] = texto.trim().replace(/\s+/g, ' ');
  else emFalta.push(chave);
}

mkdirSync('src/assets/data', { recursive: true });
const destino = 'src/assets/data/versiculos.json';
writeFileSync(destino, JSON.stringify(versiculos));

const tamanho = Buffer.byteLength(JSON.stringify(versiculos)) / 1024;
console.log(`${destino}: ${Object.keys(versiculos).length} versículos, ${tamanho.toFixed(0)} KB`);
if (emFalta.length) console.log(`não encontrados (${emFalta.length}): ${emFalta.slice(0, 10).join(', ')}`);
