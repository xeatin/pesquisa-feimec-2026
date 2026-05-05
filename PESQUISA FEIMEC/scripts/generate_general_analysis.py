from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT_DIR = ROOT / "empresas"
DEFAULT_OUTPUT = ROOT / "analise-geral.md"


SECTION_PAIN = "Principais dores"
SECTION_DREAM = "Principais sonhos"
SECTION_FEAR = "Gargalos"
SECTION_DESIRE = "Gaps"
SECTION_PRODUCTS = "Produtos"
SECTION_SERVICES = "Serviços"


def normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    ascii_value = re.sub(r"[^a-z0-9]+", " ", ascii_value)
    return re.sub(r"\s+", " ", ascii_value).strip()


def percentage(count: int, total: int) -> str:
    if total == 0:
        return "0,0%"
    return f"{(count / total) * 100:.1f}%".replace(".", ",")


def title_from_path(path: Path) -> str:
    return path.stem


def contains_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


@dataclass
class CompanyProfile:
    name: str
    source_label: str
    sections: dict[str, list[str]]


def parse_company_file(path: Path) -> CompanyProfile:
    lines = path.read_text(encoding="utf-8").splitlines()
    sections: dict[str, list[str]] = defaultdict(list)
    current_section: str | None = None
    source_label = ""

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("- Base usada:"):
            source_label = stripped.split(":", 1)[1].strip()
            continue
        if stripped.startswith("## "):
            current_section = stripped[3:].strip()
            continue
        if stripped.startswith("- ") and current_section:
            sections[current_section].append(stripped[2:].strip())

    return CompanyProfile(
        name=title_from_path(path),
        source_label=source_label,
        sections=dict(sections),
    )


def count_exact_items(profiles: list[CompanyProfile], section: str) -> tuple[Counter, dict[str, Counter]]:
    counts: Counter = Counter()
    variants: dict[str, Counter] = defaultdict(Counter)

    for profile in profiles:
        seen: set[str] = set()
        for item in profile.sections.get(section, []):
            key = normalize(item)
            if not key or key in seen:
                continue
            seen.add(key)
            counts[key] += 1
            variants[key][item] += 1

    return counts, variants


def canonical_item(key: str, variants: dict[str, Counter]) -> str:
    return variants[key].most_common(1)[0][0]


def top_exact_items(profiles: list[CompanyProfile], section: str, limit: int = 12) -> list[tuple[str, int]]:
    counts, variants = count_exact_items(profiles, section)
    ranked = sorted(counts.items(), key=lambda item: (-item[1], canonical_item(item[0], variants)))
    return [(canonical_item(key, variants), count) for key, count in ranked[:limit]]


def top_theme_matches(
    profiles: list[CompanyProfile],
    sections: list[str],
    themes: list[dict[str, object]],
    limit: int = 10,
) -> list[dict[str, object]]:
    ranked: list[dict[str, object]] = []

    for theme in themes:
        company_hits: set[str] = set()
        examples: Counter = Counter()
        keywords = theme["keywords"]

        for profile in profiles:
            matched = False
            for section in sections:
                for item in profile.sections.get(section, []):
                    normalized_item = normalize(item)
                    if contains_any(normalized_item, keywords):
                        matched = True
                        examples[item] += 1
            if matched:
                company_hits.add(profile.name)

        if company_hits:
            ranked.append(
                {
                    "label": theme["label"],
                    "count": len(company_hits),
                    "examples": [example for example, _ in examples.most_common(3)],
                }
            )

    ranked.sort(key=lambda item: (-item["count"], item["label"]))
    return ranked[:limit]


PRODUCT_THEMES = [
    {"label": "Automação, robótica e controle", "keywords": ["robo", "automacao", "clp", "ihm", "servo", "drive", "amr", "controlador"]},
    {"label": "Software, CAD/CAM e digitalização", "keywords": ["software", "cad cam", "erp", "mes", "digital", "monitoramento", "inteligencia artificial", "iot"]},
    {"label": "Máquinas-ferramenta e usinagem", "keywords": ["centro de usinagem", "torno", "mandrilhadora", "maquinas especiais", "usinagem", "prensas e dobradeiras", "dobradeira", "guilhotina"]},
    {"label": "Corte, laser e soldagem", "keywords": ["laser", "solda", "soldagem", "tocha", "waterjet", "exaustao", "plasma", "corte"]},
    {"label": "Hidráulica, pneumática e fluidos", "keywords": ["valvula", "bomba", "compressor", "pneumat", "hidraul", "fluido", "engate", "conexao", "criogenia", "vacuo"]},
    {"label": "Materiais, componentes e insumos", "keywords": ["aco", "acoplamento", "abrasivo", "fixador", "redutor", "rolamento", "lubrificante", "componentes"]},
    {"label": "Movimentação de carga e logística interna", "keywords": ["ponte", "talha", "içamento", "movimentacao", "armazenagem", "crane", "seguranca"]},
    {"label": "Metrologia, medição e inspeção", "keywords": ["metrolog", "medicao", "inspecao", "scanner", "calibracao", "qualidade"]},
    {"label": "Utilidades, energia e processo térmico", "keywords": ["forno", "queimador", "gases", "aquec", "combust", "energia", "induction"]},
]


