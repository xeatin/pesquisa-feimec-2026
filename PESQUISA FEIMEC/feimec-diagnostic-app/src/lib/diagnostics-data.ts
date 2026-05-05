export type DiagnosticScore = {
  label: string;
  value: number;
  note: string;
};

export type LossItem = {
  title: string;
  amount: number;
  statement: string;
  action: string;
};

export type Scenario = {
  label: string;
  capture: string;
  return90d: number;
  roi: string;
  note: string;
};

export type QuickWin = {
  title: string;
  owner: string;
  target: string;
  eta: string;
  risk: string;
  impact: number;
  proof: string;
};

export type Milestone = {
  label: string;
  window: string;
  focus: string;
  outcomes: string[];
};

export type Tenant = {
  slug: string;
  name: string;
  shortName: string;
  booth: string;
  category: string;
  headline: string;
  summary: string;
  northStar: string;
  monthlyCapture: number;
  investment90d: number;
  confidence: number;
  colors: {
    accent: string;
    secondary: string;
    halo: string;
  };
  scores: DiagnosticScore[];
  fairBullets: string[];
  losses: LossItem[];
  scenarios: Scenario[];
  quickWins: QuickWin[];
  milestones: Milestone[];
  cfoSummary: string;
  operatorSummary: string;
  fairClose: string;
  uiHighlights: string[];
};

