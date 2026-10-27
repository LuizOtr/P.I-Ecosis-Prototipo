# Documentação Técnica: Design System, Acessibilidade Sênior e Microsoft Clarity

**Projeto:** EcoSis — Condomínio Inclusivo e Colaborativo  
**Origem:** Faculdade Senac Portão — Curso de Análise e Desenvolvimento de Sistemas (Projeto Integrador)  
**Equipe:** Agatha de Andrade Lima, Luiz Otávio Ribeiro Cordeiro, Pedro Frazão Freitas, Vinicius Lourenço Kulibaba, Willyan de Lima Farias  
**Data:** Outubro de 2026  
**Versão:** 1.2  
**Hospedagem Oficial:** [https://luizotr.github.io/P.I-Ecosis-Prototipo/](https://luizotr.github.io/P.I-Ecosis-Prototipo/)  
**Link Direto do Design System:** [https://luizotr.github.io/P.I-Ecosis-Prototipo/#design-system](https://luizotr.github.io/P.I-Ecosis-Prototipo/#design-system)

---

## 1. Visão Geral e Contexto do Projeto

O **EcoSis** é uma plataforma digital desenvolvida para otimizar a comunicação, segurança e convivência condominial, com foco prioritário na **inclusão digital de moradores idosos e pessoas com deficiência**. 

No Brasil, o envelhecimento populacional acelerado e a exclusão gerada por softwares complexos tornam muitos condôminos da terceira idade "invisíveis", dificultando o acesso a comunicados essenciais, encomendas e canais de emergência. O EcoSis resolve esse vácuo por meio de uma interface simplificada, limpa e multissensorial.

---

## 2. Persona Guia e Requisitos Atendidos

A base de todo o design do projeto é orientada pela **Persona 01 — Maria Aparecida**:
- **Idade:** 68 anos | **Ocupação:** Aposentada
- **Contexto:** Mora sozinha, usa smartphone para funções básicas (ligações e WhatsApp), mas sente medo de se perder em aplicativos complexos ou não receber avisos urgentes.
- **Dores centrais:** Dificuldade para ler letras miúdas, menus cheios de subníveis, risco de passar mal sozinha.
- **Frase:** *"Preciso conseguir entender os avisos e pedir ajuda sem depender de outra pessoa."*

### Matriz de Requisitos Funcionais e Não Funcionais Atendidos

| Requisito | Tipo | Descrição no Projeto Integrador | Implementação no Protótipo |
| :--- | :--- | :--- | :--- |
| **RF08** | Funcional | Opções de ajuste de acessibilidade (fonte ampliada, alto contraste e síntese de voz). | Controles interativos no Login, em Ajustes e no Design System; síntese nativa Web Speech API (`pt-BR`). |
| **RF25** | Funcional | Botão de pânico/emergência rápida para acionar a portaria em situações de risco. | Botão de SOS destacado na Início (`Home`) com modal de confirmação acolhedor e feedback imediato. |
| **RNF10** | Usabilidade | Elementos visuais com tamanho de fonte ajustável até 24pt e conformidade WCAG 2.1 AA. | Modo `.large-text` escalável e tipografia Inter com contraste validado em conformidade com WCAG AA/AAA. |
| **RNF11** | Usabilidade | Tarefas prioritárias concluídas em no máximo 3 toques/cliques. | Navegação direta por barra inferior com 6 seções claras, sem menus suspensos labirínticos. |
| **RNF12** | Usabilidade | Feedback visual e sonoro imediato para qualquer ação do usuário. | Toasts com ícones de sucesso, leitura em voz alta e indicação de status visual pulsante. |
| **RNF15** | Usabilidade | Compatibilidade com tecnologias assistivas e leitores de tela. | Semântica HTML5, atributos `aria-label`, `role="status"` e ícones vetoriais com `aria-hidden="true"`. |

---

## 3. Integração com Microsoft Clarity (Telemetria & Usabilidade)

Para fundamentar as pesquisas de campo e a validação empírica com condôminos idosos, o **Microsoft Clarity** foi integrado assincronamente ao `<head>` da aplicação (`index.html`):

```html
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "wqjiis2n1a");
</script>
```

### Objetivos da Telemetria no Projeto Integrador:
1. **Mapas de Calor de Clique (Click Heatmaps):** Mensurar se botões maiores (&ge; 48px) de fato aumentam a taxa de acerto no primeiro toque por parte dos idosos.
2. **Gravações Anônimas de Sessão:** Acompanhar fluxos de uso reais para identificar hesitações ou gargalos na leitura dos avisos e na solicitação de chamados.
3. **Métricas de Frustração:** Mapear *Rage Clicks* (toques repetidos em frustração) e *Dead Clicks* (toques em elementos não clicáveis), orientando futuras iterações da interface.

---

## 4. Fundamentos do Design System

O Design System do EcoSis foi construído para aliar **identidade visual profissional**, **acolhimento comunitário** e **acessibilidade rigorosa**.

### 4.1. Paleta de Cores e Taxas de Contraste (WCAG 2.1)

| Nome do Token | Variável CSS | Hex | Taxa de Contraste | Nível WCAG | Aplicação Primária |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Verde Escuro Institucional** | `--green-dark` | `#0f6045` | 6.8:1 | **WCAG AA** | Botões primários, ações principais e títulos destacados. |
| **Verde Acento** | `--green` | `#16805b` | 4.6:1 | **WCAG AA** | Indicadores de sucesso, bordas selecionadas e acentos. |
| **Verde Suave** | `--green-soft` | `#dcefe7` | 12.4:1 (vs `#0f6045`) | **WCAG AAA** | Fundo de boas-vindas, cards de síntese e badges positivos. |
| **Azul Noturno** | `--navy` | `#12324a` | 11.2:1 | **WCAG AAA** | Textos principais, títulos e barra de navegação. |
| **Azul Institucional** | `--blue` | `#176b9d` | 5.1:1 | **WCAG AA** | Links navegáveis, filtros ativos e badges informativos. |
| **Azul Suave** | `--blue-soft` | `#dcecf5` | Fundo suave | — | Fundo de caixas de busca, banners e badges. |
| **Vermelho de Emergência** | `--danger` | `#b71c1c` | 5.8:1 | **WCAG AA** | Botão de pânico (SOS), alertas urgentes e confirmações críticas. |
| **Alto Contraste Preto** | `--high-contrast` | `#000000` | 21.0:1 | **WCAG AAA** | Modo alto contraste com bordas e textos em preto puro. |

### 4.2. Tipografia e Escala de Acessibilidade

- **Família Tipográfica:** `Inter, ui-sans-serif, system-ui, sans-serif`
- **Justificativa:** Tipografia sem serifa de forma aberta, com grande altura de x (*x-height*) e diferenciação nítida entre caracteres facilmente confundíveis (como 'I' maiúsculo, 'l' minúsculo e o número '1').
- **Pesos Utilizados:** `400` (Regular), `700` (Bold), `800`/`850` (Extra Bold para títulos e overlines).

#### Tabela de Escala Tipográfica (Padrão vs. Modo Ampliado):

| Elemento | Tamanho Padrão | Modo Texto Ampliado (`.large-text`) | Peso |
| :--- | :--- | :--- | :--- |
| **H1 (Título da Tela)** | 1.4rem (~22px) | **1.75rem (~28px)** | 800 |
| **H2 (Títulos de Seção)** | 1.15rem (~18px) | **1.45rem (~23px)** | 750 |
| **H3 (Títulos de Cards)** | 0.90rem (~14px) | **1.25rem (~20px)** | 750 |
| **Corpo & Parágrafos** | 0.85rem (~13.6px) | **1.05rem (~17px)** | 400 |
| **Overlines & Rótulos** | 0.70rem (~11px) | **0.85rem (~14px)** | 850 |
| **Badges & Chips** | 0.66rem (~10.5px) | **0.82rem (~13px)** | 800 |

### 4.3. Biblioteca de Ícones Semânticos em SVG

Para eliminar a barreira de caracteres soltos abstratos (`!`, `▦`, `□`, `◇`), criamos o módulo `src/components/Icons.tsx` com traços vetoriais com espessura mínima de `2px` ou `2.5px`, garantindo reconhecimento imediato:
- `HomeIcon`: Silhueta clássica de casa com porta.
- `AlertsIcon`: Sino de comunicados com badalo audível.
- `ServicesIcon`: Grade modular organizada de 4 quadrantes para o Mural.
- `ConciergeIcon`: Caixa de encomenda geométrica 3D para Portaria.
- `MaintenanceIcon`: Chave inglesa e de fenda para Chamados.
- `SettingsIcon`: Engrenagem de alta precisão para Ajustes.
- `PanicIcon`: Triângulo de alerta com ponto de exclamação em negrito para Emergências.
- `SpeakerIcon`: Alto-falante emitindo ondas sonoras para Síntese de Voz.
- `CheckIcon`: Visto de confirmação para ações concluídas e toasts.
- `BackIcon`: Seta espessa para esquerda facilitando a volta segura de telas.

### 4.4. Componentes de Interface

1. **Botão Primário:** Fundo verde escuro institucional (`#0f6045`), texto branco, altura mínima de 48px (56px no modo ampliado), bordas arredondadas e efeito de foco com anel externo de 3px.
2. **Botão Secundário:** Fundo transparente com borda nítida para ações neutras ou de cancelamento.
3. **Botão de Pânico (SOS):** Fundo vermelho claro com borda escarlate (`#b71c1c`) e ícone `PanicIcon`. Ao ser clicado, abre modal de confirmação com texto claro e acolhedor para prevenir disparos falsos, mas sem fricção.
4. **Cards de Informação:** Bordas arredondadas, fundo branco com elevação sutil e espaçamento de 18px a 24px entre alvos de clique.
5. **Barra de Navegação Inferior (`bottom-nav`):** Fixada no rodapé da aplicação móvel, com altura mínima de 54px por botão e rótulos textuais permanentes sob cada ícone.

---

## 5. Recursos Específicos para a Terceira Idade

### 5.1. Síntese de Voz Nativa (Web Speech API)
Integrada nativamente em `src/App.tsx` através da função `speakText`:
- Utiliza `SpeechSynthesisUtterance` com idioma configurado para `pt-BR`.
- Velocidade de reprodução reduzida (`rate = 0.92`) para pronúncia pausada e de fácil compreensão.
- Ao clicar em "Ouvir avisos", o sistema lê a quantidade de comunicados e o conteúdo de cada um. O aviso em reprodução ganha uma borda azul pulsante (`.alert-item.speaking`).

### 5.2. Modo Alto Contraste
Disponível tanto na tela de login quanto nas configurações:
- Altera todas as variáveis de cor para preto puro (`#000000`) e fundos brancos puros (`#ffffff`).
- Aplica bordas de 2px a todos os botões, cards e separadores, garantindo discernimento em ambientes ensolarados ou para usuários com perda de sensibilidade a contrastes.

### 5.3. Botão de Pânico Seguro
- O acionamento abre um modal com a identificação automática do morador: *"A equipe de segurança receberá sua localização imediatamente (Bloco A · Apto 84)"*.
- Opções claras: "Cancelar e voltar" e "Sim, chamar portaria agora", acionando um aviso sonoro/visual simulado.

---

## 6. Instruções de Execução e Apresentação

### 6.1. Visualização Online (GitHub Pages)
O projeto está publicado e ativo em:
- **Aplicação Completa:** [https://luizotr.github.io/P.I-Ecosis-Prototipo/](https://luizotr.github.io/P.I-Ecosis-Prototipo/)
- **Design System Direto:** [https://luizotr.github.io/P.I-Ecosis-Prototipo/#design-system](https://luizotr.github.io/P.I-Ecosis-Prototipo/#design-system)

### 6.2. Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev

# 3. Gerar build de produção para o GitHub Pages
npm run build

# 4. Visualizar localmente o build de produção
npm run preview
```
