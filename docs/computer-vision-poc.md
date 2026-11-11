# Sinaliza — Prova de Conceito de Visão Computacional

## 1. Visão geral

Este documento descreve a prova de conceito (PoC) de visão computacional desenvolvida como parte do projeto Sinaliza.

O experimento investiga o uso de visão computacional para detectar mãos, extrair pontos de referência e analisar características geométricas que possam futuramente apoiar atividades práticas de aprendizagem de Língua Brasileira de Sinais (Libras).

A PoC é um experimento independente da aplicação web do Sinaliza. Seu objetivo é validar conceitos técnicos e explorar possibilidades de análise visual, não oferecer um sistema completo de reconhecimento de sinais.

## 2. Objetivos

Os principais objetivos do experimento são:

- Capturar imagens em tempo real utilizando uma webcam.
- Detectar mãos presentes nos quadros capturados.
- Extrair landmarks que representam pontos de referência da mão.
- Calcular características geométricas a partir desses pontos.
- Investigar medidas relativas e proporções normalizadas.
- Explorar possibilidades de análise de configurações manuais.

A PoC também serve como ambiente de aprendizado e experimentação com conceitos fundamentais de visão computacional.

## 3. Tecnologias utilizadas

| Tecnologia | Responsabilidade |
|---|---|
| Python 3.13.7 | Linguagem de programação do experimento. |
| MediaPipe Hand Landmarker | Detecção das mãos e extração de landmarks. |
| OpenCV | Captura e processamento de imagens da webcam. |

O modelo utilizado pelo MediaPipe é disponibilizado por meio do arquivo `hand_landmarker.task`.

## 4. Ambiente de desenvolvimento

O experimento é mantido em um projeto Python independente:

`sinaliza-poc`

O ambiente utiliza um ambiente virtual Python para isolar as dependências do projeto.

A implementação inicial está concentrada no arquivo:

`detector_maos.py`

O modelo de detecção é carregado a partir do arquivo:

`hand_landmarker.task`

Essa organização permite experimentar e modificar a lógica de visão computacional sem introduzir dependências diretamente na aplicação web.

## 5. Fluxo de processamento

O processamento experimental segue estas etapas:

1. **Captura:** a webcam fornece quadros de vídeo.
2. **Pré-processamento:** o OpenCV disponibiliza os quadros para processamento.
3. **Detecção:** o MediaPipe identifica as mãos presentes na imagem.
4. **Extração:** são obtidos os landmarks correspondentes aos pontos de referência das mãos.
5. **Análise geométrica:** características selecionadas são calculadas a partir das coordenadas dos landmarks.
6. **Experimentação:** as características são utilizadas para investigar diferenças entre configurações manuais.

### 5.1. Representação por landmarks

O MediaPipe Hand Landmarker fornece uma representação da mão por meio de 21 landmarks.

Esses pontos representam regiões importantes, incluindo:

- Pulso.
- Articulações dos dedos.
- Pontas dos dedos.

Cada landmark possui coordenadas que permitem analisar a posição relativa dos pontos da mão.

A representação facilita a construção de medidas geométricas sem depender exclusivamente da análise direta dos pixels da imagem.

## 6. Extração de características geométricas

Uma das etapas centrais do experimento é transformar as coordenadas dos landmarks em características que possam ser comparadas.

Em vez de analisar somente as coordenadas individuais, a PoC investiga relações geométricas entre pontos selecionados.

Entre as características experimentadas estão:

- Ângulos entre segmentos da mão.
- Distâncias entre landmarks específicos.
- Proporções entre regiões da mão.
- Relações geométricas envolvendo dedos e palma.

### 6.1. Ângulos

Os ângulos permitem investigar a orientação e a flexão de determinadas articulações.

Uma medida angular pode ser obtida utilizando três pontos:

- Um ponto anterior.
- O ponto da articulação.
- Um ponto posterior.

A relação entre esses pontos permite calcular o ângulo formado pelos segmentos.

As medidas angulares podem ajudar a diferenciar configurações que apresentam posições semelhantes, mas articulações com orientações distintas.

### 6.2. Distâncias

As distâncias entre landmarks permitem analisar a separação entre regiões específicas da mão.

Entre as relações investigadas estão:

- Distância entre regiões próximas ao polegar e ao indicador.
- Distância entre a base e outras regiões dos dedos.
- Largura relativa da palma.

Essas medidas fornecem informações geométricas complementares aos ângulos.

### 6.3. Proporções normalizadas

Uma das investigações importantes da PoC é a utilização de proporções em vez de distâncias absolutas.

Medidas absolutas podem variar conforme a distância entre a mão e a câmera, o tamanho da mão e a escala da imagem.