export const tenants: Tenant[] = [
  {
    slug: "romi",
    name: "ROMI",
    shortName: "ROMI",
    booth: "E040",
    category: "Machine builder / produtividade industrial",
    headline:
      "ROMI sai de venda de equipamento para captura mensal de margem via setup, disponibilidade e qualidade.",
    summary:
      "O mock mostra a ROMI como uma operação onde o dinheiro escondido já está quantificado. Setup, microparada e refugo deixam de ser discurso e viram run-rate mensal, dono operacional e retorno financeiro em 90 dias.",
    northStar:
      "Margem por hora-máquina crítica com tendência semanal positiva e prova econômica em até 30 dias.",
    monthlyCapture: 594_000,
    investment90d: 180_000,
    confidence: 98,
    colors: {
      accent: "#FF6A00",
      secondary: "#00C2FF",
      halo: "rgba(255, 106, 0, 0.28)",
    },
    scores: [
      {
        label: "Entendimento",
        value: 10,
        note: "CAPEX, ramp-up, setup e integração foram traduzidos em caixa com contexto industrial real.",
      },
      {
        label: "Acionabilidade",
        value: 10,
        note: "Quick wins já vêm com dono, meta e impacto mensal. Nada depende de workshop abstrato.",
      },
      {
        label: "ROI claro",
        value: 10,
        note: "R$ 180 mil para buscar R$ 570 mil a R$ 855 mil em 90 dias.",
      },
      {
        label: "Surpresa",
        value: 10,
        note: "O relatório deixa claro o quanto de margem está vazando em três alavancas simples.",
      },
    ],
    fairBullets: [
      "R$ 594 mil/mês de perda capturável já mapeada no bloco crítico.",
      "3 quick wins com dono, meta e ROI explícito para 30 dias.",
      "Investimento travado em R$ 180 mil para buscar até R$ 855 mil em 90 dias.",
    ],
    losses: [
      {
        title: "Setup longo e instável",
        amount: 252_000,
        statement:
          "95 min de setup médio, 210 trocas por mês e variação forte entre turnos estão comendo capacidade, fila e overtime.",
        action:
          "Padronizar setup por família crítica e zerar a variação operacional entre turnos.",
      },
      {
        title: "Microparadas recorrentes",
        amount: 198_000,
        statement:
          "55 h/mês de parada evitável continuam sendo aceitas porque a resposta de causa-raiz ainda não fecha o loop.",
        action:
          "Criar regra única de resposta para as 3 causas dominantes e escalonamento diário por célula.",
      },
      {
        title: "Refugo e retrabalho de ajuste",
        amount: 144_000,
        statement:
          "Troca de lote e ferramental ainda desalinham repetibilidade e transformam precisão em retrabalho.",
        action:
          "Receita operacional por lote + gatilho de validação rápida antes de produzir volume.",
      },
    ],
    scenarios: [
      {
        label: "Conservador",
        capture: "18% do mapa",
        return90d: 320_760,
        roi: "1,78x",
        note: "Prova rápida sem mexer em toda a célula ao mesmo tempo.",
      },
      {
        label: "Base",
        capture: "32% do mapa",
        return90d: 570_240,
        roi: "3,17x",
        note: "Cenário mais plausível para vender e validar expansão.",
      },
      {
        label: "Agressivo",
        capture: "48% do mapa",
        return90d: 855_360,
        roi: "4,75x",
        note: "Mensagem de impacto para CFO e industrial em ambiente favorável.",
      },
    ],
    quickWins: [
      {
        title: "Padrão único de setup por família crítica",
        owner: "Engenharia de processo",
        target: "-25 min por setup",
        eta: "Semana 1 a 3",
        risk: "Baixo",
        impact: 105_000,
        proof: "87,5 h/mês de capacidade direta recuperada no bloco crítico.",
      },
      {
        title: "Regra de resposta para top 3 causas de microparada",
        owner: "Manutenção + líder de célula",
        target: "-55 h de parada/mês",
        eta: "Semana 1 a 4",
        risk: "Médio-baixo",
        impact: 66_000,
        proof: "Redução imediata do tempo perdido sem depender de CAPEX novo.",
      },
      {
        title: "Receita operacional por lote e ferramental",
        owner: "Processo + qualidade",
        target: "-1,2 p.p. de refugo",
        eta: "Semana 2 a 4",
        risk: "Baixo",
        impact: 45_600,
        proof: "Cai retrabalho, reinspeção e atraso por instabilidade em troca de lote.",
      },
    ],
    milestones: [
      {
        label: "Sprint 0-30",
        window: "0-30 dias",
        focus: "Provar dinheiro escondido",
        outcomes: [
          "Baseline fechado por célula e turno",
          "Top 3 perdas com impacto em R$ e dono operacional",
          "Primeira revisão executiva com ganho já consolidado",
        ],
      },
      {
        label: "Sprint 31-60",
        window: "31-60 dias",
        focus: "Travar padrão operacional",
        outcomes: [
          "Setup com receita operacional padronizada",
          "Ritual diário de performance por célula",
          "Escalonamento único de anomalia e microparada",
        ],
      },
      {
        label: "Sprint 61-90",
        window: "61-90 dias",
        focus: "Escalar e monetizar recorrência",
        outcomes: [
          "Expansão para novas células",
          "Backlog de ROI priorizado por mês",
          "Contrato de performance gerenciada travado",
        ],
      },
    ],
    cfoSummary:
      "A conta é simples: o mock já fecha o investimento, mostra o mapa de perdas e deixa a decisão financeira pronta para aprovação sem depender de narrativa genérica.",
    operatorSummary:
      "O operador vê o que muda amanhã: setup, resposta de parada e validação de lote. Nada fica escondido atrás de consultoria aberta.",
    fairClose:
      "Aqui estão os 3 vazamentos de margem, o dono de cada frente e a conta: R$ 180 mil para buscar até R$ 855 mil em 90 dias.",
    uiHighlights: [
      "Heatmap por célula com dinheiro perdido em tempo real",
      "Switch entre visão operacional e visão CFO sem trocar de tela",
      "Quick wins com impacto, risco e ETA lado a lado",
      "Export executivo em 1 página pronto para diretoria",
    ],
  },
  {
    slug: "paletrans",
    name: "Paletrans",
    shortName: "Paletrans",
    booth: "J030",
    category: "Fluxo operacional / produtividade aplicada",
    headline:
      "Paletrans transforma gargalo invisível em lucro visível com priorização certa, execução leve e retorno rápido.",
    summary:
      "No mock da Paletrans, o ganho vem de parar de vender solução genérica e começar a mostrar exatamente onde o fluxo trava, quanto isso custa e qual melhoria devolve caixa primeiro.",
    northStar:
      "Tempo de decisão comercial e ganho operacional validado no primeiro ciclo.",
    monthlyCapture: 413_100,
    investment90d: 130_000,
    confidence: 94,
    colors: {
      accent: "#22A6F2",
      secondary: "#12D18E",
      halo: "rgba(34, 166, 242, 0.24)",
    },
    scores: [
      {
        label: "Entendimento",
        value: 10,
        note: "O diagnóstico acerta o ponto: o cliente quer aplicação clara, não catálogo técnico longo.",
      },
      {
        label: "Acionabilidade",
        value: 10,
        note: "Cada quick win reduz espera, padroniza rotina ou encurta decisão comercial.",
      },
      {
        label: "ROI claro",
        value: 10,
        note: "R$ 130 mil para buscar até R$ 594 mil em 90 dias.",
      },
      {
        label: "Surpresa",
        value: 10,
        note: "O gargalo deixa de ser opinião e vira uma linha do P&L em tempo real.",
      },
    ],
    fairBullets: [
      "R$ 413,1 mil/mês de perda agregada já mockada no fluxo crítico.",
      "3 ações pequenas com impacto financeiro grande e risco baixo.",
      "Investimento travado em R$ 130 mil para buscar até R$ 594 mil em 90 dias.",
    ],
    losses: [
      {
        title: "Gargalo de fluxo e espera entre etapas",
        amount: 173_400,
        statement:
          "A maior perda não está na máquina isolada; está no tempo morto entre etapas, filas e repasses mal sincronizados.",
        action:
          "Balancear o fluxo do ponto mais congestionado e reduzir espera entre handoffs.",
      },
      {
        title: "Paradas de rotina por falta de padrão",
        amount: 141_100,
        statement:
          "Turnos diferentes seguem rituais diferentes e a operação paga isso em paradas curtas repetitivas.",
        action:
          "Playbook único de início, troca de turno e retomada para reduzir ruído operacional.",
      },
      {
        title: "Decisão técnica-comercial lenta",
        amount: 98_600,
        statement:
          "O custo da não ação já aparece no mock como dinheiro perdido enquanto o cliente demora para decidir.",
        action:
          "Quadro único de decisão com impacto, risco e payback para encurtar o ciclo comercial.",
      },
    ],
    scenarios: [
      {
        label: "Conservador",
        capture: "20% do mapa",
        return90d: 247_860,
        roi: "1,91x",
        note: "Entra leve e prova a tese sem exigir transformação grande logo no início.",
      },
      {
        label: "Base",
        capture: "32% do mapa",
        return90d: 396_576,
        roi: "3,05x",
        note: "Melhor cenário para demo comercial e fechamento consultivo.",
      },
      {
        label: "Agressivo",
        capture: "48% do mapa",
        return90d: 594_864,
        roi: "4,58x",
        note: "Mostra que melhorar decisão e fluxo rápido gera mais caixa do que parece.",
      },
    ],
    quickWins: [
      {
        title: "Balanceamento do ponto de maior fila",
        owner: "Operações",
        target: "-22% do tempo de espera entre etapas",
        eta: "Semana 1 a 2",
        risk: "Baixo",
        impact: 92_000,
        proof: "O mock reduz fila, overtime e atraso de entrega no mesmo movimento.",
      },
      {
        title: "Playbook de início e troca de turno",
        owner: "Supervisão de turno",
        target: "-30% de paradas curtas repetitivas",
        eta: "Semana 1 a 3",
        risk: "Baixo",
        impact: 74_000,
        proof: "A operação ganha previsibilidade sem depender de tecnologia nova.",
      },
      {
        title: "Quadro único de decisão técnica-comercial",
        owner: "Comercial técnico",
        target: "-35% do tempo de decisão",
        eta: "Semana 2 a 4",
        risk: "Médio-baixo",
        impact: 51_000,
        proof: "Encurta o ciclo de venda e mostra o custo da demora em R$.",
      },
    ],
    milestones: [
      {
        label: "Sprint 0-30",
        window: "0-30 dias",
        focus: "Encontrar o gargalo certo",
        outcomes: [
          "Mapa de fila e espera com custo por etapa",
          "Piloto com 1 indicador único de sucesso",
          "Resumo executivo pronto para destravar escala",
        ],
      },
      {
        label: "Sprint 31-60",
        window: "31-60 dias",
        focus: "Padronizar o que deu certo",
        outcomes: [
          "Playbook operacional consolidado",
          "Rotina semanal de prova de ganho",
          "Escala controlada para segunda frente",
        ],
      },
      {
        label: "Sprint 61-90",
        window: "61-90 dias",
        focus: "Escalar receita e conversão",
        outcomes: [
          "Expansão para novas linhas ou contas",
          "Governança mensal de resultado",
          "Narrativa comercial de bolso já validada",
        ],
      },
    ],
    cfoSummary:
      "O mock mostra que o dinheiro está preso em espera, parada curta e lentidão de decisão. A aprovação sai porque o custo da demora aparece sem maquiagem.",
    operatorSummary:
      "O operador ganha um playbook claro e o comercial ganha uma história curta para fechar mais rápido.",
    fairClose:
      "Aqui está o gargalo em reais, aqui estão as 3 alavancas e aqui está a conta: R$ 130 mil para buscar até R$ 594 mil em 90 dias.",
    uiHighlights: [
      "Radar de gargalo por etapa com custo da não ação",
      "Ranking Top 3 por impacto financeiro e dificuldade",
      "Cenários conservador, base e agressivo em uma única dobra",
      "Resumo executivo que cabe em 6 linhas para aprovação rápida",
    ],
  },
  {
    slug: "combustol",
    name: "Combustol Fornos",
    shortName: "Combustol",
    booth: "F072",
    category: "Processo térmico / energia / confiabilidade",
    headline:
      "Combustol converte estabilidade térmica em caixa: menos variação, menos risco, menos energia desperdiçada e mais disponibilidade.",
    summary:
      "O tenant da Combustol foi desenhado como uma sala de controle térmica premium. Tudo já entra mockado com perdas energéticas, risco operacional e alavancas com retorno econômico claro.",
    northStar:
      "Custo térmico por unidade produzida com estabilidade de qualidade e disponibilidade.",
    monthlyCapture: 477_500,
    investment90d: 160_000,
    confidence: 97,
    colors: {
      accent: "#FF7A1A",
      secondary: "#00D1B2",
      halo: "rgba(255, 122, 26, 0.24)",
    },
    scores: [
      {
        label: "Entendimento",
        value: 10,
        note: "O mock fala de variação térmica, segurança, energia e parada como um problema só: caixa em risco.",
      },
      {
        label: "Acionabilidade",
        value: 10,
        note: "As três alavancas já estão ligadas a janela segura, alerta precoce e sequência de carga.",
      },
      {
        label: "ROI claro",
        value: 10,
        note: "R$ 160 mil para buscar R$ 429 mil a R$ 644 mil em 90 dias com risco controlado.",
      },
      {
        label: "Surpresa",
        value: 10,
        note: "O choque vem quando custo energético e risco térmico aparecem juntos no mesmo painel.",
      },
    ],
    fairBullets: [
      "R$ 477,5 mil/mês de perda térmica já mockada entre energia, refugo e parada.",
      "3 alavancas seguras com impacto mensal e dono operacional.",
      "Investimento travado em R$ 160 mil para buscar até R$ 644 mil em 90 dias.",
    ],
    losses: [
      {
        title: "Ineficiência energética por janela instável",
        amount: 188_400,
        statement:
          "O mock deixa claro quanto custa operar fora da janela térmica segura e transformar energia em desperdício silencioso.",
        action:
          "Travar janela operacional por receita e corrigir deriva antes dela virar custo fixo escondido.",
      },
      {
        title: "Variação térmica com impacto em qualidade",
        amount: 132_300,
        statement:
          "A oscilação térmica não é detalhe técnico; ela aparece como refugo, retrabalho e lote instável.",
        action:
          "Alertar desvio precoce e atrelar a decisão a risco real por faixa crítica.",
      },
      {
        title: "Parada corretiva em ambiente crítico",
        amount: 156_800,
        statement:
          "Quando a intervenção corretiva vira rotina, a planta paga em indisponibilidade e risco operacional acumulado.",
        action:
          "Sequência de carga, regras de alarme e manutenção focada no que mais derruba disponibilidade.",
      },
    ],
    scenarios: [
      {
        label: "Conservador",
        capture: "18% do mapa",
        return90d: 257_850,
        roi: "1,61x",
        note: "Entra leve, reduz variabilidade e dá segurança para escalar depois.",
      },
      {
        label: "Base",
        capture: "30% do mapa",
        return90d: 429_750,
        roi: "2,69x",
        note: "Melhor narrativa para diretoria industrial e financeira juntas.",
      },
      {
        label: "Agressivo",
        capture: "45% do mapa",
        return90d: 644_625,
        roi: "4,03x",
        note: "Mostra a potência do pacote quando estabilidade e energia são tratadas como uma frente única.",
      },
    ],
    quickWins: [
      {
        title: "Janela operacional segura por receita",
        owner: "Engenharia térmica",
        target: "-18% de oscilação térmica",
        eta: "Semana 1 a 3",
        risk: "Baixo",
        impact: 81_000,
        proof: "Menos oscilação diminui sucata, consumo fora de faixa e risco de retrabalho.",
      },
      {
        title: "Rotina de alerta precoce de desvio",
        owner: "Operação + manutenção",
        target: "-25% de intervenções corretivas",
        eta: "Semana 1 a 4",
        risk: "Baixo",
        impact: 67_000,
        proof: "O ganho vem de intervir cedo e evitar parada longa em ambiente crítico.",
      },
      {
        title: "Ajuste de sequência e carga por lote",
        owner: "Planejamento + processo",
        target: "-12% de consumo energético específico",
        eta: "Semana 2 a 4",
        risk: "Médio-baixo",
        impact: 73_000,
        proof: "Menos energia desperdiçada e melhor estabilidade por lote no mesmo ciclo.",
      },
    ],
    milestones: [
      {
        label: "Sprint 0-30",
        window: "0-30 dias",
        focus: "Estabilizar o núcleo térmico",
        outcomes: [
          "Baseline energético e térmico por linha crítica",
          "Mapa de perda por janela, lote e intervenção",
          "Primeira prova econômica semanal em reais",
        ],
      },
      {
        label: "Sprint 31-60",
        window: "31-60 dias",
        focus: "Blindar risco e rotina",
        outcomes: [
          "Janela de operação segura formalizada",
          "Alerta precoce em rotina de turno",
          "Treinamento objetivo de operação e manutenção",
        ],
      },
      {
        label: "Sprint 61-90",
        window: "61-90 dias",
        focus: "Escalar confiabilidade com retrofit leve",
        outcomes: [
          "Expansão para novas linhas térmicas",
          "Simulação de retrofit faseado com mínimo impacto",
          "Contrato recorrente de confiabilidade térmica",
        ],
      },
    ],
    cfoSummary:
      "A aprovação sai quando energia, disponibilidade e risco aparecem no mesmo quadro econômico. O mock foi construído exatamente para isso.",
    operatorSummary:
      "Operação vê a janela segura, manutenção vê o alerta precoce e diretoria vê custo evitado acumulado.",
    fairClose:
      "Aqui está o custo mensal da variação térmica, aqui estão as 3 alavancas e aqui está a conta: R$ 160 mil para buscar até R$ 644 mil em 90 dias.",
    uiHighlights: [
      "Thermal Pulse com custo instantâneo por desvio",
      "Risk board conectando segurança, compliance e dinheiro",
      "Cenários de retrofit faseado comparados em uma ação",
      "Resumo CFO com payback e custo evitado em linguagem seca",
    ],
  },
];

export const portfolioSnapshot = {
  tenantCount: tenants.length,
  totalMonthlyCapture: tenants.reduce((sum, tenant) => sum + tenant.monthlyCapture, 0),
  totalInvestment90d: tenants.reduce((sum, tenant) => sum + tenant.investment90d, 0),
  totalBaseReturn90d: tenants.reduce(
    (sum, tenant) => sum + tenant.scenarios[1].return90d,
    0,
  ),
};

export function getTenantBySlug(slug: string) {
  return tenants.find((tenant) => tenant.slug === slug);
}

export function getNextTenantSlug(slug: string) {
  const currentIndex = tenants.findIndex((tenant) => tenant.slug === slug);

  if (currentIndex === -1) {
    return tenants[0]?.slug;
  }

  return tenants[(currentIndex + 1) % tenants.length]?.slug;
}

export function formatCurrency(
  value: number,
  notation: "standard" | "compact" = "standard",
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
    notation,
  }).format(value);
}