import json
import os

with open('dados/feimec_cache.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

companies = []

for idx, comp in enumerate(data):
    name = comp.get('name', 'Desconhecida')
    desc = comp.get('description_text', '').lower()
    inferred = ('inferida' in comp.get('source_status', '').lower() or not desc.strip())
    
    # Base scores
    c1, c2, c3, c4, c5, c6 = 5, 5, 5, 10, 5, 3
    c1_just = "Oferta genérica ou institucional."
    c2_just = "Produto de difícil demonstração."
    c3_just = "Venda de insumos ou peças com margem de volume."
    c4_just = "Descrição identificável."
    c5_just = "Decisor menos comum no perfil dominante da feira."
    c6_just = "Marca sem indicadores claros de liderança no texto."
    
    if inferred:
        c4 = 2
        c4_just = "Descrição ausente ou inferida."
        
    # C1
    if any(k in desc for k in ['cnc', 'robô', 'robótica', 'corte', 'solda', 'laser', 'metrologia', 'software', 'impressão 3d', 'automação']):
        c1 = 25
        c1_just = "Alta aderência, soluções de alto engajamento industrial (máquinas, tech)."
    elif any(k in desc for k in ['equipamento', 'componente', 'ferramenta', 'peça', 'manutenção', 'válvula']):
        c1 = 15
        c1_just = "Média aderência, componente industrial válido mas comum."
    
    # C2
    if any(k in desc for k in ['máquina', 'robô', 'scanner', 'impressão 3d', 'software']):
        c2 = 20
        c2_just = "Produto altamente demonstrável no estande."
    elif any(k in desc for k in ['equipamento', 'medidor']):
        c2 = 12
        c2_just = "Demonstração possível, mas de menor apelo visual do que grandes máquinas."
    
    # C3
    if any(k in desc for k in ['cnc', 'robô', 'projeto', 'turn-key', 'solução completa']):
        c3 = 15
        c3_just = "Ticket altíssimo, poucos leads justificam o ROI."
    elif any(k in desc for k in ['software', 'equipamento', 'válvula', 'motor']):
        c3 = 10
        c3_just = "Ticket razoável, exige volume qualificado."
    
    # C4
    if not inferred:
        if any(k in desc for k in ['oferecemos', 'fabricante', 'distribuidor', 'soluções', 'aplicações']):
            c4 = 15
            c4_just = "Descrição clara, objetiva e com portfólio especificado."
            
    # C5
    if any(k in desc for k in ['engenharia', 'produção', 'fabricação', 'chão de fábrica', 'manutenção']):
        c5 = 15
        c5_just = "Alvo direto em engenharias e gerentes de produção."
    elif 'ti' in desc or 'tecnologia' in desc or 'inovação' in desc:
        c5 = 10
        c5_just = "Atinge perfis técnicos secundários (tecnologia, qualidade)."
        
    # C6
    if any(k in desc for k in ['líder', 'global', 'multinacional', 'anos']):
        c6 = 10
        c6_just = "Marca com forte presença e estabilidade manifestada (anos de mercado/global)."
    elif any(k in desc for k in ['brasileira', 'nacional', 'distribuidora']):
        c6 = 6
        c6_just = "Marca estabelecida com distribuição ou atuação nacional."
        
    total_score = c1 + c2 + c3 + c4 + c5 + c6
    if total_score >= 80:
        cls = 'A'
    elif total_score >= 65:
        cls = 'B'
    elif total_score >= 45:
        cls = 'C'
    else:
        cls = 'D'
        
    c4_warning = " ⚠️" if inferred else ""
    
    diag = f"{name} é focado em tech/soluções industriais." if total_score > 60 else f"{name} tem oferta mais institucional ou baseada em insumo simples."
    if cls == 'A':
        acao = "Renovação antecipada, prioridade máxima para fechar patrocínios e espaços premium."
    elif cls == 'B':
        acao = "Oferecer pacote com matchmaking e reuniões guiadas."
    elif cls == 'C':
        acao = "Vender plano de geração de demanda antes do m2."
    else:
        acao = "Fazer contato consultivo para entender barreiras e reposicionar com matchmaking alvo."
        
    companies.append({
        'name': name,
        'score': total_score,
        'class': cls,
        'c1': c1, 'c1_just': c1_just,
        'c2': c2, 'c2_just': c2_just,
        'c3': c3, 'c3_just': c3_just,
        'c4': c4, 'c4_warning': c4_warning, 'c4_just': c4_just,
        'c5': c5, 'c5_just': c5_just,
        'c6': c6, 'c6_just': c6_just,
        'diag': diag, 'acao': acao
    })

companies.sort(key=lambda x: x['score'], reverse=True)

top_20 = companies[:20]
bottom_10 = companies[-10:]

with open('output_feimec.md', 'w', encoding='utf-8') as f:
    f.write("# Análise de Empresas FEIMEC 2026\n\n")
    f.write("## TOP 20 EMPRESAS (Renovar Agora / Com Upsell)\n\n")
    for c in top_20:
        f.write(f"### EMPRESA: {c['name']}\n")
        f.write(f"**Score Total: {c['score']}/100**\n")
        f.write(f"**Classe: {c['class']}**\n\n")
        f.write(f"- Critério 1 - Aderência ao público: {c['c1']}/25 — {c['c1_just']}\n")
        f.write(f"- Critério 2 - Capacidade de demo: {c['c2']}/20 — {c['c2_just']}\n")
        f.write(f"- Critério 3 - Ticket e ciclo: {c['c3']}/15 — {c['c3_just']}\n")
        f.write(f"- Critério 4 - Clareza da oferta: {c['c4']}/15{c['c4_warning']} — {c['c4_just']}\n")
        f.write(f"- Critério 5 - Fit com decisores: {c['c5']}/15 — {c['c5_just']}\n")
        f.write(f"- Critério 6 - Força de marca: {c['c6']}/10 — {c['c6_just']}\n\n")
        f.write(f"**Diagnóstico resumido:** {c['diag']}\n")
        f.write(f"**Ação recomendada:** {c['acao']}\n\n")

    f.write("---\n## BOTTOM 10 EMPRESAS (Risco de Churn / Baixa Qualificação)\n\n")
    for c in bottom_10:
        f.write(f"### EMPRESA: {c['name']}\n")
        f.write(f"**Score Total: {c['score']}/100**\n")
        f.write(f"**Classe: {c['class']}**\n\n")
        f.write(f"- Critério 1 - Aderência ao público: {c['c1']}/25 — {c['c1_just']}\n")
        f.write(f"- Critério 2 - Capacidade de demo: {c['c2']}/20 — {c['c2_just']}\n")
        f.write(f"- Critério 3 - Ticket e ciclo: {c['c3']}/15 — {c['c3_just']}\n")
        f.write(f"- Critério 4 - Clareza da oferta: {c['c4']}/15{c['c4_warning']} — {c['c4_just']}\n")
        f.write(f"- Critério 5 - Fit com decisores: {c['c5']}/15 — {c['c5_just']}\n")
        f.write(f"- Critério 6 - Força de marca: {c['c6']}/10 — {c['c6_just']}\n\n")
        f.write(f"**Diagnóstico resumido:** {c['diag']}\n")
        f.write(f"**Ação recomendada:** {c['acao']}\n\n")
        
    f.write("---\n## LISTAS CONSOLIDADAS\n\n")
    
    lista_1 = [c for c in companies if c['score'] >= 80]
    lista_2 = [c for c in companies if 65 <= c['score'] < 80]
    lista_3 = [c for c in companies if 45 <= c['score'] < 65]
    lista_4 = [c for c in companies if c['score'] < 45]
    
    f.write("### Lista 1: Renovar agora (score 80+)\n")
    for c in lista_1:
        f.write(f"- {c['name']} (Score: {c['score']}) - Lead e aderência imbatíveis.\n")
        
    f.write("\n### Lista 2: Renovar com upsell (score 65 a 79)\n")
    for c in lista_2:
        f.write(f"- {c['name']} (Score: {c['score']}) - Oferta válida que exige suporte e matchmaking.\n")
        
    f.write("\n### Lista 3: Salvar com plano de ROI (score 45 a 64)\n")
    for c in lista_3:
        f.write(f"- {c['name']} (Score: {c['score']}) - Risco moderado. Custo x benefício difícil de provar sem ajuda de conversão.\n")
        
    f.write("\n### Lista 4: Risco de churn (abaixo de 45)\n")
    for c in lista_4:
        f.write(f"- {c['name']} (Score: {c['score']}) - Desalinhamento institucional ou falta de dados na oferta.\n")

print("Arquivo gerado: output_feimec.md")
