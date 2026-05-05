# Ofertas 1 e 2 do Triple-Lock em Linguagem Muito Simples

Este arquivo explica as 2 primeiras ofertas como se fosse para uma crianca entender.
Tambem traz um MVP bem simples (chatgpt wrapper + prompt em linguagem natural) e uma simulacao de conversa na feira com 3 ICPs.

## Oferta 1 (mais forte): Diagnostico + ROI + Performance

## O que e isso, super simples

Imagine uma fabrica como um carro velho e novo misturado.
Tem pecas de marcas diferentes.
Tudo funciona, mas gasta muito, para muito e perde tempo.

Essa oferta entra para:
- descobrir onde o dinheiro esta vazando
- mostrar o que arrumar primeiro
- provar em numeros o ganho
- acompanhar para o ganho continuar

Em frase de crianca:
"Eu te mostro onde voce perde dinheiro, arrumo o mais importante primeiro e te provo com numeros que melhorou."

## MVP super simples da Oferta 1

## Nome do MVP

MVP 1 - Mapa de Perdas em 1 Pagina

## Como funciona (simples)

1. A empresa responde 10 perguntas basicas.
2. O ChatGPT organiza tudo em 1 pagina.
3. A saida mostra:
- 3 maiores perdas
- 3 acoes rapidas (quick wins)
- estimativa simples de ganho em R$
- proximo passo de 30 dias

## Wrapper mais simples possivel

- Tela unica com formulario (perguntas simples).
- Botao: "Gerar meu mapa".
- API chama ChatGPT com um prompt fixo.
- Retorna um texto estruturado em blocos.

## Prompt natural (bem simples)

Use este prompt no backend do MVP:

"Voce e um consultor industrial pratico. Vou te dar dados simples de uma fabrica. Pense de forma estruturada em silencio e me entregue so o resultado final em linguagem muito simples. Nao use palavras complicadas.

Dados da fabrica:
- Segmento: {segmento}
- Maquinas principais: {maquinas}
- Principais problemas: {problemas}
- Paradas por semana: {paradas}
- Refugo aproximado (%): {refugo}
- Time de setup medio (min): {setup}
- Custo medio de hora parada (R$): {custo_hora_parada}
- Meta da empresa: {meta}

Me entregue EXATAMENTE nestes blocos:
1) O que esta doendo mais (3 itens)
2) O que fazer primeiro (3 acoes em ate 30 dias)
3) Ganho estimado simples (baixo, medio, alto + faixa em R$)
4) Plano de 30 dias (semana 1, 2, 3, 4)
5) Frase final para diretor (2 linhas)

Tom: direto, simples, sem jargao." 

## Output valido para MVP (exemplo)

1) O que esta doendo mais
- Setup muito longo
- Paradas por falha repetida
- Refugo acima do ideal

2) O que fazer primeiro
- Padronizar setup da maquina A
- Criar checklist de partida
- Revisar 1 parametro critico por turno

3) Ganho estimado simples
- Nivel: medio
- Faixa: R$ 40 mil a R$ 80 mil em 3 meses

4) Plano de 30 dias
- Semana 1: medir baseline
- Semana 2: executar 2 quick wins
- Semana 3: validar resultado
- Semana 4: fechar plano de escala

5) Frase final para diretor
- "Hoje a fabrica perde dinheiro em 3 pontos claros."
- "Com 30 dias de foco, ja da para capturar ganho e provar ROI." 

---

## Oferta 2: ROI + Diagnostico Multimarcas

## O que e isso, super simples

Imagine que a fabrica comprou pecas de varias lojas.
Cada loja ajuda um pouco, mas ninguem junta tudo.

Essa oferta junta o quebra-cabeca inteiro para:
- ver o todo
- escolher a ordem certa de investimento
- evitar gastar no lugar errado

Em frase de crianca:
"Eu junto todas as marcas numa historia so e te mostro onde investir primeiro para ganhar mais rapido."

## MVP super simples da Oferta 2

## Nome do MVP

MVP 2 - Priorizador de Investimento Industrial

## Como funciona (simples)

1. Usuario lista ate 8 problemas e 8 ideias de melhoria.
2. Usuario preenche impacto esperado e dificuldade.
3. ChatGPT devolve um ranking 1, 2, 3 com justificativa simples.

## Wrapper mais simples possivel

- Upload de planilha simples ou formulario.
- Botao: "Priorizar agora".
- API chama ChatGPT.
- Retorno: tabela curta + recomendacao do primeiro piloto.

## Prompt natural (bem simples)

"Voce e um consultor industrial de priorizacao. Vou te passar oportunidades de melhoria de uma fabrica com ambiente multimarcas. Pense de forma estruturada em silencio e me entregue so o resultado final de forma simples.

Entradas:
- Lista de problemas: {problemas}
- Lista de melhorias propostas: {melhorias}
- Impacto estimado por melhoria (1-5): {impactos}
- Dificuldade de implantacao (1-5): {dificuldades}
- Orçamento disponivel: {orcamento}
- Meta principal da direcao: {meta}

