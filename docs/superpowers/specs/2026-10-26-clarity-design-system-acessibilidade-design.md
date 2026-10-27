# Integração do Microsoft Clarity, Design System e Usabilidade para Idosos — Design

Data: 2026-10-26
Status: Proposta para aprovação

---

## 1. Intenção e o Porquê

O projeto **EcoSis — Condomínio** (desenvolvido no âmbito do Projeto Integrador Senac) tem como diferencial a inclusão digital e a acessibilidade no ambiente condominial, com atenção especial a moradores idosos e pessoas com limitações visuais ou motoras (Persona principal: **Maria Aparecida, 68 anos**).

Para elevar o protótipo ao padrão de excelência acadêmica e usabilidade real, precisamos de três pilares:
1. **Métricas e Usabilidade com Microsoft Clarity:** Inserir a telemetria do Clarity para mapear mapas de calor (heatmaps), gravações de sessão e padrões de navegação dos usuários e avaliadores.
2. **Página de Design System Interativa:** Criar uma área dedicada dentro do protótipo onde professores e avaliadores possam inspecionar a base visual do projeto: paleta de cores (com taxas de contraste WCAG), tipografia, tokens de acessibilidade, componentes de UI e princípios de design para a terceira idade.
3. **Refinamento de Usabilidade para Idosos:** Adequar a interface existente com base nos requisitos do PI (RF08, RNF10, RNF11, RNF12, RNF15):
   - Ícones claros e semânticos (substituindo caracteres Unicode abstratos como `!`, `▦`, `□`, `◇` por ícones vetoriais identificáveis com texto).
   - Alvos de toque generosos (mínimo de 48px a 56px de altura).
   - Síntese de voz real (Web Speech API) no botão "Ouvir avisos" para condôminos com dificuldade de leitura.
   - Alternância global de acessibilidade (Alto Contraste e Texto Ampliado) acessível em qualquer tela.
   - Botão de emergência/pânico seguro e acolhedor.
4. **Documentação Técnica Completa:** Registro formal em markdown (`docs/design-system-e-acessibilidade.md`) detalhando a integração do Clarity, os fundamentos do design system e as decisões de acessibilidade voltadas ao público sênior.

---

## 2. Metas

- Inserir o snippet oficial do Microsoft Clarity (`wqjiis2n1a`) de forma assíncrona no `<head>` de `index.html`.
- Adicionar uma nova tela **Design System** (`Screen = 'design-system'`) no protótipo, acessível tanto a partir da tela de **Ajustes** quanto por atalho na tela de **Login** (e via hash `#design-system` na URL para envio direto a professores).
- A tela de Design System deve exibir:
  - **Identidade e Princípios:** Foco na inclusão da terceira idade, WCAG 2.1 nível AA e simplicidade de 3 toques.
  - **Paleta de Cores e Contraste:** Cores institucionais (Verde Eco, Neutros, Alertas) com indicação do nível de conformidade WCAG (ex: 4.5:1 para texto normal, 7:1 para alto contraste).
  - **Tipografia:** Famílias, tamanhos padrão vs. tamanho ampliado (RNF10 até 24px/32px), pesos e legibilidade.
  - **Componentes Interativos:** Demonstração de botões primários, secundários, botões flutuantes, cards com estados de foco e hover, badges de status, modais e formulários com labels grandes.
  - **Padrões de Acessibilidade:** Diretrizes aplicadas (alvos de toque, feedback sonoro/visual, síntese de voz, modo alto contraste).
- Refinar a interface geral do protótipo com melhorias específicas para idosos:
  - Navegação inferior e cards com ícones SVG nítidos e texto descritivo.
  - Ativação funcional da síntese de voz (`speechSynthesis.speak`) na tela de avisos para leitura dos comunicados.
  - Controles de acessibilidade rápidos e persistentes.
- Criar a documentação formal `docs/design-system-e-acessibilidade.md` detalhando todas as implementações para a entrega do Projeto Integrador.

---

## 3. Fora do Escopo

- Implementar backend persistente ou banco de dados externo (o protótipo permanece estático em React/TypeScript, com estado reativo em memória e compatível com o GitHub Pages).
- Autenticação real com servidores de terceiros ou envio de SMS/WhatsApp real.
- Redesenhar os fluxos funcionais já aprovados do condomínio (avisos, mural colaborativo, portaria, chamados).

