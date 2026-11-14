/**
 * Camada única de telemetria.
 *
 * O resto do app importa daqui, nunca de `clarity.ts` direto. Assim, quando
 * uma tela ou ação nova é instrumentada, Clarity e Google Analytics recebem o
 * mesmo sinal — sem instrumentação duplicada e sem os dois divergirem.
 *
 * Google Analytics entra por um contêiner do Google Tag Manager
 * (`GTM-PDBMKH29`). O carregador fica em `index.html`, junto do Clarity e pelo
 * mesmo motivo: precisa rodar mesmo quando o bundle React quebra.
 *
 * ATENÇÃO — o contêiner sozinho não coleta nada. Ele é um executor vazio: o
 * que envia dado para o GA4 são as tags configuradas dentro dele. Sem um
 * "Google tag" apontando para a propriedade do GA4, `gtm.js` carrega e não
 * registra nada. O passo a passo está no README.
 */

import {
  addDiagnosticLine,
  bootstrapClarity,
  setTag as claritySetTag,
  trackEvent as clarityTrackEvent,
  trackFatalError as clarityTrackFatalError,
  trackScreen as clarityTrackScreen,
} from "./clarity"

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Contêiner do Google Tag Manager. Precisa ser idêntico ao do snippet em
 * `index.html` — o workflow de deploy falha quando divergem.
 */
export const GTM_CONTAINER_ID = "GTM-PDBMKH29"

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,}$/
const MAX_USER_PROPERTY_LENGTH = 36

let currentScreen = "desconhecida"

export function isGtmConfigured(): boolean {
  return GTM_ID_PATTERN.test(GTM_CONTAINER_ID)
}

/**
 * Empurra um comando para o dataLayer. O contêiner lê daqui; se o gtm.js foi
 * bloqueado, os comandos ficam enfileirados sem lançar exceção e sem perder
 * o que foi registrado antes do bloqueio ser detectado.
 */
function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return
  ensureGtagStub()
  try {
    window.gtag!(...args)
  } catch {
    // telemetria nunca derruba o app
  }
}

/** O stub do snippet inline do index.html costuma bastar; aqui é rede de segurança. */
function ensureGtagStub(): void {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args)
    }
  }
}

/** Caminho virtual por tela: o protótipo não muda de URL de verdade. */
function screenPath(screen: string): string {
  if (typeof window === "undefined") return "/" + screen
  const base = window.location.pathname.endsWith("/")
    ? window.location.pathname
    : window.location.pathname + "/"
  return base + screen
}

export function initAnalytics(): void {
  bootstrapClarity()

  if (!isGtmConfigured()) {
    addDiagnosticLine("gtm: não configurado")
    return
  }

  ensureGtagStub()
  addDiagnosticLine(
    "gtm: " + GTM_CONTAINER_ID + " | fila " + String(window.dataLayer?.length ?? 0),
  )
}

export function trackScreen(screen: string, label: string): void {
  currentScreen = screen
  clarityTrackScreen(screen, label)

  if (!isGtmConfigured()) return
  const path = screenPath(screen)
  // Nome `page_view` de propósito: é o evento que o GA4 trata como visualização
  // de página, então uma tag de evento no contêiner já resolve o relatório de
  // páginas sem inventar métrica paralela.
  gtag("event", "page_view", {
    page_title: label,
    page_path: path,
    page_location: window.location.origin + path,
    screen,
  })
}

export function trackEvent(name: string): void {
  clarityTrackEvent(name)

  if (!isGtmConfigured()) return
  gtag("event", name, { screen: currentScreen })
}

export function setTag(key: string, value: string | string[]): void {
  claritySetTag(key, value)

  if (!isGtmConfigured()) return
  const flat = Array.isArray(value) ? value.join(",") : value
  gtag("set", "user_properties", { [key]: flat.slice(0, MAX_USER_PROPERTY_LENGTH) })
}

export function trackFatalError(error: Error): void {
  clarityTrackFatalError(error)

  if (!isGtmConfigured()) return
  // Só o tipo do erro vai para o GA; a mensagem pode carregar dado do usuário.
  gtag("event", "react_error_boundary", { error_name: error.name })
}

export {
  CLARITY_PROJECT_ID,
  checkClarityHealth,
  getClarityIds,
  isClarityLoaded,
} from "./clarity"