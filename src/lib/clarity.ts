/**
 * Integração com o Microsoft Clarity.
 *
 * O carregador fica em `index.html`, dentro do `<head>`, de propósito: ele
 * precisa continuar rodando mesmo quando o bundle do React quebra. Foi
 * exatamente o cenário da tela em branco — com o script no HTML, a gravação
 * sobrevive ao erro e mostra o que o usuário viu.
 *
 * Este módulo é só a camada de API: identificação de usuário e sessão, telas,
 * eventos, tags e diagnóstico de bloqueio.
 *
 * Referências:
 * - API do cliente: https://learn.microsoft.com/clarity/setup-and-installation/clarity-api
 * - Identify: https://learn.microsoft.com/clarity/setup-and-installation/identify-api
 * - Dados coletados: https://learn.microsoft.com/clarity/setup-and-installation/clarity-data
 */

type ClarityFn = (...args: unknown[]) => unknown

export type ClarityStatus = "pending" | "loaded" | "blocked" | "unavailable"

declare global {
  interface Window {
    clarity?: ClarityFn
    __ECOSIS_CLARITY__?: {
      status: ClarityStatus
      checkedAt: string
      userId: string
      sessionId: string
      version: string | null
    }
  }
}

/**
 * ID do projeto Clarity. É o mesmo valor passado ao carregador em
 * `index.html` — se trocar um, troque o outro. O workflow de deploy falha
 * quando os dois divergem.
 */
export const CLARITY_PROJECT_ID = "zdl7ay26wo"

const USER_KEY = "ecosis_clarity_uid"
const SESSION_KEY = "ecosis_clarity_sid"
const MAX_TAG_LENGTH = 200

let cachedUserId: string | null = null
let cachedSessionId: string | null = null
let errorTrackingInstalled = false

const diagnostics: string[] = []

/** Linha extra no badge de ?clarity-debug (ex.: status do GA4). */
export function addDiagnosticLine(line: string): void {
  diagnostics.push(line)
}

function randomId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch {
    // contexto sem crypto (http, navegador antigo): cai no fallback
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function readOrCreate(store: () => Storage | null, key: string): string {
  try {
    const storage = store()
    const existing = storage?.getItem(key)
    if (existing) return existing
    const created = randomId()
    storage?.setItem(key, created)
    return created
  } catch {
    // modo privado ou storage bloqueado: identificador só em memória
    return randomId()
  }
}

function localStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

function sessionStore(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Identificador anônimo e estável do navegador (`custom-id`) e da aba
 * (`custom-session-id`). Permite ao Clarity juntar o mesmo visitante entre
 * visitas e entre dispositivos, em vez de contar cada acesso como um usuário
 * novo.
 */
export function getClarityIds(): { userId: string; sessionId: string } {
  if (!cachedUserId) cachedUserId = readOrCreate(localStore, USER_KEY)
  if (!cachedSessionId) cachedSessionId = readOrCreate(sessionStore, SESSION_KEY)
  return { userId: cachedUserId, sessionId: cachedSessionId }
}

/** O stub existe sempre que o snippet inline rodou — inclusive com bloqueador ativo. */
export function hasClarityStub(): boolean {
  return typeof window !== "undefined" && typeof window.clarity === "function"
}

function callClarity(...args: unknown[]): void {
  if (!hasClarityStub()) return
  try {
    window.clarity!(...args)
  } catch {
    // a instrumentação nunca deve derrubar o app
  }
}

function truncate(value: unknown): string {
  const text = typeof value === "string" ? value : String(value)
  const flat = text.replace(/\s+/g, " ").trim()
  return flat.length > MAX_TAG_LENGTH ? `${flat.slice(0, MAX_TAG_LENGTH)}…` : flat
}

/** Tag de sessão, filtrável no dashboard. */
export function setTag(key: string, value: string | string[]): void {
  if (Array.isArray(value)) {
    callClarity("set", key, value.map(truncate))
    return
  }
  callClarity("set", key, truncate(value))
}

/** Evento nomeado; aparece junto dos smart events, em filtros e gravações. */
export function trackEvent(name: string): void {
  callClarity("event", name)
}

/** Prioriza a gravação da sessão quando o volume diário estoura o limite. */
export function upgradeSession(reason: string): void {
  callClarity("upgrade", truncate(reason))
}

/**
 * Registra a troca de tela. Como o protótipo não muda a URL, é este o único
 * sinal que separa uma tela da outra no Clarity.
 */
export function trackScreen(screen: string, label: string): void {
  const { userId, sessionId } = getClarityIds()
  callClarity("identify", userId, sessionId, screen)
  setTag("screen", screen)
  setTag("screen_label", label)
  trackEvent(`screen_view_${screen}`)
}

/**
 * Consentimento explícito (LGPD/GDPR) para projetos configurados em Consent
 * Mode. Só chame depois de uma escolha real do usuário — sinalizar
 * consentimento sem banner é violação de conformidade, não otimização de
 * coleta.
 */
export function grantConsent(): void {
  callClarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" })
  callClarity("consent", true)
}

export function revokeConsent(): void {
  callClarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" })
  callClarity("consent", false)
}

type ClarityProbe = ClarityFn & { v?: unknown }

/**
 * Diagnóstico de bloqueio.
 *
 * O stub de fila existe mesmo com bloqueador ativo, então `typeof
 * window.clarity === "function"` não diz nada sobre a coleta estar
 * funcionando. O sinal confiável é o que o script real instala ao carregar.
 *
 * Medido em navegador (Edge headless, projeto zdl7ay26wo):
 *   - script carregado     -> `window.clarity.v === "0.8.77"`, `identify` devolve Promise
 *   - requisição bloqueada -> `clarity.v === undefined`, `identify` devolve undefined
 *
 * O Resource Timing NÃO serve como detector: a entrada `clarity.ms/tag/...`
 * aparece em `performance.getEntriesByType("resource")` mesmo quando a
 * requisição falha, o que geraria falso positivo de "gravando".
 */

/** Versão instalada pelo script real; `null` quando só o stub está presente. */
export function getClarityVersion(): string | null {
  if (!hasClarityStub()) return null
  const version = (window.clarity as ClarityProbe).v
  return typeof version === "string" && version.length > 0 ? version : null
}

/** Segunda opinião para o caso de a versão mudar de forma. */
function probeIdentifyPromise(): boolean {
  try {
    const result = window.clarity!("identify", getClarityIds().userId)
    if (result && typeof (result as Promise<unknown>).then === "function") {
      void (result as Promise<unknown>).catch(() => undefined)
      return true
    }
  } catch {
    return false
  }
  return false
}

export function isClarityLoaded(): boolean {
  if (!hasClarityStub()) return false
  return getClarityVersion() !== null || probeIdentifyPromise()
}

export function checkClarityHealth(timeoutMs = 6000): Promise<ClarityStatus> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !hasClarityStub()) {
      resolve("unavailable")
      return
    }
    const startedAt = Date.now()
    const probe = () => {
      if (isClarityLoaded()) {
        resolve("loaded")
        return
      }
      if (Date.now() - startedAt >= timeoutMs) {
        resolve("blocked")
        return
      }
      window.setTimeout(probe, 300)
    }
    probe()
  })
}

