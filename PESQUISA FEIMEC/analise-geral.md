# Análise Geral FEIMEC 2026

## Escopo
- Leitura empresa por empresa e arquivo por arquivo de 779 arquivos `.md` na pasta `empresas/`.
- 656 arquivos com descrição pública capturada da FEIMEC.
- 123 arquivos com perfil inferido a partir do tipo de expositor e do template gerado.
- Critério desta análise: contagem por empresa, não por repetição de linha dentro do mesmo arquivo.
- Como os arquivos não tinham uma seção explícita de `medos`, usei `Gargalos` como proxy de medo operacional e comercial.
- Como os arquivos não tinham uma seção explícita de `desejos`, usei `Gaps` como proxy do que o mercado mais sente falta e quer comprar melhor.

## Visão Executiva
- Foram lidos 779 arquivos individuais de empresa.
- 656 perfis usam descrição pública da FEIMEC e 123 usam inferência setorial do arquivo original.
- As dores mais recorrentes giram em torno de refugo, retrabalho e variabilidade de qualidade, produtividade baixa, setups longos e ineficiência, paradas, falhas e indisponibilidade operacional.
- Os medos mais recorrentes aparecem como errar a integração com legado e travar a operação, não conseguir adoção operacional e treinamento suficientes, ficar sem estoque, peça, reposição ou suporte.
- Os sonhos mais recorrentes se concentram em aumentar qualidade, padronização e reduzir erros, ter previsibilidade, estabilidade e confiabilidade, reduzir custo, desperdício e custo unitário.
- Em serviços, o núcleo dominante é consultoria e processo, suporte técnico, treinamento.

## Dores Mais Constantes
### Temas
- Refugo, retrabalho e variabilidade de qualidade — 702 empresas (90,1%).
  Exemplos: Necessidade de equilibrar custo, qualidade e prazo.; Desvios de processo que aparecem tarde demais e viram refugo.; Dificuldade de manter precisão, repetibilidade e disponibilidade..
- Produtividade baixa, setups longos e ineficiência — 519 empresas (66,6%).
  Exemplos: Pressão por produtividade com menos margem para erro e parada.; Capacidade insuficiente, setups longos e baixa produtividade por máquina.; Perda de produtividade por parametrização ruim, consumíveis e retrabalho..
- Paradas, falhas e indisponibilidade operacional — 495 empresas (63,5%).
  Exemplos: Pressão por produtividade com menos margem para erro e parada.; Dificuldade de manter precisão, repetibilidade e disponibilidade.; Paradas de máquina e dificuldade de manter o processo estável..
- Custo alto, desperdício e pressão por margem — 303 empresas (38,9%).
  Exemplos: Pressão por produtividade com menos margem para erro e parada.; Necessidade de equilibrar custo, qualidade e prazo.; Pressão por custo sem comprometer performance e durabilidade..
- Baixa visibilidade de dados e do desempenho do processo — 197 empresas (25,3%).
  Exemplos: Baixa rastreabilidade e dificuldade de padronizar medições.; Pouca visibilidade sobre desempenho e gargalos do processo.; Dificuldade de ampliar visibilidade e influência do setor..
- Risco operacional, segurança e compliance — 147 empresas (18,9%).
  Exemplos: Risco de ruptura de estoque, variação de qualidade e lead time alto.; Dificuldade de padronizar componentes e reduzir risco operacional.; Risco de acidente, ergonomia ruim e gargalos no fluxo interno..
- Integração difícil entre sistemas, engenharia e produção — 115 empresas (14,8%).
  Exemplos: Baixa integração entre engenharia, produção e gestão.; Baixa OEE por setups, paradas e falta de integração..
- Estoque, reposição e lead time — 68 empresas (8,7%).
  Exemplos: Risco de ruptura de estoque, variação de qualidade e lead time alto..

### Linhas Exatas Mais Frequentes
- Dificuldade de encontrar solução aderente ao processo real. — 175 empresas (22,5%).
- Necessidade de equilibrar custo, qualidade e prazo. — 175 empresas (22,5%).
- Pressão por produtividade com menos margem para erro e parada. — 175 empresas (22,5%).
- Baixa rastreabilidade e dificuldade de padronizar medições. — 121 empresas (15,5%).
- Desvios de processo que aparecem tarde demais e viram refugo. — 121 empresas (15,5%).
- Necessidade de acelerar inspeção sem perder confiabilidade. — 121 empresas (15,5%).
- Capacidade insuficiente, setups longos e baixa produtividade por máquina. — 115 empresas (14,8%).
- Dificuldade de manter precisão, repetibilidade e disponibilidade. — 115 empresas (14,8%).
- Necessidade de justificar investimentos pesados com retorno claro. — 115 empresas (14,8%).
- Oscilação de qualidade em corte, união e acabamento. — 95 empresas (12,2%).
- Paradas de máquina e dificuldade de manter o processo estável. — 95 empresas (12,2%).
- Perda de produtividade por parametrização ruim, consumíveis e retrabalho. — 95 empresas (12,2%).

