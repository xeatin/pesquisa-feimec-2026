from __future__ import annotations

import argparse
import concurrent.futures
import html
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


EVENT_ID = "RXZlbnRfMjc0MzQ5Mw=="
VIEW_ID = "RXZlbnRWaWV3XzEyMTA2ODM="
BASE_URL = f"https://app.informamarkets.com.br/event/feimec-2026/exhibitors/{VIEW_ID}"
DEFAULT_INPUT = Path("/Users/tiagopc/Downloads/message.txt")
DEFAULT_OUTPUT = Path("empresas")
DEFAULT_CACHE = Path("dados/feimec_cache.json")
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/136.0.0.0 Safari/537.36"
)
BOOTH_CODE_RE = re.compile(r"^(?:[A-Z]{1,3}\d{2,3}[a-z]?|EXT\d{2}|N/A)$")


@dataclass
class CompanySeed:
    name: str
    booths: list[str]


@dataclass
class CompanyResult:
    name: str
    booths: list[str]
    found_names: list[str]
    description_text: str
    source_status: str
    search_url: str
    matches: int
    used_query: str


SEGMENTS = {
    "institutional": {
        "label": "entidades, associações e ecossistema setorial",
        "summary": "atua como articulador do ecossistema industrial, conectando empresas, conhecimento, capacitação e oportunidades de negócios.",
        "value": [
            "fortalecer a representatividade do setor",
            "gerar networking qualificado",
            "acelerar acesso a informação e mercado",
        ],
        "products": [
            "Representação setorial",
            "Networking e geração de negócios",
            "Eventos e conteúdo técnico",
            "Capacitação e relacionamento institucional",
        ],
        "services": [
            "Articulação institucional",
            "Curadoria de conteúdo",
            "Promoção comercial",
            "Conexão entre associados e mercado",
        ],
        "pains": [
            "Baixa articulação entre empresas, cadeia produtiva e governo.",
            "Dificuldade de ampliar visibilidade e influência do setor.",
            "Necessidade de gerar relacionamento e negócios com mais previsibilidade.",
        ],
        "dreams": [
            "Concentrar a indústria em um ecossistema mais conectado e influente.",
            "Aumentar relevância, alcance e autoridade junto ao mercado.",
            "Transformar conteúdo e relacionamento em novos negócios para a base.",
        ],
        "gargalos": [
            "Converter relevância institucional em valor tangível para os membros.",
            "Manter agenda contínua de engajamento além do evento presencial.",
            "Segmentar melhor ofertas para perfis distintos de associados e parceiros.",
        ],
        "gaps": [
            "Mais produtos digitais recorrentes e orientados a resultado.",
            "Pacotes claros de patrocínio, inteligência e relacionamento.",
            "Melhor mensuração de impacto comercial gerado para a base.",
        ],
    },
    "software": {
        "label": "software industrial, CAD/CAM, ERP e digitalização",
        "summary": "atua com software para projetar, programar, integrar e otimizar operações industriais, transformando dados e processos em produtividade.",
        "value": [
            "reduzir retrabalho",
            "acelerar programação e decisão",
            "integrar informação de ponta a ponta",
        ],
        "products": [
            "Software CAD/CAM",
            "ERP industrial",
            "Soluções de automação e integração",
            "Monitoramento e análise de processos",
        ],
        "services": [
            "Implantação",
            "Treinamento",
            "Suporte técnico",
            "Consultoria de processos",
        ],
        "pains": [
            "Programação manual, retrabalho e perda de produtividade no fluxo técnico.",
            "Baixa integração entre engenharia, produção e gestão.",
            "Pouca visibilidade sobre desempenho e gargalos do processo.",
        ],
        "dreams": [
            "Digitalizar o fluxo industrial sem perder velocidade operacional.",
            "Tomar decisões com dados confiáveis e em tempo quase real.",
            "Escalar produtividade com padronização, rastreabilidade e menos erro.",
        ],
        "gargalos": [
            "Integração com sistemas legados e bases fragmentadas.",
            "Adoção pelos usuários do chão de fábrica e engenharia.",
            "Comprovação de ROI em projetos de transformação digital.",
        ],
        "gaps": [
            "Pacotes de implantação mais enxutos e rápidos.",
            "Casos de uso por segmento com métricas objetivas de ganho.",
            "Ofertas mais fortes de onboarding e governança de dados.",
        ],
    },
    "automation": {
        "label": "automação industrial, robótica e controle de movimento",
        "summary": "atua em automação e robótica para tornar operações industriais mais produtivas, flexíveis, seguras e repetíveis.",
        "value": [
            "aumentar produtividade",
            "melhorar flexibilidade operacional",
            "reduzir risco e variabilidade",
        ],
        "products": [
            "Robôs industriais e colaborativos",
            "Sistemas de automação",
            "Controladores e drives",
            "Soluções de movimento e integração",
        ],
        "services": [
            "Integração de células",
            "Comissionamento",
            "Treinamento",
            "Suporte técnico e pós-venda",
        ],
        "pains": [
            "Escassez de mão de obra em operações repetitivas ou críticas.",
            "Baixa OEE por setups, paradas e falta de integração.",
            "Variabilidade de qualidade e dificuldade para escalar automação.",
        ],
        "dreams": [
            "Operar com mais previsibilidade, segurança e qualidade.",
            "Escalar automação com payback claro e baixo risco.",
            "Conectar máquinas, células e dados em uma operação flexível.",
        ],
        "gargalos": [
            "Integração com legado e adequação ao processo real do cliente.",
            "Capex e aprovação técnica/comercial do investimento.",
            "Disponibilidade de suporte especializado no pós-venda.",
        ],
        "gaps": [
            "Mais provas de conceito com ROI por aplicação.",
            "Ofertas modulares de entrada, retrofit e expansão.",
            "Conteúdo consultivo mais específico por segmento industrial.",
        ],
    },
    "machine_tools": {
        "label": "máquinas-ferramenta, conformação e equipamentos de produção",
        "summary": "atua com máquinas e células produtivas para usinagem, conformação, corte, dobra, injeção ou produção industrial pesada.",
        "value": [
            "elevar capacidade produtiva",
            "ganhar precisão e repetibilidade",
            "reduzir custo por peça e lead time",
        ],
        "products": [
            "Centros de usinagem",
            "Tornos CNC",
            "Prensas e dobradeiras",
            "Máquinas especiais e células turnkey",
        ],
        "services": [
            "Aplicação e engenharia de processo",
            "Turnkey",
            "Assistência técnica",
            "Instalação e start-up",
        ],
        "pains": [
            "Capacidade insuficiente, setups longos e baixa produtividade por máquina.",
            "Dificuldade de manter precisão, repetibilidade e disponibilidade.",
            "Necessidade de justificar investimentos pesados com retorno claro.",
        ],
        "dreams": [
            "Produzir mais, com menos refugo e menor custo unitário.",
            "Ganhar previsibilidade de prazo e estabilidade de processo.",
            "Modernizar o parque fabril sem interromper a operação.",
        ],
        "gargalos": [
            "Lead time de compra, importação, instalação e ramp-up.",
            "Treinamento operacional e manutenção de alta complexidade.",
            "Integração com automação, ferramental e fluxo real de fábrica.",
        ],
        "gaps": [
            "Pacotes mais fortes de produtividade aplicada por processo.",
            "Modelos de retrofit, financiamento e expansão faseada.",
            "Oferta mais profunda de monitoramento, serviço e performance pós-venda.",
        ],
    },
    "laser_welding": {
        "label": "corte, soldagem, laser e processos térmicos de fabricação",
        "summary": "atua com tecnologias de corte, solda, laser e processos correlatos para aumentar velocidade, qualidade e controle da fabricação.",
        "value": [
            "reduzir refugo",
            "ganhar velocidade e acabamento",
            "padronizar qualidade de processo",
        ],
        "products": [
            "Máquinas de corte a laser",
            "Equipamentos de soldagem",
            "Consumíveis e tochas",
            "Soluções de exaustão e processo térmico",
        ],
        "services": [
            "Aplicação de processo",
            "Assistência técnica",
            "Treinamento",
            "Suporte de parametrização",
        ],
        "pains": [
            "Perda de produtividade por parametrização ruim, consumíveis e retrabalho.",
            "Oscilação de qualidade em corte, união e acabamento.",
            "Paradas de máquina e dificuldade de manter o processo estável.",
        ],
        "dreams": [
            "Cortar e soldar mais rápido, com menos desperdício e mais qualidade.",
            "Automatizar processos mantendo robustez e segurança.",
            "Reduzir custo operacional com processo padronizado e previsível.",
        ],
        "gargalos": [
            "Dependência de parametrização fina e operadores experientes.",
            "Disponibilidade de peças, consumíveis e suporte de campo.",
            "Integração entre fonte, automação, exaustão e setup produtivo.",
        ],
        "gaps": [
            "Pacotes de aplicação por espessura, material e volume.",
            "Mais prova de ganho em custo por peça e consumo.",
            "Ofertas combinando equipamento, processo e pós-venda contínuo.",
        ],
    },
    "fluids": {
        "label": "hidráulica, pneumática, válvulas, bombas e fluidos industriais",
        "summary": "atua com componentes e sistemas para movimentação, controle e confiabilidade de fluidos e energia em aplicações industriais.",
        "value": [
            "garantir confiabilidade",
            "reduzir vazamentos e paradas",
            "melhorar eficiência operacional",
        ],
        "products": [
            "Válvulas e atuadores",
            "Bombas e compressores",
            "Conexões e engates",
            "Sistemas hidráulicos e pneumáticos",
        ],
        "services": [
            "Projeto e especificação",
            "Montagem e integração",
            "Suporte técnico",
            "Manutenção e reposição",
        ],
        "pains": [
            "Paradas por vazamento, contaminação, falha de vedação ou especificação errada.",
            "Baixa eficiência energética e alto custo de manutenção.",
            "Dificuldade de padronizar componentes e reduzir risco operacional.",
        ],
        "dreams": [
            "Operar com máxima confiabilidade e menor parada não planejada.",
            "Reduzir desperdício energético e custo total de manutenção.",
            "Ter componentes certos, com entrega rápida e suporte técnico forte.",
        ],
        "gargalos": [
            "Especificação técnica complexa em ambientes severos.",
            "Disponibilidade de estoque e lead time de reposição.",
            "Integração entre desempenho, segurança e custo total.",
        ],
        "gaps": [
            "Mais diagnóstico preventivo e monitoramento de condição.",
            "Kits e soluções aplicadas por segmento/processo.",
            "Maior clareza comercial sobre custo total de propriedade.",
        ],
    },
    "materials": {
        "label": "materiais, componentes, abrasivos, fixação e insumos industriais",
        "summary": "atua com insumos e componentes críticos para manter a produção industrial abastecida, estável e com desempenho técnico adequado.",
        "value": [
            "garantir disponibilidade",
            "elevar desempenho do processo",
            "reduzir custo e variabilidade de suprimento",
        ],
        "products": [
            "Aços, ligas e metais",
            "Fixadores e componentes",
            "Abrasivos e consumíveis",
            "Peças de transmissão e reposição",
        ],
        "services": [
            "Especificação técnica",
            "Suporte de aplicação",
            "Logística e abastecimento",
            "Atendimento comercial consultivo",
        ],
        "pains": [
            "Risco de ruptura de estoque, variação de qualidade e lead time alto.",
            "Dificuldade de escolher material ou componente certo para a aplicação.",
            "Pressão por custo sem comprometer performance e durabilidade.",
        ],
        "dreams": [
            "Ter suprimento previsível com especificação técnica confiável.",
            "Reduzir custo total mantendo qualidade e vida útil.",
            "Encontrar fornecedores que respondam rápido e conheçam a aplicação.",
        ],
        "gargalos": [
            "Volatilidade de preço, importação e disponibilidade.",
            "Compatibilização entre desempenho técnico e orçamento.",
            "Necessidade de customização ou corte/processo adicional.",
        ],
        "gaps": [
            "Mais conteúdo aplicado por caso de uso e material.",
            "Serviços adicionais de engenharia, corte, kit e consignado.",
            "Visibilidade melhor sobre prazo, estoque e substituição equivalente.",
        ],
    },
    "handling": {
        "label": "movimentação de carga, armazenagem e segurança industrial",
        "summary": "atua com soluções para movimentação, elevação, armazenagem e segurança de operação em ambientes industriais e logísticos.",
        "value": [
            "aumentar segurança",
            "reduzir esforço e risco operacional",
            "dar fluidez ao fluxo interno",
        ],
        "products": [
            "Pontes, talhas e equipamentos de içamento",
            "Sistemas de armazenagem e movimentação",
            "Componentes de segurança e sinalização",
            "Soluções de logística interna",
        ],
        "services": [
            "Projeto de aplicação",
            "Instalação",
            "Inspeção e manutenção",
            "Treinamento e adequação de segurança",
        ],
        "pains": [
            "Risco de acidente, ergonomia ruim e gargalos no fluxo interno.",
            "Baixa produtividade em movimentação e abastecimento da operação.",
            "Necessidade de atender normas sem travar a produção.",
        ],
        "dreams": [
            "Movimentar cargas com segurança, rapidez e previsibilidade.",
            "Reduzir incidentes e melhorar fluidez operacional.",
            "Ampliar capacidade sem crescer proporcionalmente em equipe ou risco.",
        ],
        "gargalos": [
            "Adequação estrutural e normativa da planta.",
            "Integração entre equipamento, layout e operação real.",
            "Manutenção e inspeção contínuas para evitar parada e risco.",
        ],
        "gaps": [
            "Mais ofertas completas com engenharia, instalação e inspeção.",
            "Conteúdo objetivo sobre compliance e redução de risco.",
            "Modelos mais claros de retrofit e modernização de ativos.",
        ],
    },
    "quality": {
        "label": "metrologia, controle de qualidade e inspeção",
        "summary": "atua com tecnologia de medição, inspeção e controle de qualidade para reduzir desvio, refugo e incerteza nos processos industriais.",
        "value": [
            "aumentar precisão",
            "reduzir refugo e retrabalho",
            "dar confiabilidade às decisões de processo",
        ],
        "products": [
            "Equipamentos de medição",
            "Sistemas de inspeção",
            "Software de qualidade",
            "Soluções de calibração e controle",
        ],
        "services": [
            "Aplicação técnica",
            "Treinamento",
            "Calibração e suporte",
            "Consultoria de qualidade",
        ],
        "pains": [
            "Desvios de processo que aparecem tarde demais e viram refugo.",
            "Baixa rastreabilidade e dificuldade de padronizar medições.",
            "Necessidade de acelerar inspeção sem perder confiabilidade.",
        ],
        "dreams": [
            "Tomar decisão com confiança e reduzir variabilidade do processo.",
            "Ganhar velocidade na inspeção mantendo precisão.",
            "Conectar qualidade ao fluxo produtivo e aos dados da fábrica.",
        ],
        "gargalos": [
            "Adoção operacional de métodos e rotinas de medição.",
            "Integração entre hardware, software e processo.",
            "Custo de equipamento versus frequência de uso e criticidade.",
        ],
        "gaps": [
            "Mais pacotes por aplicação e criticidade de processo.",
            "Integração mais simples com sistemas digitais e relatórios.",
            "Narrativa comercial mais forte em custo evitado e redução de refugo.",
        ],
    },
    "thermal": {
        "label": "aquecimento, fornos, gases e utilidades industriais",
        "summary": "atua com utilidades, aquecimento, combustão, gases ou processos térmicos críticos para sustentar produção, eficiência e segurança industrial.",
        "value": [
            "elevar eficiência energética",
            "garantir estabilidade operacional",
            "reduzir risco e custo do processo térmico",
        ],
        "products": [
            "Fornos e aquecimento industrial",
            "Queimadores e combustão",
            "Gases e utilidades",
            "Equipamentos de processo térmico",
        ],
        "services": [
            "Projeto e especificação",
            "Comissionamento",
            "Manutenção",
            "Otimização de processo",
        ],
        "pains": [
            "Alto consumo energético e instabilidade de processo.",
            "Risco operacional e exigências rigorosas de segurança.",
            "Dificuldade de manter eficiência, qualidade térmica e disponibilidade.",
        ],
        "dreams": [
            "Operar com menor custo energético e maior confiabilidade.",
            "Padronizar qualidade térmica e reduzir variações do processo.",
            "Ter suporte técnico forte para ambientes de alta criticidade.",
        ],
        "gargalos": [
            "Adequação de utilidades e infraestrutura da planta.",
            "Equilíbrio entre segurança, eficiência e produtividade.",
            "Tempo de parada para manutenção ou modernização.",
        ],
        "gaps": [
            "Mais diagnósticos de eficiência energética com plano de ação.",
            "Retrofit e modernização com execução menos invasiva.",
            "Mensuração comercial mais clara do ganho energético e operacional.",
        ],
    },
    "general": {
        "label": "soluções industriais gerais",
        "summary": "atua com soluções industriais voltadas a melhorar desempenho, confiabilidade e produtividade no ambiente fabril.",
        "value": [
            "ganhar eficiência",
            "reduzir parada e retrabalho",
            "acelerar resultado operacional",
        ],
        "products": [
            "Equipamentos e componentes industriais",
            "Soluções de processo",
            "Tecnologias de apoio à produção",
            "Itens de manutenção e melhoria contínua",
        ],
        "services": [
            "Suporte técnico",
            "Aplicação e especificação",
            "Atendimento consultivo",
            "Pós-venda",
        ],
        "pains": [
            "Pressão por produtividade com menos margem para erro e parada.",
            "Dificuldade de encontrar solução aderente ao processo real.",
            "Necessidade de equilibrar custo, qualidade e prazo.",
        ],
        "dreams": [
            "Ganhar previsibilidade, qualidade e velocidade operacional.",
            "Ter fornecedor que entenda a aplicação e responda rápido.",
            "Transformar melhoria técnica em resultado econômico palpável.",
        ],
        "gargalos": [
            "Mapear corretamente o problema antes de comprar a solução.",
            "Integrar tecnologia nova ao processo existente.",
            "Sustentar resultado no pós-venda e na rotina operacional.",
        ],
        "gaps": [
            "Mais prova prática de ganho por aplicação.",
            "Pacotes consultivos mais claros antes e depois da venda.",
            "Conteúdo mais objetivo para encurtar decisão técnica e comercial.",
        ],
    },
}