function describeError(value: unknown): string {
  if (value instanceof Error) {
    return truncate(`${value.name}: ${value.message}`)
  }
  if (typeof value === "string") return truncate(value)
  try {
    return truncate(JSON.stringify(value))
  } catch {
    return "erro não serializável"
  }
}

/** Erros globais viram eventos — é o que denuncia tela em branco em produção. */
export function installGlobalErrorTracking(): void {
  if (errorTrackingInstalled || typeof window === "undefined") return
  errorTrackingInstalled = true

  window.addEventListener("error", (event: ErrorEvent) => {
    setTag("last_error", describeError(event.error ?? event.message))
    trackEvent("js_error")
  })

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    setTag("last_rejection", describeError(event.reason))
    trackEvent("unhandled_rejection")
  })
}

/** Usado pelo ErrorBoundary do React. */
export function trackFatalError(error: Error): void {
  setTag("last_error", describeError(error))
  trackEvent("react_error_boundary")
}

const STATUS_COPY: Record<ClarityStatus, string> = {
  pending: "verificando…",
  loaded: "gravando",
  blocked: "bloqueado",
  unavailable: "indisponível",
}

function renderDebugBadge(status: ClarityStatus): void {
  if (typeof document === "undefined") return
  const { userId, sessionId } = getClarityIds()
  const badge = document.createElement("div")
  badge.id = "ecosis-clarity-debug"
  badge.setAttribute("role", "status")
  badge.style.cssText = [
    "position:fixed",
    "left:12px",
    "bottom:12px",
    "z-index:2147483647",
    "padding:8px 12px",
    "border-radius:8px",
    "font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace",
    "color:#fff",
    "background:" +
      (status === "loaded" ? "#0f6045" : status === "blocked" ? "#b71c1c" : "#455a64"),
    "box-shadow:0 4px 16px rgba(0,0,0,.25)",
    "max-width:320px",
    "white-space:pre-wrap",
  ].join(";")
  badge.textContent = [
    `Clarity: ${STATUS_COPY[status]}`,
    `script: ${getClarityVersion() ?? "—"}`,
    `projeto: ${CLARITY_PROJECT_ID}`,
    `usuário: ${userId.slice(0, 8)}`,
    `sessão: ${sessionId.slice(0, 8)}`,
    status === "blocked"
      ? "Bloqueador de anúncios, ETP estrito ou DNS filtrado impedem a coleta neste navegador."
      : "",
    ...diagnostics,
  ]
    .filter(Boolean)
    .join("\n")
  document.body.appendChild(badge)
}

/**
 * Diagnóstico visível só sob demanda: abra a página com `?clarity-debug` para
 * confirmar, no navegador de um participante, se a gravação está ativa antes
 * de contar com os dados dele.
 */
export function installDebugBadge(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return
  let requested = false
  try {
    requested = new URL(window.location.href).searchParams.has("clarity-debug")
  } catch {
    requested = false
  }
  if (!requested) return

  const paint = () => {
    renderDebugBadge("pending")
    void checkClarityHealth().then((status) => {
      document.getElementById("ecosis-clarity-debug")?.remove()
      renderDebugBadge(status)
    })
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paint, { once: true })
  } else {
    paint()
  }
}

/** Chamado uma vez no bootstrap do app. */
export function bootstrapClarity(): void {
  if (typeof window === "undefined") return
  const { userId, sessionId } = getClarityIds()
  installGlobalErrorTracking()
  installDebugBadge()

  void checkClarityHealth().then((status) => {
    window.__ECOSIS_CLARITY__ = {
      status,
      checkedAt: new Date().toISOString(),
      userId,
      sessionId,
      version: getClarityVersion(),
    }
    if (status === "loaded") {
      console.info("[EcoSis] Clarity ativo — projeto %s", CLARITY_PROJECT_ID)
    } else if (status === "blocked") {
      console.warn(
        "[EcoSis] Clarity bloqueado neste navegador. A sessão deste usuário não será coletada. " +
          "Causas: extensão de bloqueio (uBlock/AdGuard), Brave Shields, Firefox com ETP estrito, " +
          "DNS filtrado (Pi-hole/NextDNS) ou proxy corporativo.",
      )
    }
  })
}