## Medos Mais Constantes
### Temas
- Errar a integração com legado e travar a operação — 687 empresas (88,2%).
  Exemplos: Integrar tecnologia nova ao processo existente.; Integração entre hardware, software e processo.; Integração com automação, ferramental e fluxo real de fábrica..
- Não conseguir adoção operacional e treinamento suficientes — 571 empresas (73,3%).
  Exemplos: Sustentar resultado no pós-venda e na rotina operacional.; Adoção operacional de métodos e rotinas de medição.; Treinamento operacional e manutenção de alta complexidade..
- Ficar sem estoque, peça, reposição ou suporte — 326 empresas (41,8%).
  Exemplos: Lead time de compra, importação, instalação e ramp-up.; Disponibilidade de peças, consumíveis e suporte de campo.; Disponibilidade de suporte especializado no pós-venda..
- Lidar com alta complexidade técnica e especificação errada — 325 empresas (41,7%).
  Exemplos: Treinamento operacional e manutenção de alta complexidade.; Dependência de parametrização fina e operadores experientes.; Necessidade de customização ou corte/processo adicional..
- Não comprovar ROI ou justificar o investimento — 230 empresas (29,5%).
  Exemplos: Compatibilização entre desempenho técnico e orçamento.; Comprovação de ROI em projetos de transformação digital.; Capex e aprovação técnica/comercial do investimento..
- Parar no ramp-up, manutenção ou operação diária — 147 empresas (18,9%).
  Exemplos: Lead time de compra, importação, instalação e ramp-up.; Treinamento operacional e manutenção de alta complexidade.; Integração entre equipamento, layout e operação real..
- Perder qualidade, segurança ou conformidade — 79 empresas (10,1%).
  Exemplos: Integração entre desempenho, segurança e custo total.; Manutenção e inspeção contínuas para evitar parada e risco.; Equilíbrio entre segurança, eficiência e produtividade..

### Linhas Exatas Mais Frequentes
- Integrar tecnologia nova ao processo existente. — 175 empresas (22,5%).
- Mapear corretamente o problema antes de comprar a solução. — 175 empresas (22,5%).
- Sustentar resultado no pós-venda e na rotina operacional. — 175 empresas (22,5%).
- Adoção operacional de métodos e rotinas de medição. — 121 empresas (15,5%).
- Custo de equipamento versus frequência de uso e criticidade. — 121 empresas (15,5%).
- Integração entre hardware, software e processo. — 121 empresas (15,5%).
- Integração com automação, ferramental e fluxo real de fábrica. — 115 empresas (14,8%).
- Lead time de compra, importação, instalação e ramp-up. — 115 empresas (14,8%).
- Treinamento operacional e manutenção de alta complexidade. — 115 empresas (14,8%).
- Dependência de parametrização fina e operadores experientes. — 95 empresas (12,2%).
- Disponibilidade de peças, consumíveis e suporte de campo. — 95 empresas (12,2%).
- Integração entre fonte, automação, exaustão e setup produtivo. — 95 empresas (12,2%).

## Produtos Mais Constantes
### Temas
- Materiais, componentes e insumos — 297 empresas (38,1%).
  Exemplos: Equipamentos e componentes industriais; Aços, ligas e metais; Fixadores e componentes.
- Software, CAD/CAM e digitalização — 183 empresas (23,5%).
  Exemplos: Software de qualidade; Software CAD/CAM; ERP industrial.
- Metrologia, medição e inspeção — 125 empresas (16,0%).
  Exemplos: Equipamentos de medição; Sistemas de inspeção; Software de qualidade.
- Automação, robótica e controle — 121 empresas (15,5%).
  Exemplos: Soluções de automação e integração; Robôs industriais e colaborativos; Sistemas de automação.
- Corte, laser e soldagem — 118 empresas (15,1%).
  Exemplos: Máquinas de corte a laser; Equipamentos de soldagem; Consumíveis e tochas.
- Máquinas-ferramenta e usinagem — 118 empresas (15,1%).
  Exemplos: Centros de usinagem; Tornos CNC; Prensas e dobradeiras.
- Hidráulica, pneumática e fluidos — 62 empresas (8,0%).
  Exemplos: Válvulas e atuadores; Bombas e compressores; Conexões e engates.
- Movimentação de carga e logística interna — 29 empresas (3,7%).
  Exemplos: Pontes, talhas e equipamentos de içamento; Sistemas de armazenagem e movimentação; Componentes de segurança e sinalização.

