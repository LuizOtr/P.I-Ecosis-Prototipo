# Plano de Implementação: Microsoft Clarity, Design System e Usabilidade para Idosos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o script de telemetria Microsoft Clarity, desenvolver a tela interativa de Design System acessível no protótipo, aprimorar a usabilidade voltada à terceira idade (ícones SVG nítidos, áreas de toque generosas, síntese de voz real e botão de pânico seguro) e documentar todas as decisões de design e acessibilidade em conformidade com o Projeto Integrador e o GitHub Pages.

**Architecture:** A aplicação é uma SPA em React 19 + TypeScript + Vite + Tailwind CSS v4. A navegação interna é orientada pelo estado `Screen` com suporte a deep link por hash (`#design-system`), garantindo total compatibilidade com o subcaminho `/P.I-Ecosis-Prototipo/` do GitHub Pages sem requisições 404. O Microsoft Clarity é inserido de forma assíncrona no `index.html`. Componentes de acessibilidade utilizam a Web Speech API nativa e tokens utilitários CSS focados no padrão WCAG 2.1 AA.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Web Speech API (`window.speechSynthesis`), Microsoft Clarity.

**Spec:** `docs/superpowers/specs/2026-10-26-clarity-design-system-acessibilidade-design.md`

## Global Constraints

- O protótipo deve compilar perfeitamente com `npm run build` gerando a pasta `dist/` com caminho base `/P.I-Ecosis-Prototipo/`.
- Todos os links, ícones e assets devem usar caminhos relativos ao base, evitando caminhos absolutos na raiz `/`.
- Nenhuma dependência externa pesada deve ser adicionada (ícones embutidos em SVG direto no projeto).
- Compatibilidade com diretrizes de acessibilidade WCAG 2.1 nível AA e requisitos do PI (RF08, RNF10, RNF11, RNF12, RNF15).

## Review Focus

- **1. Falha de execução de áudio sem interação do usuário:** O navegador pode bloquear síntese de voz automática; a Web Speech API deve ser chamada estritamente em resposta a clique do usuário e com tratamento de erro gracioso.
- **2. Quebra de rotas no GitHub Pages:** O acesso ao Design System deve funcionar via estado interno da SPA e via hash `#design-system`, nunca exigindo sub-rotas no servidor que causariam 404 no Pages.
- **3. Sobreposição de elementos no modo Texto Ampliado:** O layout e os cards devem se ajustar fluidamente com `flex-wrap` e espaçamentos adequados quando o modo texto ampliado estiver ativo.
- **4. Contraste insuficiente no modo escuro/alto contraste:** As cores e bordas em alto contraste devem manter contraste mínimo de 7:1 em relação ao fundo escuro.
- **5. Bloqueio de scripts de terceiros por AdBlock:** O Microsoft Clarity carrega de forma assíncrona; sua ausência ou bloqueio não pode causar erros em cascata na aplicação.

---

### Task 1: Integração do Microsoft Clarity e Ajustes no `index.html`

**Files:**
- Modify: `index.html:1-19`

**Interfaces:**
- Produces: Carregamento assíncrono do script de telemetria do Clarity com tag `wqjiis2n1a` e link relativo para o favicon.

- [ ] **Step 1: Adicionar o snippet do Microsoft Clarity no `<head>` do `index.html`**
Adicionar o bloco de script oficial do Microsoft Clarity logo antes do fechamento de `</head>`:
```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wqjiis2n1a");
</script>
```

- [ ] **Step 2: Ajustar o caminho do favicon para compatibilidade com GitHub Pages**
Alterar `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` para `./favicon.svg` garantindo que resolva corretamente sob `/P.I-Ecosis-Prototipo/`.

- [ ] **Step 3: Verificar build do Vite**
Executar `npm run build` para validar que o `index.html` continua válido e compilando sem erros.

- [ ] **Step 4: Commit**
```bash
git add index.html
git commit -m "feat: integrate Microsoft Clarity and fix relative favicon path"
```

---

### Task 2: Criação de Conjunto de Ícones Semânticos em SVG Acessíveis

**Files:**
- Create: `src/components/Icons.tsx`
- Modify: `src/App.tsx:22-30`

