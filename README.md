# EcoSis — Protótipo

Protótipo navegável do aplicativo de condomínio **EcoSis**, construído com React 19, Vite e Tailwind CSS v4.

**No ar:** https://luizotr.github.io/P.I-Ecosis-Prototipo/

## Comandos

- `npm install` — instala as dependências
- `npm run dev` — servidor local em `http://localhost:5173/`
- `npm run build` — build de produção em `dist/`, com base `/P.I-Ecosis-Prototipo/`
- `npm run preview` — serve o build em `http://localhost:4173/P.I-Ecosis-Prototipo/`
- `npm run format` — formata o código com oxfmt

Cada `push` na branch `main` dispara `.github/workflows/deploy.yml`, que compila e publica no GitHub Pages.

---

## Telemetria com Microsoft Clarity

Projeto Clarity: **`zdl7ay26wo`**

### Onde o código vive

| Arquivo | Papel |
| --- | --- |
| `index.html` | Snippet oficial do Clarity dentro do `<head>` — é ele que carrega o script |
| `src/lib/clarity.ts` | Camada de API: telas, eventos, tags, identificação e diagnóstico |
| `src/App.tsx` | Instrumentação das telas e das ações do usuário |
| `src/main.tsx` | Bootstrap do diagnóstico e captura de erros globais |

O snippet fica no HTML, e não no bundle React, de propósito. Ele precisa rodar mesmo quando o app quebra. Foi o que faltou no incidente da tela em branco: com o script no `<head>`, a gravação sobrevive ao erro e mostra o que o usuário viu.

### O que é instrumentado

**Telas.** O protótipo troca de tela por estado do React, sem mexer na URL. Sem sinal explícito, o Clarity enxerga uma única página e perde a navegação inteira. Cada troca emite `identify` com o `custom-page-id`, as tags `screen` e `screen_label`, e o evento `screen_view_<tela>`. Telas: `login`, `home`, `alerts`, `services`, `collaborative`, `concierge`, `maintenance`, `settings`, `design-system`.

**Eventos.** `login_quick`, `login_prefilled`, `login_credentials`, `logout`, `modal_open_support`, `modal_open_panic`, `modal_open_newAlert`, `panic_confirmed`, `alerts_mark_all_read`, `collab_ad_created`, `alert_sent_to_manager`, `support_recovery_sms`, `support_recovery_concierge`, `design_system_open`, `contrast_on|off`, `large_text_on|off`, `js_error`, `unhandled_rejection`, `react_error_boundary`.

**Tags de sessão.** `screen`, `screen_label`, `auth_method`, `user_role`, `authenticated`, `high_contrast`, `large_text`, `last_error`, `last_rejection`. Filtre por elas no dashboard.

**Identificação anônima.** `src/lib/clarity.ts` gera um UUID em `localStorage` (`ecosis_clarity_uid`) e um por aba em `sessionStorage` (`ecosis_clarity_sid`), enviados via `identify`. É isso que faz o Clarity reconhecer o mesmo visitante entre visitas e entre dispositivos, em vez de contar cada acesso como um usuário novo.

**Erros.** `window.onerror`, `unhandledrejection` e o ErrorBoundary do React viram eventos, com a mensagem truncada em 200 caracteres na tag `last_error`.

### Por que parte dos dados não chega

Cinco causas, em ordem de impacto:

**1. Bloqueadores de anúncios.** A regra `||clarity.ms^` está na linha 3623 do EasyPrivacy — a lista que uBlock Origin, AdGuard e o Brave usam por padrão. Isso bloqueia tanto o script quanto o envio para `/collect`. Firefox com Proteção Contra Rastreamento no modo estrito, DNS filtrado (Pi-hole, NextDNS, AdGuard DNS) e proxy corporativo produzem o mesmo efeito. **Não existe contorno legítimo do lado do cliente:** qualquer truque para disfarçar o domínio seria evasão de bloqueador, não otimização. A saída honesta é medir a perda, e para isso existe o diagnóstico abaixo.

**2. Consentimento (EEA, Reino Unido e Suíça).** Desde 31 de outubro de 2025 o Clarity exige sinal de consentimento nessas regiões. Sem ele, o Clarity ainda coleta, mas degrada o relatório: cada visualização vira uma sessão nova, "páginas por sessão" fica em 1, funis mostram queda total e todo usuário conta como novo. Usuários no Brasil não são afetados. `grantConsent()` e `revokeConsent()` estão prontos em `src/lib/clarity.ts`, mas **não** são chamados automaticamente: sinalizar consentimento sem banner é violação de conformidade.

