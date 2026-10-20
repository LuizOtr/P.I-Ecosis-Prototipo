# Porte EcoSis → GitHub Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar o protótipo em `https://luizotr.github.io/P.I-Ecosis-Prototipo/` com deploy automático a cada push na `main`, sem nenhum resto do Figma Make.

**Architecture:** Vite gera `dist/` estático com `base` igual ao subcaminho do repositório (só no build). Um workflow do GitHub Actions faz `npm ci && npm run build` e publica `dist/` via `actions/deploy-pages`. O Pages é habilitado uma vez pela API com o token temporário.

**Tech Stack:** React 19, Vite 8, Tailwind v4, TypeScript, npm, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-19-github-pages-design.md`

## Global Constraints

- Nenhuma mudança em `src/App.tsx`, `src/index.css` ou `src/main.tsx` (zero mudança visual/comportamental).
- Base de build: exatamente `/P.I-Ecosis-Prototipo/`; em `npm run dev` continua `/`.
- Gerenciador: npm (sem `pnpm-lock.yaml`, sem `.mise.toml`).
- Título: `EcoSis — Protótipo`; `lang="pt-BR"`; `<meta name="robots" content="noindex, nofollow">`.
- Meta description: `Create interactive low-fidelity prototypes with functional flows and buttons, enabling designers and teams to visualize and test user experiences effectively.`
- `.agents/` fora do Git; `docs/` dentro.
- O token do GitHub nunca aparece em arquivo, URL de remote, config do Git ou commit. Só em `$env:GH_TOKEN` da sessão.
- Shell: PowerShell no Windows. Caminho do projeto contém espaço e acento — sempre usar aspas.

## Review Focus

1. **Assets sob o subcaminho** — JS/CSS/favicon em `dist/index.html` precisam começar com `/P.I-Ecosis-Prototipo/`; senão página em branco. Testado na Task 1, Step 1.
2. **Dev server quebrado pelo base** — `npm run dev` deve continuar servindo em `/`. Testado na Task 1, Step 6.
3. **Vazamento do token** — remote, `.git/config` e histórico sem `ghp_`. Testado na Task 3, Step 5.
4. **Celular** — professores podem abrir no telefone; navegação deve funcionar em ~390px de largura. Testado na Task 3, Step 8.
5. **Recarregar a página publicada** — F5 em qualquer tela volta ao app (não 404). Como não há rotas na URL, basta confirmar na Task 3, Step 8.

---

### Task 1: Limpar o Figma Make, trocar para npm e configurar o base

**Files:**
- Modify: `vite.config.ts` (arquivo inteiro reduzido)
- Modify: `index.html`
- Modify: `.gitignore`
- Modify: `package.json` (só se necessário; scripts atuais servem)
- Delete: `.figma/`, `pnpm-lock.yaml`, `.mise.toml`
- Create: `package-lock.json` (gerado por `npm install`)
- Test: `scripts/check-dist.ps1`

**Interfaces:**
- Produces: `npm run build` → `dist/` com base `/P.I-Ecosis-Prototipo/`; `scripts/check-dist.ps1` (sai com código 0 se ok, 1 se falhar) usado pela Task 3.

- [ ] **Step 1: Escrever o teste `scripts/check-dist.ps1`**

Lê `dist/index.html` e falha (`exit 1`, mensagem clara) se qualquer item faltar:
- contém `src="/P.I-Ecosis-Prototipo/assets/` (JS)
- contém `href="/P.I-Ecosis-Prototipo/assets/` (CSS)
- contém `href="/P.I-Ecosis-Prototipo/favicon.svg"`
- contém `<title>EcoSis — Protótipo</title>`
- contém `lang="pt-BR"`
- contém `content="noindex, nofollow"`
- NÃO contém `figma` (case-insensitive)
- `dist/favicon.svg` existe
Lê o arquivo com `-Encoding UTF8`.

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `npm install; npm run build; powershell -File scripts/check-dist.ps1`
Expected: FAIL (título "Figma Make App", base `/`).
Se `npm install` falhar por causa do lockfile do pnpm, remover `pnpm-lock.yaml` antes.

- [ ] **Step 3: Reduzir `vite.config.ts`**

`defineConfig(({ command }) => ({ base: command === 'build' ? '/P.I-Ecosis-Prototipo/' : '/', plugins: [react(), tailwindcss()], resolve: { alias: { '@': path.resolve(__dirname, './src') } } }))`. Remover todas as funções `figma*`, o import de `site.json`, `server`/`preview` com `FIGMA_*`/`PORT` e o tipo `FigmaSiteConfiguration`.

- [ ] **Step 4: Reescrever `index.html`**

Sem comentários `<!-- figma:... -->`. `<html lang="pt-BR">`; no head: charset, viewport, `<title>EcoSis — Protótipo</title>`, meta description (texto das Global Constraints), `<meta name="robots" content="noindex, nofollow">`, `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` (Vite prefixa o base no build). Body: `#root` + script `/src/main.tsx`.

- [ ] **Step 5: Remover arquivos do Figma e ajustar `.gitignore`**

Apagar `.figma/`, `pnpm-lock.yaml`, `.mise.toml`. No `.gitignore`: remover `.claude-replay.*`, `/.figma/design-context/`, o bloco de comentário + `/.plugins/` e `/.opencode-skills/`; adicionar `.agents/`.

- [ ] **Step 6: Rodar build + teste e checar o dev**

