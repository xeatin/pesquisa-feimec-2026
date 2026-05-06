import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(appRoot, "..");

const sourcePath = path.join(workspaceRoot, "output_feimec.md");
const companiesDirectory = path.join(workspaceRoot, "empresas");
const appJsonPath = path.join(appRoot, "src", "data", "feimec-predictions.json");
const workspaceJsonPath = path.join(workspaceRoot, "feimec-predictions.json");

const listDefinitions = {
  "1": {
    bucket: "renew-now",
    actionLabel: "Renovar agora",
    playbook: "Renovação antecipada com fechamento de área e patrocínio.",
  },
  "2": {
    bucket: "renew-with-upsell",
    actionLabel: "Renovar com upsell",
    playbook: "Renovar com matchmaking, reuniões pré-agendadas e pacote de visibilidade.",
  },
  "3": {
    bucket: "save-with-roi-plan",
    actionLabel: "Salvar com ROI",
    playbook: "Reforçar prova de retorno antes de discutir metragem ou upgrade.",
  },
  "4": {
    bucket: "high-churn-risk",
    actionLabel: "Risco de churn",
    playbook: "Contato consultivo, downsell de área e reposicionamento comercial.",
  },
};

const categoryDefinitions = [
  {
    key: "automation-robotics",
    label: "Automação e robótica",
    demandScore: 86,
    demoScore: 84,
    keywords: [
      "robô",
      "robos",
      "robot",
      "robotica",
      "automação",
      "automacao",
      "cobot",
      "amr",
      "clp",
      "ihm",
      "servo",
      "visão artificial",
      "visao artificial",
      "integração de células",
      "integracao de celulas",
    ],
    nameHints: ["robotics", "fanuc", "kuka", "yaskawa", "elite robots"],
  },
  {
    key: "cutting-welding-laser",
    label: "Corte, solda e laser",
    demandScore: 84,
    demoScore: 88,
    keywords: [
      "laser",
      "solda",
      "welding",
      "corte",
      "plasma",
      "oxicorte",
      "oxicorte",
      "waterjet",
      "tocha",
      "marcação industrial",
      "marcacao industrial",
    ],
    nameHints: ["lincoln electric", "hypertherm", "fronius", "megaplasma"],
  },
  {
    key: "cnc-forming",
    label: "Máquinas CNC e conformação",
    demandScore: 83,
    demoScore: 86,
    keywords: [
      "cnc",
      "torno",
      "fresadora",
      "usinagem",
      "centro de usinagem",
      "dobradeira",
      "prensa",
      "conformação",
      "conformacao",
      "curvadora",
      "perfiladeira",
      "estampagem",
      "mandrilhadora",
    ],
    nameHints: ["romi", "haas", "mazak", "lvd", "salvagnini", "bener"],
  },
  {
    key: "industrial-software",
    label: "Software industrial",
    demandScore: 80,
    demoScore: 74,
    keywords: [
      "software",
      "erp",
      "cad/cam",
      "cadcam",
      "mes",
      "plm",
      "inteligência artificial",
      "inteligencia artificial",
      "dados",
      "monitoramento",
      "análise de processos",
      "analise de processos",
      "simulação",
      "simulacao",
      "iiot",
      "saas",
    ],
    nameHints: ["totvs", "solidcam", "topsolid", "vericut", "fracttal", "erp"],
  },
  {
    key: "metrology-quality",
    label: "Metrologia e qualidade",
    demandScore: 76,
    demoScore: 75,
    keywords: [
      "metrolog",
      "medição",
      "medicao",
      "qualidade",
      "inspeção",
      "inspecao",
      "scanner 3d",
      "cmm",
      "calibração",
      "calibracao",
      "medição 3d",
      "medicao 3d",
    ],
    nameHints: ["zeiss", "renishaw", "hexagon", "mitutoyo", "creaform"],
  },
  {
    key: "components-fluids-pneumatics",
    label: "Componentes, fluidos e pneumática",
    demandScore: 72,
    demoScore: 60,
    keywords: [
      "hidrául",
      "hidraul",
      "pneum",
      "válvula",
      "valvula",
      "rolamento",
      "redutor",
      "motor",
      "mangueira",
      "bomba",
      "fluido",
      "lubrific",
      "cabos",
      "acoplamento",
      "conector de fluido",
    ],
    nameHints: ["airtac", "airfit", "hydac", "rexroth", "omron"],
  },
  {
    key: "movement-logistics",
    label: "Movimentação e logística",
    demandScore: 74,
    demoScore: 68,
    keywords: [
      "logística",
      "logistica",
      "movimentação",
      "movimentacao",
      "ponte rolante",
      "talha",
      "crane",
      "guindaste",
      "empilhadeira",
      "paleteira",
      "armazenagem",
      "intralogística",
      "intralogistica",
      "transporte interno",
    ],
    nameHints: ["paletrans", "konecranes", "gh cranes", "omega cranes", "combilift"],
  },
  {
    key: "associations-entities",
    label: "Associações e entidades",
    demandScore: 42,
    demoScore: 24,
    keywords: [
      "associação",
      "associacao",
      "entidade",
      "sindicato",
      "trade agency",
      "instituto",
      "federação",
      "federacao",
      "pavilhão",
      "pavilhao",
      "embaixada",
      "serviço comercial",
      "servico comercial",
      "informa markets",
      "abimaq",
      "abinfer",
      "abfa",
      "italian trade agency",
    ],
    nameHints: ["abfa", "abimaq", "abinfer", "trade agency", "informa markets", "embaixada"],
  },
  {
    key: "general-industrial",
    label: "Soluções industriais gerais",
    demandScore: 60,
    demoScore: 56,
    keywords: [],
    nameHints: [],
  },
];