SERVICE_THEMES = [
    {"label": "Suporte técnico", "keywords": ["suporte tecnico"]},
    {"label": "Assistência técnica", "keywords": ["assistencia tecnica"]},
    {"label": "Treinamento", "keywords": ["treinamento"]},
    {"label": "Consultoria e processo", "keywords": ["consultoria", "processo", "aplicacao", "especificacao"]},
    {"label": "Manutenção e reposição", "keywords": ["manutencao", "reposicao"]},
    {"label": "Implantação, implementação e integração", "keywords": ["implantacao", "implementacao", "integracao"]},
    {"label": "Instalação, start-up e comissionamento", "keywords": ["instalacao", "start up", "comissionamento"]},
    {"label": "Engenharia e projeto", "keywords": ["engenharia", "projeto", "projetos personalizados", "projetos sob medida"]},
    {"label": "Pós-venda e atendimento consultivo", "keywords": ["pos venda", "atendimento consultivo"]},
    {"label": "Retrofit", "keywords": ["retrofit"]},
]


PAIN_THEMES = [
    {"label": "Produtividade baixa, setups longos e ineficiência", "keywords": ["produtividade", "setup", "fluxo", "capacidade", "tempo", "ineficiencia"]},
    {"label": "Custo alto, desperdício e pressão por margem", "keywords": ["custo", "desperdicio", "orcamento", "consumo", "margem", "capex", "roi"]},
    {"label": "Refugo, retrabalho e variabilidade de qualidade", "keywords": ["refugo", "retrabalho", "variabilidade", "qualidade", "precisao", "desvio"]},
    {"label": "Paradas, falhas e indisponibilidade operacional", "keywords": ["parada", "disponibilidade", "falha", "vazamento", "manutencao", "indisponibilidade"]},
    {"label": "Integração difícil entre sistemas, engenharia e produção", "keywords": ["integracao", "legado", "sistemas", "engenharia", "gestao", "fragmentadas"]},
    {"label": "Baixa visibilidade de dados e do desempenho do processo", "keywords": ["visibilidade", "dados", "desempenho", "rastreabilidade", "diagnostico"]},
    {"label": "Estoque, reposição e lead time", "keywords": ["estoque", "reposicao", "lead time", "fornecimento"]},
    {"label": "Risco operacional, segurança e compliance", "keywords": ["risco", "seguranca", "compliance", "norma", "acidente"]},
    {"label": "Mão de obra, operadores e adoção", "keywords": ["mao de obra", "operador", "usuarios", "adocao", "treinamento"]},
]


FEAR_THEMES = [
    {"label": "Errar a integração com legado e travar a operação", "keywords": ["integracao", "legado", "processo existente", "fluxo real", "adaptacao"]},
    {"label": "Não comprovar ROI ou justificar o investimento", "keywords": ["roi", "investimento", "capex", "orcamento", "custo total"]},
    {"label": "Ficar sem estoque, peça, reposição ou suporte", "keywords": ["estoque", "reposicao", "peca", "suporte", "lead time"]},
    {"label": "Lidar com alta complexidade técnica e especificação errada", "keywords": ["especificacao", "parametrizacao", "complexidade", "ambientes severos", "customizacao"]},
    {"label": "Parar no ramp-up, manutenção ou operação diária", "keywords": ["ramp up", "parada", "manutencao", "start up", "operacao"]},
    {"label": "Não conseguir adoção operacional e treinamento suficientes", "keywords": ["adocao", "operacional", "treinamento", "usuarios", "operador"]},
    {"label": "Perder qualidade, segurança ou conformidade", "keywords": ["qualidade", "seguranca", "compliance", "risco"]},
]