SEGMENT_RULES = [
    (
        "institutional",
        [
            r"\bassocia(?:c|ç)[aã]o\b",
            r"\bsindicato\b",
            r"\bpavilh[aã]o\b",
            r"\btrade agency\b",
            r"\bembaixada\b",
            r"\beditora\b",
            r"\brevista\b",
            r"\bcomercial service\b",
        ],
    ),
    (
        "software",
        [
            r"cad/?cam",
            r"\berp\b",
            r"software",
            r"mes\b",
            r"intelig[eê]ncia artificial",
            r"\bia\b",
            r"manuten[cç][aã]o preditiva",
            r"monitoramento",
            r"diagn[oó]stico",
            r"efici[eê]ncia energ[eé]tica",
            r"ind[uú]stria 4\.0",
            r"digital",
            r"iot\b",
            r"analytics",
        ],
    ),
    (
        "quality",
        [
            r"metrolog",
            r"inspe[cç][aã]o",
            r"medi[cç][aã]o",
            r"calibra",
            r"qualidade",
            r"scanner",
            r"zeiss",
            r"renishaw",
            r"zoller",
        ],
    ),
    (
        "automation",
        [
            r"rob[oô]t",
            r"cobot",
            r"automa[cç][aã]o",
            r"clp\b",
            r"ihm\b",
            r"servo",
            r"inversor",
            r"drive\b",
            r"motion",
            r"amr\b",
        ],
    ),
    (
        "machine_tools",
        [
            r"centro de usinagem",
            r"torno",
            r"m[aá]quina",
            r"prensa",
            r"dobradeira",
            r"guilhotina",
            r"inje",
            r"mandrilhadora",
            r"perfiladeira",
            r"usinagem",
        ],
    ),
    (
        "laser_welding",
        [
            r"laser",
            r"solda",
            r"soldagem",
            r"plasma",
            r"waterjet",
            r"tocha",
            r"corte",
            r"exaust",
        ],
    ),
    (
        "fluids",
        [
            r"hidr[aá]ul",
            r"pneum[aá]t",
            r"v[aá]lvul",
            r"bomba",
            r"compress",
            r"air",
            r"fluido",
            r"veda[cç][aã]",
            r"engate",
        ],
    ),
    (
        "handling",
        [
            r"movimenta[cç][aã]o de cargas",
            r"i[cç]amento",
            r"ponte rolante",
            r"talha",
            r"crane",
            r"armazen",
            r"safety",
            r"log[ií]st",
        ],
    ),
    (
        "thermal",
        [
            r"forno",
            r"aquec",
            r"combust",
            r"queimador",
            r"gases?",
            r"induction",
            r"caldeira",
        ],
    ),
    (
        "materials",
        [
            r"a[cç]o",
            r"metal",
            r"abrasiv",
            r"fixa",
            r"parafus",
            r"acoplament",
            r"rolament",
            r"corrente",
            r"lubrificant",
            r"ferramenta",
        ],
    ),
]