const categoryDefinitionMap = new Map(categoryDefinitions.map((definition) => [definition.key, definition]));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeKey(value) {
  return value
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function stripTrailingPunctuation(value) {
  return value.replace(/[.!?]+$/g, "").trim();
}

function lowerFirst(value) {
  if (!value) {
    return value;
  }

  return `${value.charAt(0).toLowerCase()}${value.slice(1)}`;
}

function joinReasons(reasons) {
  const cleanedReasons = reasons.map((reason) => stripTrailingPunctuation(reason)).filter(Boolean);

  if (cleanedReasons.length === 0) {
    return "faltam sinais suficientes para uma leitura mais confiante";
  }
  if (cleanedReasons.length === 1) {
    return lowerFirst(cleanedReasons[0]);
  }
  if (cleanedReasons.length === 2) {
    return `${lowerFirst(cleanedReasons[0])} e ${lowerFirst(cleanedReasons[1])}`;
  }

  return `${lowerFirst(cleanedReasons[0])}, ${lowerFirst(cleanedReasons[1])} e ${lowerFirst(cleanedReasons[2])}`;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreToClass(score) {
  if (score >= 80) {
    return "A";
  }
  if (score >= 65) {
    return "B";
  }
  if (score >= 45) {
    return "C";
  }
  return "D";
}

function churnBand(probability) {
  if (probability >= 70) {
    return "critical";
  }
  if (probability >= 50) {
    return "high";
  }
  if (probability >= 30) {
    return "medium";
  }
  if (probability >= 15) {
    return "low";
  }
  return "very-low";
}

function extractSection(markdown, title) {
  const regex = new RegExp(`## ${escapeRegex(title)}\\n([\\s\\S]*?)(?=\\n## |\\n# |$)`);
  return markdown.match(regex)?.[1]?.trim() ?? null;
}

function extractList(markdown, title) {
  const block = extractSection(markdown, title);

  if (!block) {
    return [];
  }

  return block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

function extractText(markdown, title) {
  const block = extractSection(markdown, title);

  if (!block) {
    return null;
  }

  return block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

function parseCompanyFile(markdown, fileName) {
  const name = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fileName.replace(/\.md$/i, "");
  const boothsRaw = markdown.match(/^- Estande\(s\): (?<value>.+)$/m)?.groups?.value?.trim() ?? "";
  const baseUsed = markdown.match(/^- Base usada: (?<value>.+)$/m)?.groups?.value?.trim() ?? null;
  const searchUrl = markdown.match(/^- URL de busca FEIMEC: (?<value>.+)$/m)?.groups?.value?.trim() ?? null;
  const matchesFoundRaw = markdown.match(/^- Correspondências encontradas: (?<value>.+)$/m)?.groups?.value?.trim() ?? null;
  const summary80_20 = extractText(markdown, "O que a empresa faz em 80/20");
  const inferred =
    /infer(ê|e)ncia|sem descrição pública/i.test(baseUsed ?? "") ||
    /provavelmente atua|oferta tende a girar/i.test(summary80_20 ?? "");

  const booths = boothsRaw
    .split(/\s*,\s*/)
    .map((booth) => booth.trim())
    .filter(Boolean);

  return {
    name,
    slug: normalizeKey(name),
    fileName,
    booths,
    boothLabel: booths.join(" • "),
    baseUsed,
    searchUrl,
    matchesFound: matchesFoundRaw ? Number(matchesFoundRaw) : null,
    inferred,
    summary80_20,
    products: extractList(markdown, "Produtos"),
    services: extractList(markdown, "Serviços"),
    pains: extractList(markdown, "Principais dores"),
    dreams: extractList(markdown, "Principais sonhos"),
    bottlenecks: extractList(markdown, "Gargalos"),
    gaps: extractList(markdown, "Gaps"),
    publicSignals: extractText(markdown, "Sinais públicos capturados"),
  };
}

async function readCompanyProfiles() {
  const files = await readdir(companiesDirectory);
  const profiles = new Map();

  for (const fileName of files) {
    if (!fileName.endsWith(".md")) {
      continue;
    }

    const markdown = await readFile(path.join(companiesDirectory, fileName), "utf8");
    const profile = parseCompanyFile(markdown, fileName);
    profiles.set(profile.slug, profile);
  }

  return profiles;
}

function computeRenewalProbability(company) {
  const detailBonus = company.source.hasDetailedProfile ? 0.03 : 0;
  const classBonus =
    company.class === "A"
      ? 0.05
      : company.class === "B"
        ? 0.02
        : company.class === "C"
          ? -0.02
          : -0.08;
  const sectionBonus =
    company.source.detailedSection === "top20"
      ? 0.03
      : company.source.detailedSection === "bottom10"
        ? -0.05
        : 0;

  return Math.round(
    clamp(company.score / 100 * 0.88 + 0.08 + detailBonus + classBonus + sectionBonus, 0.03, 0.98) *
      100,
  );
}

function computeUpgradeProbability(company) {
  const scoreMomentum = clamp((company.score - 65) / 35, 0, 1);
  const classBonus = company.class === "A" ? 0.12 : company.class === "B" ? 0.03 : -0.05;
  const sectionBonus =
    company.source.detailedSection === "top20"
      ? 0.1
      : company.source.detailedSection === "bottom10"
        ? -0.1
        : 0;
  const actionBonus = /(premium|upsell|upgrade|patrocínios|espaços premium|área maior)/i.test(
    company.actionRecommended ?? "",
  )
    ? 0.12
    : 0;
  const demoBonus = company.profile.products.length > 0 && company.profile.services.length > 0 ? 0.03 : 0;

  return Math.round(
    clamp(0.08 + scoreMomentum * 0.65 + classBonus + sectionBonus + actionBonus + demoBonus, 0.02, 0.95) *
      100,
  );
}

function computePartnershipProbability(company) {
  const scoreFit = clamp((company.score - 45) / 55, 0, 1);
  const classBonus =
    company.class === "B"
      ? 0.08
      : company.class === "C"
        ? 0.06
        : company.class === "A"
          ? 0.03
          : -0.05;
  const serviceBonus = company.profile.services.length >= 3 ? 0.04 : 0;

  return Math.round(clamp(0.18 + scoreFit * 0.5 + classBonus + serviceBonus, 0.05, 0.9) * 100);
}

function computeRenewAndUpgradeProbability(company) {
  const renewal = company.predictions.buyStandAgainProbability / 100;
  const upgrade = company.predictions.buyBetterStandProbability / 100;

  return Math.round(clamp(renewal * upgrade, 0.01, 0.96) * 100);
}

function buildCompanyText(company) {
  return normalizeText(
    [
      company.name,
      company.diagnostic ?? "",
      company.consolidatedContext ?? "",
      company.profile.summary80_20 ?? "",
      company.profile.products.join(" "),
      company.profile.services.join(" "),
      company.profile.publicSignals ?? "",
    ].join(" "),
  );
}

function keywordScore(text, keywords) {
  return Array.from(new Set(keywords.map((keyword) => normalizeText(keyword)))).reduce((total, keyword) => {
    if (!keyword || !text.includes(keyword)) {
      return total;
    }

    return total + (keyword.includes(" ") ? 3 : 2);
  }, 0);
}

function classifyCompanyCategory(company) {
  const text = buildCompanyText(company);
  const normalizedName = normalizeText(company.name);
  const scoredCategories = categoryDefinitions.slice(0, -1).map((definition) => {
    const keywordPoints = keywordScore(text, definition.keywords);
    const namePoints = definition.nameHints.reduce((total, hint) => {
      return normalizedName.includes(normalizeText(hint)) ? total + 4 : total;
    }, 0);

    return {
      definition,
      score: keywordPoints + namePoints,
    };
  });

  scoredCategories.sort((left, right) => right.score - left.score);
  const winner = scoredCategories[0];

  if (!winner || winner.score <= 0) {
    return categoryDefinitionMap.get("general-industrial");
  }

  return winner.definition;
}

function hasAnchorBrandSignals(company, text) {
  return (
    company.score >= 90 &&
    /(lider|maior|principal|global|referencia|25 anos|anos de atuacao|presenca global|marca reconhecida)/.test(text)
  );
}

function computeFitScore(company, category, text) {
  let value = company.score;

  if (category.key === "associations-entities") {
    value -= 18;
  }
  if (category.key === "general-industrial") {
    value -= 8;
  }
  if (company.profile.inferred) {
    value -= 8;
  }
  if (company.source.hasDetailedProfile) {
    value += 4;
  }
  if (/(engenharia|producao|chao de fabrica|manufatura|industrial)/.test(text)) {
    value += 5;
  }

  return Math.round(clamp(value, 15, 98));
}

function computeClarityScore(company) {
  let value = 34;

  if (company.profile.summary80_20) {
    value += 18;
  }
  value += Math.min(company.profile.products.length * 4, 18);
  value += Math.min(company.profile.services.length * 3, 15);
  if (company.profile.publicSignals) {
    value += 10;
  }
  if (company.source.hasDetailedProfile) {
    value += 6;
  }
  if (company.profile.inferred) {
    value -= 22;
  }

  const clarityCriterion = company.criteria.find((criterion) => normalizeText(criterion.label).includes("clareza"));
  if (clarityCriterion) {
    const criterionScore = Math.round((clarityCriterion.score / Math.max(clarityCriterion.maxScore, 1)) * 100);
    value = Math.round((value + criterionScore) / 2);
  }

  return Math.round(clamp(value, 10, 98));
}

function computeDemoPotentialScore(company, category, text) {
  let value = category.demoScore;

  if (/(demo|demonstr|robot|laser|solda|corte|cnc|scanner|metrolog|erp|software|cad\/cam|automacao|automacao)/.test(text)) {
    value += 8;
  }
  if (company.profile.products.length >= 4) {
    value += 4;
  }
  if (company.profile.inferred) {
    value -= 10;
  }
  if (category.key === "associations-entities") {
    value = 24;
  }

  return Math.round(clamp(value, 18, 96));
}

function computeBaseDifferentiationScore(company, category, text) {
  let value = 48 + (company.score - 60) * 0.45;

  if (company.source.hasDetailedProfile) {
    value += 8;
  }
  if (company.profile.publicSignals) {
    value += 6;
  }
  if (/(lider|global|maior|referencia|premium|ia|amr|cobot|patente)/.test(text)) {
    value += 6;
  }
  if (company.profile.inferred) {
    value -= 16;
  }
  if (category.key === "general-industrial") {
    value -= 8;
  }

  return Math.round(clamp(value, 8, 95));
}

function buildInitialSignals(company) {
  const category = classifyCompanyCategory(company);
  const text = buildCompanyText(company);

  return {
    category,
    text,
    fitScore: computeFitScore(company, category, text),
    clarityScore: computeClarityScore(company),
    demoPotentialScore: computeDemoPotentialScore(company, category, text),
    baseDifferentiationScore: computeBaseDifferentiationScore(company, category, text),
    anchorBrand: hasAnchorBrandSignals(company, text),
    operationalFriction: company.profile.bottlenecks.length > 0 || company.profile.gaps.length > 0,
  };
}

function buildWhyBelieve(company, context) {
  const reasons = [];

  if (context.fitScore >= 75) {
    reasons.push("Alto fit com visitantes de manufatura.");
  } else if (context.fitScore <= 55) {
    reasons.push("Baixo fit com o público dominante da feira.");
  }

  if (context.categoryStatus === "Categoria forte" || context.categoryStatus === "Categoria de nicho forte") {
    reasons.push("Categoria com forte demanda.");
  } else if (context.categoryStatus === "Categoria saturada") {
    reasons.push("Categoria muito concorrida.");
  }

  if (context.demoPotentialScore >= 75) {
    reasons.push("Produto fácil de demonstrar.");
  }

  if (context.anchorBrand) {
    reasons.push("Marca reconhecida no setor.");
  }

  if (context.differentiationScore >= 70) {
    reasons.push("Diferencial claro frente aos concorrentes diretos.");
  } else if (context.differentiationScore <= 48) {
    reasons.push("Oferta muito parecida com vários expositores próximos.");
  }

  if (context.directCompetitorsCount <= 10 && context.differentiationScore >= 65) {
    reasons.push("Poucos concorrentes diretos no mesmo nicho.");
  }

  if (reasons.length === 0) {
    reasons.push(company.consolidatedContext);
  }

  return Array.from(new Set(reasons)).slice(0, 4);
}

function computeGoodExperienceScore(company, context) {
  let value = Math.round(
    context.fitScore * 0.26 +
      context.clarityScore * 0.18 +
      context.categoryDemandScore * 0.18 +
      context.differentiationScore * 0.18 +
      context.demoPotentialScore * 0.12 +
      company.predictions.buyStandAgainProbability * 0.08,
  );

  if (company.decision === "upgrade-stand") {
    value += 4;
  }
  if (company.decision === "high-churn-risk") {
    value -= 8;
  }
  if (company.profile.inferred) {
    value -= 4;
  }

  return Math.round(clamp(value, 8, 97));
}

function buildGoodExperienceExplanation(score, whyBelieve) {
  const lead =
    score >= 80
      ? "Alta chance de boa experiência"
      : score >= 65
        ? "Boa chance de boa experiência"
        : score >= 50
          ? "Chance moderada de boa experiência"
          : "Baixa chance de boa experiência";

  return `${lead}, porque ${joinReasons(whyBelieve)}.`;
}

function buildMainReason(company, context) {
  if (context.categoryStatus === "Categoria saturada" && context.differentiationScore <= 55) {
    return "Categoria muito concorrida.";
  }
  if (context.differentiationScore <= 45) {
    return "Oferta pouco diferenciada.";
  }
  if (context.fitScore <= 55) {
    return "Baixo fit com público da feira.";
  }
  if (context.anchorBrand && company.predictions.buyStandAgainProbability >= 85) {
    return "Marca âncora com alto fluxo esperado.";
  }
  if (context.demoPotentialScore >= 80) {
    return "Produto altamente demonstrável no estande.";
  }
  if (company.predictions.renewAndUpgradeProbability >= 70) {
    return "Empresa com grande potencial de expansão.";
  }
  if (company.predictions.buyStandAgainProbability >= 75) {
    return "Boa chance de sucesso comercial na feira.";
  }

  return "Experiência depende de apoio comercial e ativação de tráfego.";
}

function buildNextActionShort(company, context) {
  if (company.decision === "upgrade-stand") {
    if (company.predictions.buyBetterStandProbability >= 85) {
      return "Oferecer upgrade de área.";
    }
    if (context.anchorBrand) {
      return "Oferecer mídia/merchandising.";
    }

    return "Agendar conversa de renovação.";
  }

  if (company.decision === "renew-stand") {
    return company.predictions.buyStandAgainProbability >= 85
      ? "Agendar conversa de renovação."
      : "Visitar o estande hoje.";
  }

  if (company.decision === "salvage-account") {
    return context.differentiationScore < 50 || context.categoryStatus === "Categoria saturada"
      ? "Ajudar com geração de tráfego."
      : "Coletar feedback de satisfação.";
  }

  return context.operationalFriction ? "Resolver problema operacional." : "Coletar feedback de satisfação.";
}

function enrichCompanies(companies) {
  const initialSignals = new Map();
  const companiesByCategory = new Map();

  for (const company of companies) {
    const signals = buildInitialSignals(company);
    initialSignals.set(company.slug, signals);

    if (!companiesByCategory.has(signals.category.key)) {
      companiesByCategory.set(signals.category.key, []);
    }

    companiesByCategory.get(signals.category.key).push(company);
  }

  const maxCategorySize = Math.max(
    1,
    ...Array.from(companiesByCategory.values(), (categoryCompanies) => categoryCompanies.length),
  );

  const categoryStats = new Map();

  for (const [categoryKey, categoryCompanies] of companiesByCategory.entries()) {
    const definition = categoryDefinitionMap.get(categoryKey) ?? categoryDefinitionMap.get("general-industrial");
    const companyCount = categoryCompanies.length;
    const averageScore = Math.round(
      categoryCompanies.reduce((sum, company) => sum + company.score, 0) / Math.max(companyCount, 1),
    );
    const averageRenewal = Math.round(
      categoryCompanies.reduce((sum, company) => sum + company.predictions.buyStandAgainProbability, 0) /
        Math.max(companyCount, 1),
    );
    const averageUpgrade = Math.round(
      categoryCompanies.reduce((sum, company) => sum + company.predictions.buyBetterStandProbability, 0) /
        Math.max(companyCount, 1),
    );
    const averageChurn = Math.round(
      categoryCompanies.reduce((sum, company) => sum + company.predictions.churnProbability, 0) /
        Math.max(companyCount, 1),
    );
    const saturationPenalty = companyCount >= 90 ? 10 : companyCount >= 60 ? 6 : companyCount >= 30 ? 2 : 0;
    const categoryDemandScore = Math.round(
      clamp(definition.demandScore * 0.65 + averageRenewal * 0.35 - saturationPenalty, 18, 96),
    );

    let categoryStatus = "Categoria equilibrada";
    let categoryStatusReason = `Grupo com ${companyCount} expositores parecidos e demanda estável na feira.`;

    if (companyCount >= 70 && categoryDemandScore < 78) {
      categoryStatus = "Categoria saturada";
      categoryStatusReason = `${companyCount} expositores parecidos e pressão competitiva alta dentro do grupo.`;
    } else if (categoryDemandScore >= 80 && companyCount <= 14) {
      categoryStatus = "Categoria de nicho forte";
      categoryStatusReason = `Poucos concorrentes diretos e média de renovação de ${averageRenewal}% dentro do grupo.`;
    } else if (categoryDemandScore >= 78) {
      categoryStatus = "Categoria forte";
      categoryStatusReason = `${companyCount} expositores parecidos e média de renovação de ${averageRenewal}% no grupo.`;
    } else if (companyCount <= 14) {
      categoryStatus = "Categoria de nicho";
      categoryStatusReason = `Grupo enxuto, com ${companyCount} expositores comparáveis e competição administrável.`;
    }

    categoryStats.set(categoryKey, {
      definition,
      companyCount,
      averageScore,
      averageRenewal,
      averageUpgrade,
      averageChurn,
      categoryDemandScore,
      categoryStatus,
      categoryStatusReason,
      competitionPressureBase: Math.round(
        ((Math.max(companyCount - 1, 0)) / Math.max(maxCategorySize - 1, 1)) * 100,
      ),
    });
  }

  for (const company of companies) {
    const signals = initialSignals.get(company.slug);
    const stats = categoryStats.get(signals.category.key);
    const directCompetitorsCount = Math.max(stats.companyCount - 1, 0);
    const competitionPressure = Math.round(
      (directCompetitorsCount / Math.max(maxCategorySize - 1, 1)) * 100,
    );
    const differentiationScore = Math.round(
      clamp(
        signals.baseDifferentiationScore +
          (company.score - stats.averageScore) * 0.55 +
          (company.predictions.buyBetterStandProbability - stats.averageUpgrade) * 0.18 -
          competitionPressure * 0.12,
        8,
        96,
      ),
    );

    const context = {
      ...signals,
      ...stats,
      directCompetitorsCount,
      competitionPressure,
      differentiationScore,
    };

    const whyBelieve = buildWhyBelieve(company, context);
    const goodExperienceScore = computeGoodExperienceScore(company, context);
    const scoreGapInCategory = company.score - stats.averageScore;

    let differentialLabel = "Diferencial moderado";
    let differentialReason = "A empresa compete bem no grupo, mas ainda divide atenção com ofertas próximas.";

    if (differentiationScore >= 70) {
      differentialLabel = "Diferencial claro";
      differentialReason = "Tem sinais mais fortes que a média do grupo e tende a se destacar frente aos pares.";
    } else if (differentiationScore <= 48) {
      differentialLabel = "Oferta pouco diferenciada";
      differentialReason = "A oferta parece próxima demais de vários expositores comparáveis na mesma categoria.";
    }

    let relativeRiskLabel = "Risco médio no grupo";
    let relativeRiskReason = "Está em linha com a média da categoria e precisa de execução comercial consistente.";

    if (company.decision === "high-churn-risk" || scoreGapInCategory <= -8 || goodExperienceScore < 52) {
      relativeRiskLabel = "Risco alto no grupo";
      relativeRiskReason = "Fica abaixo da média dos concorrentes diretos e tende a sentir mais a pressão competitiva.";
    } else if (scoreGapInCategory >= 8 && differentiationScore >= 65 && goodExperienceScore >= 72) {
      relativeRiskLabel = "Risco baixo no grupo";
      relativeRiskReason = "Opera acima da média dos pares e tende a capturar melhor atenção e retorno dentro da categoria.";
    }

    company.mainReason = buildMainReason(company, context);
    company.nextActionShort = buildNextActionShort(company, context);
    company.goodExperience = {
      score: goodExperienceScore,
      explanation: buildGoodExperienceExplanation(goodExperienceScore, whyBelieve),
      whyBelieve,
    };
    company.segmentation = {
      categoryKey: signals.category.key,
      categoryLabel: signals.category.label,
      directCompetitorsCount,
      companyCountInCategory: stats.companyCount,
      categoryStatus: stats.categoryStatus,
      categoryStatusReason: stats.categoryStatusReason,
      differentialLabel,
      differentialReason,
      relativeRiskLabel,
      relativeRiskReason,
    };
  }
}

function decideCommercialRoute(company) {
  if (company.predictions.renewAndUpgradeProbability >= 78) {
    return "upgrade-stand";
  }
  if (company.predictions.buyStandAgainProbability >= 75) {
    return "renew-stand";
  }
  if (company.predictions.buyStandAgainProbability >= 50) {
    return "salvage-account";
  }
  return "high-churn-risk";
}

function extractDetailedCompanies(markdown) {
  const top20Index = markdown.indexOf("## TOP 20 EMPRESAS");
  const bottom10Index = markdown.indexOf("## BOTTOM 10 EMPRESAS");
  const consolidatedIndex = markdown.indexOf("## LISTAS CONSOLIDADAS");
  const blockRegex =
    /### EMPRESA: (?<name>.+)\n\*\*Score Total: (?<score>\d+)\/100\*\*\n\*\*Classe: (?<class>[ABCD])\*\*[\s\S]*?(?=\n### EMPRESA: |\n---\n## LISTAS CONSOLIDADAS|\n## LISTAS CONSOLIDADAS|$)/g;

  const detailedCompanies = new Map();
  let match;

  while ((match = blockRegex.exec(markdown)) !== null) {
    const block = match[0];
    const name = match.groups?.name?.trim();
    const score = Number(match.groups?.score ?? 0);
    const klass = match.groups?.class ?? scoreToClass(score);

    if (!name) {
      continue;
    }

    const detailedSection =
      match.index > top20Index && match.index < bottom10Index
        ? "top20"
        : match.index > bottom10Index && match.index < consolidatedIndex
          ? "bottom10"
          : null;

    const criteria = Array.from(
      block.matchAll(
        /- Critério (?<index>\d+) - (?<label>.*?): (?<value>\d+)\/(?<max>\d+)(?: (?<warning>⚠️))? — (?<justification>.+)/g,
      ),
    ).map((criterionMatch) => ({
      index: Number(criterionMatch.groups?.index ?? 0),
      label: criterionMatch.groups?.label?.trim() ?? "",
      score: Number(criterionMatch.groups?.value ?? 0),
      maxScore: Number(criterionMatch.groups?.max ?? 0),
      warning: Boolean(criterionMatch.groups?.warning),
      justification: criterionMatch.groups?.justification?.trim() ?? "",
    }));

    const diagnostic =
      block.match(/\*\*Diagnóstico resumido:\*\* (?<value>.+)/)?.groups?.value?.trim() ?? null;
    const actionRecommended =
      block.match(/\*\*Ação recomendada:\*\* (?<value>.+)/)?.groups?.value?.trim() ?? null;

    detailedCompanies.set(normalizeKey(name), {
      name,
      score,
      class: klass,
      detailedSection,
      criteria,
      diagnostic,
      actionRecommended,
    });
  }

  return detailedCompanies;
}

function extractConsolidatedCompanies(markdown) {
  const lines = markdown.split(/\r?\n/);
  const companies = new Map();
  let currentList = null;

  for (const line of lines) {
    const listMatch = line.match(/^### Lista (?<index>[1-4]): /);
    if (listMatch?.groups?.index) {
      currentList = listMatch.groups.index;
      continue;
    }

    const companyMatch = line.match(/^- (?<name>.+) \(Score: (?<score>\d+)\) - (?<context>.+)$/);
    if (!currentList || !companyMatch?.groups?.name) {
      continue;
    }

    const name = companyMatch.groups.name.trim();
    const score = Number(companyMatch.groups.score ?? 0);
    const key = normalizeKey(name);

    companies.set(key, {
      name,
      score,
      class: scoreToClass(score),
      consolidatedList: currentList,
      consolidatedContext: companyMatch.groups.context.trim(),
      actionLabel: listDefinitions[currentList].actionLabel,
      playbook: listDefinitions[currentList].playbook,
      bucket: listDefinitions[currentList].bucket,
    });
  }

  return companies;
}

function buildInsights(company) {
  const insights = [];

  if (company.profile.inferred) {
    insights.push("Perfil inferido: clareza menor; usar qualificação rápida antes de propor upgrade.");
  }
  if (company.decision === "upgrade-stand") {
    insights.push("Conta com força para renovar e subir o plano do estande na mesma abordagem.");
  }
  if (company.profile.gaps[0]) {
    insights.push(company.profile.gaps[0]);
  }
  if (company.profile.bottlenecks[0]) {
    insights.push(company.profile.bottlenecks[0]);
  }
  if (company.profile.pains[0]) {
    insights.push(company.profile.pains[0]);
  }

  return Array.from(new Set(insights)).slice(0, 4);
}

function buildCompanyRecord(baseCompany, detailedCompany, companyProfile) {
  const profile =
    companyProfile ??
    {
      name: baseCompany.name,
      slug: normalizeKey(baseCompany.name),
      fileName: null,
      booths: [],
      boothLabel: "Sem estande mapeado",
      baseUsed: null,
      searchUrl: null,
      matchesFound: null,
      inferred: true,
      summary80_20: null,
      products: [],
      services: [],
      pains: [],
      dreams: [],
      bottlenecks: [],
      gaps: [],
      publicSignals: null,
    };

  const company = {
    slug: normalizeKey(baseCompany.name),
    name: baseCompany.name,
    score: baseCompany.score,
    class: detailedCompany?.class ?? baseCompany.class,
    bucket: baseCompany.bucket,
    actionLabel: baseCompany.actionLabel,
    playbook: detailedCompany?.actionRecommended ?? baseCompany.playbook,
    consolidatedContext: baseCompany.consolidatedContext,
    diagnostic: detailedCompany?.diagnostic ?? null,
    actionRecommended: detailedCompany?.actionRecommended ?? baseCompany.playbook,
    criteria: detailedCompany?.criteria ?? [],
    profile,
    source: {
      report: "output_feimec.md",
      hasDetailedProfile: Boolean(detailedCompany),
      detailedSection: detailedCompany?.detailedSection ?? null,
      hasCompanyFile: Boolean(companyProfile),
      inferredCompanyProfile: profile.inferred,
    },
    predictions: {
      buyStandAgainProbability: 0,
      churnProbability: 0,
      buyBetterStandProbability: 0,
      renewAndUpgradeProbability: 0,
      partnershipProbability: 0,
      churnBand: "medium",
    },
    insights: [],
    mainReason: "",
    nextActionShort: "",
    goodExperience: {
      score: 0,
      explanation: "",
      whyBelieve: [],
    },
    segmentation: {
      categoryKey: "general-industrial",
      categoryLabel: "Soluções industriais gerais",
      directCompetitorsCount: 0,
      companyCountInCategory: 1,
      categoryStatus: "Categoria equilibrada",
      categoryStatusReason: "Sem grupo comparável suficiente ainda.",
      differentialLabel: "Diferencial moderado",
      differentialReason: "Sem leitura comparativa suficiente ainda.",
      relativeRiskLabel: "Risco médio no grupo",
      relativeRiskReason: "Sem leitura comparativa suficiente ainda.",
    },
    nextBestAction: "",
    decision: "renew-stand",
  };

  company.predictions.buyStandAgainProbability = computeRenewalProbability(company);
  company.predictions.churnProbability = 100 - company.predictions.buyStandAgainProbability;
  company.predictions.buyBetterStandProbability = computeUpgradeProbability(company);
  company.predictions.partnershipProbability = computePartnershipProbability(company);
  company.predictions.renewAndUpgradeProbability = computeRenewAndUpgradeProbability(company);
  company.predictions.churnBand = churnBand(company.predictions.churnProbability);
  company.decision = decideCommercialRoute(company);
  company.nextBestAction =
    company.decision === "upgrade-stand"
      ? "Abordar com renovação antecipada, área maior, melhor plano e pacote de patrocínio."
      : company.decision === "renew-stand"
        ? "Renovar rápido e anexar matchmaking/pre-agendamento para elevar percepção de ROI."
        : company.decision === "salvage-account"
          ? "Levar plano de ROI e ativação antes de discutir metragem."
          : "Fazer contato consultivo, reduzir risco e rediscutir posicionamento na feira.";
  company.insights = buildInsights(company);

  return company;
}

function createSnapshot(company, probabilityKey) {
  const probability = company.predictions[probabilityKey];
  const rationale = company.mainReason || company.diagnostic || company.profile.summary80_20 || `${company.actionLabel}. ${company.consolidatedContext}`;

  return {
    name: company.name,
    slug: company.slug,
    boothLabel: company.profile.boothLabel,
    score: company.score,
    class: company.class,
    probability,
    decision: company.decision,
    rationale,
    nextBestAction: company.nextBestAction,
    renewalProbability: company.predictions.buyStandAgainProbability,
    upgradeProbability: company.predictions.buyBetterStandProbability,
    churnProbability: company.predictions.churnProbability,
    renewAndUpgradeProbability: company.predictions.renewAndUpgradeProbability,
  };
}

const rawMarkdown = await readFile(sourcePath, "utf8");
const companyProfiles = await readCompanyProfiles();
const detailedCompanies = extractDetailedCompanies(rawMarkdown);
const consolidatedCompanies = extractConsolidatedCompanies(rawMarkdown);

for (const [key, detailedCompany] of detailedCompanies.entries()) {
  if (!consolidatedCompanies.has(key)) {
    consolidatedCompanies.set(key, {
      name: detailedCompany.name,
      score: detailedCompany.score,
      class: detailedCompany.class,
      consolidatedList: detailedCompany.detailedSection === "top20" ? "1" : "4",
      consolidatedContext: detailedCompany.diagnostic ?? "Empresa detalhada no relatório principal.",
      actionLabel:
        detailedCompany.detailedSection === "top20"
          ? listDefinitions["1"].actionLabel
          : listDefinitions["4"].actionLabel,
      playbook:
        detailedCompany.actionRecommended ??
        (detailedCompany.detailedSection === "top20"
          ? listDefinitions["1"].playbook
          : listDefinitions["4"].playbook),
      bucket:
        detailedCompany.detailedSection === "top20"
          ? listDefinitions["1"].bucket
          : listDefinitions["4"].bucket,
    });
  }
}

const companies = Array.from(consolidatedCompanies.values()).map((company) =>
  buildCompanyRecord(
    company,
    detailedCompanies.get(normalizeKey(company.name)),
    companyProfiles.get(normalizeKey(company.name)),
  ),
);

enrichCompanies(companies);

companies.sort((left, right) => {
  if (right.predictions.renewAndUpgradeProbability !== left.predictions.renewAndUpgradeProbability) {
    return right.predictions.renewAndUpgradeProbability - left.predictions.renewAndUpgradeProbability;
  }
  if (right.predictions.buyStandAgainProbability !== left.predictions.buyStandAgainProbability) {
    return right.predictions.buyStandAgainProbability - left.predictions.buyStandAgainProbability;
  }
  if (right.score !== left.score) {
    return right.score - left.score;
  }
  return left.name.localeCompare(right.name, "pt-BR");
});

const countsByClass = companies.reduce(
  (accumulator, company) => {
    accumulator[company.class] += 1;
    return accumulator;
  },
  { A: 0, B: 0, C: 0, D: 0 },
);

const decisionCounts = companies.reduce(
  (accumulator, company) => {
    accumulator[company.decision] = (accumulator[company.decision] ?? 0) + 1;
    return accumulator;
  },
  {
    "upgrade-stand": 0,
    "renew-stand": 0,
    "salvage-account": 0,
    "high-churn-risk": 0,
  },
);

const averageScore = Math.round(
  companies.reduce((sum, company) => sum + company.score, 0) / Math.max(companies.length, 1),
);

const inferredProfilesCount = companies.filter((company) => company.profile.inferred).length;

const expansionCandidates = [...companies]
  .sort((left, right) => {
    if (right.predictions.renewAndUpgradeProbability !== left.predictions.renewAndUpgradeProbability) {
      return right.predictions.renewAndUpgradeProbability - left.predictions.renewAndUpgradeProbability;
    }
    if (right.predictions.buyBetterStandProbability !== left.predictions.buyBetterStandProbability) {
      return right.predictions.buyBetterStandProbability - left.predictions.buyBetterStandProbability;
    }
    return right.predictions.buyStandAgainProbability - left.predictions.buyStandAgainProbability;
  })
  .slice(0, 8)
  .map((company) => createSnapshot(company, "renewAndUpgradeProbability"));

const top5Renewal = [...companies]
  .sort((left, right) => {
    if (right.predictions.buyStandAgainProbability !== left.predictions.buyStandAgainProbability) {
      return right.predictions.buyStandAgainProbability - left.predictions.buyStandAgainProbability;
    }
    if (right.score !== left.score) {
      return right.score - left.score;
    }
    return left.name.localeCompare(right.name, "pt-BR");
  })
  .slice(0, 5)
  .map((company) => createSnapshot(company, "buyStandAgainProbability"));

const top5Upgrade = [...companies]
  .sort((left, right) => {
    if (right.predictions.buyBetterStandProbability !== left.predictions.buyBetterStandProbability) {
      return right.predictions.buyBetterStandProbability - left.predictions.buyBetterStandProbability;
    }
    if (right.predictions.buyStandAgainProbability !== left.predictions.buyStandAgainProbability) {
      return right.predictions.buyStandAgainProbability - left.predictions.buyStandAgainProbability;
    }
    return right.score - left.score;
  })
  .slice(0, 5)
  .map((company) => createSnapshot(company, "buyBetterStandProbability"));

const top5Churn = [...companies]
  .sort((left, right) => {
    if (right.predictions.churnProbability !== left.predictions.churnProbability) {
      return right.predictions.churnProbability - left.predictions.churnProbability;
    }
    if (left.score !== right.score) {
      return left.score - right.score;
    }
    return left.name.localeCompare(right.name, "pt-BR");
  })
  .slice(0, 5)
  .map((company) => createSnapshot(company, "churnProbability"));

const payload = {
  generatedAt: new Date().toISOString(),
  sourceFile: "output_feimec.md",
  methodology: {
    input:
      "Conversão do score final do relatório FEIMEC em probabilidades operacionais de renovação, churn e upgrade de estande, enriquecida com o dossiê individual de cada empresa.",
    note:
      "As probabilidades usam o score do relatório, a classe FEIMEC, o detalhamento do perfil e o conteúdo consolidado dos arquivos individuais em empresas/.",
    formulas: {
      renewal: "score normalizado + ajuste por classe + ajuste por seção detalhada",
      churn: "100 - probabilidade de renovação",
      upgrade: "score acima da faixa de renovação + bônus de premium/upsell + densidade de oferta",
      renewAndUpgrade: "probabilidade conjunta entre renovar e subir o plano do estande",
      goodExperience:
        "fit com o público + clareza da oferta + força da categoria + diferenciação frente aos concorrentes + capacidade de demo",
    },
  },
  summary: {
    totalCompanies: companies.length,
    averageScore,
    inferredProfilesCount,
    countsByClass,
    decisionCounts,
    expansionCandidates,
    standAgainCandidates: top5Renewal,
    betterStandCandidates: top5Upgrade,
    topChurnRisk: top5Churn,
  },
  companies,
};

await mkdir(path.dirname(appJsonPath), { recursive: true });
await writeFile(appJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await writeFile(workspaceJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`Predictions JSON generated with ${companies.length} companies.`);
console.log(`App data: ${appJsonPath}`);
console.log(`Workspace export: ${workspaceJsonPath}`);