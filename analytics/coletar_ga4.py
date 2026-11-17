#!/usr/bin/env python3
"""Coleta as métricas do GA4 que sustentam a avaliação do EcoSis.

Uso típico:

    .venv-analytics/Scripts/python.exe analytics/coletar_ga4.py --dias 28

Autenticação (uma das duas):

    --key analytics/ga4-key.json
    variável de ambiente GOOGLE_APPLICATION_CREDENTIALS

O service account precisa ser Viewer na propriedade do GA4. O número 564336568
que aparece na URL do dashboard é o ID da propriedade; a API recebe só esse
número, sem o prefixo "properties/".

Saída: analytics/data/run-<timestamp>/, com um CSV e um JSON por relatório,
além de resumo.md pronto para colar no Obsidian.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    Cohort,
    CohortSpec,
    CohortsRange,
    DateRange,
    Dimension,
    Filter,
    FilterExpression,
    Metric,
    OrderBy,
    RunReportRequest,
)
from google.oauth2 import service_account

RAIZ = Path(__file__).resolve().parent
PROPRIEDADE_PADRAO = os.environ.get("GA4_PROPERTY_ID", "564336568")
ESCOPO = ["https://www.googleapis.com/auth/analytics.readonly"]

# Métricas de engajamento usadas na seção de resultados. Os nomes seguem a
# nomenclatura da API (Data API v1beta), não os rótulos em português do painel.
METRICAS_BASE = [
    "activeUsers",
    "newUsers",
    "totalUsers",
    "sessions",
    "engagedSessions",
    "engagementRate",
    "averageSessionDuration",
    "userEngagementDuration",
    "screenPageViews",
    "eventCount",
    "bounceRate",
]


def criar_cliente(caminho_chave: str | None) -> BetaAnalyticsDataClient:
    caminho = caminho_chave or os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if caminho:
        p = Path(caminho).expanduser()
        if not p.is_file():
            sys.exit(f"[erro] chave não encontrada: {p}")
        return BetaAnalyticsDataClient(
            credentials=service_account.Credentials.from_service_account_file(
                str(p), scopes=ESCOPO
            )
        )
    # Sem chave explícita, tenta o Application Default Credentials.
    try:
        return BetaAnalyticsDataClient()
    except Exception as exc:  # noqa: BLE001 - mensagem precisa chegar ao usuário
        sys.exit(
            "[erro] sem credencial do Google.\n"
            "       passe --key caminho/ga4-key.json ou defina GOOGLE_APPLICATION_CREDENTIALS.\n"
            f"       detalhe: {exc}"
        )


def executar(cliente, propriedade: str, nome: str, dimensoes, metricas, inicio, fim,
             limite=100, ordem: str | None = None, filtro: FilterExpression | None = None,
             desc=True):
    """Roda um relatório e devolve (cabeçalho, linhas)."""
    req = RunReportRequest(
        property=f"properties/{propriedade}",
        dimensions=[Dimension(name=d) for d in dimensoes],
        metrics=[Metric(name=m) for m in metricas],
        date_ranges=[DateRange(start_date=inicio, end_date=fim)],
        limit=limite,
    )
    if ordem:
        req.order_bys = [
            OrderBy(metric=OrderBy.MetricOrderBy(metric_name=ordem), desc=desc)
        ]
    if filtro is not None:
        req.dimension_filter = filtro
    resp = cliente.run_report(req)
    cabecalho = [d.name for d in dimensoes] + [m.name for m in metricas]
    linhas = [
        [v.value for v in linha.dimension_values] + [v.value for v in linha.metric_values]
        for linha in resp.rows
    ]
    print(f"  {nome}: {len(linhas)} linha(s)")
    return cabecalho, linhas, resp


def salvar(pasta: Path, indice: int, nome: str, cabecalho, linhas):
    base = f"{indice:02d}_{nome}"
    with (pasta / f"{base}.csv").open("w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh, delimiter=";")  # ';' abre direto no Excel em pt-BR
        w.writerow(cabecalho)
        w.writerows(linhas)
    (pasta / f"{base}.json").write_text(
        json.dumps({"colunas": cabecalho, "linhas": linhas}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return base


def tabela_md(cabecalho, linhas, limite=15) -> str:
    cab = "| " + " | ".join(cabecalho) + " |"
    sep = "|" + "|".join(["---"] * len(cabecalho)) + "|"
    corpo = ["| " + " | ".join(l) + " |" for l in linhas[:limite]]
    extra = ""
    if len(linhas) > limite:
        extra = f"\n\n*({len(linhas) - limite} linha(s) omitida(s); ver CSV correspondente.)*"
    return "\n".join([cab, sep, *corpo]) + extra


def coleta_retencao(cliente, propriedade: str, inicio: str, fim: str):
    """Retenção por coorte semanal: quantos voltam depois da primeira visita."""
    req = RunReportRequest(
        property=f"properties/{propriedade}",
        metrics=[Metric(name="cohortActiveUsers"), Metric(name="cohortTotalUsers")],
        cohort_spec=CohortSpec(
            cohorts=[
                # Janela curta o bastante para um protótipo acadêmico: 4 coortes.
                Cohort(dimension="firstSessionDate", date_range=DateRange(start_date=inicio, end_date=fim))
            ],
            cohorts_range=CohortsRange(granularity=CohortsRange.Granularity.WEEKLY, end_offset=5),
        ),
    )
    resp = cliente.run_cohort_report(req)
    cabecalho = ["cohort", "cohortActiveUsers", "cohortTotalUsers"]
    linhas: list[list[str]] = []
    for linha in resp.rows:
        dim = linha.dimension_values[0].value if linha.dimension_values else ""
        met = [v.value for v in linha.metric_values]
        linhas.append([dim, *met])
    return cabecalho, linhas


def main() -> int:
    ap = argparse.ArgumentParser(description="Coleta métricas do GA4 para o PI do EcoSis.")
    ap.add_argument("--property", default=PROPRIEDADE_PADRAO, help="ID numérico da propriedade GA4")
    ap.add_argument("--key", default=None, help="JSON do service account")
    ap.add_argument("--dias", type=int, default=28, help="janela em dias terminando ontem")
    ap.add_argument("--inicio", default=None, help="YYYY-MM-DD (sobrepõe --dias)")
    ap.add_argument("--fim", default=None, help="YYYY-MM-DD")
    ap.add_argument("--saida", default=None, help="pasta de saída")
    args = ap.parse_args()

    fim = args.fim or (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    if args.inicio:
        inicio = args.inicio
    else:
        inicio = (datetime.strptime(fim, "%Y-%m-%d") - timedelta(days=args.dias - 1)).strftime("%Y-%m-%d")

    carimbo = datetime.now().strftime("%Y%m%d-%H%M%S")
    pasta = Path(args.saida) if args.saida else RAIZ / "data" / f"run-{carimbo}"
    pasta.mkdir(parents=True, exist_ok=True)

    print(f"propriedade {args.property} | {inicio} → {fim}")
    cliente = criar_cliente(args.key)
    blocos: list[tuple[str, str, list[str], list[list[str]]]] = []

    plano = [
        ("totais", [], METRICAS_BASE, None),
        ("por_dia", ["date"], METRICAS_BASE, "activeUsers"),
        ("dispositivos", ["deviceCategory"], METRICAS_BASE, "sessions"),
        ("plataformas", ["operatingSystem", "browser"], ["sessions", "activeUsers", "engagementRate"], "sessions"),
        ("aquisicao", ["sessionDefaultChannelGroup", "sessionSource", "sessionMedium"], ["sessions", "activeUsers", "engagedSessions"], "sessions"),
        ("geografia", ["region", "city"], ["activeUsers", "sessions"], "activeUsers"),
        ("eventos", ["eventName"], ["eventCount", "totalUsers", "sessions"], "eventCount"),
        ("paginas", ["pagePath", "pageTitle"], ["screenPageViews", "activeUsers", "engagementRate"], "screenPageViews"),
        ("telas_custom", ["customEvent:screen"], ["eventCount", "totalUsers"], "eventCount"),
    ]

    for i, (nome, dims, mets, ordem) in enumerate(plano, start=1):
        try:
            cab, lin, _ = executar(cliente, args.property, nome, dims, mets, inicio, fim, ordem=ordem)
        except Exception as exc:  # noqa: BLE001
            print(f"  [aviso] {nome} falhou: {str(exc).splitlines()[0][:180]}")
            if nome == "telas_custom":
                print("         (crie a dimensão personalizada 'screen', escopo evento, "
                      "apontando para o parâmetro 'screen', em Admin → Definições personalizadas)")
            continue
        base = salvar(pasta, i, nome, cab, lin)
        blocos.append((nome, base, cab, lin))

    # Retenção é um endpoint distinto; falha sozinha não derruba a coleta.
    try:
        cab, lin = coleta_retencao(cliente, args.property, inicio, fim)
        base = salvar(pasta, 10, "retencao", cab, lin)
        blocos.append(("retencao", base, cab, lin))
        print(f"  retencao: {len(lin)} linha(s)")
    except Exception as exc:  # noqa: BLE001
        print(f"  [aviso] retencao falhou: {str(exc).splitlines()[0][:180]}")

    # Tempo real: serve para confirmar que a coleta está viva agora.
    try:
        req = __import__(
            "google.analytics.data_v1beta.types", fromlist=["RunRealtimeReportRequest"]
        ).RunRealtimeReportRequest(
            property=f"properties/{args.property}",
            dimensions=[Dimension(name="eventName")],
            metrics=[Metric(name="activeUsers")],
            limit=20,
        )
        resp = cliente.run_realtime_report(req)
        cab = ["eventName", "activeUsers"]
        lin = [[r.dimension_values[0].value, r.metric_values[0].value] for r in resp.rows]
        base = salvar(pasta, 11, "tempo_real", cab, lin)
        blocos.append(("tempo_real", base, cab, lin))
        print(f"  tempo_real: {len(lin)} linha(s)")
    except Exception as exc:  # noqa: BLE001
        print(f"  [aviso] tempo_real falhou: {str(exc).splitlines()[0][:180]}")

    resumo = [
        "# Coleta GA4 — EcoSis",
        "",
        f"- Propriedade: `{args.property}`",
        f"- Janela: {inicio} a {fim}",
        f"- Coletado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
        f"- Pasta: `{pasta.name}`",
        "",
    ]
    for nome, base, cab, lin in blocos:
        resumo += [f"## {nome}", "", tabela_md(cab, lin), ""]
    (pasta / "resumo.md").write_text("\n".join(resumo), encoding="utf-8")

    print(f"\npronto: {pasta}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())