Ao relacionar medidas geométricas entre si, é possível reduzir parte dessa dependência de escala.

Por exemplo, uma distância específica pode ser dividida por uma medida de referência da própria mão.

De forma simplificada:

```text
proporcao = distancia_referencia / medida_de_referencia
```

A escolha da medida de referência depende da característica que está sendo analisada.

Essa abordagem busca tornar as características mais consistentes diante de variações de escala, embora não elimine todos os efeitos de perspectiva, posicionamento ou orientação da mão.

## 7. Organização das características

As características extraídas podem ser agrupadas em uma representação estruturada.

Um exemplo conceitual:

```python
features = {
    "angulo_polegar_base": 0.0,
    "angulo_indicador_base": 0.0,
    "distancia_polegar_indicador": 0.0,
    "largura_palma": 0.0,
    "proporcao_referencia": 0.0,
}
```

Os nomes e valores acima são ilustrativos. As características efetivamente utilizadas dependem da implementação e dos experimentos realizados.

Uma representação estruturada facilita comparar configurações manuais, registrar resultados e evoluir a lógica de análise.

## 8. Experimentos realizados

Durante o desenvolvimento da PoC, foram explorados:

- Inicialização do modelo Hand Landmarker.
- Captura de vídeo utilizando OpenCV.
- Detecção de mãos em tempo real.
- Visualização e utilização dos landmarks.
- Extração de distâncias e ângulos.
- Cálculo de proporções entre características.
- Testes com movimentação e posicionamento das mãos.
- Investigação de medidas relativas para reduzir a dependência de distâncias absolutas.

Também foram realizadas experimentações com configurações manuais identificadas por rótulos, como a letra `I`, para investigar quais características poderiam ajudar a representar diferentes posições da mão.

Esses experimentos são exploratórios e não representam uma validação de reconhecimento de Libras.

## 9. Limitações atuais

A PoC ainda possui limitações importantes:

- Não reconhece integralmente o alfabeto manual.
- Não realiza reconhecimento completo de sinais de Libras.
- Não traduz frases ou conversas.
- Não avalia fluência ou correção linguística.
- Não contempla toda a complexidade dos movimentos e componentes visuais envolvidos na produção de sinais.
- As características geométricas selecionadas ainda precisam ser avaliadas em diferentes condições e entre diferentes pessoas.

A análise baseada em landmarks também está sujeita a variações causadas por iluminação, oclusões, posicionamento, orientação e qualidade da captura.

Uma configuração manual não deve ser considerada validada apenas porque foi detectada corretamente em um conjunto pequeno de testes.

## 10. Possibilidades de evolução

A evolução da PoC poderá seguir diferentes etapas:

### 10.1. Organização do código

- Separar captura, detecção e extração de características.
- Organizar as funções geométricas em módulos.
- Padronizar a representação das características.
- Criar testes automatizados para os cálculos.

### 10.2. Construção de uma base de dados experimental

- Registrar amostras de configurações manuais.
- Coletar exemplos em diferentes condições.
- Avaliar variações entre pessoas.
- Separar dados de treinamento e validação caso seja adotada uma abordagem de aprendizado de máquina.

A coleta deverá considerar consentimento, privacidade e finalidade de utilização das imagens.

### 10.3. Avaliação das características

- Investigar quais medidas são mais relevantes para cada configuração.
- Avaliar estabilidade e sensibilidade das características.
- Comparar medidas absolutas e normalizadas.
- Investigar o impacto da orientação e perspectiva.
- Definir critérios objetivos de avaliação.

### 10.4. Possível integração com o Sinaliza

Após validação técnica, os experimentos poderão orientar o desenvolvimento de recursos de prática com câmera.

Uma eventual integração deverá considerar:

- Comunicação entre a aplicação web e o componente de processamento.
- Latência e desempenho.
- Privacidade das imagens capturadas.
- Tratamento de falhas e resultados inconclusivos.
- Feedback compreensível e pedagogicamente adequado.

Nenhuma integração está implementada neste estágio.

## 11. Relação com o produto

A PoC está relacionada à visão de futuro do Sinaliza: utilizar tecnologia para apoiar a aprendizagem prática de Libras.

Seu papel atual é investigar possibilidades técnicas e gerar conhecimento para decisões futuras.

A evolução do experimento deverá permanecer alinhada aos objetivos educacionais do produto e respeitar a complexidade linguística e cultural de Libras.

## 12. Referências técnicas

- [MediaPipe — Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker)
- [OpenCV — Documentação oficial](https://docs.opencv.org/)
- [Python — Documentação oficial](https://docs.python.org/3/)

---

**Sinaliza — experimentação tecnológica a serviço da aprendizagem.**