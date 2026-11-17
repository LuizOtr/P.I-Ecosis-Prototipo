# Coleta de métricas — EcoSis

Pipeline que puxa os dados do Google Analytics 4 (propriedade `564336568`,
stream `G-EY47T0176V` atrás do contêiner `GTM-TVKK4R67`) e transforma em
tabelas e figuras para a seção de avaliação do Projeto Integrador.

O Microsoft Clarity (`zdl7ay26wo`) cobre o lado comportamental — mapas de
calor, gravações e cliques — e não tem API pública de leitura. Os números dele
saem do painel (ver seção "Clarity" no fim deste arquivo).

## 1. Pré-requisito único: credencial de leitura

A API do GA4 não aceita login de navegador. Ela exige uma conta de serviço com
permissão de leitura na propriedade.

1. <https://console.cloud.google.com/projectcreate> → crie um projeto
   (ex.: `ecosis-analytics`).
2. No projeto: **APIs e serviços → Biblioteca** → procure
   **Google Analytics Data API** → **Ativar**.
3. **APIs e serviços → Credenciais → Criar credenciais → Conta de serviço**
   (nome `ecosis-leitura`). Criada a conta, entre nela → aba **Chaves** →
   **Adicionar chave → Criar nova chave → JSON**. O arquivo baixa sozinho.
4. Renomeie para `ga4-key.json` e coloque em `analytics/` (já está no
   `.gitignore` — não vai para o repositório).
5. Copie o e-mail da conta de serviço (algo como
   `ecosis-leitura@ecosis-analytics.iam.gserviceaccount.com`).
6. No GA4: **Admin → Acesso à propriedade → + → Adicionar usuários** → cole o
   e-mail, papel **Leitor** → **Adicionar**.

## 2. Rodar

```bash
# ambiente (uma vez)
uv venv .venv-analytics --python 3.12
uv pip install --python .venv-analytics/Scripts/python.exe -r analytics/requirements.txt

# coleta dos últimos 28 dias
.venv-analytics/Scripts/python.exe analytics/coletar_ga4.py --key analytics/ga4-key.json --dias 28

# uma janela específica
.venv-analytics/Scripts/python.exe analytics/coletar_ga4.py --key analytics/ga4-key.json \
  --inicio 2026-10-01 --fim 2026-11-15

# tabelas e figuras da última coleta
.venv-analytics/Scripts/python.exe analytics/gerar_figuras.py --run analytics/data/run-<carimbo>
```

Saída em `analytics/data/run-<carimbo>/`:

| Arquivo | Conteúdo |
|---|---|
| `01_totais` | usuários ativos, novos, sessões, engajamento, duração média, rejeição |
| `02_por_dia` | a mesma bateria, dia a dia |
| `03_dispositivos` | sessões por categoria de dispositivo |
| `04_plataformas` | sistema operacional e navegador |
| `05_aquisicao` | canal, origem e mídia |
| `06_geografia` | estado e cidade |
| `07_eventos` | todos os eventos, com contagem e usuários |
| `08_paginas` | páginas e títulos |
| `09_telas_custom` | tela por tela (exige a dimensão personalizada `screen`) |
| `10_retencao` | coortes semanais |
| `11_tempo_real` | últimos 30 minutos |
| `resumo.md` | tudo acima em tabelas, pronto para colar no Obsidian |

Cada relatório sai em `.csv` (separador `;`, abre direto no Excel em pt-BR) e
`.json`.

## 3. Instrumentação no app

`src/lib/analytics.ts` é a camada única: o app importa daqui e o sinal vai para
Clarity e GA4 ao mesmo tempo.

- `trackScreen()` envia um `page_view` virtual com `page_title`, `page_path` e
  `screen` — o protótipo troca de tela por estado do React, sem mudar a URL, e
  sem isso o GA4 enxergaria uma página só.
- `trackEvent()` manda o evento com o parâmetro `screen`.
- `setTag()` vira `user_properties` no GA4 (`auth_method`, `user_role`,
  `high_contrast`, `large_text`).

Eventos instrumentados: `login_quick`, `login_prefilled`, `login_credentials`,
`logout`, `screen_view_<tela>`, `modal_open_<support|panic|newAlert>`,
`contrast_on|off`, `large_text_on|off`, `design_system_open`,
`alerts_mark_all_read`, `collab_ad_created`, `panic_confirmed`,
`alert_sent_to_manager`, `support_recovery_sms|concierge`, `js_error`,
`unhandled_rejection`, `react_error_boundary`.

## 4. Dimensão personalizada `screen` (opcional, melhora o relatório de telas)

No GA4: **Admin → Definições personalizadas → Criar dimensão personalizada**,
nome `screen`, escopo **Evento**, parâmetro do evento `screen`. Leva até 24 h
para os dados antigos aparecerem. Sem ela o script avisa e segue; o relatório
`07_eventos` já mostra as telas via `screen_view_<tela>`.

## 5. Clarity (dados que não saem por API)

Exportar manualmente do painel e salvar em `analytics/data/clarity/`:

- **Dashboard** → período do estudo → captura de tela (sessões, usuários,
  duração média, taxa de rejeição, scroll depth).
- **Recordings** → filtro por evento/tela → contar sessões com rage click e
  dead click (indicadores de atrito de interface).
- **Heatmaps** → por tela, para cada uma das telas principais.

O badge de diagnóstico (`?clarity-debug` na URL) mostra se a coleta está
acontecendo no navegador do visitante ou se foi bloqueada — bloqueador de
anúncio é a causa mais comum de queda de amostra.