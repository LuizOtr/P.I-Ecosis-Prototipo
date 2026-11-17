#!/usr/bin/env python3
"""Gera as figuras e as tabelas formatadas do PI a partir de uma coleta do GA4.

    .venv-analytics/Scripts/python.exe analytics/gerar_figuras.py --run analytics/data/run-20261116-2100

Lê os CSVs gravados por `coletar_ga4.py`, escreve PNG (300 dpi) e um
`tabelas.md` com os números no padrão brasileiro (vírgula decimal).
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

RAIZ = Path(__file__).resolve().parent

# Paleta sóbria, legível em impressão P&B.
CINZA = "#4d4d4d"
VERDE = "#1f6f5c"
CLARO = "#c8d8d3"

plt.rcParams.update(
    {
        "font.size": 10,
        "axes.edgecolor": CINZA,
        "axes.labelcolor": "#222222",
        "axes.spines.top": False,
        "axes.spines.right": False,
        "figure.dpi": 300,
        "savefig.bbox": "tight",
    }
)


def ler(pasta: Path, prefixo: str):
    """Devolve (colunas, linhas) do CSV cujo nome começa com o prefixo."""
    for arq in sorted(pasta.glob(f"{prefixo}*.csv")):
        with arq.open(encoding="utf-8", newline="") as fh:
            leitor = list(csv.reader(fh, delimiter=";"))
        if leitor:
            return leitor[0], leitor[1:]
    return [], []


def numero(valor: str) -> float:
    try:
        return float(valor)
    except (TypeError, ValueError):
        return 0.0


def br(valor: float, casas: int = 0) -> str:
    """Formata 1234.5 como 1.234,5 (padrão brasileiro)."""
    texto = f"{valor:,.{casas}f}"
    return texto.replace(",", "\x00").replace(".", ",").replace("\x00", ".")


def rotulo_data(iso: str) -> str:
    try:
        return datetime.strptime(iso, "%Y%m%d").strftime("%d/%m")
    except ValueError:
        return iso


def figura_serie(pasta: Path, destino: Path) -> bool:
    cab, lin = ler(pasta, "02_por_dia")
    if not lin:
        return False
    i_dia = cab.index("date")
    i_usu = cab.index("activeUsers")
    i_ses = cab.index("sessions")
    lin.sort(key=lambda r: r[i_dia])
    dias = [rotulo_data(r[i_dia]) for r in lin]
    usuarios = [numero(r[i_usu]) for r in lin]
    sessoes = [numero(r[i_ses]) for r in lin]

    fig, ax = plt.subplots(figsize=(7, 3.2))
    ax.plot(dias, usuarios, marker="o", ms=3, color=VERDE, label="Usuários ativos")
    ax.plot(dias, sessoes, marker="s", ms=3, color=CINZA, ls="--", label="Sessões")
    ax.set_ylabel("Contagem")
    ax.grid(axis="y", color=CLARO, lw=0.8)
    ax.set_axisbelow(True)
    ax.legend(frameon=False, fontsize=9)
    if len(dias) > 12:
        passo = max(1, len(dias) // 10)
        ax.set_xticks(range(0, len(dias), passo))
    fig.autofmt_xdate(rotation=45)
    fig.savefig(destino / "fig_uso_por_dia.png")
    plt.close(fig)
    return True


def figura_barras(pasta: Path, prefixo: str, coluna: str, metrica: str, titulo: str,
                  destino: Path, nome: str, limite: int = 8, horizontal=True) -> bool:
    cab, lin = ler(pasta, prefixo)
    if not lin or metrica not in cab:
        return False
    i_col = cab.index(coluna)
    i_met = cab.index(metrica)
    lin.sort(key=lambda r: -numero(r[i_met]))
    lin = lin[:limite]
    rotulos = [r[i_col] or "(não definido)" for r in lin]
    valores = [numero(r[i_met]) for r in lin]

    if horizontal:
        fig, ax = plt.subplots(figsize=(6.5, 0.45 * len(rotulos) + 1.6))
        ax.barh(rotulos[::-1], valores[::-1], color=VERDE)
        ax.set_xlabel(titulo)
        ax.grid(axis="x", color=CLARO, lw=0.8)
    else:
        fig, ax = plt.subplots(figsize=(6.5, 3.2))
        ax.bar(rotulos, valores, color=VERDE)
        ax.set_ylabel(titulo)
        ax.grid(axis="y", color=CLARO, lw=0.8)
        plt.setp(ax.get_xticklabels(), rotation=30, ha="right")
    ax.set_axisbelow(True)
    fig.savefig(destino / f"{nome}.png")
    plt.close(fig)
    return True


def tabela_totais(pasta: Path) -> str:
    cab, lin = ler(pasta, "01_totais")
    if not lin:
        return "_Coleta sem relatório de totais._"
    r = lin[0]
    rotulos = {
        "activeUsers": "Usuários ativos",
        "newUsers": "Novos usuários",
        "sessions": "Sessões",
        "engagedSessions": "Sessões engajadas",
        "engagementRate": "Taxa de engajamento",
        "averageSessionDuration": "Duração média da sessão (s)",
        "screenPageViews": "Visualizações",
        "eventCount": "Eventos",
        "bounceRate": "Taxa de rejeição",
    }
    linhas = ["| Métrica | Valor |", "|---|---|"]
    for chave, texto in rotulos.items():
        if chave not in cab:
            continue
        valor = numero(r[cab.index(chave)])
        if "Rate" in chave:
            linhas.append(f"| {texto} | {br(valor * 100, 1)}% |")
        elif chave == "averageSessionDuration":
            m, s = divmod(int(valor), 60)
            linhas.append(f"| {texto} | {m} min {s} s |")
        else:
            linhas.append(f"| {texto} | {br(valor)} |")
    return "\n".join(linhas)


def tabela_eventos(pasta: Path) -> str:
    cab, lin = ler(pasta, "07_eventos")
    if not lin:
        return "_Sem relatório de eventos._"
    i_nome, i_qtd = cab.index("eventName"), cab.index("eventCount")
    i_usr = cab.index("totalUsers") if "totalUsers" in cab else None
    lin.sort(key=lambda r: -numero(r[i_qtd]))
    out = ["| Evento | Ocorrências | Usuários |", "|---|---|---|"]
    for r in lin[:15]:
        usuarios = br(numero(r[i_usr])) if i_usr is not None else "—"
        out.append(f"| `{r[i_nome]}` | {br(numero(r[i_qtd]))} | {usuarios} |")
    return "\n".join(out)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--run", required=True, help="pasta de uma coleta (analytics/data/run-*)")
    ap.add_argument("--saida", default=None)
    args = ap.parse_args()

    pasta = Path(args.run)
    if not pasta.is_dir():
        raise SystemExit(f"[erro] pasta inexistente: {pasta}")
    destino = Path(args.saida) if args.saida else pasta / "figuras"
    destino.mkdir(parents=True, exist_ok=True)

    feitas = []
    if figura_serie(pasta, destino):
        feitas.append("fig_uso_por_dia.png")
    feitas += [
        n for n, ok in [
            ("fig_dispositivos.png", figura_barras(pasta, "03_dispositivos", "deviceCategory", "sessions",
                                                   "Sessões por dispositivo", destino, "fig_dispositivos", horizontal=False)),
            ("fig_eventos.png", figura_barras(pasta, "07_eventos", "eventName", "eventCount",
                                              "Ocorrências do evento", destino, "fig_eventos")),
            ("fig_telas.png", figura_barras(pasta, "09_telas_custom", "customEvent:screen", "eventCount",
                                            "Visualizações da tela", destino, "fig_telas")),
            ("fig_aquisicao.png", figura_barras(pasta, "05_aquisicao", "sessionDefaultChannelGroup", "sessions",
                                                "Sessões por canal", destino, "fig_aquisicao", horizontal=False)),
        ] if ok
    ]

    texto = [
        "# Resultados — tabelas geradas",
        "",
        f"Coleta: `{pasta.name}`",
        "",
        "## Visão geral do período",
        "",
        tabela_totais(pasta),
        "",
        "## Eventos registrados",
        "",
        tabela_eventos(pasta),
        "",
        "## Figuras",
        "",
        *[f"- `{n}`" for n in feitas],
        "",
    ]
    (destino / "tabelas.md").write_text("\n".join(texto), encoding="utf-8")
    print(f"figuras em {destino}: {', '.join(feitas) if feitas else 'nenhuma'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())