**Interfaces:**
- Produces: Componentes de ícone SVG reutilizáveis (`HomeIcon`, `AlertsIcon`, `ServicesIcon`, `ConciergeIcon`, `MaintenanceIcon`, `SettingsIcon`, `PanicIcon`, `SpeakerIcon`, `CheckIcon`, `BackIcon`, `DesignSystemIcon`).

- [ ] **Step 1: Criar `src/components/Icons.tsx` com ícones vetoriais de alta legibilidade**
Implementar componentes funcionais que recebem `{ className?: string, size?: number }` e desenham traços geométricos nítidos com `strokeWidth={2}` ou `fill="currentColor"`, legíveis mesmo em telas com redução de acuidade visual.

- [ ] **Step 2: Atualizar a barra de navegação inferior (`navItems`) em `src/App.tsx`**
Substituir os caracteres soltos (`⌂`, `!`, `▦`, `□`, `◇`, `settings`) pelos novos componentes de ícones semânticos, mantendo os labels textuais bem visíveis.

- [ ] **Step 3: Verificar renderização e ausência de erros de tipagem**
Executar verificação de tipo com `npm run build`.

- [ ] **Step 4: Commit**
```bash
git add src/components/Icons.tsx src/App.tsx
git commit -m "feat: add accessible semantic SVG icons for navigation and features"
```

---

### Task 3: Aprimoramentos de Usabilidade para Idosos (Áreas de Toque, Síntese de Voz e Botão de Pânico)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Produces:
  - Função auxiliar `speakText(text: string): void` utilizando `window.speechSynthesis`.
  - Áreas de toque ampliadas (mínimo 48px na navegação e botões interativos).
  - Modal acolhedor de confirmação do Botão de Pânico com opções "Confirmar Emergência" e "Cancelar".
  - Acesso aos controles de Acessibilidade (Alto Contraste e Texto Ampliado) em Ajustes e no Login.

- [ ] **Step 1: Implementar o utilitário de síntese de voz `speakText`**
Criar função que instancia `SpeechSynthesisUtterance`, configura `lang = 'pt-BR'`, `rate = 0.9` (fala pausada para facilitar compreensão por idosos) e aciona `window.speechSynthesis.speak()`.

- [ ] **Step 2: Integrar o botão "Ouvir avisos" com áudio real**
Na tela `Alerts`, ao clicar em "Ouvir avisos" ou no botão individual de cada comunicado, disparar a leitura falada do título e corpo do aviso.

- [ ] **Step 3: Criar o modal de confirmação do Botão de Pânico**
Substituir o disparo direto de pânico por um modal de confirmação com visual acolhedor, botões grandes e instrução simples ("Você está acionando a portaria e os contatos de emergência do seu condomínio. Deseja continuar?").

- [ ] **Step 4: Ajustar CSS para áreas de toque mínimas e modo texto ampliado**
Em `src/index.css`, certificar que botões primários, itens da `bottom-nav` e cards possuem `min-height: 48px` a `56px`, tipografia nítida e espaçamento confortável entre alvos de clique.

- [ ] **Step 5: Testar build e responsividade**
Executar `npm run build`.

- [ ] **Step 6: Commit**
```bash
git add src/App.tsx src/index.css
git commit -m "feat: add speech synthesis, panic confirmation modal, and senior-focused touch targets"
```

---

### Task 4: Desenvolvimento da Tela Interativa de Design System (`DesignSystemView`)

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Componentes de ícone de `src/components/Icons.tsx` e estado global de acessibilidade (`highContrast`, `largeText`).
- Produces: Tela completa `DesignSystemView` com renderização de tokens, cores WCAG, tipografia, componentes interativos e guia de acessibilidade.

- [ ] **Step 1: Expandir o tipo `Screen` para incluir `'design-system'`**
Atualizar `type Screen = ... | 'design-system'` em `src/App.tsx`.
Adicionar suporte a hash URL na montagem: se `window.location.hash === '#design-system'`, abrir diretamente a tela do Design System.