### Linhas Exatas Mais Frequentes
- Equipamentos e componentes industriais — 174 empresas (22,3%).
- Itens de manutenção e melhoria contínua — 174 empresas (22,3%).
- Soluções de processo — 174 empresas (22,3%).
- Tecnologias de apoio à produção — 174 empresas (22,3%).
- Equipamentos de medição — 116 empresas (14,9%).
- Sistemas de inspeção — 116 empresas (14,9%).
- Software de qualidade — 116 empresas (14,9%).
- Soluções de calibração e controle — 116 empresas (14,9%).
- Centros de usinagem — 111 empresas (14,2%).
- Tornos CNC — 110 empresas (14,1%).
- Máquinas especiais e células turnkey — 108 empresas (13,9%).
- Prensas e dobradeiras — 108 empresas (13,9%).

## Serviços Mais Constantes
### Temas
- Consultoria e processo — 702 empresas (90,1%).
  Exemplos: Aplicação e especificação; Aplicação técnica; Consultoria de qualidade.
- Suporte técnico — 379 empresas (48,7%).
  Exemplos: Suporte técnico; Suporte técnico e pós-venda.
- Treinamento — 338 empresas (43,4%).
  Exemplos: Treinamento; Treinamento e adequação de segurança.
- Pós-venda e atendimento consultivo — 245 empresas (31,5%).
  Exemplos: Pós-venda; Atendimento consultivo; Suporte técnico e pós-venda.
- Engenharia e projeto — 236 empresas (30,3%).
  Exemplos: Aplicação e engenharia de processo; Engenharia de aplicação; Projeto e especificação.
- Assistência técnica — 223 empresas (28,6%).
  Exemplos: Assistência técnica.
- Instalação, start-up e comissionamento — 195 empresas (25,0%).
  Exemplos: Instalação e start-up; Comissionamento; Instalação.
- Implantação, implementação e integração — 162 empresas (20,8%).
  Exemplos: Implantação; Integração de células; Montagem e integração.

### Linhas Exatas Mais Frequentes
- Suporte técnico — 336 empresas (43,1%).
- Treinamento — 320 empresas (41,1%).
- Assistência técnica — 223 empresas (28,6%).
- Pós-venda — 199 empresas (25,5%).
- Aplicação e especificação — 174 empresas (22,3%).
- Atendimento consultivo — 174 empresas (22,3%).
- Desenvolvimento de soluções — 134 empresas (17,2%).
- Aplicação técnica — 106 empresas (13,6%).
- Calibração e suporte — 106 empresas (13,6%).
- Consultoria de qualidade — 106 empresas (13,6%).
- Aplicação e engenharia de processo — 100 empresas (12,8%).
- Instalação e start-up — 100 empresas (12,8%).

## Sonhos Mais Constantes
### Temas
- Aumentar qualidade, padronização e reduzir erros — 702 empresas (90,1%).
  Exemplos: Ganhar previsibilidade, qualidade e velocidade operacional.; Conectar qualidade ao fluxo produtivo e aos dados da fábrica.; Produzir mais, com menos refugo e menor custo unitário..
- Ter previsibilidade, estabilidade e confiabilidade — 487 empresas (62,5%).
  Exemplos: Ganhar previsibilidade, qualidade e velocidade operacional.; Ganhar previsibilidade de prazo e estabilidade de processo.; Ter suprimento previsível com especificação técnica confiável..
- Reduzir custo, desperdício e custo unitário — 338 empresas (43,4%).
  Exemplos: Produzir mais, com menos refugo e menor custo unitário.; Cortar e soldar mais rápido, com menos desperdício e mais qualidade.; Reduzir custo operacional com processo padronizado e previsível..
- Ter suporte forte, resposta rápida e fornecedor aderente — 303 empresas (38,9%).
  Exemplos: Ter fornecedor que entenda a aplicação e responda rápido.; Encontrar fornecedores que respondam rápido e conheçam a aplicação.; Ter componentes certos, com entrega rápida e suporte técnico forte..
- Automatizar e modernizar a operação — 260 empresas (33,4%).
  Exemplos: Modernizar o parque fabril sem interromper a operação.; Automatizar processos mantendo robustez e segurança.; Escalar automação com payback claro e baixo risco..
- Ganhar produtividade, escala e capacidade — 249 empresas (32,0%).
  Exemplos: Produzir mais, com menos refugo e menor custo unitário.; Escalar produtividade com padronização, rastreabilidade e menos erro.; Escalar automação com payback claro e baixo risco..
- Digitalizar, integrar e decidir melhor com dados — 236 empresas (30,3%).
  Exemplos: Conectar qualidade ao fluxo produtivo e aos dados da fábrica.; Digitalizar o fluxo industrial sem perder velocidade operacional.; Tomar decisões com dados confiáveis e em tempo quase real..