PRODUCT_PATTERNS = [
    (r"rob[oô]s? colaborativos?", "Robôs colaborativos"),
    (r"rob[oô]s? m[oó]veis aut[oô]nomos|\bamrs?\b", "Robôs móveis autônomos (AMRs)"),
    (r"rob[oô]s? industriais?", "Robôs industriais"),
    (r"centros? de usinagem", "Centros de usinagem"),
    (r"tornos? cnc", "Tornos CNC"),
    (r"mandrilhadoras?", "Mandrilhadoras"),
    (r"prensas? mec[aâ]nicas?", "Prensas mecânicas"),
    (r"servo ?prensas?", "Servo prensas"),
    (r"dobradeiras?", "Dobradeiras"),
    (r"guilhotinas?", "Guilhotinas"),
    (r"inje(?:tora|toras)", "Injetoras"),
    (r"m[aá]quinas? de corte a laser|corte a laser", "Máquinas de corte a laser"),
    (r"solda(?:gem)? robotizada|soldagem", "Soluções de soldagem"),
    (r"tochas?", "Tochas e consumíveis"),
    (r"v[aá]lvulas?", "Válvulas industriais"),
    (r"bombas?", "Bombas"),
    (r"compressores?", "Compressores"),
    (r"cilindros? pneum[aá]ticos?", "Cilindros pneumáticos"),
    (r"conex[oõ]es?", "Conexões industriais"),
    (r"engates? r[aá]pidos?", "Engates rápidos"),
    (r"acoplamentos?", "Acoplamentos"),
    (r"redutores?", "Redutores"),
    (r"motores? el[eé]tricos?", "Motores elétricos"),
    (r"servo motores?", "Servo motores"),
    (r"inversores? de frequ[eê]ncia", "Inversores de frequência"),
    (r"\bclp\b|controladores? l[oó]gicos program[aá]veis", "CLPs"),
    (r"\bihm\b|interfaces? homem-m[aá]quina", "IHMs"),
    (r"software cad/?cam", "Software CAD/CAM"),
    (r"manuten[cç][aã]o preditiva", "Soluções de manutenção preditiva"),
    (r"intelig[eê]ncia artificial", "Soluções com inteligência artificial"),
    (r"monitoramento", "Plataformas de monitoramento industrial"),
    (r"diagn[oó]stico de falhas", "Diagnóstico de falhas"),
    (r"\berp\b", "ERP industrial"),
    (r"metrolog", "Soluções de metrologia"),
    (r"scanner", "Scanners de inspeção"),
    (r"impress[aã]o 3d|manufatura aditiva", "Manufatura aditiva / impressão 3D"),
    (r"a[cç]os? ferramenta", "Aços ferramenta"),
    (r"a[cç]os? inox", "Aços inoxidáveis"),
    (r"fixadores?", "Fixadores"),
    (r"abrasivos?", "Abrasivos"),
    (r"pontes? e p[oó]rticos rolantes", "Pontes e pórticos rolantes"),
    (r"talhas?", "Talhas"),
    (r"fornos?", "Fornos industriais"),
    (r"queimadores?", "Queimadores"),
    (r"gases?", "Gases e utilidades industriais"),
]