- [ ] **Step 2: Adicionar pontos de entrada para o Design System**
- Na tela de `Login`: botão/link "Explorar Design System & Guia de Estilo" para a banca e professores poderem avaliar diretamente.
- Na tela de `Ajustes`: card de destaque "Design System & Acessibilidade do EcoSis".

- [ ] **Step 3: Construir o componente `DesignSystemView`**
Implementar o componente com:
- **Cabeçalho:** Título, badge de conformidade WCAG 2.1 AA e botão de retorno ao protótipo.
- **Seção 1: Princípios Inclusivos para Idosos:** Heurísticas baseadas na Persona Maria Aparecida (foco visual, 3 toques, feedback sonoro e visual).
- **Seção 2: Cores e Contraste WCAG:** Swatches interativos com Verde Eco (`#1b5e20`), Verde Médio, Neutros, Fundo Escuro, Alerta (`#d32f2f`), indicando os índices de contraste (ex: 4.5:1, 7:1).
- **Seção 3: Escala Tipográfica:** Exemplos dinâmicos alternando entre texto normal e texto ampliado (24px/32px conforme RNF10).
- **Seção 4: Vitrine de Componentes:** Demonstração funcional de Botões (Primário, Secundário, Perigo, Flutuante), Badges de Status, Cards de Notificação e Formulários.
- **Seção 5: Demonstração de Recursos:** Testador de síntese de voz ao vivo e alternador de alto contraste.

- [ ] **Step 4: Estilizar o Design System em `src/index.css`**
Adicionar estilos elegantes, limpos e acessíveis para as grades de swatches, cards demonstrativos e métricas de contraste.

- [ ] **Step 5: Testar compilação**
Executar `npm run build`.

- [ ] **Step 6: Commit**
```bash
git add src/App.tsx src/index.css
git commit -m "feat: implement interactive Design System screen with senior guidelines and WCAG tokens"
```

---

### Task 5: Documentação Formal de Entrega do Projeto

**Files:**
- Create: `docs/design-system-e-acessibilidade.md`

**Interfaces:**
- Produces: Documento em Markdown consolidado com a documentação do Design System, usabilidade para idosos, integração do Microsoft Clarity e alinhamento com os requisitos do Projeto Integrador.

- [ ] **Step 1: Redigir `docs/design-system-e-acessibilidade.md`**
Incluir:
- 1. Apresentação do Projeto EcoSis e Contexto Acadêmico (Senac).
- 2. Integração do Microsoft Clarity (propósito, script, tags e acompanhamento de métricas de usabilidade e heatmaps).
- 3. Fundamentos do Design System (Cores, Tipografia, Ícones e Componentes).
- 4. Diretrizes de Usabilidade e Acessibilidade para Moradores Idosos (atendimento aos requisitos RF08, RNF10, RNF11, RNF12, RNF15 e Persona Maria Aparecida).
- 5. Guia de Acesso e Apresentação (instruções para a banca acadêmica tanto em execução local quanto no GitHub Pages com subcaminho `/P.I-Ecosis-Prototipo/`).

- [ ] **Step 2: Commit**
```bash
git add docs/design-system-e-acessibilidade.md
git commit -m "docs: add comprehensive design system, accessibility and Microsoft Clarity documentation"
```

---

### Task 6: Validação Final, Build e Teste de Execução para GitHub Pages

**Files:**
- Verify: `dist/`, `package.json`, `index.html`, `src/App.tsx`

- [ ] **Step 1: Rodar formatação de código com oxfmt**
Executar `npm run format` para manter padrão do projeto.

- [ ] **Step 2: Rodar compilação de produção com `npm run build`**
Validar que não há nenhum erro de compilação do TypeScript, Vite ou Tailwind CSS v4, e que a pasta `dist/` é gerada com caminhos relativos ao base `/P.I-Ecosis-Prototipo/`.

- [ ] **Step 3: Validar a distribuição estática com `npm run preview` ou inspeção do `dist/index.html`**
Verificar se o Clarity script, os links e os scripts foram devidamente injetados no bundle final de produção.

- [ ] **Step 4: Commit e sincronização final**
```bash
git commit -m "chore: validate build and finalize release for GitHub Pages"
```