**3. Cookies desligados no dashboard.** Em *Settings → Setup*, o botão de cookies precisa estar ligado. Desligado, as gravações não se conectam em sessões de várias páginas e o relatório fica fragmentado.

**4. Retenção de 30 dias.** O Clarity guarda os dados para consulta por até 30 dias a partir da gravação. Depois disso, some. Para trabalho acadêmico, exporte os relatórios dentro da janela.

**5. Limites do produto.** O Clarity não enxerga dentro de `<canvas>` nem de iframes de terceiros. Tráfego de bot é excluído da contagem por padrão. Navegadores que enviam Global Privacy Control podem ser tratados como opt-out.

Há ainda um efeito menos óbvio: o Clarity mascara conteúdo sensível por padrão, e o formulário de login tem `data-clarity-mask="true"` em e-mail e senha. Isso **não** reduz os dados analíticos — cliques, rolagem, eventos e tags continuam completos. Reduz apenas o texto digitado dentro das gravações, que é exatamente o que a LGPD exige que fique de fora.

### Diagnóstico

Abra a página com `?clarity-debug` na URL:

```
https://luizotr.github.io/P.I-Ecosis-Prototipo/?clarity-debug
```

Aparece um selo no canto inferior esquerdo com o status, a versão do script, o ID do projeto e os identificadores anônimos da sessão. Serve para confirmar, no navegador de um participante da avaliação, se a gravação está de fato ativa antes de contar com os dados dele.

O mesmo estado fica em `window.__ECOSIS_CLARITY__`:

```js
{ status: "loaded" | "blocked" | "unavailable" | "pending", version: "0.8.77", ... }
```

Como o detector funciona, e por que não usa Resource Timing: o stub de fila do Clarity existe mesmo com bloqueador ativo, então `typeof window.clarity === "function"` não prova nada. O sinal confiável é o que o script real instala — `window.clarity.v` recebe a versão (`0.8.77` quando medido), e `identify` passa a devolver uma Promise. A entrada `clarity.ms/tag/...` aparece em `performance.getEntriesByType("resource")` mesmo quando a requisição falha, então Resource Timing daria falso positivo de "gravando".

Para conferir a instalação manualmente, abra o DevTools, aba Network, filtre por `collect`: interagir com a página deve gerar POSTs para `https://www.clarity.ms/collect`.

### Como aumentar a cobertura

Para uma avaliação controlada, instrua os participantes a usar Chrome ou Edge sem extensões de bloqueio. Vale avisar quem usa Brave ou Firefox estrito que a coleta será perdida, e conferir com o selo `?clarity-debug` antes da sessão. No dashboard, confirme *Settings → Setup* com cookies ligados e *Bot Detection* ativo.

### LGPD

O Clarity coleta interação, não identidade. Ainda assim, informe os participantes que a sessão é gravada de forma anônima e que os campos de e-mail e senha ficam mascarados. A política de privacidade do serviço está em https://privacy.microsoft.com/privacystatement.

### Trocar de projeto Clarity

Dois pontos, e um teste automático cobra que fiquem em sincronia:

1. `index.html` — o último argumento do snippet.
2. `src/lib/clarity.ts` — a constante `CLARITY_PROJECT_ID`.

O workflow de deploy falha se os dois divergirem ou se o snippet sumir do build, então uma troca pela metade não chega em produção.

> Observação: o projeto `wqjiis2n1a`, usado antes, também é um projeto Clarity válido e ainda ativo. Se o dashboard que você acompanha for esse, basta trocar o ID nos dois arquivos acima.

---

## Google Analytics 4

Segunda fonte de métricas. O GA4 traz número agregado (sessões, usuários, eventos, aquisição) e retenção de 14 meses, contra os 30 dias do Clarity. Não substitui o Clarity: mapa de calor e gravação de sessão continuam sendo dele. As duas ferramentas respondem perguntas diferentes.

**Instalado: contêiner `GTM-TVKK4R67`.** O snippet vive em `index.html` (junto do Clarity, pelo mesmo motivo: precisa rodar mesmo quando o bundle quebra) e o ID fica em `src/lib/analytics.ts`. O deploy falha se os dois divergirem.

**O contêiner sozinho não coleta nada.** Ele é um executor: quem envia dado ao GA4 são as tags configuradas dentro dele. Com o contêiner publicado e nenhuma tag dentro, o `gtm.js` carrega, o dataLayer enche e o GA4 continua zerado. Três passos no painel resolvem:

