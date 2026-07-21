# Site da Igreja Evangélica de Livramento

Site estático construído com [Eleventy](https://www.11ty.dev/), preparado para GitHub Pages. O conteúdo está em português de Portugal e pode ser atualizado sem alterar a programação do site.

## Trabalhar localmente

É necessário ter Node.js 22 ou mais recente instalado.

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal (normalmente `http://localhost:8080`). Para gerar a versão final do site:

```bash
npm run build
```

Os ficheiros publicados são criados na pasta `_site/`.

## Onde editar o conteúdo

- `src/index.njk` — página inicial.
- `src/quem-somos/` — Sobre, História, No que Cremos e Ministérios.
- `src/mensagens/` — páginas de YouTube e Spotify.
- `src/recursos/` — leituras e devocional.
- `src/onde-estamos.md` — contactos e mapa.
- `src/_data/site.json` — nome, contactos, morada, horários, redes sociais e valores.

Os ficheiros `.md` são documentos Markdown: os títulos começam com `#`, subtítulos com `##` e parágrafos são separados por uma linha vazia.

## Passagens bíblicas em "No que Cremos"

Na página da confissão de fé, cada referência mostra o texto bíblico ao passar o rato (ou ao tocar, no telemóvel). O texto usado é a **Bíblia Livre**, que está em domínio público.

Os versículos vivem em `src/assets/data/versiculos.json` e são gerados a partir das referências da própria página. **Se acrescentar ou alterar referências bíblicas, é preciso gerar o ficheiro de novo:**

1. Descarregue `BLIVRE.json` das [Bíblias em formato aberto](https://github.com/damarals/biblias/releases) (a Bíblia completa não fica no repositório por ser demasiado grande).
2. Corra: `node tools/gerar-versiculos.mjs caminho/para/BLIVRE.json`

Para mudar de tradução, corra o mesmo comando com outro ficheiro — por exemplo `ALM1911.json`. Atenção: só BLIVRE, ALM1911 e TB são de domínio público; as restantes traduções (Almeida Corrigida Fiel, NVI, Bíblia para Todos, etc.) têm direitos reservados e exigem autorização escrita do editor.

## Publicar um artigo no blog

1. Crie um ficheiro em `src/blog/`, por exemplo `src/blog/uma-nova-noticia.md`.
2. Use este início de ficheiro:

```md
---
layout: layouts/post.njk
tags: posts
title: Título do artigo
description: Pequeno resumo para a lista de artigos.
date: 2026-07-20
---

Escreva aqui o texto do artigo.
```

3. Guarde o ficheiro. O artigo surgirá automaticamente na página Blog.

## Fotografias a fornecer

As imagens atuais são placeholders propositados. Para substituir, forneça idealmente fotografias horizontais, bem iluminadas e com pessoas reais da comunidade:

- uma fotografia de grupo ou do culto para o destaque inicial (mínimo 1600 × 900 px);
- uma fotografia do edifício e da entrada;
- uma fotografia por ministério (Escola Bíblica Dominical, Pequenos Grupos e ABCD);
- fotografias de atividades, se existirem, para futuras mensagens e artigos.

Depois de adicionar as imagens em `src/assets/img/`, atualize os respetivos caminhos nos ficheiros de conteúdo.

## GitHub Pages e domínio

O workflow em `.github/workflows/deploy.yml` publica automaticamente quando há alterações na branch `main`. No repositório GitHub, ative **Settings → Pages → Source: GitHub Actions**.

Este projeto publica através de um workflow GitHub Actions. Por isso, defina o domínio em **Settings → Pages → Custom domain** no GitHub; nesse modo, o GitHub não requer nem usa o ficheiro `CNAME` incluído no artefacto de publicação. O ficheiro `src/CNAME` contém `www.iel.pt` como referência para futuros alojamentos que o utilizem.

Quando o domínio estiver decidido, atualize também o campo `url` em `src/_data/site.json`.

Para ligar um domínio próprio, crie estes registos DNS no fornecedor do domínio:

- Para `www`: um registo `CNAME` de `www` para `<utilizador>.github.io`.
- Para o domínio raiz (`exemplo.pt`): quatro registos `A` para `185.199.108.153`, `185.199.109.153`, `185.199.110.153` e `185.199.111.153`.

No GitHub Pages, defina o domínio personalizado e ative HTTPS quando a verificação terminar. Confirme os valores atuais na [documentação do GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site) antes de alterar o DNS.

## Pontos a confirmar antes da publicação

- O telefone `961 234 567` está marcado como provisório.