### Linhas Exatas Mais Frequentes
- Ganhar previsibilidade, qualidade e velocidade operacional. — 175 empresas (22,5%).
- Ter fornecedor que entenda a aplicação e responda rápido. — 175 empresas (22,5%).
- Transformar melhoria técnica em resultado econômico palpável. — 175 empresas (22,5%).
- Conectar qualidade ao fluxo produtivo e aos dados da fábrica. — 121 empresas (15,5%).
- Ganhar velocidade na inspeção mantendo precisão. — 121 empresas (15,5%).
- Tomar decisão com confiança e reduzir variabilidade do processo. — 121 empresas (15,5%).
- Ganhar previsibilidade de prazo e estabilidade de processo. — 115 empresas (14,8%).
- Modernizar o parque fabril sem interromper a operação. — 115 empresas (14,8%).
- Produzir mais, com menos refugo e menor custo unitário. — 115 empresas (14,8%).
- Automatizar processos mantendo robustez e segurança. — 95 empresas (12,2%).
- Cortar e soldar mais rápido, com menos desperdício e mais qualidade. — 95 empresas (12,2%).
- Reduzir custo operacional com processo padronizado e previsível. — 95 empresas (12,2%).

## Desejos Mais Constantes
### Temas
- Pacotes por segmento, processo e aplicacao — 679 empresas (87,2%).
  Exemplos: Mais prova prática de ganho por aplicação.; Pacotes consultivos mais claros antes e depois da venda.; Mais pacotes por aplicação e criticidade de processo..
- Mais suporte consultivo, diagnostico e engenharia aplicada — 653 empresas (83,8%).
  Exemplos: Mais prova prática de ganho por aplicação.; Pacotes consultivos mais claros antes e depois da venda.; Mais pacotes por aplicação e criticidade de processo..
- Mais prova de ROI, casos de uso e metricas objetivas — 409 empresas (52,5%).
  Exemplos: Mais prova prática de ganho por aplicação.; Mais prova de ganho em custo por peça e consumo.; Casos de uso por segmento com métricas objetivas de ganho..
- Mais integracao, dados, monitoramento e governanca — 348 empresas (44,7%).
  Exemplos: Integração mais simples com sistemas digitais e relatórios.; Oferta mais profunda de monitoramento, serviço e performance pós-venda.; Ofertas mais fortes de onboarding e governança de dados..
- Ofertas mais rapidas, modulares e faceis de implantar — 230 empresas (29,5%).
  Exemplos: Modelos de retrofit, financiamento e expansão faseada.; Pacotes de implantação mais enxutos e rápidos.; Ofertas modulares de entrada, retrofit e expansão..
- Retrofit, financiamento e expansao com menor risco — 197 empresas (25,3%).
  Exemplos: Modelos de retrofit, financiamento e expansão faseada.; Ofertas modulares de entrada, retrofit e expansão.; Modelos mais claros de retrofit e modernização de ativos..
- Mais clareza comercial sobre prazo, estoque e custo total — 115 empresas (14,8%).
  Exemplos: Visibilidade melhor sobre prazo, estoque e substituição equivalente.; Maior clareza comercial sobre custo total de propriedade..

### Linhas Exatas Mais Frequentes
- Conteúdo mais objetivo para encurtar decisão técnica e comercial. — 175 empresas (22,5%).
- Mais prova prática de ganho por aplicação. — 175 empresas (22,5%).
- Pacotes consultivos mais claros antes e depois da venda. — 175 empresas (22,5%).
- Integração mais simples com sistemas digitais e relatórios. — 121 empresas (15,5%).
- Mais pacotes por aplicação e criticidade de processo. — 121 empresas (15,5%).
- Narrativa comercial mais forte em custo evitado e redução de refugo. — 121 empresas (15,5%).
- Modelos de retrofit, financiamento e expansão faseada. — 115 empresas (14,8%).
- Oferta mais profunda de monitoramento, serviço e performance pós-venda. — 115 empresas (14,8%).
- Pacotes mais fortes de produtividade aplicada por processo. — 115 empresas (14,8%).
- Mais prova de ganho em custo por peça e consumo. — 95 empresas (12,2%).
- Ofertas combinando equipamento, processo e pós-venda contínuo. — 95 empresas (12,2%).
- Pacotes de aplicação por espessura, material e volume. — 95 empresas (12,2%).

## Leitura Final
- O mercado está muito mais orientado a produtividade, previsibilidade e redução de custo total do que a compra pura de equipamento isolado.
- Suporte técnico, implantação, treinamento e engenharia aplicada aparecem como parte central da proposta de valor, não como acessório.
- O medo dominante não é apenas preço: é parar a operação, errar a integração, não comprovar ROI e ficar sem suporte ou reposição.
- Os desejos mais fortes apontam para ofertas comerciais mais consultivas, mais modulares, com prova de ganho e aderência clara por segmento e processo.
