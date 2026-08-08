// Interpreta as listas de referências bíblicas da confissão de fé.
//
// As listas usam livro implícito: em "Salmo 19:7-10; 119:11, 89, 105, 140"
// o segundo grupo continua em Salmos. Também aparecem capítulos inteiros
// ("Isaías 53"), intervalos entre capítulos ("Hebreus 11:39-12:2") e o
// sufixo "ss." (e seguintes).

// Índice de cada livro (1-66), pelos nomes usados no texto em português europeu.
export const LIVROS = [
  ['Génesis', 'Gênesis'], ['Êxodo'], ['Levítico'], ['Números'], ['Deuteronómio', 'Deuteronômio'],
  ['Josué'], ['Juízes'], ['Rute'], ['1 Samuel'], ['2 Samuel'], ['1 Reis'], ['2 Reis'],
  ['1 Crónicas', '1 Crônicas'], ['2 Crónicas', '2 Crônicas'], ['Esdras'], ['Neemias'], ['Ester'],
  ['Jó'], ['Salmo', 'Salmos'], ['Provérbios'], ['Eclesiastes'], ['Cânticos', 'Cantares'],
  ['Isaías'], ['Jeremias'], ['Lamentações'], ['Ezequiel'], ['Daniel'], ['Oseias', 'Oséias'],
  ['Joel'], ['Amós'], ['Obadias'], ['Jonas'], ['Miqueias', 'Miquéias'], ['Naum'], ['Habacuque'],
  ['Sofonias'], ['Ageu'], ['Zacarias'], ['Malaquias'],
  ['Mateus'], ['Marcos'], ['Lucas'], ['João'], ['Atos'], ['Romanos'],
  ['1 Coríntios'], ['2 Coríntios'], ['Gálatas'], ['Efésios'], ['Filipenses'], ['Colossenses'],
  ['1 Tessalonicenses'], ['2 Tessalonicenses'], ['1 Timóteo'], ['2 Timóteo'], ['Tito'],
  ['Filémon', 'Filemom'], ['Hebreus'], ['Tiago'], ['1 Pedro'], ['2 Pedro'],
  ['1 João'], ['2 João'], ['3 João'], ['Judas'], ['Apocalipse'],
];

// Nomes ordenados do mais longo para o mais curto, para "1 João" ganhar a "João".
const NOMES = LIVROS.flatMap((nomes, i) => nomes.map((nome) => ({ nome, indice: i + 1 })))
  .sort((a, b) => b.nome.length - a.nome.length);

const MAX_VERSICULOS = 5; // limite mostrado na janela

function encontrarLivro(texto) {
  for (const { nome, indice } of NOMES) {
    if (texto.startsWith(nome)) {
      const resto = texto.slice(nome.length);
      // evita apanhar "Joel" dentro de "João"
      if (resto === '' || /^[\s\d]/.test(resto)) {
        return { indice, resto: resto.trim() };
      }
    }
  }
  return null;
}

