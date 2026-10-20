# Porte do protótipo EcoSis para o GitHub Pages — Design

Data: 2026-10-19
Status: aprovado pelo Luiz em 2026-10-19

## Intenção e o porquê

O protótipo de baixa fidelidade do EcoSis (app de condomínio) foi gerado no
Figma Make. O objetivo é publicá-lo num link público do GitHub Pages para
**apresentar aos professores**. Eles vão abrir o link no celular ou no
computador e navegar pelas telas. O link precisa abrir direto e não pode
quebrar no dia da apresentação.

O Figma Make deixa de ser usado. Esta pasta passa a ser a versão oficial, e
todas as alterações futuras serão feitas aqui. Cada alteração enviada ao
GitHub deve atualizar o site sozinha, sem passos manuais.

## Metas

- Site publicado em `https://luizotr.github.io/P.I-Ecosis-Prototipo/`.
- Publicação automática a cada `push` na branch `main` (GitHub Actions).
- Todas as telas funcionando sob o subcaminho `/P.I-Ecosis-Prototipo/`,
  incluindo o favicon.
- Título da aba legível: "EcoSis — Protótipo".
- Projeto livre de dependências do Figma Make.

## Fora do escopo

- Mudar telas, fluxos, textos ou o visual do protótipo.
- Domínio próprio.
- Backend, banco de dados ou persistência (os dados continuam fictícios e
  em memória).

## Anti-metas (o que tornaria isso um fracasso)

- Página em branco no Pages por causa do caminho base errado.
- Ícone ou assets quebrados no subcaminho.
- Depender de algum passo manual (build local, upload de `dist/`) para
  atualizar o site.
- Qualquer mudança visual ou de comportamento no protótipo.

## Restrições e estado atual

- App estático: React 19, Vite 8, Tailwind v4, TypeScript. Todo o app fica
  em `src/App.tsx` e `src/index.css`.
- A navegação entre telas é feita por estado do React (`Screen`), sem rotas
  na URL. Por isso não há problema de 404 ao recarregar e não é preciso um
  `404.html` de fallback.
- Repositório remoto `https://github.com/LuizOtr/P.I-Ecosis-Prototipo`:
  público, **vazio**, branch padrão `main`, Pages ainda não habilitado.
- Pasta local: **não é um repositório Git**. A identidade Git global já está
  configurada (`LuizOtr`).
- Máquina local: Node 24 e npm 11; **pnpm não está instalado**;
  `node_modules` ausente. Existe um `pnpm-lock.yaml` vindo do Figma Make.

## Decisões do Luiz

- Público: professores, para a apresentação.
- Hospedagem: GitHub Pages, no repositório `LuizOtr/P.I-Ecosis-Prototipo`.
- O protótipo vai continuar sendo alterado, sempre nesta pasta. Figma Make
  abandonado.

## Escolhas minhas (podem ser revistas)

1. **Gerenciador de pacotes: npm.** Trocar o `pnpm-lock.yaml` por
   `package-lock.json`, remover `.mise.toml`. Motivo: o npm já está
   instalado, e assim ninguém precisa instalar o pnpm para rodar o projeto.
2. **Caminho base:** `base: '/P.I-Ecosis-Prototipo/'` no `vite.config.ts`,
   aplicado só no build (no `npm run dev` continua `/`).
3. **Favicon:** referenciar via caminho relativo ao base (por exemplo,
   `%BASE_URL%favicon.svg` ou o `<link>` direto no `index.html`), nunca
   `/favicon.svg` fixo.
4. **Limpeza do Figma:**
   - `vite.config.ts` fica só com `react()`, `tailwindcss()`, o alias `@` e
     o `base`. Saem `figmaSiteConfiguration`, `figmaErrorOverlayReplay`,
     `figmaReactRefreshBoundaryFallback`, `figmaMakeKitPlugin`, o import de
     `.figma/make/site.json` e as variáveis `FIGMA_*`.
   - `index.html` passa a ter `lang="pt-BR"`, título, meta description
     (texto atual do `site.json`), `meta robots noindex, nofollow` e o
     favicon escritos direto, sem os comentários `<!-- figma:... -->`.
   - Remover a pasta `.figma/` e as entradas do Figma no `.gitignore`
     (`/.figma/design-context/`, `/.plugins/`, `/.opencode-skills/`,
     `.claude-replay.*`).
5. **Não indexar no Google:** mantém o `noindex` atual, via meta tag no
   `index.html`. O `robots.txt` deixa de ser gerado.
6. **Deploy:** workflow `.github/workflows/deploy.yml` com as actions
   oficiais (`actions/checkout`, `actions/setup-node` com Node 22 e cache
   npm, `npm ci`, `npm run build`, `actions/upload-pages-artifact` com
   `dist/`, `actions/deploy-pages`). Gatilhos: `push` na `main` e
   `workflow_dispatch` (para republicar manualmente se precisar).
7. **Habilitar o Pages:** via API do GitHub
   (`POST /repos/LuizOtr/P.I-Ecosis-Prototipo/pages` com
   `build_type: "workflow"`), usando o token temporário que o Luiz forneceu
   (expira em ~3h). O token também autentica o primeiro `push`. Ele **nunca**
   é gravado em arquivo, na URL do remote ou no histórico do Git: usar só
   em variável de ambiente da sessão / header de requisição.
8. **`AGENTS.md`/`CLAUDE.md`:** reescrever o `AGENTS.md` para o novo
   contexto: sem servidor do Figma, comandos `npm run dev` e
   `npm run build`, deploy automático pelo Pages, aviso sobre o `base`.
   O `CLAUDE.md` (`@AGENTS.md`) continua igual.
9. **Pasta `.agents/` fica fora do Git** (`.gitignore`). É ferramenta do
   assistente, não do protótipo, e o plugin clonado tem seu próprio `.git`
   aninhado. `docs/` entra no Git.
10. **Script `format` (oxfmt):** manter, já que é inofensivo.

## Verificação esperada

- `npm ci && npm run build` sem erros localmente.
- `npm run preview` servindo em `/P.I-Ecosis-Prototipo/`: a página carrega,
  o favicon aparece e todas as telas (login, Início, Avisos, Mural,
  Portaria, Chamados, Ajustes) navegam normalmente.
- Após o primeiro `push`, o workflow fica verde e o link público abre no
  navegador, inclusive com largura de celular.

## Deixado para o builder

- Formato exato do workflow e das versões das actions (usar as atuais).
- Mensagens de commit.
- Ordem: limpar e verificar localmente → `git init` → primeiro commit →
  `git remote add origin` → push → Luiz habilita o Pages → confirmar o
  deploy.
