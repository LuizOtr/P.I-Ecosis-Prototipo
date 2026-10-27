import React, { Component, ErrorInfo, ReactNode } from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("EcoSis ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#f4f7f6",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              width: "100%",
              background: "#ffffff",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fde8e8",
                color: "#b71c1c",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                marginBottom: "16px",
              }}
            >
              ⚠
            </div>
            <h1
              style={{
                fontSize: "20px",
                color: "#12324a",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Ops, algo deu errado
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#546e7a",
                lineHeight: 1.5,
                marginBottom: "20px",
              }}
            >
              Não se preocupe, seus dados estão seguros. Clique no botão abaixo
              para reiniciar o aplicativo.
            </p>
            {this.state.error?.message && (
              <pre
                style={{
                  background: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#b71c1c",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "20px",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                width: "100%",
                padding: "14px",
                background: "#0f6045",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Recarregar aplicativo
            </button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
