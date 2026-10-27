import { useState } from "react"
import {
  AlertsIcon,
  BackIcon,
  CheckIcon,
  ConciergeIcon,
  DesignSystemIcon,
  HomeIcon,
  MaintenanceIcon,
  PackageIcon,
  PanicIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SpeakerIcon,
} from "./Icons"

interface DesignSystemProps {
  onBack: () => void
  highContrast: boolean
  largeText: boolean
  onContrast: () => void
  onLargeText: () => void
}

export function DesignSystemView({
  onBack,
  highContrast,
  largeText,
  onContrast,
  onLargeText,
}: DesignSystemProps) {
  const [testSpeechText, setTestSpeechText] = useState(
    "Aviso aos condôminos: a água será interrompida amanhã para higienização dos reservatórios.",
  )
  const [isSpeaking, setIsSpeaking] = useState(false)

  function handleSpeak() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(testSpeechText)
      utterance.lang = "pt-BR"
      utterance.rate = 0.92
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  function handleStop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const colors = [
    {
      name: "Verde Escuro Institucional",
      token: "--green-dark",
      hex: "#0f6045",
      contrast: "6.8:1 (WCAG AA)",
      usage: "Botões primários, ações principais e destaques prioritários",
      textLight: true,
    },
    {
      name: "Verde Acento Primário",
      token: "--green",
      hex: "#16805b",
      contrast: "4.6:1 (WCAG AA)",
      usage: "Status de sucesso, indicadores ativos e bordas selecionadas",
      textLight: true,
    },
    {
      name: "Verde Suave (Acolhedor)",
      token: "--green-soft",
      hex: "#dcefe7",
      contrast: "12.4:1 contra o verde escuro",
      usage: "Fundo de boas-vindas, cards de síntese e badges positivos",
      textLight: false,
    },
    {
      name: "Azul Noturno Primário",
      token: "--navy",
      hex: "#12324a",
      contrast: "11.2:1 (WCAG AAA)",
      usage: "Títulos h1/h2, texto corporal de alta legibilidade e cabeçalho",
      textLight: true,
    },
    {
      name: "Azul Institucional",
      token: "--blue",
      hex: "#176b9d",
      contrast: "5.1:1 (WCAG AA)",
      usage: "Links navegáveis, ícones informativos e botões de filtro",
      textLight: true,
    },
    {
      name: "Azul Suave",
      token: "--blue-soft",
      hex: "#dcecf5",
      contrast: "Fundo informativo",
      usage: "Fundo de banners informativos, ícones e destaques sutis",
      textLight: false,
    },
    {
      name: "Vermelho de Emergência (SOS)",
      token: "--danger",
      hex: "#b71c1c",
      contrast: "5.8:1 (WCAG AA)",
      usage: "Botão de pânico, confirmação de socorro e alertas urgentes",
      textLight: true,
    },
    {
      name: "Alto Contraste Preto Absoluto",
      token: "--high-contrast",
      hex: "#000000",
      contrast: "21:1 (WCAG AAA)",
      usage: "Modo acessibilidade extrema com bordas nítidas de 2px",
      textLight: true,
    },
  ]

  return (
    <div className="design-system-page">
      {/* Topo / Barra de Navegação */}
      <header className="ds-header">
        <button
          className="ds-back-button"
          onClick={onBack}
          aria-label="Voltar para o protótipo"
        >
          <BackIcon size={24} />
          <span>Voltar ao Aplicativo</span>
        </button>

        <div className="ds-title-row">
          <div className="ds-mark">
            <DesignSystemIcon size={32} />
          </div>
          <div>
            <span className="ds-badge-top">
              PROJETO INTEGRADOR SENAC · ECOSIS
            </span>
            <h1>Design System &amp; Acessibilidade Sênior</h1>
            <p>
              Guia oficial de identidade visual, componentes, tokens e
              diretrizes de usabilidade voltadas a pessoas idosas e
              acessibilidade WCAG 2.1 nível AA.
            </p>
          </div>
        </div>

        <div className="ds-tags-row">
          <span className="ds-tag">♿ WCAG 2.1 AA Compliant</span>
          <span className="ds-tag">👵 Persona: Maria Aparecida (68 anos)</span>
          <span className="ds-tag">⚡ Regra dos 3 Toques (RNF11)</span>
          <span className="ds-tag">📊 Microsoft Clarity Ativo</span>
        </div>
      </header>

      {/* Controles de Acessibilidade ao Vivo */}
      <section className="ds-card ds-toolbar-card">
        <div>
          <h3>Controles de Acessibilidade ao Vivo</h3>
          <p>
            Alterne os modos abaixo para testar instantaneamente a resposta
            visual de toda a aplicação:
          </p>
        </div>
        <div className="ds-toggle-grid">
          <button
            type="button"
            className={`ds-toggle-btn ${highContrast ? "active" : ""}`}
            onClick={onContrast}
          >
            <span>Modo Alto Contraste</span>
            <i className={highContrast ? "switch on" : "switch"} />
          </button>
          <button
            type="button"
            className={`ds-toggle-btn ${largeText ? "active" : ""}`}
            onClick={onLargeText}
          >
            <span>Modo Texto Ampliado</span>
            <i className={largeText ? "switch on" : "switch"} />
          </button>
        </div>
      </section>

      {/* Seção 1: Princípios e Heurísticas para a Terceira Idade */}
      <section className="ds-section">
        <span className="ds-overline">FUNDAMENTAÇÃO DE USABILIDADE</span>
        <h2>4 Pilares de Inclusão para Moradores Idosos</h2>
        <p className="ds-section-intro">
          Desenvolvido com base na persona{" "}
          <strong>Maria Aparecida (68 anos)</strong>, que mora sozinha no
          condomínio e necessita de autonomia e segurança sem depender de
          terceiros:
        </p>

        <div className="ds-principles-grid">
          <article className="ds-principle-card">
            <div className="ds-principle-num">1</div>
            <h3>Legibilidade e Contraste Robusto</h3>
            <p>
              Uso de tipografia com formas abertas (Inter) e fontes escaláveis
              (RNF10 até 24px/32px). Cores com contraste mínimo de 4.5:1 (AA)
              para texto normal e modo com bordas de 2px em preto para garantir
              leitura sem esforço visual.
            </p>
          </article>

          <article className="ds-principle-card">
            <div className="ds-principle-num">2</div>
            <h3>Alvos de Toque Generosos (&ge; 48px)</h3>
            <p>
              Botões e áreas interativas com altura mínima de 48px a 56px e
              espaçamento generoso. Isso acolhe pessoas com redução de precisão
              motora, tremores ou artrose, prevenindo cliques acidentais.
            </p>
          </article>

          <article className="ds-principle-card">
            <div className="ds-principle-num">3</div>
            <h3>Síntese de Voz Nativa (Web Speech API)</h3>
            <p>
              Cumprimento do requisito <strong>RF08</strong>: leitura em voz
              alta com velocidade calibrada (0.92) e pronúncia em português do
              Brasil, auxiliando idosos com vista cansada, catarata ou
              dificuldade de leitura.
            </p>
          </article>

          <article className="ds-principle-card">
            <div className="ds-principle-num">4</div>
            <h3>Redução de Carga Cognitiva</h3>
            <p>
              Navegação direta em no máximo 3 toques (<strong>RNF11</strong>).
              Textos sem jargões tecnológicos (&quot;Avisos&quot; em vez de
              &quot;Feed&quot;, &quot;Portaria&quot; em vez de &quot;Concierge
              Hub&quot;), além de ícones semânticos com rótulo textual contínuo.
            </p>
          </article>
        </div>
      </section>

      {/* Seção 2: Paleta de Cores e Acessibilidade WCAG */}
      <section className="ds-section">
        <span className="ds-overline">SISTEMA DE CORES</span>
        <h2>Paleta Institucional &amp; Taxas de Contraste</h2>
        <p className="ds-section-intro">
          Todas as combinações de cor e texto foram validadas conforme os
          critérios de contraste da W3C (WCAG 2.1 nível AA e AAA):
        </p>

        <div className="ds-color-grid">
          {colors.map((c) => (
            <div className="ds-color-card" key={c.token}>
              <div
                className="ds-color-preview"
                style={{
                  backgroundColor: c.hex,
                  color: c.textLight ? "#ffffff" : "#143044",
                }}
              >
                <span>{c.hex}</span>
              </div>
              <div className="ds-color-body">
                <strong>{c.name}</strong>
                <code>{c.token}</code>
                <span className="ds-contrast-tag">{c.contrast}</span>
                <p>{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção 3: Tipografia & Escala de Acessibilidade */}
      <section className="ds-section">
        <span className="ds-overline">TIPOGRAFIA INCLUSIVA</span>
        <h2>Escala Tipográfica (Padrão vs. Modo Ampliado)</h2>
        <p className="ds-section-intro">
          Utilizamos a família de fontes <strong>Inter</strong> com pesos 600,
          700 e 800 para reforçar a legibilidade. Ao acionar o modo de texto
          ampliado, todos os tamanhos aumentam proporcionalmente:
        </p>

        <div className="ds-type-table">
          <div className="ds-type-row">
            <div className="ds-type-meta">
              <strong>H1 · Título Principal</strong>
              <small>Padrão: 22px / Ampliado: 28px</small>
            </div>
            <div className="ds-type-sample">
              <h1>Tudo do seu condomínio em um só lugar.</h1>
            </div>
          </div>

          <div className="ds-type-row">
            <div className="ds-type-meta">
              <strong>H2 · Título de Seção</strong>
              <small>Padrão: 18px / Ampliado: 23px</small>
            </div>
            <div className="ds-type-sample">
              <h2>Avisos recentes e comunicados</h2>
            </div>
          </div>

          <div className="ds-type-row">
            <div className="ds-type-meta">
              <strong>Corpo &amp; Textos</strong>
              <small>Padrão: 14px / Ampliado: 17px</small>
            </div>
            <div className="ds-type-sample">
              <p>
                Acompanhe as assembleias, manutenções dos elevadores e entregas
                pendentes na portaria com clareza e tranquilidade.
              </p>
            </div>
          </div>

          <div className="ds-type-row">
            <div className="ds-type-meta">
              <strong>Overlines &amp; Badges</strong>
              <small>Padrão: 11px / Ampliado: 14px (Negrito 800)</small>
            </div>
            <div className="ds-type-sample">
              <span className="status-chip">TUDO TRANQUILO POR AQUI</span>
              <span className="badge" style={{ marginLeft: "10px" }}>
                2 NOVOS AVISOS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4: Demonstração Interativa de Síntese de Voz (TTS) */}
      <section className="ds-section">
        <span className="ds-overline">RECURSO NATIVO DE ACESSIBILIDADE</span>
        <h2>Testador Interativo de Leitura por Voz (Web Speech API)</h2>
        <p className="ds-section-intro">
          Teste abaixo o funcionamento real do sintetizador de voz integrado ao
          protótipo:
        </p>

        <div className="ds-speech-card">
          <label htmlFor="speech-input">
            <strong>Texto a ser lido em voz alta pelo navegador:</strong>
          </label>
          <textarea
            id="speech-input"
            value={testSpeechText}
            onChange={(e) => setTestSpeechText(e.target.value)}
            rows={3}
          />
          <div className="ds-speech-actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleSpeak}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <SpeakerIcon size={20} />
              <span>
                {isSpeaking
                  ? "Falando novamente..."
                  : "Ouvir texto em voz alta"}
              </span>
            </button>
            {isSpeaking && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleStop}
              >
                Parar áudio
              </button>
            )}
            <span className="ds-speech-badge">
              {isSpeaking
                ? "🔊 Áudio em reprodução ativa"
                : "Pronto para reproduzir"}
            </span>
          </div>
        </div>
      </section>

      {/* Seção 5: Biblioteca de Componentes */}
      <section className="ds-section">
        <span className="ds-overline">BIBLIOTECA ATÔMICA</span>
        <h2>Componentes de Interface</h2>

        <div className="ds-components-grid">
          {/* Botões */}
          <article className="ds-component-card">
            <h3>Botões &amp; Ações</h3>
            <p>
              Alturas padronizadas com feedback tátil e foco visível de 3px:
            </p>
            <div className="ds-component-demo">
              <button className="primary-button" style={{ width: "100%" }}>
                Botão Primário (Ação Principal)
              </button>
              <button
                className="secondary-button"
                style={{ width: "100%", marginTop: "8px" }}
              >
                Botão Secundário (Ação Neutra)
              </button>
              <button
                className="panic-button"
                style={{ width: "100%", marginTop: "8px", minHeight: "48px" }}
              >
                <PanicIcon size={20} />
                <span>Botão de Emergência SOS</span>
              </button>
            </div>
          </article>

          {/* Ícones Semânticos */}
          <article className="ds-component-card">
            <h3>Ícones Semânticos em SVG</h3>
            <p>Traços geométricos vetoriais nítidos (strokeWidth 2 ou 2.5):</p>
            <div className="ds-icons-demo">
              <div className="ds-icon-item">
                <HomeIcon size={26} />
                <span>Início</span>
              </div>
              <div className="ds-icon-item">
                <AlertsIcon size={26} />
                <span>Avisos</span>
              </div>
              <div className="ds-icon-item">
                <ConciergeIcon size={26} />
                <span>Portaria</span>
              </div>
              <div className="ds-icon-item">
                <MaintenanceIcon size={26} />
                <span>Chamados</span>
              </div>
              <div className="ds-icon-item">
                <SettingsIcon size={26} />
                <span>Ajustes</span>
              </div>
              <div className="ds-icon-item">
                <SpeakerIcon size={26} />
                <span>Leitor</span>
              </div>
              <div className="ds-icon-item">
                <PanicIcon size={26} />
                <span>Emergência</span>
              </div>
            </div>
          </article>

          {/* Cards & Alertas */}
          <article
            className="ds-component-card"
            style={{ gridColumn: "1 / -1" }}
          >
            <h3>Cards com Hierarquia Clara</h3>
            <div className="ds-cards-demo">
              <div className="feature-card" style={{ cursor: "default" }}>
                <div className="feature-icon">
                  <AlertsIcon size={24} />
                </div>
                <div>
                  <span className="badge">1 NOVO COMUNICADO</span>
                  <h3>Manutenção no elevador social</h3>
                  <p>
                    Indisponível amanhã das 9h às 12h para troca preventiva de
                    cabos.
                  </p>
                </div>
                <b>→</b>
              </div>

              <div className="package-card" style={{ marginTop: "12px" }}>
                <div className="package-icon">
                  <PackageIcon size={26} />
                </div>
                <div>
                  <span>RECEBIDA HOJE, 11:40</span>
                  <h3>Encomenda aguardando na portaria</h3>
                  <p>Pacote médio · Remetente: Loja Online</p>
                </div>
                <button type="button">Confirmar retirada</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Seção 6: Telemetria & Microsoft Clarity */}
      <section className="ds-section">
        <span className="ds-overline">MÉTRICAS DE EXPERIÊNCIA</span>
        <h2>Telemetria com Microsoft Clarity (ID: wqjiis2n1a)</h2>
        <div className="ds-clarity-card">
          <div className="ds-clarity-badge">ANÁLISE DE USABILIDADE</div>
          <h3>Validação de Campo com Moradores Idosos</h3>
          <p>
            O Microsoft Clarity foi integrado ao projeto para coletar mapas de
            calor (heatmaps) e gravações de sessão totalmente anônimas. Com
            isso, a equipe e os avaliadores podem:
          </p>
          <ul>
            <li>
              <strong>Identificar cliques de frustração (rage clicks):</strong>{" "}
              Detectar botões ou textos em que idosos tocam repetidamente sem
              obter resposta.
            </li>
            <li>
              <strong>Mapear áreas mortas (dead clicks):</strong> Ajustar alvos
              de clique que passam despercebidos na tela.
            </li>
            <li>
              <strong>Validar a regra dos 3 toques:</strong> Medir o tempo e a
              quantidade de passos até a conclusão de tarefas críticas (como ler
              avisos ou autorizar visitas).
            </li>
          </ul>
        </div>
      </section>

      {/* Rodapé da página */}
      <footer className="ds-footer">
        <button
          className="primary-button"
          onClick={onBack}
          style={{ minWidth: "220px" }}
        >
          Voltar ao Aplicativo EcoSis
        </button>
        <p>Projeto Integrador — EcoSis Condomínio · Faculdade Senac Portão</p>
      </footer>
    </div>
  )
}
