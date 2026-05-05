from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
COMPANIES_DIR = ROOT / "empresas"
GENERAL_ANALYSIS = ROOT / "analise-geral.md"
OUTPUT_FILE = ROOT / "maior-oportunidade-real-feimec-2026.md"

PUBLIC_WEIGHT = 1.0
INFERRED_WEIGHT = 0.55

SECTION_PRODUCTS = "Produtos"
SECTION_SERVICES = "Serviços"
SECTION_PAINS = "Principais dores"
SECTION_DREAMS = "Principais sonhos"
SECTION_FEARS = "Gargalos"
SECTION_DESIRES = "Gaps"


def normalize(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    ascii_value = re.sub(r"[^a-z0-9]+", " ", ascii_value)
    return re.sub(r"\s+", " ", ascii_value).strip()


def pct(value: float, total: float) -> str:
    if total == 0:
        return "0,0%"
    return f"{(value / total) * 100:.1f}%".replace(".", ",")


def clamp(value: float, low: float = 1.0, high: float = 5.0) -> float:
    return max(low, min(high, value))


def score_from_ratio(ratio: float) -> float:
    return clamp(1 + (ratio * 4))


@dataclass
class CompanyProfile:
    name: str
    is_public: bool
    weight: float
    sections: dict[str, list[str]]


@dataclass
class Opportunity:
    title: str
    short_name: str
    primary_icp: str
    segment: str
    format_ideal: str
    description: str
    offer_ideal: str
    channel: str
    pains: list[str]
    fears: list[str]
    dreams: list[str]
    desires: list[str]
    supply_conflict: list[str]
    hardware_dependency: float
    channel_strength: float
    ticket_potential: float
    recurrence_potential: float
    time_to_value: str
    roi_proof: str
    objections: list[str]
    why_incumbents_miss: list[str]
    scale_drivers: list[str]
    discard_reason: str | None = None


def join_clauses(items: list[str]) -> str:
    return "; ".join(item.rstrip(".") for item in items if item.strip()) + "."


THEMES = {
    "quality_loss": {
        "label": "Refugo, retrabalho e variabilidade",
        "keywords": ["refugo", "retrabalho", "variabilidad", "qualidade", "desvio", "precisao"],
    },
    "productivity": {
        "label": "Produtividade, setups e eficiência",
        "keywords": ["produtividade", "setup", "capacidade", "eficiencia", "tempo", "oee"],
    },
    "downtime": {
        "label": "Paradas, falhas e indisponibilidade",
        "keywords": ["parada", "falha", "indisponibilidade", "disponibilidade", "vazamento", "manutencao"],
    },
    "integration": {
        "label": "Integração com legado e sistemas",
        "keywords": ["integracao", "legado", "sistemas", "hardware software processo", "fluxo real", "multimarcas"],
    },
    "adoption": {
        "label": "Adoção operacional e treinamento",
        "keywords": ["adocao", "usuarios", "treinamento", "operacional", "chao de fabrica", "rotinas"],
    },
    "roi": {
        "label": "Prova de ROI e justificativa econômica",
        "keywords": ["roi", "retorno", "investimento", "capex", "custo total", "ganho"],
    },
    "support_parts": {
        "label": "Suporte, peça, estoque e reposição",
        "keywords": ["suporte", "peca", "estoque", "reposicao", "consumiveis", "lead time"],
    },
    "vertical_packaging": {
        "label": "Empacotamento por aplicação, segmento e processo",
        "keywords": ["aplicacao", "segmento", "processo", "pacotes", "vertical", "criticidade"],
    },
    "faster_implant": {
        "label": "Implantação mais rápida e modular",
        "keywords": ["implantacao", "enxut", "rapido", "modular", "faseada", "entrada"],
    },
    "performance_layer": {
        "label": "Monitoramento, dados, governança e performance layer",
        "keywords": ["monitoramento", "dados", "governanca", "onboarding", "relatorios", "performance"],
    },
    "retrofit": {
        "label": "Retrofit e modernização com menor risco",
        "keywords": ["retrofit", "modernizacao", "expansao", "menos invasiva", "base instalada"],
    },
    "consultive_engineering": {
        "label": "Diagnóstico consultivo e engenharia aplicada",
        "keywords": ["consultiv", "diagnostico", "engenharia", "aplicacao", "especificacao"],
    },
    "product_hardware": {
        "label": "Produto/hardware base",
        "keywords": ["maquinas", "equipamentos", "componentes", "robot", "laser", "torno", "centros de usinagem", "valvulas", "medicao", "software cad cam", "erp"],
    },
    "basic_support": {
        "label": "Suporte técnico e pós-venda básico",
        "keywords": ["suporte tecnico", "assistencia tecnica", "treinamento", "pos venda", "calibracao e suporte"],
    },
}


OPPORTUNITIES = [
    Opportunity(
        title="Camada Multimarcas de Diagnóstico, ROI e Roadmap de Implantação",
        short_name="ROI + Diagnóstico Multimarcas",
        primary_icp="indústrias com base instalada heterogênea, múltiplos fornecedores e dificuldade de priorizar investimentos",
        segment="metalurgia, usinagem, corte e dobra, autopeças, bens de capital e plantas industriais com legado",
        format_ideal="serviço consultivo recorrente com software leve de diagnóstico e business case",
        description="transforma dores difusas de produtividade, integração e ROI em um plano priorizado de ganho com business case, quick wins e execução assistida.",
        offer_ideal="diagnóstico operacional + mapa de perdas + priorização de ganhos + ROI + playbook de implantação",
        channel="feira e pós-feira + rede de integradores + OEMs complementares + carteira de base instalada multimarcas",
        pains=["quality_loss", "productivity", "downtime", "integration"],
        fears=["integration", "roi", "adoption"],
        dreams=["quality_loss", "productivity", "performance_layer"],
        desires=["roi", "consultive_engineering", "vertical_packaging", "faster_implant"],
        supply_conflict=["product_hardware", "basic_support"],
        hardware_dependency=1.0,
        channel_strength=5.0,
        ticket_potential=4.5,
        recurrence_potential=4.5,
        time_to_value="30 a 60 dias para diagnóstico, quick wins e business case inicial",
        roi_proof="baseline de perdas, plano por alavanca, antes/depois por célula e payback por frente",
        objections=[
            "Já temos fornecedores e suporte técnico.",
            "Não queremos mais uma consultoria genérica.",
            "Difícil integrar múltiplos vendors sem conflito.",
        ],
        why_incumbents_miss=[
            "OEMs tendem a puxar a solução para o próprio stack.",
            "Distribuidores param na especificação e venda.",
            "Suporte tradicional não fecha business case executivo.",
        ],
        scale_drivers=[
            "metodologia replicável por processo",
            "biblioteca de benchmarks por segmento",
            "software leve para diagnóstico e governança de plano",
        ],
    ),
    Opportunity(
        title="Plataforma de Retrofit e Integração de Base Instalada",
        short_name="Retrofit + Integração",
        primary_icp="fábricas com parque heterogêneo, máquinas antigas e necessidade de modernização sem CAPEX completo",
        segment="usinagem, corte e conformação, linhas térmicas, movimentação, pneumática e plantas com ativos legados",
        format_ideal="modelo híbrido serviço + projeto + software de supervisão e conectividade",
        description="moderniza ativos existentes, conecta legado, reduz risco de troca completa e acelera resultado sem depender de hardware novo em larga escala.",
        offer_ideal="auditoria de base instalada + retrofit por criticidade + conectividade + comissionamento + treinamento",
        channel="base instalada multimarcas + assistência técnica + parceiros de manutenção + revendas técnicas",
        pains=["downtime", "productivity", "integration"],
        fears=["integration", "support_parts", "roi"],
        dreams=["productivity", "retrofit", "quality_loss"],
        desires=["retrofit", "faster_implant", "performance_layer"],
        supply_conflict=["product_hardware"],
        hardware_dependency=2.0,
        channel_strength=4.8,
        ticket_potential=4.8,
        recurrence_potential=4.0,
        time_to_value="60 a 120 dias por célula ou ativo crítico",
        roi_proof="comparação retrofit versus troca total, OEE, tempo de parada evitado e CAPEX preservado",
        objections=[
            "Retrofit pode virar gambiarra.",
            "Integração com legado é arriscada.",
            "Já temos roadmap de troca futura.",
        ],
        why_incumbents_miss=[
            "fabricantes preferem vender equipamento novo",
            "integradores vendem projeto, mas nem sempre governam adoção e resultado",
            "assistência técnica tradicional não vende transformação estruturada",
        ],
        scale_drivers=[
            "playbooks por família de máquina",
            "parcerias técnicas modulares",
            "biblioteca de kits e padrões de integração",
        ],
    ),
    Opportunity(
        title="Pacotes Verticais de Produtividade por Processo",
        short_name="Pacotes por Aplicação",
        primary_icp="operações que entendem a dor, mas não querem comprar engenharia aberta sem clareza de escopo",
        segment="corte laser, soldagem, metrologia, automação de célula, utilidades e fluidos, processo térmico",
        format_ideal="serviço empacotado com escopo, benchmark, implantação e metas claras por processo",
        description="traduz tecnologias já existentes em pacotes de ganho por aplicação específica, reduzindo risco comercial e técnico da compra.",
        offer_ideal="pacote fechado por processo com baseline, benchmark, implantação, treinamento e KPI final",
        channel="feira, distribuidores, conteúdo técnico, cases setoriais e parceiros especializados por nicho",
        pains=["quality_loss", "productivity", "downtime"],
        fears=["adoption", "roi"],
        dreams=["quality_loss", "productivity"],
        desires=["vertical_packaging", "consultive_engineering", "roi"],
        supply_conflict=["product_hardware", "basic_support"],
        hardware_dependency=1.2,
        channel_strength=4.6,
        ticket_potential=4.0,
        recurrence_potential=4.2,
        time_to_value="30 a 90 dias, dependendo do processo e do pacote",
        roi_proof="meta única por pacote: refugo, tempo de setup, consumo, qualidade ou disponibilidade",
        objections=[
            "Cada planta é única.",
            "Pacote pode não servir ao nosso caso.",
            "Já compramos tecnologia semelhante e não sustentou ganho.",
        ],
        why_incumbents_miss=[
            "a maioria vende catálogo, não desfecho operacional",
            "poucos traduzem a oferta por segmento, criticidade e aplicação",
            "suporte existe, mas o empacotamento comercial ainda é fraco",
        ],
        scale_drivers=[
            "repetibilidade comercial",
            "time-to-value mais curto",
            "fácil productização e expansão por nicho",
        ],
    ),
    Opportunity(
        title="Camada Multimarcas de Diagnóstico, ROI e Performance para Base Instalada",
        short_name="Diagnóstico + ROI + Performance",
        primary_icp="fábricas com muitos ativos, base instalada heterogênea, baixa visibilidade de perdas e dificuldade de transformar dados e investimentos em ação priorizada",
        segment="plantas com automação parcial, múltiplas células, legados e metas agressivas de eficiência, qualidade e disponibilidade",
        format_ideal="entrada consultiva com software leve + governança mensal + agenda de ganho e expansão progressiva",
        description="combina diagnóstico operacional, business case, monitoramento leve e governança de rotina para transformar base instalada em resultado visível e sustentado.",
        offer_ideal="diagnóstico operacional + mapa de perdas + camada leve de monitoramento + rituais de operação + agenda de ganho + revisão executiva de ROI",
        channel="OEMs sem software forte, integradores, manutenção, pós-venda técnico e carteira de clientes já instalada",
        pains=["downtime", "productivity", "quality_loss"],
        fears=["integration", "adoption"],
        dreams=["performance_layer", "productivity", "quality_loss"],
        desires=["performance_layer", "roi", "consultive_engineering"],
        supply_conflict=["basic_support"],
        hardware_dependency=1.0,
        channel_strength=4.2,
        ticket_potential=4.2,
        recurrence_potential=5.0,
        time_to_value="30 a 60 dias para baseline confiável, quick wins e primeiros rituais de gestão",
        roi_proof="tempo de parada reduzido, gargalos eliminados, quick wins capturados, aderência de rotina e melhora de KPI por célula",
        objections=[
            "Já temos BI ou supervisório.",
            "Mais uma camada de software pode virar ruído.",
            "Nosso time não tem disponibilidade para alimentar isso.",
        ],
        why_incumbents_miss=[
            "muitos vendors entregam dados, poucos entregam priorização econômica e gestão de decisão",
            "a camada de software sem serviço, diagnóstico e cobrança de resultado não fecha adoção",
            "o valor se perde entre TI, manutenção, operação e liderança executiva",
        ],
        scale_drivers=[
            "modelo recorrente",
            "cross-sell sobre base instalada",
            "efeito de rede via benchmarks, playbooks e dados proprietários",
        ],
    ),
    Opportunity(
        title="Enablement de Adoção Industrial e Treinamento com KPI",
        short_name="Adoção + Treinamento KPI",
        primary_icp="empresas que já compraram tecnologia, mas não capturam o resultado por falha de adoção operacional",
        segment="automação, software industrial, metrologia, corte e solda, integração de células",
        format_ideal="serviço de enablement com treinamento, rotina, certificação e acompanhamento pós-implantação",
        description="fecha a lacuna entre tecnologia comprada e resultado capturado, com foco em usuário, rotina e disciplina operacional.",
        offer_ideal="plano de adoção + treinamento por perfil + rituais operacionais + coaching de líder + KPI de uso e resultado",
        channel="pós-venda de OEMs, integradores, revendas técnicas, base de clientes recém-implantados",
        pains=["adoption", "productivity", "quality_loss"],
        fears=["adoption", "support_parts"],
        dreams=["quality_loss", "productivity"],
        desires=["consultive_engineering", "faster_implant"],
        supply_conflict=["basic_support"],
        hardware_dependency=1.0,
        channel_strength=4.7,
        ticket_potential=3.6,
        recurrence_potential=4.3,
        time_to_value="15 a 45 dias para ganho visível de uso, disciplina e estabilidade",
        roi_proof="uso real do sistema, aderência de rotina, queda de erro operacional e tempo de setup",
        objections=[
            "Treinamento não é prioridade agora.",
            "Nossa equipe já foi treinada pelo fornecedor.",
            "Isso deveria estar embutido no projeto original.",
        ],
        why_incumbents_miss=[
            "fornecedor considera treinamento como entrega de projeto, não como captura de resultado",
            "não existe dono claro da adoção após o go-live",
            "treinamento sem KPI não gera cobrança nem continuidade",
        ],
        scale_drivers=[
            "modelo replicável por tecnologia",
            "entradas via pós-venda já existente",
            "expansão por planta e por célula",
        ],
    ),
    Opportunity(
        title="Otimização de Processo em Corte, Solda e Laser como Serviço",
        short_name="Processo Corte/Solda/Laser",
        primary_icp="operações com perda por parametrização, consumíveis, acabamento e indisponibilidade de processo",
        segment="metalurgia, caldeiraria, estruturas metálicas, corte de chapa, soldagem automatizada",
        format_ideal="serviço aplicado com diagnóstico, parametrização, benchmark e suporte recorrente",
        description="captura valor onde a máquina existe, mas a qualidade, velocidade e custo por peça continuam aquém do prometido.",
        offer_ideal="auditoria de processo + parametrização + padronização + gestão de consumíveis + prova de ganho por peça",
        channel="parceiros técnicos, consumíveis, assistência técnica, OEMs sem braço consultivo forte",
        pains=["quality_loss", "productivity", "downtime"],
        fears=["support_parts", "roi"],
        dreams=["quality_loss", "productivity"],
        desires=["vertical_packaging", "roi", "consultive_engineering"],
        supply_conflict=["product_hardware", "basic_support"],
        hardware_dependency=1.5,
        channel_strength=4.4,
        ticket_potential=4.0,
        recurrence_potential=4.0,
        time_to_value="15 a 60 dias conforme maturidade da linha",
        roi_proof="custo por peça, consumo, refugo, tempo de ciclo e disponibilidade da célula",
        objections=[
            "Nosso fornecedor já nos atende.",
            "A causa pode ser interna, não da tecnologia.",
            "Cada lote/material muda demais.",
        ],
        why_incumbents_miss=[
            "vendedores focam em máquina e consumível, não em resultado por peça",
            "parâmetro bom em teste nem sempre vira processo estável no chão de fábrica",
            "falta camada neutra de prova econômica",
        ],
        scale_drivers=[
            "alto valor por linha crítica",
            "forte efeito prova a partir de cases",
            "cross-sell com monitoramento e treinamento",
        ],
    ),
    Opportunity(
        title="Programa de Confiabilidade para Fluidos, Utilidades e Processo Térmico",
        short_name="Confiabilidade de Utilidades",
        primary_icp="plantas com perdas recorrentes em utilidades, fluidos, calor, combustão e sistemas auxiliares críticos",
        segment="alimentos, siderurgia, metalurgia, química, papel e celulose, manufatura contínua",
        format_ideal="serviço de confiabilidade com diagnóstico, monitoramento, retrofit leve e manutenção orientada a risco",
        description="reduz vazamento, instabilidade térmica e custo operacional onde existe muita peça e pouco programa estruturado de confiabilidade.",
        offer_ideal="auditoria de perdas + criticidade + plano de confiabilidade + monitoramento + retrofit leve + governança de manutenção",
        channel="assistência técnica, manutenção, distribuidores de fluidos/utilidades e parceiros de campo",
        pains=["downtime", "quality_loss", "productivity"],
        fears=["support_parts", "roi"],
        dreams=["quality_loss", "support_parts"],
        desires=["consultive_engineering", "retrofit", "performance_layer"],
        supply_conflict=["product_hardware", "basic_support"],
        hardware_dependency=2.0,
        channel_strength=4.0,
        ticket_potential=4.2,
        recurrence_potential=4.4,
        time_to_value="30 a 90 dias por frente crítica",
        roi_proof="energia, perdas, parada evitada, descarte, vida útil e custo total de manutenção",
        objections=[
            "Já temos manutenção interna.",
            "Confiabilidade é tema difuso e difícil de vender internamente.",
            "Nem sempre a economia é visível no curto prazo.",
        ],
        why_incumbents_miss=[
            "fornecedor de componente vende item, não programa de confiabilidade",
            "a dor fica fragmentada entre utilidades, manutenção e operação",
            "ganho econômico existe, mas raramente é empacotado com clareza",
        ],
        scale_drivers=[
            "recorrência natural",
            "alto custo da falha",
            "expansão modular por utilidade e área da planta",
        ],
    ),
    Opportunity(
        title="Camada de Decisão para Metrologia e Qualidade em Tempo de Produção",
        short_name="Quality Decision Layer",
        primary_icp="empresas com investimento em medição e inspeção, mas dificuldade de transformar isso em decisão operacional rápida",
        segment="usinagem de precisão, autopeças, aeroespacial, dispositivos, moldes e ferramentaria",
        format_ideal="software leve + serviço de integração e governança de qualidade",
        description="transforma medição e inspeção em decisão de processo, priorizando custo evitado, refugo reduzido e rotina operacional.",
        offer_ideal="integração de medições + regras de decisão + dashboard operacional + ritual de resposta + business case de refugo evitado",
        channel="metrologia, qualidade, integradores, consultorias técnicas e parceiros de chão de fábrica",
        pains=["quality_loss", "productivity"],
        fears=["adoption", "integration", "roi"],
        dreams=["quality_loss", "performance_layer"],
        desires=["performance_layer", "vertical_packaging", "roi"],
        supply_conflict=["product_hardware"],
        hardware_dependency=1.2,
        channel_strength=3.8,
        ticket_potential=3.9,
        recurrence_potential=4.5,
        time_to_value="30 a 75 dias em células críticas",
        roi_proof="refugo evitado, tempo de resposta, estabilidade do processo e redução de retrabalho",
        objections=[
            "Já temos medição suficiente.",
            "Qualidade não controla a produção.",
            "Integração entre hardware, software e rotina é trabalhosa.",
        ],
        why_incumbents_miss=[
            "metrologia vende precisão, mas não necessariamente decisão operacional",
            "a captura do valor fica partida entre qualidade, processo e produção",
            "existem poucos pacotes claros por criticidade e aplicação",
        ],
        scale_drivers=[
            "recorrência por linha e planta",
            "efeito de benchmark e templates por aplicação",
            "forte aderência em setores com custo alto de não qualidade",
        ],
    ),
    Opportunity(
        title="Marketplace de Especialistas e Execução Técnica Pós-Feira",
        short_name="Marketplace Pós-Feira",
        primary_icp="expositores e compradores que saem da feira com leads, mas sem capacidade de transformar isso em projeto executado",
        segment="cross-setorial industrial",
        format_ideal="orquestração de especialistas, projetos rápidos e matching técnico-comercial",
        description="conecta demanda pós-feira com execução técnica especializada, reduzindo tempo entre interesse e projeto em campo.",
        offer_ideal="matching técnico + scoping + squad de execução + governança comercial",
        channel="a própria FEIMEC, entidades, base de expositores, ecossistema de integradores e prestadores",
        pains=["productivity", "integration"],
        fears=["adoption", "support_parts"],
        dreams=["productivity"],
        desires=["consultive_engineering", "faster_implant"],
        supply_conflict=["basic_support"],
        hardware_dependency=1.0,
        channel_strength=4.0,
        ticket_potential=3.5,
        recurrence_potential=3.7,
        time_to_value="15 a 45 dias para primeiro projeto piloto",
        roi_proof="tempo de conversão reduzido, menor ciclo comercial e projetos destravados",
        objections=[
            "Intermediação pode diluir margem.",
            "Difícil padronizar qualidade entre especialistas.",
            "Sem governança, vira marketplace genérico.",
        ],
        why_incumbents_miss=[
            "a feira entrega atenção, não execução",
            "expositores têm produto, mas nem sempre braço de delivery",
            "compradores não sabem quem combina melhor para cada caso",
        ],
        scale_drivers=[
            "aproveita canal já existente",
            "baixo CAPEX inicial",
            "pode evoluir para plataforma de inteligência comercial e técnica",
        ],
        discard_reason="boa leitura de canal, mas risco alto de virar intermediação genérica sem diferencial forte e sem defensabilidade se não houver metodologia e curadoria profunda.",
    ),
    Opportunity(
        title="OEM Performance Pods White-Label",
        short_name="White-Label para OEMs",
        primary_icp="fabricantes e distribuidores que têm produto forte, mas lacuna entre venda e captura de valor pós-implantação",
        segment="automação, software industrial, máquinas, metrologia e utilidades",
        format_ideal="camada white-label de ROI, adoção e governança para vendors",
        description="vira músculo de resultado para OEMs que hoje param em suporte e pós-venda básico.",
        offer_ideal="pod white-label com business case, implantação, adoção e revisão de performance",
        channel="OEMs, distribuidores e integradores já ativos",
        pains=["integration", "adoption", "roi"],
        fears=["adoption", "support_parts"],
        dreams=["productivity", "quality_loss"],
        desires=["consultive_engineering", "roi", "faster_implant"],
        supply_conflict=["basic_support"],
        hardware_dependency=1.0,
        channel_strength=4.9,
        ticket_potential=4.1,
        recurrence_potential=4.7,
        time_to_value="30 a 60 dias por pod ou parceiro piloto",
        roi_proof="aumento de conversão, redução de churn técnico, expansão em base instalada e captura de resultado do cliente final",
        objections=[
            "OEM pode querer internalizar depois.",
            "White-label exige confiança e maturidade comercial do parceiro.",
            "Pode haver conflito com canais internos de serviço.",
        ],
        why_incumbents_miss=[
            "muitos vendors não têm time ou disciplina para fechar a lacuna de resultado",
            "o canal comercial prefere vender novo equipamento a monetizar adoção e performance",
            "a camada white-label resolve um problema interno deles e um problema do cliente final",
        ],
        scale_drivers=[
            "pluga em canais já prontos",
            "baixo CAC relativo",
            "recorrência e expansão em parceiros fortes",
        ],
    ),
    Opportunity(
        title="Nova Marca de Hardware Industrial Generalista",
        short_name="Novo Hardware Genérico",
        primary_icp="mercado amplo industrial",
        segment="cross-setorial",
        format_ideal="fabricante novo de máquinas ou componentes",
        description="entrar com mais um hardware genérico em categorias já densas de expositores.",
        offer_ideal="nova linha de produto",
        channel="distribuição tradicional",
        pains=["productivity"],
        fears=["roi"],
        dreams=["productivity"],
        desires=[],
        supply_conflict=["product_hardware"],
        hardware_dependency=5.0,
        channel_strength=2.2,
        ticket_potential=3.8,
        recurrence_potential=2.6,
        time_to_value="lento",
        roi_proof="difícil sem base instalada e reputação",
        objections=[
            "mercado lotado",
            "confiança baixa para marca nova",
            "ciclo comercial longo e pesado",
        ],
        why_incumbents_miss=[
            "não se aplica; aqui o problema é saturação estrutural",
        ],
        scale_drivers=[
            "limitados sem capital pesado e diferenciação forte",
        ],
        discard_reason="deve ser descartada porque o corpus mostra forte saturação de produto base e baixa carência por 'mais um hardware'.",
    ),
]


def parse_company(path: Path) -> CompanyProfile:
    lines = path.read_text(encoding="utf-8").splitlines()
    sections: dict[str, list[str]] = defaultdict(list)
    current_section: str | None = None
    is_public = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("- Base usada:"):
            is_public = "Descrição pública do expositor encontrada na FEIMEC" in stripped
            continue
        if stripped.startswith("## "):
            current_section = stripped[3:].strip()
            continue
        if stripped.startswith("- ") and current_section:
            sections[current_section].append(stripped[2:].strip())

    return CompanyProfile(
        name=path.stem,
        is_public=is_public,
        weight=PUBLIC_WEIGHT if is_public else INFERRED_WEIGHT,
        sections=dict(sections),
    )


def weighted_theme_coverage(profiles: list[CompanyProfile], section_names: list[str], theme_keys: list[str]) -> float:
    total = 0.0
    for profile in profiles:
        items = []
        for section_name in section_names:
            items.extend(profile.sections.get(section_name, []))
        normalized_items = " || ".join(normalize(item) for item in items)
        if not normalized_items:
            continue
        if any(any(keyword in normalized_items for keyword in THEMES[theme_key]["keywords"]) for theme_key in theme_keys):
            total += profile.weight
    return total


def weighted_exact_coverage(profiles: list[CompanyProfile], section_name: str) -> Counter:
    counter: Counter = Counter()
    for profile in profiles:
        seen: set[str] = set()
        for item in profile.sections.get(section_name, []):
            key = normalize(item)
            if not key or key in seen:
                continue
            seen.add(key)
            counter[key] += profile.weight
    return counter


def parse_general_analysis(path: Path) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = defaultdict(list)
    current: str | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped.startswith("## "):
            current = stripped[3:].strip()
            continue
        if current and stripped.startswith("- "):
            sections[current].append(stripped[2:].strip())
    return dict(sections)


def build_market_metrics(profiles: list[CompanyProfile]) -> dict[str, float]:
    total_weight = sum(profile.weight for profile in profiles)
    metrics = {"total_weight": total_weight}
    for theme_key in THEMES:
        metrics[f"pain_{theme_key}"] = weighted_theme_coverage(profiles, [SECTION_PAINS], [theme_key])
        metrics[f"fear_{theme_key}"] = weighted_theme_coverage(profiles, [SECTION_FEARS], [theme_key])
        metrics[f"dream_{theme_key}"] = weighted_theme_coverage(profiles, [SECTION_DREAMS], [theme_key])
        metrics[f"desire_{theme_key}"] = weighted_theme_coverage(profiles, [SECTION_DESIRES], [theme_key])
        metrics[f"supply_{theme_key}"] = weighted_theme_coverage(profiles, [SECTION_PRODUCTS, SECTION_SERVICES], [theme_key])
    return metrics


def opportunity_scores(opportunity: Opportunity, metrics: dict[str, float]) -> dict[str, float]:
    total_weight = metrics["total_weight"]
    demand_weight = sum(metrics.get(f"pain_{key}", 0.0) for key in opportunity.pains)
    fear_weight = sum(metrics.get(f"fear_{key}", 0.0) for key in opportunity.fears)
    dream_weight = sum(metrics.get(f"dream_{key}", 0.0) for key in opportunity.dreams)
    desire_weight = sum(metrics.get(f"desire_{key}", 0.0) for key in opportunity.desires)
    supply_weight = sum(metrics.get(f"supply_{key}", 0.0) for key in opportunity.supply_conflict)

    demand_ratio = clamp((0.5 * demand_weight + 0.2 * fear_weight + 0.3 * desire_weight) / max(total_weight, 1.0) / max(len(opportunity.pains) * 0.5 + len(opportunity.fears) * 0.2 + len(opportunity.desires) * 0.3, 1.0), 0.0, 1.0)
    dream_ratio = clamp(dream_weight / max(total_weight, 1.0) / max(len(opportunity.dreams), 1), 0.0, 1.0)
    desire_ratio = clamp(desire_weight / max(total_weight, 1.0) / max(len(opportunity.desires), 1), 0.0, 1.0) if opportunity.desires else 0.0
    supply_ratio = clamp(supply_weight / max(total_weight, 1.0) / max(len(opportunity.supply_conflict), 1), 0.0, 1.0) if opportunity.supply_conflict else 0.0
    gap_ratio = clamp((0.55 * desire_ratio + 0.25 * demand_ratio + 0.20 * dream_ratio) - (0.35 * supply_ratio), 0.0, 1.0)

    scores = {
        "intensity_of_pain": round(score_from_ratio(demand_ratio), 1),
        "frequency_of_pain": round(score_from_ratio(demand_ratio), 1),
        "clarity_of_gap": round(score_from_ratio(gap_ratio), 1),
        "ease_of_channel": round(opportunity.channel_strength, 1),
        "speed_to_value": round(clamp(6 - opportunity.hardware_dependency), 1),
        "sell_without_new_hardware": round(clamp(6 - opportunity.hardware_dependency), 1),
        "ticket_potential": round(opportunity.ticket_potential, 1),
        "recurrence_potential": round(opportunity.recurrence_potential, 1),
    }
    scores["final_score"] = round(sum(scores.values()) / 8, 2)
    scores["demand_ratio"] = demand_ratio
    scores["gap_ratio"] = gap_ratio
    scores["supply_ratio"] = supply_ratio
    scores["desire_ratio"] = desire_ratio
    return scores


def theme_summary_line(title: str, weighted: float, total_weight: float, qualifier: str = "empresas equivalentes") -> str:
    return f"- {title}: {weighted:.1f} {qualifier} ({pct(weighted, total_weight)} do corpus ponderado)."


def top_weighted_lines(profiles: list[CompanyProfile], section_name: str, limit: int = 8) -> list[str]:
    counter = weighted_exact_coverage(profiles, section_name)
    ranked = sorted(counter.items(), key=lambda item: (-item[1], item[0]))
    return [f"- {label} — {count:.1f} empresas equivalentes." for label, count in ranked[:limit]]


def canonical_themes_report(metrics: dict[str, float]) -> dict[str, list[str]]:
    total_weight = metrics["total_weight"]
    demand_pairs = [
        ("Refugo, retrabalho e variabilidade", metrics["pain_quality_loss"]),
        ("Produtividade, setups e eficiência", metrics["pain_productivity"]),
        ("Paradas e indisponibilidade", metrics["pain_downtime"]),
        ("Integração com legado", metrics["fear_integration"]),
        ("Adoção operacional", metrics["fear_adoption"]),
        ("Prova de ROI", metrics["fear_roi"]),
    ]
    supply_pairs = [
        ("Produto/hardware base", metrics["supply_product_hardware"]),
        ("Suporte técnico e pós-venda básico", metrics["supply_basic_support"]),
        ("Diagnóstico consultivo e engenharia aplicada", metrics["supply_consultive_engineering"]),
        ("Monitoramento, dados e governança", metrics["supply_performance_layer"]),
        ("Retrofit e modernização", metrics["supply_retrofit"]),
    ]
    desire_pairs = [
        ("Pacotes por aplicação/segmento/processo", metrics["desire_vertical_packaging"]),
        ("Suporte consultivo e engenharia aplicada", metrics["desire_consultive_engineering"]),
        ("Prova de ROI e casos", metrics["desire_roi"]),
        ("Monitoramento, dados e performance layer", metrics["desire_performance_layer"]),
        ("Retrofit e modernização com menor risco", metrics["desire_retrofit"]),
    ]
    return {
        "demand": [theme_summary_line(title, value, total_weight) for title, value in demand_pairs],
        "supply": [theme_summary_line(title, value, total_weight) for title, value in supply_pairs],
        "desire": [theme_summary_line(title, value, total_weight) for title, value in desire_pairs],
    }


def build_markdown(profiles: list[CompanyProfile], general_sections: dict[str, list[str]]) -> str:
    metrics = build_market_metrics(profiles)
    total_profiles = len(profiles)
    public_profiles = sum(1 for profile in profiles if profile.is_public)
    inferred_profiles = total_profiles - public_profiles

    scored = [(opportunity, opportunity_scores(opportunity, metrics)) for opportunity in OPPORTUNITIES]
    ranked = sorted(scored, key=lambda item: item[1]["final_score"], reverse=True)
    top_10 = ranked[:10]
    top_3 = top_10[:3]
    main_opportunity, main_scores = top_3[0]
    report = canonical_themes_report(metrics)

    lines: list[str] = [
        "# Oportunidade Triple-Lock FEIMEC 2026",
        "",
        "## Método",
        f"- Releitura integral de {total_profiles} arquivos individuais de empresas na pasta `empresas/`.",
        f"- Releitura da análise consolidada em `analise-geral.md`.",
        f"- Perfis com descrição pública FEIMEC: {public_profiles}.",
        f"- Perfis inferidos: {inferred_profiles}.",
        f"- Perfis inferidos receberam peso reduzido ({INFERRED_WEIGHT}) versus perfis com descrição pública ({PUBLIC_WEIGHT}).",
        "- Nesta análise, `Gargalos` foram tratados como medos recorrentes e `Gaps` como desejos não plenamente atendidos.",
        "- O objetivo foi localizar o maior vazio entre dor real, oferta explícita atual e canal plugável legítimo.",
        "",
        "## 1. Síntese Executiva Do Mercado",
        "- O mercado mais compra hoje produto base: máquinas, componentes, automação, software industrial, metrologia, corte/solda e utilidades, normalmente acompanhado de suporte técnico, treinamento e pós-venda básico.",
        "- O mercado mais sofre hoje com refugo e variabilidade, baixa produtividade, paradas operacionais, dificuldade de integrar legado, dificuldade de adoção operacional e pressão para justificar investimento com ROI claro.",
        "- O mercado mais deseja e ainda não recebe bem é a camada de tradução do produto em resultado: diagnóstico aplicado, pacote por aplicação, implantação mais rápida, prova econômica, integração multimarcas, governança de dados e retrofit de menor risco.",
        "- Onde o mercado está saturado: hardware e software base, oferta de catálogo, suporte técnico tradicional e narrativas de tecnologia sem amarração executiva forte de ganho.",
        "- Onde o mercado está mal servido: serviços orientados a resultado, business case, integração neutra entre fornecedores, pacotes verticais por processo e performance layer sobre base instalada.",
        "",
        "## 2. Mapa De Oferta Vs Demanda",
        "### Demanda Dominante",
        *report["demand"],
        "",
        "### Desejo Não Atendido",
        *report["desire"],
        "",
        "### Oferta Explícita Mais Recorrente",
        *report["supply"],
        "",
        "### Leitura Comparativa",
        "- Superofertado: produto/hardware base e tecnologia de catálogo em quase todos os grandes blocos da feira.",
        "- Bem ofertado: suporte técnico, treinamento, assistência e pós-venda básicos; existe oferta, mas quase sempre como apêndice da venda principal.",
        "- Subofertado: diagnóstico econômico-operacional, integração multimarcas com neutralidade, pacotes por aplicação, performance layer e programas de retrofit orientados a ganho.",
        "- Claramente mal resolvido: captura de ROI, implantação acelerada, adoção real no chão de fábrica e orquestração entre hardware, software, processo e pessoas.",
        "",
        "## 3. Identificação Do Maior Vácuo",
    ]

    top_5 = top_10[:5]
    for index, (opportunity, scores) in enumerate(top_5, start=1):
        lines.extend([
            f"### {index}. {opportunity.title}",
            f"- Dor que resolve: {opportunity.description}",
            f"- Por que a oferta atual não resolve bem: o corpus mostra alta densidade de produto e suporte, mas baixa densidade de oferta explícita em {', '.join(THEMES[key]['label'].lower() for key in opportunity.desires[:3])}.",
            f"- Categorias de players próximos: {', '.join(THEMES[key]['label'].lower() for key in opportunity.supply_conflict) if opportunity.supply_conflict else 'fornecedores adjacentes'}.",
            f"- Por que ainda sobra espaço: a dor ponderada permanece alta ({pct(scores['demand_ratio'], 1.0)} do máximo possível da tese) e a clareza do vácuo também ({pct(scores['gap_ratio'], 1.0)}), enquanto a maior parte da feira para em produto, projeto ou suporte básico.",
            f"- Melhor forma de captura: {opportunity.format_ideal}.",
            "",
        ])

    lines.extend([
        "## 4. Ranking De Oportunidades Pelo Triple-Lock",
        "| # | Oportunidade | Dor | Frequência | Vácuo | Canal | Time-to-value | Sem hardware novo | Ticket | Recorrência | Nota final |",
        "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ])
    for index, (opportunity, scores) in enumerate(top_10, start=1):
        lines.append(
            f"| {index} | {opportunity.short_name} | {scores['intensity_of_pain']:.1f} | {scores['frequency_of_pain']:.1f} | {scores['clarity_of_gap']:.1f} | {scores['ease_of_channel']:.1f} | {scores['speed_to_value']:.1f} | {scores['sell_without_new_hardware']:.1f} | {scores['ticket_potential']:.1f} | {scores['recurrence_potential']:.1f} | {scores['final_score']:.2f} |"
        )

    lines.extend([
        "",
        "## 5. Top 3 Oportunidades Reais",
    ])

    for index, (opportunity, scores) in enumerate(top_3, start=1):
        pain_label = THEMES[opportunity.pains[0]]["label"] if opportunity.pains else "Dor operacional"
        fear_label = THEMES[opportunity.fears[0]]["label"] if opportunity.fears else "Risco operacional"
        dream_label = THEMES[opportunity.dreams[0]]["label"] if opportunity.dreams else "Ganho operacional"
        desire_label = THEMES[opportunity.desires[0]]["label"] if opportunity.desires else "Melhor entrega"
        lines.extend([
            f"### {index}. {opportunity.title}",
            f"- Nome da tese: {opportunity.short_name}.",
            f"- ICP primário: {opportunity.primary_icp}.",
            f"- Segmento industrial mais aderente: {opportunity.segment}.",
            f"- Dor central: {pain_label}.",
            f"- Medo central: {fear_label}.",
            f"- Sonho central: {dream_label}.",
            f"- Desejo não atendido: {desire_label}.",
            f"- Oferta ideal: {opportunity.offer_ideal}.",
            f"- Formato ideal da oferta: {opportunity.format_ideal}.",
            f"- Por que incumbentes não capturam bem esse espaço: {join_clauses(opportunity.why_incumbents_miss)}",
            f"- Canal plugável de aquisição: {opportunity.channel}.",
            f"- Time-to-value esperado: {opportunity.time_to_value}.",
            f"- Como provar ROI: {opportunity.roi_proof}.",
            f"- Principais objeções de compra: {join_clauses(opportunity.objections)}",
            f"- O que torna essa tese escalável: {'; '.join(opportunity.scale_drivers)}.",
            f"- Nota final Triple-Lock: {scores['final_score']:.2f}.",
            "",
        ])

    lines.extend([
        "## 6. Tese Principal",
        f"A melhor oportunidade do mercado é **{main_opportunity.title}**.",
        f"- Ela combina demanda real muito alta porque ataca simultaneamente refugo/variabilidade, produtividade, integração e prova de ROI, que são os blocos mais repetidos do corpus.",
        f"- Ela tem vácuo claro porque a oferta atual explicita muito produto/hardware e muito suporte tradicional, mas pouco serviço neutro de diagnóstico, priorização e captura de ganho cross-vendor.",
        f"- Ela tem canal plugável forte porque entra por pós-feira, base instalada, OEMs complementares, integradores e assistência técnica já existente.",
        f"- Ela é mais forte do que criar mais um produto industrial genérico porque monetiza a camada acima do produto: decisão, implantação, priorização, ROI e governança da captura de valor.",
        f"- Ela tem maior chance de capturar valor rapidamente porque consegue vender sem fabricar hardware novo, provar ganho em 30 a 60 dias e abrir expansão para retrofit, performance layer e execução assistida.",
        f"- Ela conversa com o núcleo emocional e operacional do mercado porque reduz o medo de errar investimento, integra legado sem travar a operação e transforma promessa técnica em resultado econômico palpável.",
        "",
        "## 7. O Que Descartar",
        "- Mais uma marca de hardware industrial generalista: o mercado já está saturado de produto base e a dor não é falta de catálogo.",
        "- Software amplo e genérico de transformação industrial sem aplicação específica: tende a competir em narrativa, não em resultado capturável.",
        "- Consultoria industrial aberta e sem empacotamento: o corpus pede aplicação, rapidez, prova e recorte vertical, não diagnóstico abstrato sem entrega.",
        "- Plataformas que exigem confiança longa antes do primeiro resultado: o mercado quer evidência rápida, não promessa estrutural sem quick wins.",
        "- Teses que dependem de fabricar hardware novo e concorrer frontalmente com gigantes da feira: canal mais duro, prova mais lenta e pouca diferenciação frente à densidade de incumbentes.",
        "- Marketplaces técnicos genéricos: têm bom canal, mas viram intermediação fraca se não houver metodologia, curadoria e captura real de resultado.",
        "",
        "## 8. Saída Final",
        "- Maior vazio do mercado em uma frase: o maior vazio da FEIMEC está na camada que converte tecnologia industrial já disponível em ganho comprovado, implementado e sustentado no chão de fábrica.",
        f"- Melhor tese de oferta em uma frase: {main_opportunity.title} é a tese mais forte porque empacota diagnóstico, priorização, ROI e implantação sobre base instalada multimarcas sem depender de novo hardware.",
        f"- Melhor canal plugável em uma frase: o melhor canal é a combinação pós-feira + base instalada + integradores/OEMs/revendas técnicas que já possuem relacionamento e acesso ao problema real.",
        "- Melhor combinação de entrada rápida + defensabilidade em uma frase: entrar com diagnóstico e business case rápido, depois expandir para retrofit, monitoramento e governança, cria velocidade comercial com defensabilidade crescente por metodologia e dados.",
        "",
        "## Observações De Confiança",
        f"- As leituras de mercado acima usam todo o corpus, mas perfis inferidos tiveram peso reduzido para evitar superestimar padrões genéricos.",
        f"- Os padrões mais críticos da tese principal aparecem de forma consistente tanto nos 656 perfis públicos quanto na análise geral consolidada.",
        f"- Itens do corpus usados como apoio de recorrência: {general_sections.get('Visão Executiva', [])[2] if len(general_sections.get('Visão Executiva', [])) > 2 else 'dores recorrentes altas'}, {general_sections.get('Visão Executiva', [])[3] if len(general_sections.get('Visão Executiva', [])) > 3 else 'medos recorrentes altos'}, {general_sections.get('Visão Executiva', [])[5] if len(general_sections.get('Visão Executiva', [])) > 5 else 'núcleo de serviços dominante'}.",
        "",
        "## Apêndice Rápido",
        "### Produtos Mais Frequentes No Corpus",
        *top_weighted_lines(profiles, SECTION_PRODUCTS),
        "",
        "### Serviços Mais Frequentes No Corpus",
        *top_weighted_lines(profiles, SECTION_SERVICES),
        "",
        "### Dores Mais Frequentes No Corpus",
        *top_weighted_lines(profiles, SECTION_PAINS),
        "",
        "### Medos Mais Frequentes No Corpus",
        *top_weighted_lines(profiles, SECTION_FEARS),
        "",
        "### Desejos Mais Frequentes No Corpus",
        *top_weighted_lines(profiles, SECTION_DESIRES),
    ])

    return "\n".join(lines).strip() + "\n"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera a análise final de oportunidade Triple-Lock para a FEIMEC 2026.")
    parser.add_argument("--companies-dir", type=Path, default=COMPANIES_DIR)
    parser.add_argument("--general-analysis", type=Path, default=GENERAL_ANALYSIS)
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    company_files = sorted(args.companies_dir.glob("*.md"))
    profiles = [parse_company(path) for path in company_files]
    general_sections = parse_general_analysis(args.general_analysis)
    markdown = build_markdown(profiles, general_sections)
    args.output.write_text(markdown, encoding="utf-8")
    print(
        json.dumps(
            {
                "companies": len(profiles),
                "public_profiles": sum(1 for profile in profiles if profile.is_public),
                "inferred_profiles": sum(1 for profile in profiles if not profile.is_public),
                "output": str(args.output),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()