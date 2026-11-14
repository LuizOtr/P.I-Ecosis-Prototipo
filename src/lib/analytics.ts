/**
 * Camada única de telemetria.
 *
 * O resto do app importa daqui, nunca de `clarity.ts` direto. Assim, quando
 * uma tela ou ação nova é instrumentada, Clarity e Google Analytics recebem o
 * mesmo sinal — sem instrumentação duplicada e sem os dois divergirem.
 *
 * Google Analytics 4 usa gtag.js direto com o Measurement ID. Google Tag
 * Manager não é necessário neste projeto: é uma camada de gestão de tags, e
 * aqui não há time trocando tags sem passar pelo código.
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
 * Measurement ID do GA4 — o "G-" que aparece em GA4 › Administrador › Fluxos
 * de dados › (fluxo web) › ID da métrica.
 *
 * Enquanto estiver vazio, a integração fica inerte: nenhum script é baixado,
 * nenhuma requisição falha e nada aparece no console. Basta colar o ID aqui
 * para ativar.
 */
export const GA_MEASUREMENT_ID = ""

const GA_ID_PATTERN = /^G-[A-Z0-9]{6,}$/
const MAX_USER_PROPERTY_LENGTH = 36

let currentScreen = "desconhecida"

export function isGaConfigured(): boolean {
  return GA_ID_PATTERN.test(GA_MEASUREMENT_ID)
}

function gtag(...args: unknown[]): void {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return
  try {
    window.gtag(...args)
  } catch {
    // telemetria nunca derruba o app
  }
}

/**
 * Fila local enquanto o gtag.js não chega. Sem isso, os primeiros eventos
 * (justamente o page_view inicial) seriam perdidos na janela de carregamento.
 */
function ensureGtagStub(): void {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args)
    }
  }
}

function loadGtag(): void {
  if (typeof document === "undefined") return
  if (document.getElementById("ga4-gtag")) return
  const script = document.createElement("script")
  script.id = "ga4-gtag"
  script.async = true
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID
  document.head.appendChild(script)
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

  if (!isGaConfigured()) {
    addDiagnosticLine("ga4: não configurado")
    return
  }

  ensureGtagStub()
  loadGtag()
  gtag("js", new Date())
  // send_page_view: false porque cada tela emite seu próprio page_view.
  // Sem isso, a entrada inicial em "/" seria contada duas vezes.
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false })
  addDiagnosticLine("ga4: " + GA_MEASUREMENT_ID + " | hits " + String(window.dataLayer?.length ?? 0))
}

export function trackScreen(screen: string, label: string): void {
  currentScreen = screen
  clarityTrackScreen(screen, label)

  if (!isGaConfigured()) return
  const path = screenPath(screen)
  gtag("event", "page_view", {
    page_title: label,
    page_path: path,
    page_location: window.location.origin + path,
    screen,
  })
}

export function trackEvent(name: string): void {
  clarityTrackEvent(name)

  if (!isGaConfigured()) return
  gtag("event", name, { screen: currentScreen })
}

export function setTag(key: string, value: string | string[]): void {
  claritySetTag(key, value)

  if (!isGaConfigured()) return
  const flat = Array.isArray(value) ? value.join(",") : value
  gtag("set", "user_properties", { [key]: flat.slice(0, MAX_USER_PROPERTY_LENGTH) })
}

export function trackFatalError(error: Error): void {
  clarityTrackFatalError(error)

  if (!isGaConfigured()) return
  // Só o tipo do erro vai para o GA; a mensagem pode carregar dado do usuário.
  gtag("event", "react_error_boundary", { error_name: error.name })
}

export {
  CLARITY_PROJECT_ID,
  checkClarityHealth,
  getClarityIds,
  isClarityLoaded,
} from "./clarity"