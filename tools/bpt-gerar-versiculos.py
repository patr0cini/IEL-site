#!/usr/bin/env python3
"""Gera src/assets/data/versiculos.json a partir do PDF da Bíblia para Todos.

A BPT tem direitos reservados (© Sociedade Bíblica de Portugal, 1993, 2009) e é
usada com autorização da SBP. Por isso o texto completo NÃO fica no repositório:
só os versículos citados na confissão de fé.

Como correr (dois passos):

  1. Extrair o texto do PDF, com a informação de tipos de letra:
       swiftc -O tools/bpt-extrair-runs.swift -o /tmp/extrair
       /tmp/extrair "caminho/para/BPT.pdf" /tmp/runs.tsv

  2. Gerar os versículos:
       python3 tools/bpt-gerar-versiculos.py /tmp/runs.tsv

Porquê os tipos de letra: no PDF, o texto bíblico (Helvetica 13.6) só se
distingue dos títulos de secção (Arial-Bold), das referências cruzadas
(Arial) e dos cabeçalhos dos Salmos (Arial-Itálico) pela formatação.
"""

import collections
import json
import re
import subprocess
import sys

CORPO = {'Helvetica|13.6', 'TimesNewRomanPSMT|15.0', 'TimesNewRomanPSMT|12.0',
         'Helvetica|12.0', 'Helvetica|11.0', 'Helvetica|24.0'}

LIVROS = [
    'GÉNESIS', 'ÊXODO', 'LEVÍTICO', 'NÚMEROS', 'DEUTERONÓMIO', 'JOSUÉ', 'JUÍZES', 'RUTE',
    '1 SAMUEL', '2 SAMUEL', '1 REIS', '2 REIS', '1 CRÓNICAS', '2 CRÓNICAS', 'ESDRAS', 'NEEMIAS',
    'ESTER', 'JOB', 'SALMOS', 'PROVÉRBIOS', 'ECLESIASTES', 'CÂNTICO', 'ISAÍAS', 'JEREMIAS',
    'LAMENTAÇÕES', 'EZEQUIEL', 'DANIEL', 'OSEIAS', 'JOEL', 'AMÓS', 'OBADIAS', 'JONAS', 'MIQUEIAS',
    'NAUM', 'HABACUC', 'SOFONIAS', 'AGEU', 'ZACARIAS', 'MALAQUIAS', 'MATEUS', 'MARCOS', 'LUCAS',
    'JOÃO', 'ATOS DOS APÓSTOLOS', 'ROMANOS', '1 CORÍNTIOS', '2 CORÍNTIOS', 'GÁLATAS', 'EFÉSIOS',
    'FILIPENSES', 'COLOSSENSES', '1 TESSALONICENSES', '2 TESSALONICENSES', '1 TIMÓTEO',
    '2 TIMÓTEO', 'TITO', 'FILÉMON', 'HEBREUS', 'TIAGO', '1 PEDRO', '2 PEDRO', '1 JOÃO', '2 JOÃO',
    '3 JOÃO', 'JUDAS', 'APOCALIPSE',
]

# A BPT numera os Salmos pela tradição grega (Salmo 23 hebraico = 22 na BPT) e
# conta o título como versículo. Os desvios abaixo foram verificados por
# comparação do conteúdo, salmo a salmo.
DESVIO_SALMO = {1: 0, 2: 0, 8: 1, 19: 1, 32: 0, 51: 2, 78: 0, 101: 0, 110: 0,
                119: 0, 127: 0, 128: 0, 139: 0}


def salmo_para_bpt(capitulo, versiculo):
    grego = (capitulo if capitulo <= 8
             else 9 if capitulo <= 10
             else capitulo - 1 if capitulo <= 113
             else 113 if capitulo <= 115
             else capitulo - 1)
    return grego, versiculo + DESVIO_SALMO.get(capitulo, 0)