DREAM_THEMES = [
    {"label": "Ganhar produtividade, escala e capacidade", "keywords": ["produzir mais", "produtividade", "escalar", "capacidade"]},
    {"label": "Ter previsibilidade, estabilidade e confiabilidade", "keywords": ["previsibilidade", "estabilidade", "confiabilidade", "confiavel", "operar com maxima confiabilidade"]},
    {"label": "Reduzir custo, desperdício e custo unitário", "keywords": ["custo", "desperdicio", "custo unitario", "eficiencia energetica"]},
    {"label": "Digitalizar, integrar e decidir melhor com dados", "keywords": ["digitalizar", "dados", "tempo quase real", "integracao", "rastreabilidade"]},
    {"label": "Aumentar qualidade, padronização e reduzir erros", "keywords": ["qualidade", "padronizacao", "menos erro", "refugo"]},
    {"label": "Automatizar e modernizar a operação", "keywords": ["automatizar", "modernizar", "parque fabril", "automacao"]},
    {"label": "Ter suporte forte, resposta rápida e fornecedor aderente", "keywords": ["suporte tecnico", "entrega rapida", "fornecedor", "responda rapido"]},
]


DESIRE_THEMES = [
    {"label": "Mais suporte consultivo, diagnostico e engenharia aplicada", "keywords": ["suporte", "consultiv", "diagnostico", "engenharia", "aplicacao", "onboarding"]},
    {"label": "Ofertas mais rapidas, modulares e faceis de implantar", "keywords": ["rapido", "modular", "enxut", "faseada", "implantacao"]},
    {"label": "Mais prova de ROI, casos de uso e metricas objetivas", "keywords": ["roi", "casos de uso", "metricas", "prova", "mensuracao", "ganho"]},
    {"label": "Mais integracao, dados, monitoramento e governanca", "keywords": ["integracao", "dados", "monitoramento", "governanca", "digital"]},
    {"label": "Mais clareza comercial sobre prazo, estoque e custo total", "keywords": ["clareza comercial", "prazo", "estoque", "custo total", "propriedade"]},
    {"label": "Pacotes por segmento, processo e aplicacao", "keywords": ["segmento", "processo", "aplicacao", "kits", "pacotes", "solucoes aplicadas"]},
    {"label": "Retrofit, financiamento e expansao com menor risco", "keywords": ["retrofit", "financiamento", "expansao"]},
]


def render_ranked_list(items: list[dict[str, object]], total: int) -> list[str]:
    lines: list[str] = []
    for item in items:
        lines.append(
            f"- {item['label']} — {item['count']} empresas ({percentage(item['count'], total)})."
        )
        if item.get("examples"):
            lines.append(f"  Exemplos: {'; '.join(item['examples'])}.")
    return lines


def render_exact_list(items: list[tuple[str, int]], total: int) -> list[str]:
    return [
        f"- {label} — {count} empresas ({percentage(count, total)})."
        for label, count in items
    ]


def make_executive_summary(total: int, public_count: int, profiles: list[CompanyProfile]) -> list[str]:
    pain_top = top_theme_matches(profiles, [SECTION_PAIN], PAIN_THEMES, limit=3)
    fear_top = top_theme_matches(profiles, [SECTION_FEAR], FEAR_THEMES, limit=3)
    dream_top = top_theme_matches(profiles, [SECTION_DREAM], DREAM_THEMES, limit=3)
    service_top = top_theme_matches(profiles, [SECTION_SERVICES], SERVICE_THEMES, limit=3)

    lines = [
        f"- Foram lidos {total} arquivos individuais de empresa.",
        f"- {public_count} perfis usam descrição pública da FEIMEC e {total - public_count} usam inferência setorial do arquivo original.",
    ]

    if pain_top:
        lines.append(
            "- As dores mais recorrentes giram em torno de "
            + ", ".join(item["label"].lower() for item in pain_top)
            + "."
        )
    if fear_top:
        lines.append(
            "- Os medos mais recorrentes aparecem como "
            + ", ".join(item["label"].lower() for item in fear_top)
            + "."
        )
    if dream_top:
        lines.append(
            "- Os sonhos mais recorrentes se concentram em "
            + ", ".join(item["label"].lower() for item in dream_top)
            + "."
        )
    if service_top:
        lines.append(
            "- Em serviços, o núcleo dominante é "
            + ", ".join(item["label"].lower() for item in service_top)
            + "."
        )
    return lines