SERVICE_PATTERNS = [
    (r"assist[eê]ncia t[eé]cnica", "Assistência técnica"),
    (r"suporte(?: t[eé]cnico)?", "Suporte técnico"),
    (r"consultoria", "Consultoria"),
    (r"treinamento", "Treinamento"),
    (r"manuten[cç][aã]o", "Manutenção"),
    (r"retrofit", "Retrofit"),
    (r"implementa[cç][aã]o", "Implementação"),
    (r"integra[cç][aã]o", "Integração"),
    (r"projetos? personalizados?", "Projetos personalizados"),
    (r"projetos? sob medida", "Projetos sob medida"),
    (r"outsourcing", "Outsourcing"),
    (r"instala[cç][aã]o", "Instalação"),
    (r"comissionamento", "Comissionamento"),
    (r"start-up", "Start-up"),
    (r"p[oó]s-venda", "Pós-venda"),
    (r"engenharia", "Engenharia de aplicação"),
    (r"desenvolvimento", "Desenvolvimento de soluções"),
]


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_value = ascii_value.lower()
    ascii_value = re.sub(r"[^a-z0-9]+", " ", ascii_value)
    return re.sub(r"\s+", " ", ascii_value).strip()


def sanitize_filename(name: str) -> str:
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    ascii_name = ascii_name.replace("/", " - ")
    ascii_name = re.sub(r"[\\:*?\"<>|]", " ", ascii_name)
    ascii_name = re.sub(r"\s+", " ", ascii_name).strip(" .")
    return ascii_name or "empresa"


