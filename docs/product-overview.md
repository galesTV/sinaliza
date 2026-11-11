# Sinaliza — Visão do Produto

## 1. Visão geral

O **Sinaliza** é uma plataforma digital de aprendizagem de Língua Brasileira de Sinais (Libras), criada para tornar o aprendizado mais acessível, interativo e prático.

A proposta combina conteúdos educacionais estruturados, atividades de aprendizagem e experimentação com visão computacional para apoiar o desenvolvimento gradual do conhecimento em Libras.

O projeto busca aproximar educação, tecnologia e inclusão, utilizando recursos digitais para incentivar o contato com a língua e a prática do que foi aprendido.

A tecnologia é uma ferramenta de apoio: ela não substitui a interação humana, o contato com pessoas surdas ou a vivência cultural da comunidade surda.

## 2. Problema

O acesso ao aprendizado de Libras pode ser limitado por fatores como disponibilidade de materiais didáticos, oportunidades de prática e acesso a experiências de aprendizagem estruturadas.

Além de conhecer sinais e configurações das mãos, aprender uma língua exige contexto, continuidade, compreensão e contato com sua dimensão cultural.

O Sinaliza busca contribuir para esse cenário por meio de uma experiência digital que organize o aprendizado em etapas e incentive a prática contínua.

## 3. Objetivo

Desenvolver uma plataforma de aprendizagem de Libras que permita ao estudante:

- Conhecer sinais e conceitos fundamentais da língua.
- Aprender por meio de conteúdos visuais e organizados.
- Praticar o conhecimento adquirido com atividades interativas.
- Acompanhar sua evolução ao longo do aprendizado.
- Experimentar recursos tecnológicos que possam oferecer feedback durante a prática.

## 4. Público-alvo

O público inicial é composto por pessoas interessadas em começar a aprender Libras, especialmente iniciantes que procuram uma experiência digital acessível e organizada.

A plataforma pretende atender estudantes sem conhecimento prévio ou com conhecimento básico da língua.

## 5. Proposta de valor

O Sinaliza pretende integrar três dimensões:

### Aprender

Apresentar conteúdos visuais e progressivos, organizados para facilitar o primeiro contato com Libras.

### Praticar

Oferecer exercícios e atividades contextualizadas para reforçar o conhecimento adquirido.

### Evoluir

Incentivar a continuidade do aprendizado por meio do acompanhamento de progresso e de elementos de gamificação.

A visão computacional poderá complementar essas experiências, oferecendo recursos experimentais de análise de características das mãos durante atividades práticas.

## 6. Escopo inicial

O escopo inicial está concentrado em dois conjuntos de conteúdo:

- **Alfabeto manual:** aprendizagem das letras representadas pelo alfabeto manual de Libras.
- **Vocabulário básico:** introdução a sinais de uso cotidiano, organizados por temas e contextos.

A experiência deverá priorizar a compreensão e a prática gradual, evitando apresentar o aprendizado de uma língua como simples memorização de gestos.

## 7. Funcionalidades

### 7.1. Experiências previstas

| Funcionalidade | Descrição | Situação |
|---|---|---|
| Conteúdos educacionais | Lições visuais e organizadas em etapas | Planejada |
| Alfabeto manual | Aprendizagem das letras | Planejada |
| Vocabulário básico | Aprendizagem de sinais por temas | Planejada |
| Exercícios interativos | Atividades para reforçar o conteúdo | Planejada |
| Prática com câmera | Experiências de prática com apoio da câmera | Em investigação |
| Feedback visual | Análise experimental de características das mãos | Em investigação |
| Acompanhamento de progresso | Registro da evolução do estudante | Planejada |
| Gamificação | Recursos para incentivar a continuidade | Planejada |

### 7.2. O que já foi desenvolvido

- Identidade visual inicial do Sinaliza.
- Landing page responsiva de apresentação do projeto.
- Demonstração em vídeo de uma prova de conceito independente de visão computacional.
- Experimento em Python com MediaPipe e OpenCV para detecção de mãos, extração de landmarks e cálculo de características geométricas selecionadas.