---

## 4. Anti-Metas (O que tornaria isso um fracasso)

- Quebrar a compilação (`npm run build`) ou o deploy no GitHub Pages (`/P.I-Ecosis-Prototipo/`).
- O script do Clarity causar lentidão ou erros no console do navegador.
- A página do Design System ficar inacessível ou causar erro 404 ao ser acessada diretamente.
- O modo de acessibilidade (alto contraste ou texto ampliado) quebrar layouts ou sobrepor botões em telas menores.
- Ícones novos ficarem muito pequenos ou com contraste inadequado para idosos.

---

## 5. Arquitetura e Decisões Técnicas

### 5.1. Microsoft Clarity
- Inserção do script com tag assíncrona no `index.html`:
  ```html
  <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "wqjiis2n1a");
  </script>
  ```
- O script roda em produção e desenvolvimento de forma não-bloqueante.

### 5.2. Tela do Design System (`DesignSystemView`)
- Adicionada ao tipo `Screen`:
  `type Screen = 'home' | 'alerts' | 'services' | 'collaborative' | 'concierge' | 'maintenance' | 'settings' | 'design-system'`
- Pode ser aberta de:
  - Botão destacado no menu `Ajustes` ("Explorar Design System").
  - Link/botão no topo ou rodapé da tela de `Login` para os professores acessarem antes mesmo de logar.
  - Detecção de hash `#design-system` no carregamento da página para compartilhamento de link direto.
- Seções da página:
  1. *Header & Introdução* com botão de voltar ao protótipo.
  2. *Pilares do Design Inclusivo*: Princípios heurísticos focados na terceira idade (Clareza visual, Redução de carga cognitiva, Confirmação imediata).
  3. *Paleta de Cores*: Cores base (Brand Green, Accent, Backgrounds, Textos e Cores do Alto Contraste).
  4. *Tipografia & Escala*: Comparação visual de texto padrão vs texto ampliado.
  5. *Componentes e Estados*: Botões, Badges, Cards, Alertas e Modais.
  6. *Recursos de Acessibilidade*: Toggles interativos, Leitura de tela e Botão de emergência.

### 5.3. Usabilidade para Idosos (Melhorias no App)
- **Ícones semânticos**: SVGs limpos com contornos bem definidos para Home, Avisos, Mural, Portaria, Chamados e Ajustes, substituindo caracteres simples.
- **Áreas de toque (Touch Targets)**: Altura mínima de 48px em todos os botões e links de navegação para facilitar o toque por pessoas com tremor ou baixa precisão motora.
- **Leitura em Voz Alta Real (TTS)**: Uso da Web Speech API nativa dos navegadores (`window.speechSynthesis`), lendo o título e texto dos avisos em voz em português (`pt-BR`).
- **Botão de Pânico com Confirmação Humanizada**: Modal acolhedor com botões grandes "Confirmar Emergência" e "Cancelar", acionando feedback visual claro.
- **Feedback visual sonoro/acessível**: Toast nítido, avisos com badges visíveis e textos em linguagem direta sem jargões.

### 5.4. Documentação (`docs/design-system-e-acessibilidade.md`)
- Estruturação completa em markdown abordando:
  1. Visão Geral e Alinhamento com o Projeto Integrador.
  2. Integração do Microsoft Clarity (propósito, configuração e análise de calor).
  3. Guia do Design System (Cores, Tipografia, Espaçamentos, Componentes).
  4. Heurísticas de Usabilidade e Acessibilidade para a Terceira Idade (WCAG 2.1 AA, RNF10, RNF11, RNF12, RF08).
  5. Instruções de execução local e visualização.

---

## 6. O que fica a cargo do construtor

1. Selecionar ícones SVG elegantes, limpos e acessíveis integrados diretamente no código (sem dependências externas pesadas).
2. Garantir que a síntese de voz trate graciosamente cenários onde o navegador do usuário bloqueia áudio sem interação prévia.
3. Assegurar 100% de responsividade tanto em visualização mobile quanto desktop.
4. Manter a formatação e validação de tipos do TypeScript sem warnings ou erros.