def unique_preserve(items: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        clean = item.strip()
        if not clean or clean in seen:
            continue
        seen.add(clean)
        result.append(clean)
    return result


def parse_company_seeds(path: Path) -> list[CompanySeed]:
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines()]
    blocks: list[list[str]] = []
    current: list[str] = []
    for line in lines:
        if not line:
            if current:
                blocks.append(current)
                current = []
            continue
        current.append(line)
    if current:
        blocks.append(current)

    booths_by_name: dict[str, list[str]] = {}
    for block in blocks:
        if block and block[0] == "Empresas 2026":
            block = block[1:]
        if not block:
            continue
        if len(block) == 3 and block[0] == block[1]:
            name, booth = block[0], block[2]
        elif len(block) == 2:
            name = block[0]
            booth = block[1] if block[1] != block[0] and BOOTH_CODE_RE.match(block[1]) else ""
        else:
            name = block[0]
            booth = block[-1] if len(block) > 1 else ""
        booths_by_name.setdefault(name, [])
        if booth and booth != "N/A":
            booths_by_name[name].append(booth)

    return [
        CompanySeed(name=name, booths=unique_preserve(booths))
        for name, booths in booths_by_name.items()
    ]


def request_text(url: str, retries: int = 3) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read().decode("utf-8", errors="ignore")
        except Exception as exc:  # noqa: BLE001
            last_error = exc
            if attempt == retries:
                break
            time.sleep(0.5 * attempt)
    raise RuntimeError(f"Falha ao buscar {url}: {last_error}") from last_error