Saida obrigatoria:
1) Ranking Top 3 melhorias
2) Por que cada uma entrou no Top 3 (1 linha cada)
3) Qual fazer primeiro em 30 dias
4) Risco principal e como reduzir esse risco
5) Frase de aprovacao para diretoria (2 linhas)

Regras:
- Linguagem simples
- Frases curtas
- Sem jargao tecnico" 

## Output valido para MVP (exemplo)

1) Ranking Top 3
- 1. Reduzir setup da linha X
- 2. Padronizar checklist de inicio de turno
- 3. Ajustar plano de manutencao preventiva

2) Por que entrou
- Setup: alto impacto e baixa complexidade
- Checklist: custo baixo e ganho rapido
- Manutencao: reduz parada recorrente

3) Qual fazer primeiro em 30 dias
- Reducao de setup da linha X

4) Risco principal e mitigacao
- Risco: equipe nao seguir novo padrao
- Mitigacao: treino de 1 hora + rotina diaria de conferencia

5) Frase de aprovacao para diretoria
- "Temos 3 frentes claras de ganho, com baixo risco inicial."
- "A primeira entrega resultado em ate 30 dias e valida o resto do plano." 

---

## Simulacao de conversa na feira com 3 ICPs

Objetivo da simulacao:
mostrar como fazer venda consultiva em escada de valor (value ladder) sem ser tecnico demais.

## Value Ladder simples usada nas 3 conversas

1. Isca leve (gratuita): Raio-X de 15 min no estande
2. Entrada paga baixa: Diagnostico rapido em 7 dias
3. Projeto piloto: 30 dias com 1 meta
4. Implantacao maior: 90 dias em mais areas
5. Recorrencia: acompanhamento mensal de performance + ROI

## Conversa 1 - ICP: ROMI (foco em base instalada e eficiencia)

Voce:
"Oi, em 2 minutos: onde voces mais perdem dinheiro hoje, em setup, parada ou refugo?"

ROMI:
"Parada e setup estao pesando." 

Voce:
"Perfeito. Eu faco um raio-x rapido aqui na feira e te mostro os 3 vazamentos principais em 1 pagina. Sem custo."

ROMI:
"E depois?"

Voce:
"Se fizer sentido, entramos no passo 2: diagnostico de 7 dias, barato, para provar onde mexer primeiro."

ROMI:
"E se der certo?"

Voce:
"Passo 3: piloto de 30 dias com 1 meta, por exemplo baixar setup em 20%."

ROMI:
"E a longo prazo?"

Voce:
"Passo 4 e 5: expandimos para outras celulas e mantemos acompanhamento mensal para nao perder o ganho."

Fechamento consultivo:
"Nao vendo software primeiro. Vendo resultado pequeno, rapido e provado."

## Conversa 2 - ICP: Paletrans (foco em produtividade e padronizacao)

Voce:
"Se eu te mostrar em 1 folha onde esta o gargalo que mais atrasa entrega, te ajuda hoje?"

Paletrans:
"Ajuda, mas temos pouco tempo de time." 

Voce:
"Por isso o primeiro passo e leve: 15 minutos aqui na feira + checklist simples."

Paletrans:
"E o custo para comecar?"

Voce:
"Baixo. O diagnostico de 7 dias custa pouco e ja sai com plano de 30 dias."

Paletrans:
"Como voce prova que funciona?"

Voce:
"No piloto, escolhemos 1 numero: setup, parada ou refugo. Se o numero melhorar, seguimos. Se nao, paramos."

Fechamento consultivo:
"Risco pequeno na entrada, prova rapida, escala so depois do resultado."

## Conversa 3 - ICP: Combustol Fornos (foco em processo termico e estabilidade)

Voce:
"No forno, qual dor mais machuca: variacao de processo, paradas ou custo energetico?"

Combustol Fornos:
"Variacao e parada." 

Voce:
"Entao nossa escada e simples: primeiro te entrego um mapa de perdas. Depois um mini projeto para estabilizar 1 ponto critico em 30 dias."

Combustol Fornos:
"Tem muita marca envolvida, isso complica." 

Voce:
"Esse e o nosso trabalho: juntar tudo e priorizar sem briga de fornecedor."

Combustol Fornos:
"E depois do piloto?"

Voce:
"A gente sobe para 90 dias em mais areas e vira rotina mensal de performance e ROI."

Fechamento consultivo:
"Menos promessa grande. Mais ganho real, por etapas curtas."

---

## Script curto para voce usar no estande

"Posso te fazer 3 perguntas rapidas?
1) Onde voce mais perde dinheiro hoje?
2) Qual numero voce gostaria de melhorar em 30 dias?
3) Se eu te entregar um plano simples com ROI, voce topa um piloto pequeno?

A ideia e: começar pequeno, provar rapido e escalar com seguranca." 