// Expande um localizador ("24:4", "1-2", "11:39-12:2", "16ss.", "53")
// numa lista de {capitulo, versiculo}. Devolve null para o livro/capítulo inteiro.
function expandir(localizador, livro) {
  const limpo = localizador.replace(/\s+/g, '').replace(/\.$/, '');
  // livro inteiro (ex.: "Filémon") -> começa no primeiro versículo
  if (!limpo) return { versiculos: [{ capitulo: 1, versiculo: 1 }], aberto: true };

  const seguintes = /ss$/.test(limpo);
  const base = limpo.replace(/ss$/, '');

  // intervalo entre capítulos: 11:39-12:2
  const entreCapitulos = base.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
  if (entreCapitulos) {
    const [, c1, v1] = entreCapitulos.map(Number);
    return { versiculos: [{ capitulo: c1, versiculo: v1 }], aberto: true };
  }

  // capítulo:versículo(s), com intervalos e vírgulas: 19:7-10  ou  119:11,89,105
  const comCapitulo = base.match(/^(\d+):(.+)$/);
  if (comCapitulo) {
    const capitulo = Number(comCapitulo[1]);
    const versiculos = [];
    for (const parte of comCapitulo[2].split(',')) {
      const intervalo = parte.match(/^(\d+)-(\d+)$/);
      if (intervalo) {
        const [ini, fim] = [Number(intervalo[1]), Number(intervalo[2])];
        for (let v = ini; v <= fim && versiculos.length < MAX_VERSICULOS; v += 1) {
          versiculos.push({ capitulo, versiculo: v });
        }
      } else if (/^\d+$/.test(parte)) {
        versiculos.push({ capitulo, versiculo: Number(parte) });
      }
      if (versiculos.length >= MAX_VERSICULOS) break;
    }
    return { versiculos, aberto: seguintes || versiculos.length >= MAX_VERSICULOS };
  }

  // só capítulos: "53" ou "2-3" -> mostra o início do capítulo
  const soCapitulo = base.match(/^(\d+)(?:-\d+)?$/);
  if (soCapitulo) {
    // livros de um só capítulo (Judas, Filémon…) usam o número como versículo
    const umCapitulo = [31, 57, 63, 64, 65].includes(livro);
    const n = Number(soCapitulo[1]);
    return umCapitulo
      ? { versiculos: [{ capitulo: 1, versiculo: n }], aberto: false }
      : { versiculos: [{ capitulo: n, versiculo: 1 }], aberto: true };
  }

  return { versiculos: [], aberto: true };
}

// Escapa um texto para uso dentro de uma expressão regular.
const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Alternância com todos os nomes de livros (variantes incluídas).
const ALT_LIVROS = NOMES.map(({ nome }) => escaparRegex(nome)).join('|');

// Nas referências em linha, as vírgulas servem dois fins: listar versículos
// ("14:16,17,26") ou separar referências distintas ("João 1:18, Colossenses
// 1:15"). Converte só as segundas em ';', para o interpretador as separar.
function normalizar(texto) {
  return texto
    // vírgula antes de "capítulo:versículo" (novo capítulo do mesmo livro)
    .replace(/,\s*(?=\d+\s*:\s*\d)/g, '; ')
    // vírgula antes de um nome de livro
    .replace(new RegExp(`,\\s*(?=(?:${ALT_LIVROS})\\b)`, 'g'), '; ');
}

// Divide a lista completa em partes: texto solto e referências reconhecidas.
export function interpretar(texto) {
  const partes = [];
  let livroAtual = null;

  const grupos = normalizar(texto).split(';');
  grupos.forEach((grupo, i) => {
    const bruto = i < grupos.length - 1 ? `${grupo};` : grupo;
    // o ponto final da frase fica fora da referência (mas "ss." pertence-lhe)
    let conteudo = grupo.trim();
    if (conteudo.endsWith('.') && !/ss\.$/.test(conteudo)) {
      conteudo = conteudo.slice(0, -1);
    }
    if (!conteudo) {
      partes.push({ tipo: 'texto', texto: bruto });
      return;
    }

    const achado = encontrarLivro(conteudo);
    if (achado) livroAtual = achado.indice;
    const localizador = achado ? achado.resto : conteudo;

    if (!livroAtual) {
      partes.push({ tipo: 'texto', texto: bruto });
      return;
    }

    const { versiculos, aberto } = expandir(localizador, livroAtual);
    if (!versiculos.length) {
      partes.push({ tipo: 'texto', texto: bruto });
      return;
    }

    const antes = bruto.slice(0, bruto.indexOf(conteudo));
    const depois = bruto.slice(bruto.indexOf(conteudo) + conteudo.length);
    if (antes) partes.push({ tipo: 'texto', texto: antes });
    partes.push({
      tipo: 'referencia',
      texto: conteudo,
      chaves: versiculos.map((v) => `${livroAtual}.${v.capitulo}.${v.versiculo}`),
      aberto,
    });
    if (depois) partes.push({ tipo: 'texto', texto: depois });
  });

  return partes;
}
