// Mostra o texto bíblico ao passar o rato (ou tocar) numa referência.
// Os versículos vêm de /assets/data/versiculos.json, carregado só quando
// é preciso — quem nunca aponta para uma referência não descarrega nada.

const referencias = document.querySelectorAll('.ref');

if (referencias.length) {
  const NOMES = [
    'Génesis', 'Êxodo', 'Levítico', 'Números', 'Deuteronómio', 'Josué', 'Juízes', 'Rute',
    '1 Samuel', '2 Samuel', '1 Reis', '2 Reis', '1 Crónicas', '2 Crónicas', 'Esdras', 'Neemias',
    'Ester', 'Jó', 'Salmo', 'Provérbios', 'Eclesiastes', 'Cânticos', 'Isaías', 'Jeremias',
    'Lamentações', 'Ezequiel', 'Daniel', 'Oseias', 'Joel', 'Amós', 'Obadias', 'Jonas', 'Miqueias',
    'Naum', 'Habacuque', 'Sofonias', 'Ageu', 'Zacarias', 'Malaquias', 'Mateus', 'Marcos', 'Lucas',
    'João', 'Atos', 'Romanos', '1 Coríntios', '2 Coríntios', 'Gálatas', 'Efésios', 'Filipenses',
    'Colossenses', '1 Tessalonicenses', '2 Tessalonicenses', '1 Timóteo', '2 Timóteo', 'Tito',
    'Filémon', 'Hebreus', 'Tiago', '1 Pedro', '2 Pedro', '1 João', '2 João', '3 João', 'Judas',
    'Apocalipse',
  ];

  const painel = document.createElement('div');
  painel.className = 'versiculo';
  painel.setAttribute('role', 'tooltip');
  painel.hidden = true;
  document.body.appendChild(painel);

  let versiculos = null;
  let aCarregar = null;
  let ativa = null;

  const carregar = () => {
    if (versiculos) return Promise.resolve(versiculos);
    if (!aCarregar) {
      aCarregar = fetch('/assets/data/versiculos.json')
        .then((r) => (r.ok ? r.json() : {}))
        .then((dados) => { versiculos = dados; return dados; })
        .catch(() => ({}));
    }
    return aCarregar;
  };

  const montar = (elemento, dados) => {
    const chaves = elemento.dataset.ref.split(',');
    const linhas = chaves
      .map((chave) => {
        const texto = dados[chave];
        if (!texto) return null;
        const [livro, capitulo, versiculo] = chave.split('.').map(Number);
        return `<b>${NOMES[livro - 1]} ${capitulo}:${versiculo}</b> ${texto}`;
      })
      .filter(Boolean);

    if (!linhas.length) return null;
    const mais = elemento.dataset.mais ? '<span class="versiculo__mais">…</span>' : '';
    return `${linhas.map((l) => `<p>${l}</p>`).join('')}${mais}`;
  };

  const posicionar = (elemento) => {
    const caixa = elemento.getBoundingClientRect();
    const largura = painel.offsetWidth;
    const altura = painel.offsetHeight;
    const margem = 12;

    let esquerda = caixa.left + caixa.width / 2 - largura / 2;
    esquerda = Math.max(margem, Math.min(esquerda, window.innerWidth - largura - margem));

    // por cima se couber, senão por baixo
    const cabeEmCima = caixa.top - altura - 10 > 0;
    const topo = cabeEmCima ? caixa.top - altura - 10 : caixa.bottom + 10;

    painel.classList.toggle('versiculo--abaixo', !cabeEmCima);
    painel.style.left = `${esquerda + window.scrollX}px`;
    painel.style.top = `${topo + window.scrollY}px`;
  };

  const mostrar = async (elemento) => {
    const dados = await carregar();
    const html = montar(elemento, dados);
    if (!html) return;
    ativa = elemento;
    painel.innerHTML = html;
    painel.hidden = false;
    posicionar(elemento);
  };

  const esconder = () => {
    painel.hidden = true;
    ativa = null;
  };

  const temRato = window.matchMedia('(hover: hover)').matches;

  referencias.forEach((elemento) => {
    if (temRato) {
      elemento.addEventListener('mouseenter', () => mostrar(elemento));
      elemento.addEventListener('mouseleave', esconder);
    }
    // teclado e toque
    elemento.addEventListener('focus', () => mostrar(elemento));
    elemento.addEventListener('blur', esconder);
    elemento.addEventListener('click', (evento) => {
      evento.preventDefault();
      if (ativa === elemento && !painel.hidden) esconder();
      else mostrar(elemento);
    });
  });

  document.addEventListener('click', (evento) => {
    if (!painel.hidden && !evento.target.closest('.ref') && !evento.target.closest('.versiculo')) {
      esconder();
    }
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') esconder();
  });
  window.addEventListener('scroll', () => { if (ativa) posicionar(ativa); }, { passive: true });
  window.addEventListener('resize', esconder);
}