def build_markdown(profiles: list[CompanyProfile]) -> str:
    total = len(profiles)
    public_count = sum(
        1
        for profile in profiles
        if "Descrição pública do expositor encontrada na FEIMEC" in profile.source_label
    )

    product_themes = top_theme_matches(profiles, [SECTION_PRODUCTS], PRODUCT_THEMES, limit=8)
    service_themes = top_theme_matches(profiles, [SECTION_SERVICES], SERVICE_THEMES, limit=8)
    pain_themes = top_theme_matches(profiles, [SECTION_PAIN], PAIN_THEMES, limit=8)
    fear_themes = top_theme_matches(profiles, [SECTION_FEAR], FEAR_THEMES, limit=8)
    dream_themes = top_theme_matches(profiles, [SECTION_DREAM], DREAM_THEMES, limit=8)
    desire_themes = top_theme_matches(profiles, [SECTION_DESIRE], DESIRE_THEMES, limit=8)

    product_exact = top_exact_items(profiles, SECTION_PRODUCTS, limit=12)
    service_exact = top_exact_items(profiles, SECTION_SERVICES, limit=12)
    pain_exact = top_exact_items(profiles, SECTION_PAIN, limit=12)
    fear_exact = top_exact_items(profiles, SECTION_FEAR, limit=12)
    dream_exact = top_exact_items(profiles, SECTION_DREAM, limit=12)
    desire_exact = top_exact_items(profiles, SECTION_DESIRE, limit=12)

    lines: list[str] = [
        "# Análise Geral FEIMEC 2026",
        "",
        "## Escopo",
        f"- Leitura empresa por empresa e arquivo por arquivo de {total} arquivos `.md` na pasta `empresas/`.",
        f"- {public_count} arquivos com descrição pública capturada da FEIMEC.",
        f"- {total - public_count} arquivos com perfil inferido a partir do tipo de expositor e do template gerado.",
        "- Critério desta análise: contagem por empresa, não por repetição de linha dentro do mesmo arquivo.",
        f"- Como os arquivos não tinham uma seção explícita de `medos`, usei `Gargalos` como proxy de medo operacional e comercial.",
        f"- Como os arquivos não tinham uma seção explícita de `desejos`, usei `Gaps` como proxy do que o mercado mais sente falta e quer comprar melhor.",
        "",
        "## Visão Executiva",
        *make_executive_summary(total, public_count, profiles),
        "",
        "## Dores Mais Constantes",
        "### Temas",
        *render_ranked_list(pain_themes, total),
        "",
        "### Linhas Exatas Mais Frequentes",
        *render_exact_list(pain_exact, total),
        "",
        "## Medos Mais Constantes",
        "### Temas",
        *render_ranked_list(fear_themes, total),
        "",
        "### Linhas Exatas Mais Frequentes",
        *render_exact_list(fear_exact, total),
        "",
        "## Produtos Mais Constantes",
        "### Temas",
        *render_ranked_list(product_themes, total),
        "",
        "### Linhas Exatas Mais Frequentes",
        *render_exact_list(product_exact, total),
        "",
        "## Serviços Mais Constantes",
        "### Temas",
        *render_ranked_list(service_themes, total),
        "",
        "### Linhas Exatas Mais Frequentes",
        *render_exact_list(service_exact, total),
        "",
        "## Sonhos Mais Constantes",
        "### Temas",
        *render_ranked_list(dream_themes, total),
        "",
        "### Linhas Exatas Mais Frequentes",
        *render_exact_list(dream_exact, total),
        "",
        "## Desejos Mais Constantes",
        "### Temas",
        *render_ranked_list(desire_themes, total),
        "",
        "### Linhas Exatas Mais Frequentes",
        *render_exact_list(desire_exact, total),
        "",
        "## Leitura Final",
        "- O mercado está muito mais orientado a produtividade, previsibilidade e redução de custo total do que a compra pura de equipamento isolado.",
        "- Suporte técnico, implantação, treinamento e engenharia aplicada aparecem como parte central da proposta de valor, não como acessório.",
        "- O medo dominante não é apenas preço: é parar a operação, errar a integração, não comprovar ROI e ficar sem suporte ou reposição.",
        "- Os desejos mais fortes apontam para ofertas comerciais mais consultivas, mais modulares, com prova de ganho e aderência clara por segmento e processo.",
    ]

    return "\n".join(lines).strip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera uma análise geral a partir dos arquivos de empresas da FEIMEC.")
    parser.add_argument("--input-dir", type=Path, default=DEFAULT_INPUT_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    files = sorted(args.input_dir.glob("*.md"))
    profiles = [parse_company_file(path) for path in files]
    markdown = build_markdown(profiles)
    args.output.write_text(markdown, encoding="utf-8")

    print(
        json.dumps(
            {
                "companies": len(profiles),
                "input_dir": str(args.input_dir),
                "output": str(args.output),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()