def parse_next_data(html_text: str) -> dict:
    marker = '<script id="__NEXT_DATA__" type="application/json">'
    start = html_text.find(marker)
    if start == -1:
        raise ValueError("__NEXT_DATA__ não encontrado na página")
    start = html_text.find(">", start) + 1
    end = html_text.find("</script>", start)
    return json.loads(html_text[start:end])


def extract_state(data: dict) -> dict:
    return data.get("props", {}).get("apolloState", {})


def collect_exhibitors(state: dict) -> list[dict]:
    exhibitors: list[dict] = []
    for key, value in state.items():
        if key.startswith("Core_Exhibitor:") and isinstance(value, dict):
            exhibitors.append(value)
    return exhibitors


def extract_exhibitor_booth(exhibitor: dict) -> str:
    with_event = exhibitor.get(f'withEvent({{"eventId":"{EVENT_ID}"}})')
    if isinstance(with_event, dict):
        booth = with_event.get("booth")
        if booth and booth.upper() != "N/A":
            return booth
    return ""


def score_match(target_name: str, candidate_name: str) -> tuple[int, int]:
    target = normalize_text(target_name)
    candidate = normalize_text(candidate_name)
    if candidate == target:
        return (3, len(candidate))
    if candidate in target or target in candidate:
        return (2, len(candidate))
    target_tokens = set(target.split())
    candidate_tokens = set(candidate.split())
    overlap = len(target_tokens & candidate_tokens)
    return (1 if overlap else 0, overlap)