Run: `npm install; npm run build; powershell -File scripts/check-dist.ps1`
Expected: PASS, código 0.
Run: `npm run dev` (em background), depois `curl.exe -s http://localhost:5173/` deve conter `/src/main.tsx` sem prefixo do base; encerrar o servidor.

- [ ] **Step 7: Conferir visualmente com `npm run preview`**

Abrir `http://localhost:4173/P.I-Ecosis-Prototipo/` no navegador: login aparece, favicon aparece, entrar e navegar Início, Avisos, Mural, Portaria, Chamados, Ajustes sem erros no console. Encerrar o preview.

(Sem commit aqui: o repositório Git é criado na Task 3.)

### Task 2: Workflow de deploy e AGENTS.md

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `AGENTS.md` (reescrita)

**Interfaces:**
- Consumes: `npm ci` + `npm run build` da Task 1 gerando `dist/`.
- Produces: workflow chamado `Deploy to GitHub Pages`, disparado por `push` na `main` e `workflow_dispatch`.

- [ ] **Step 1: Criar `.github/workflows/deploy.yml`**

Permissões `contents: read`, `pages: write`, `id-token: write`; `concurrency: { group: pages, cancel-in-progress: false }`. Job `build`: `actions/checkout@v4`, `actions/setup-node@v4` (`node-version: 22`, `cache: npm`), `npm ci`, `npm run build`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` (`path: dist`). Job `deploy` (`needs: build`, `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }`): `actions/deploy-pages@v4` com `id: deployment`.

- [ ] **Step 2: Validar o YAML**

Run: `node -e "const y=require('fs').readFileSync('.github/workflows/deploy.yml','utf8'); if(!/deploy-pages@v4/.test(y)||!/path: dist/.test(y)||!/branches:\s*\[?\s*main/.test(y)) process.exit(1)"`
Expected: código 0. Conferir indentação a olho (sem tabs).

- [ ] **Step 3: Reescrever `AGENTS.md`**

Em português. Seções: o que é (protótipo EcoSis, React + Vite + Tailwind v4); Comandos (`npm install`, `npm run dev` → `http://localhost:5173/`, `npm run build`, `npm run preview` → `http://localhost:4173/P.I-Ecosis-Prototipo/`); Estrutura (mesma lista de `src/` de hoje, sem `.mise.toml`, com `.github/workflows/deploy.yml`); Deploy (push na `main` publica em `https://luizotr.github.io/P.I-Ecosis-Prototipo/`; o `base` no `vite.config.ts` precisa bater com o nome do repo; usar caminhos de assets relativos ao base); Estilo (parágrafos de Tailwind v4 / fontes do AGENTS.md atual, mantidos). Nada sobre Figma Make ou servidor já rodando.

### Task 3: Git, push, habilitar Pages e verificar no ar

**Files:** nenhum novo (só operações Git/API).

**Interfaces:**
- Consumes: tudo das Tasks 1–2; `scripts/check-dist.ps1`; `$env:GH_TOKEN` definido pelo controlador na sessão.

- [ ] **Step 1: Verificação final local**

Run: `npm ci; npm run build; powershell -File scripts/check-dist.ps1`
Expected: PASS.

- [ ] **Step 2: Inicializar o repositório**

Run: `git init -b main; git remote add origin https://github.com/LuizOtr/P.I-Ecosis-Prototipo.git`

- [ ] **Step 3: Conferir o que vai entrar**

Run: `git add -A; git status --short`
Expected: não aparece `.agents/`, `node_modules/`, `dist/`, `.figma/`, `pnpm-lock.yaml`. Aparecem `docs/`, `src/`, `public/`, `.github/`, `scripts/`, `package-lock.json`.

- [ ] **Step 4: Commit**

Run: `git commit -m "chore: port prototype from Figma Make to GitHub Pages"`

- [ ] **Step 5: Push sem gravar o token**

`$b64 = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$env:GH_TOKEN"))`
`git -c http.https://github.com/.extraheader="AUTHORIZATION: basic $b64" push -u origin main`
Depois: `git remote -v` e `Get-Content .git/config` não contêm `ghp_`; `git log -p | Select-String ghp_` vazio.

- [ ] **Step 6: Habilitar o Pages via API**

`Invoke-RestMethod -Method Post -Uri https://api.github.com/repos/LuizOtr/P.I-Ecosis-Prototipo/pages -Headers @{Authorization="Bearer $env:GH_TOKEN"; Accept="application/vnd.github+json"} -Body '{"build_type":"workflow"}' -ContentType application/json`
Expected: resposta com `html_url` `https://luizotr.github.io/P.I-Ecosis-Prototipo/`. Se 409 (já existe), fazer `PUT` no mesmo endpoint com o mesmo body.

- [ ] **Step 7: Disparar/acompanhar o workflow**

Se o run do push falhou por o Pages ainda não estar habilitado, redisparar: `POST /repos/LuizOtr/P.I-Ecosis-Prototipo/actions/workflows/deploy.yml/dispatches` com `{"ref":"main"}`. Acompanhar `GET .../actions/runs?per_page=1` até `status: completed` e `conclusion: success`.

- [ ] **Step 8: Verificar no ar**

`curl.exe -s https://luizotr.github.io/P.I-Ecosis-Prototipo/` contém `EcoSis — Protótipo`. No navegador: desktop e largura ~390px, login → todas as telas; F5 numa tela interna volta ao app sem 404; favicon visível.

- [ ] **Step 9: Limpeza**

`Remove-Item Env:GH_TOKEN`. Lembrar o Luiz de revogar o token.