def ler_biblia(caminho_runs):
    """Reconstrói livro/capítulo/versículo a partir dos runs do PDF."""
    biblia = collections.defaultdict(lambda: collections.defaultdict(dict))
    livro = capitulo = versiculo = None
    buffer = []

    def guardar():
        if livro and capitulo and versiculo is not None and buffer:
            texto = re.sub(r'\s+', ' ', ''.join(buffer)).strip()
            if texto:
                biblia[livro][capitulo][versiculo] = texto

    for linha in open(caminho_runs, encoding='utf-8'):
        fonte, _, bruto = linha.rstrip('\n').partition('\t')
        texto = bruto.replace('\\n', '\n').replace('\\t', '\t').replace('\\\\', '\\')
        limpo = texto.strip()

        if fonte == 'Helvetica|16.0':                      # título do livro
            guardar()
            buffer, versiculo, capitulo = [], None, None
            livro = limpo
        elif fonte == 'Helvetica|14.0':                    # "MATEUS 1"
            guardar()
            buffer, versiculo = [], None
            m = re.match(r'^(.*?)\s+(\d+)([AB]?)$', limpo)
            capitulo = int(m.group(2)) if m and m.group(3) != 'B' else None
        elif fonte == 'Helvetica|9.5':                     # número do versículo
            m = re.match(r'^(\d+)(.*)$', limpo)            # aceita "15", "15“" e "44["
            if m and capitulo:
                guardar()
                versiculo, buffer = int(m.group(1)), [m.group(2)]
        elif fonte in CORPO and versiculo is not None:
            buffer.append(texto)
    guardar()
    return biblia


def repor_espacos(versiculos, biblia):
    """A extração do PDF cola algumas palavras ("umaltar"). Separa-as usando a
    frequência das palavras no texto completo."""
    todo = ' '.join(t for lv in biblia.values() for c in lv.values() for t in c.values())
    freq = collections.Counter(p.lower() for p in re.findall(r'[A-Za-zÀ-ÿ]+', todo))

    def separar(m):
        palavra = m.group(0)
        if freq[palavra.lower()] > 2:                      # comum, logo legítima
            return palavra
        for i in range(5, len(palavra) - 4):
            a, b = palavra[:i].lower(), palavra[i:].lower()
            if freq[a] >= 5 and freq[b] >= 5:
                return f'{palavra[:i]} {palavra[i:]}'
        return palavra

    return {k: re.sub(r'\b[A-Za-zÀ-ÿ]{14,}\b', separar, t) for k, t in versiculos.items()}


def chaves_da_confissao():
    """Pergunta ao interpretador de referências que versículos são citados."""
    guiao = '''
      import { interpretar } from "./tools/referencias.js";
      import { readFileSync } from "node:fs";
      const p = readFileSync("src/quem-somos/no-que-cremos.md", "utf-8");
      const c = new Set();
      for (const b of p.matchAll(/<p class="creed__refs">([\\s\\S]*?)<\\/p>/g))
        for (const parte of interpretar(b[1]))
          if (parte.tipo === "referencia") parte.chaves.forEach((k) => c.add(k));
      console.log([...c].join("\\n"));
    '''
    r = subprocess.run(['node', '--input-type=module', '-e', guiao],
                       capture_output=True, text=True, check=True)
    return [c for c in r.stdout.strip().split('\n') if c]


def main():
    if len(sys.argv) < 2:
        sys.exit('Uso: python3 tools/bpt-gerar-versiculos.py <runs.tsv>')

    biblia = ler_biblia(sys.argv[1])
    total = sum(len(c) for lv in biblia.values() for c in lv.values())
    print(f'BPT lida: {len(biblia)} livros, {total} versículos')

    versiculos, faltam = {}, []
    for chave in chaves_da_confissao():
        indice, capitulo, versiculo = map(int, chave.split('.'))
        nome = LIVROS[indice - 1]
        if indice == 19:                                   # Salmos
            capitulo, versiculo = salmo_para_bpt(capitulo, versiculo)
        elif indice == 29:                                 # Joel tem 4 capítulos na BPT
            if capitulo == 2 and versiculo >= 28:
                capitulo, versiculo = 3, versiculo - 27
            elif capitulo == 3:
                capitulo = 4
        texto = biblia.get(nome, {}).get(capitulo, {}).get(versiculo)
        if texto:
            versiculos[chave] = texto
        else:
            faltam.append(f'{chave} ({nome} {capitulo}:{versiculo})')

    versiculos = repor_espacos(versiculos, biblia)
    destino = 'src/assets/data/versiculos.json'
    with open(destino, 'w', encoding='utf-8') as f:
        json.dump(versiculos, f, ensure_ascii=False)

    kb = len(json.dumps(versiculos, ensure_ascii=False).encode()) / 1024
    print(f'{destino}: {len(versiculos)} versículos, {kb:.0f} KB')
    for f in faltam:
        print('  em falta:', f)


if __name__ == '__main__':
    main()