def pick_matching_exhibitors(target_name: str, exhibitors: list[dict]) -> list[dict]:
    ranked = []
    for exhibitor in exhibitors:
        score = score_match(target_name, exhibitor.get("name", ""))
        ranked.append((score, exhibitor))
    ranked.sort(key=lambda item: item[0], reverse=True)
    if not ranked or ranked[0][0][0] == 0:
        return []
    best_score = ranked[0][0]
    return [exhibitor for score, exhibitor in ranked if score == best_score]


def normalize_html_text(raw_html: str | None) -> str:
    if not raw_html:
        return ""
    text = raw_html
    replacements = {
        r"(?i)<br\s*/?>": "\n",
        r"(?i)</p>": "\n\n",
        r"(?i)</div>": "\n\n",
        r"(?i)</ul>": "\n",
        r"(?i)</ol>": "\n",
        r"(?i)<li>": "\n- ",
    }
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = text.replace("_x000D_", " ")
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def split_sentences(text: str) -> list[str]:
    text = text.replace("\n", " ")
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [part.strip() for part in parts if len(part.strip()) > 20]


def extract_bullets(text: str) -> list[str]:
    bullets: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith(("- ", "• ")):
            bullets.append(stripped[2:].strip(" .;:-"))
    return unique_preserve(bullets)


def extract_labelled_items(text: str) -> list[str]:
    results: list[str] = []
    for pattern in [
        r"(?:produtos?|portf[oó]lio|portfolio|especialidades|linha de produtos?|nossos produtos|principais linhas)\s*:\s*(.+)",
        r"(?:solu[cç][oõ]es?)\s*:\s*(.+)",
    ]:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            chunk = match.group(1)
            for item in re.split(r"[;,]|\s[-–]\s|/", chunk):
                clean = item.strip(" .:-")
                if 3 < len(clean) < 80:
                    results.append(clean)
    return unique_preserve(results)


def infer_segment(name: str, description_text: str) -> str:
    haystack = f"{name} {description_text}".lower()
    best_key = "general"
    best_score = 0
    for segment_key, rules in SEGMENT_RULES:
        score = sum(2 if re.search(rule, haystack, flags=re.IGNORECASE) else 0 for rule in rules)
        if score > best_score:
            best_key = segment_key
            best_score = score
    return best_key


def extract_products(text: str, segment_key: str) -> list[str]:
    items = extract_bullets(text) + extract_labelled_items(text)
    for pattern, label in PRODUCT_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            items.append(label)
    items = unique_preserve(items)
    if len(items) < 4:
        items.extend(item for item in SEGMENTS[segment_key]["products"] if item not in items)
    return items[:8]


def extract_services(text: str, segment_key: str) -> list[str]:
    items: list[str] = []
    for pattern, label in SERVICE_PATTERNS:
        if re.search(pattern, text, flags=re.IGNORECASE):
            items.append(label)
    if len(items) < 3:
        items.extend(item for item in SEGMENTS[segment_key]["services"] if item not in items)
    return items[:6]


def build_summary(name: str, segment_key: str, products: list[str], has_public_description: bool) -> str:
    template = SEGMENTS[segment_key]
    product_slice = ", ".join(products[:3]) if products else "soluções industriais"
    value_slice = ", ".join(template["value"][:3])
    if has_public_description:
        return (
            f"{name} {template['summary']} Em termos práticos, sua oferta gira em torno de "
            f"{product_slice}. O valor central para o cliente está em {value_slice}."
        )
    return (
        f"{name} provavelmente {template['summary']} Em termos práticos, a oferta tende a girar em torno de "
        f"{product_slice}. Como a descrição pública do expositor não apareceu na FEIMEC, este texto usa "
        f"inferência setorial para orientar prospecção e pesquisa posterior."
    )


def render_list(items: Iterable[str]) -> str:
    return "\n".join(f"- {item}" for item in items)


def build_markdown(result: CompanyResult) -> str:
    segment_key = infer_segment(result.name, result.description_text)
    products = extract_products(result.description_text, segment_key)
    services = extract_services(result.description_text, segment_key)
    summary = build_summary(
        name=result.name,
        segment_key=segment_key,
        products=products,
        has_public_description=result.source_status == "descricao_publica_encontrada",
    )
    template = SEGMENTS[segment_key]
    booth_text = ", ".join(result.booths) if result.booths else "Não informado"
    source_label = (
        "Descrição pública do expositor encontrada na FEIMEC"
        if result.source_status == "descricao_publica_encontrada"
        else "Sem descrição pública no payload da FEIMEC; perfil com inferência setorial"
    )

    sections = [
        f"# {result.name}",
        "",
        f"- Estande(s): {booth_text}",
        f"- Base usada: {source_label}",
        f"- URL de busca FEIMEC: {result.search_url}",
        f"- Correspondências encontradas: {result.matches}",
        "",
        "## O que a empresa faz em 80/20",
        summary,
        "",
        "## Produtos",
        render_list(products),
        "",
        "## Serviços",
        render_list(services),
        "",
        "## Principais dores",
        render_list(template["pains"]),
        "",
        "## Principais sonhos",
        render_list(template["dreams"]),
        "",
        "## Gargalos",
        render_list(template["gargalos"]),
        "",
        "## Gaps",
        render_list(template["gaps"]),
    ]

    if result.description_text:
        excerpt = " ".join(split_sentences(result.description_text)[:3]).strip()
        if excerpt:
            sections.extend([
                "",
                "## Sinais públicos capturados",
                excerpt,
            ])

    return "\n".join(sections).strip() + "\n"