A landing page está publicada em:

https://sinaliza-eta.vercel.app/

### 7.3. O que ainda não está implementado

A plataforma de aprendizagem ainda está em desenvolvimento.

A prova de conceito de visão computacional é um experimento independente e não está integrada à landing page ou a uma plataforma de aprendizagem.

O experimento atual não realiza reconhecimento completo de sinais, tradução automática de Libras ou avaliação de fluência.

## 8. Visão computacional

A visão computacional é uma das possibilidades tecnológicas de diferenciação do Sinaliza.

A proposta é investigar como características visuais das mãos podem apoiar atividades práticas de aprendizagem, por exemplo, oferecendo indicações sobre aspectos específicos de uma configuração manual.

A experimentação começou com uma prova de conceito em Python, utilizando:

- MediaPipe Hand Landmarker.
- OpenCV.
- Landmarks das mãos.
- Medidas geométricas e proporções normalizadas.

A evolução desse experimento deverá considerar a complexidade dos sinais, a variação natural entre pessoas, o posicionamento das mãos e outros fatores relevantes para uma análise confiável.

Qualquer funcionalidade de feedback deverá ser validada antes de ser apresentada como recurso educacional confiável.

## 9. Princípios do produto

O desenvolvimento do Sinaliza deverá respeitar os seguintes princípios:

### Acessibilidade

A experiência deve considerar diferentes necessidades de aprendizagem e priorizar uma interface clara, compreensível e acessível.

### Respeito linguístico e cultural

Libras é uma língua, não apenas um conjunto de gestos. O conteúdo deverá respeitar sua estrutura linguística e sua dimensão cultural.

### Tecnologia como apoio

Recursos tecnológicos devem complementar a aprendizagem, sem substituir professores, pessoas surdas ou experiências reais de comunicação.

### Transparência

O projeto deve comunicar claramente o que está implementado, o que está em desenvolvimento e o que ainda é experimental.

### Aprendizagem progressiva

Os conteúdos e atividades devem acompanhar a evolução do estudante, evitando exigir conhecimentos que ainda não foram apresentados.

## 10. Roadmap do produto

O desenvolvimento está organizado em etapas evolutivas:

1. **Apresentação do projeto:** definição da proposta, identidade visual e publicação da landing page.
2. **Estrutura de aprendizagem:** definição da organização dos conteúdos e da experiência do estudante.
3. **Conteúdo inicial:** desenvolvimento das lições do alfabeto manual e do vocabulário básico.
4. **Prática:** implementação de exercícios e atividades interativas.
5. **Experimentação tecnológica:** evolução da PoC de visão computacional e investigação de possíveis integrações.
6. **Progressão:** implementação de acompanhamento de progresso e recursos de gamificação.

As etapas poderão ser ajustadas conforme validações técnicas, educacionais e de experiência do usuário.

## 11. Indicadores de sucesso

A evolução do produto poderá ser acompanhada por indicadores como:

- Conclusão de lições e atividades.
- Retenção e continuidade dos estudantes.
- Evolução do desempenho nos exercícios.
- Facilidade de navegação e compreensão dos conteúdos.
- Qualidade e confiabilidade dos recursos experimentais de feedback.

Os indicadores deverão ser definidos e medidos quando as funcionalidades correspondentes estiverem implementadas. Não existem resultados quantitativos validados neste estágio.

## 12. Considerações finais

O Sinaliza busca utilizar tecnologia para ampliar as oportunidades de aprendizagem de Libras, combinando educação, prática e experimentação.

Seu desenvolvimento deve manter o foco na qualidade pedagógica, na acessibilidade, no respeito à comunidade surda e na transparência sobre as capacidades reais da plataforma.

**Sinaliza — tecnologia como ferramenta para aproximar pessoas e ampliar o acesso à aprendizagem de Libras.**