1. **Google tag.** Em tagmanager.google.com › Tags › Novo › Google Tag, informe o ID da propriedade do GA4 (o `G-...`, em GA4 › Administrador › Fluxos de dados) e dispare em *Initialization - All Initialization Events*. Publique o contêiner.
2. **Tag de evento das telas.** Crie uma tag GA4 Event com nome de evento `page_view` e gatilho de *Custom Event* igual a `page_view`. Sem ela, a troca de tela não chega ao GA4 e o relatório de páginas fica reduzido à entrada inicial.
3. **Desligue a visualização automática** no Google tag. Cada tela já emite a sua, e deixar as duas ligadas conta a primeira tela duas vezes.

### Como está ligado

- `src/lib/analytics.ts` é a fachada única. O app importa daqui e cada sinal sai para o Clarity **e** para o dataLayer do GTM, então instrumentação não duplica e os dois nunca divergem.
- Cada tela vira caminho virtual via `page_path`: `/P.I-Ecosis-Prototipo/home`, `.../alerts`, `.../settings`. A URL real não muda neste protótipo, então sem isso o relatório mostraria uma linha só.
- O evento se chama `page_view` de propósito: é o nome que o GA4 trata como visualização de página, então uma tag de evento resolve o relatório sem inventar métrica paralela.
- Os nomes de evento estão em snake_case minúsculo (`modal_open_new_alert`), como o GA4 recomenda.
- Eventos e tags carregam o parâmetro `screen`, para cruzar ação com tela.

### Dois ajustes que só dão para fazer no painel

1. **Retenção de dados.** O padrão do GA4 é 2 meses. Em GA4 › Administrador › Retenção de dados, mude para 14 meses. É o principal motivo de existir essa segunda fonte num trabalho acadêmico.
2. **Dimensões personalizadas.** O parâmetro `screen` só aparece em relatório depois de registrado em Administrador › Dimensões personalizadas (escopo de evento, nome `screen`).

### Bloqueadores

GA4 apanha dos mesmos bloqueadores do Clarity: `||google-analytics.com^` está na linha 5011 do EasyPrivacy, junto de `/gtag/js?` na 1204. Uma segunda ferramenta **não recupera** quem bloqueia — uBlock Origin, Brave e AdGuard derrubam os dois juntos. O ganho aqui é outro tipo de métrica, retenção maior e conferência cruzada, não cobertura.

### Verificar

- DevTools › Network: `gtm.js?id=GTM-TVKK4R67` deve carregar com 200. Depois, filtro `collect` mostra as requisições ao GA4.
- Badge `?clarity-debug`: mostra o contêiner e quantos comandos estão na fila (`fila 1` = o `js` do snippet).
- Realtime do GA4: só acusa usuário ativo depois que o Google tag existir e o contêiner estiver publicado.

### LGPD

Agora são dois rastreadores. O GA4 grava os cookies `_ga` e `_ga_<ID>` por dois anos. Cite os dois se houver submissão a comitê de ética. O mascaramento de e-mail e senha vale para o Clarity; o GA4 não grava conteúdo digitado, mas registra eventos, origem e navegação.

---

## Estrutura do Projeto

- `src/main.tsx` — entrada do React, ErrorBoundary e bootstrap da telemetria
- `src/App.tsx` — telas do protótipo (Início, Avisos, Mural, Portaria, Chamados, Ajustes) e instrumentação
- `src/lib/clarity.ts` — integração com o Microsoft Clarity
- `src/components/DesignSystemView.tsx` — guia de design system e acessibilidade
- `src/components/Icons.tsx` — ícones SVG semânticos
- `src/index.css` — CSS global e Tailwind CSS v4
- `public/favicon.svg` — favicon
- `index.html` — shell HTML, meta tags e snippet do Clarity
- `vite.config.ts` — React, Tailwind e caminho base `/P.I-Ecosis-Prototipo/`
- `.github/workflows/deploy.yml` — publicação no GitHub Pages, com verificação do Clarity

## Estilo

O projeto usa **Tailwind CSS v4** pelo plugin `@tailwindcss/vite`. `src/index.css` importa o Tailwind com `@import 'tailwindcss';`. Use classes utilitárias direto no JSX e mantenha regras globais ou temas em `src/index.css`. Não há `tailwind.config.js` nem PostCSS. Como `src/main.tsx` importa `src/index.css`, a configuração global de fontes pertence a esse arquivo: mantenha os `@import` no topo, seguidos de `@font-face` e das famílias de fontes.