def fetch_company(seed: CompanySeed) -> CompanyResult:
    query_variants = unique_preserve(
        [
            seed.name,
            unicodedata.normalize("NFKD", seed.name).encode("ascii", "ignore").decode("ascii"),
            re.sub(r"[^\w\s-]+", " ", seed.name),
        ]
    )

    last_matches: list[dict] = []
    last_query = seed.name
    for query in query_variants:
        search_url = f"{BASE_URL}?search={urllib.parse.quote(query)}"
        payload = parse_next_data(request_text(search_url))
        state = extract_state(payload)
        exhibitors = collect_exhibitors(state)
        matches = pick_matching_exhibitors(seed.name, exhibitors)
        if matches:
            last_matches = matches
            last_query = query
            break
        last_matches = exhibitors
        last_query = query

    booths = list(seed.booths)
    descriptions: list[str] = []
    matched_names: list[str] = []
    for exhibitor in last_matches:
        matched_names.append(exhibitor.get("name", seed.name))
        booth = extract_exhibitor_booth(exhibitor)
        if booth:
            booths.append(booth)
        descriptions.append(normalize_html_text(exhibitor.get("htmlDescription")))

    unique_descriptions = unique_preserve([text for text in descriptions if text])
    description_text = "\n\n".join(unique_descriptions)
    source_status = (
        "descricao_publica_encontrada"
        if description_text
        else "inferencia_sem_descricao_publica"
    )
    search_url = f"{BASE_URL}?search={urllib.parse.quote(last_query)}"
    return CompanyResult(
        name=seed.name,
        booths=unique_preserve(booths),
        found_names=unique_preserve(matched_names),
        description_text=description_text,
        source_status=source_status,
        search_url=search_url,
        matches=len(last_matches),
        used_query=last_query,
    )


def ensure_unique_path(directory: Path, desired_name: str) -> Path:
    base = sanitize_filename(desired_name)
    candidate = directory / f"{base}.md"
    suffix = 2
    while candidate.exists():
        candidate = directory / f"{base} ({suffix}).md"
        suffix += 1
    return candidate


def write_outputs(results: list[CompanyResult], output_dir: Path) -> list[Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    written_paths: list[Path] = []
    for result in results:
        file_path = ensure_unique_path(output_dir, result.name)
        file_path.write_text(build_markdown(result), encoding="utf-8")
        written_paths.append(file_path)
    return written_paths


def write_cache(results: list[CompanyResult], cache_path: Path) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    payload = [
        {
            "name": result.name,
            "booths": result.booths,
            "found_names": result.found_names,
            "source_status": result.source_status,
            "search_url": result.search_url,
            "matches": result.matches,
            "used_query": result.used_query,
            "description_text": result.description_text,
        }
        for result in results
    ]
    cache_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def run(seeds: list[CompanySeed], workers: int) -> list[CompanyResult]:
    results: list[CompanyResult] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        future_map = {executor.submit(fetch_company, seed): seed for seed in seeds}
        for index, future in enumerate(concurrent.futures.as_completed(future_map), start=1):
            seed = future_map[future]
            result = future.result()
            results.append(result)
            print(
                f"[{index:04d}/{len(seeds):04d}] {seed.name} -> {result.source_status} "
                f"(matches={result.matches}, booths={','.join(result.booths) or 'n/a'})"
            )
    results.sort(key=lambda item: normalize_text(item.name))
    return results


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera perfis em Markdown para expositores da FEIMEC 2026.")
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT, help="Arquivo com a lista de empresas.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT, help="Diretório de saída dos .md.")
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE, help="Arquivo JSON com o cache consolidado.")
    parser.add_argument("--limit", type=int, default=0, help="Limita a quantidade de empresas para teste.")
    parser.add_argument("--workers", type=int, default=8, help="Quantidade de buscas paralelas.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    seeds = parse_company_seeds(args.input)
    if args.limit:
        seeds = seeds[: args.limit]
    results = run(seeds, workers=max(1, args.workers))
    written_paths = write_outputs(results, args.output_dir)
    write_cache(results, args.cache)
    found = sum(1 for result in results if result.source_status == "descricao_publica_encontrada")
    inferred = len(results) - found
    print(
        json.dumps(
            {
                "companies": len(results),
                "files_written": len(written_paths),
                "with_public_description": found,
                "with_inference_only": inferred,
                "output_dir": str(args.output_dir),
                "cache": str(args.cache),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()