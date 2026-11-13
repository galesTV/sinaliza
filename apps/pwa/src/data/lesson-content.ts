/**
 * Typed lesson content model.
 *
 * Lessons in `learning-paths.ts` describe structure and objectives only.
 * This module defines the blocks a lesson page can render once material is
 * validated — explanatory text and multiple-choice exercises — plus the seam
 * where a future backend integration plugs in.
 *
 * `demoLesson` is NOT Libras educational material: it is neutral content about
 * the lesson mechanics themselves, used by `/laboratorio/licao` to exercise the
 * interface end to end while real content awaits pedagogical/linguistic
 * validation.
 */

export interface LessonTextBlock {
  kind: "text";
  heading: string;
  body: string;
}

export interface LessonExerciseOption {
  label: string;
  /** Short explanation shown when this option is selected. */
  feedback: string;
}

export interface LessonExercise {
  prompt: string;
  options: LessonExerciseOption[];
  correctIndex: number;
  /** Shown after the correct answer is selected. */
  explanation: string;
}

export interface LessonExerciseBlock {
  kind: "exercise";
  exercise: LessonExercise;
}

export type LessonBlock = LessonTextBlock | LessonExerciseBlock;

export interface LessonContent {
  intro: string;
  blocks: LessonBlock[];
}

export const demoLesson: LessonContent = {
  intro:
    "Esta demonstração mostra como uma lição do Sinaliza funciona: passos de explicação, exercícios de múltipla escolha com retorno imediato e um estado de conclusão. O conteúdo fala sobre a própria interface — não é material educacional de Libras.",
  blocks: [
    {
      kind: "text",
      heading: "Como uma lição é organizada",
      body: "Uma lição mistura blocos de explicação, como este, com exercícios interativos. Você avança no seu ritmo: blocos de texto têm um botão para continuar, e exercícios só liberam o avanço depois de uma resposta correta.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt:
          "Nesta interface, quando você pode avançar depois de responder um exercício?",
        options: [
          {
            label: "Imediatamente, antes de escolher qualquer opção",
            feedback:
              "Não é isso: o avanço só aparece depois de você responder — a lição precisa saber como você foi.",
          },
          {
            label: "Somente depois de acertar a resposta",
            feedback:
              "Exato: uma resposta incorreta mostra o porquê e permite tentar de novo; o avanço só é liberado após o acerto.",
          },
          {
            label: "Depois de responder errado três vezes",
            feedback:
              "Não há limite de tentativas: você pode repetir o exercício até acertar.",
          },
        ],
        correctIndex: 1,
        explanation:
          "Respostas erradas são parte do aprendizado: o retorno explica o erro e libera uma nova tentativa, sem penalidade.",
      },
    },
    {
      kind: "text",
      heading: "O que o retorno mostra",
      body: "Cada opção traz uma explicação curta. Ao acertar, você vê uma síntese do conceito antes de seguir — o objetivo é reforçar o entendimento, não apenas marcar certo ou errado.",
    },
    {
      kind: "exercise",
      exercise: {
        prompt:
          "O que acontece com o progresso desta demonstração quando você sai da página?",
        options: [
          {
            label: "Ela conclui uma lição de verdade na sua trilha",
            feedback:
              "Não: demonstrações do laboratório ficam separadas e nunca contam como lições concluídas.",
          },
          {
            label: "É enviado para um servidor do Sinaliza",
            feedback:
              "Não: nada sai do seu navegador, e a demonstração nem sequer é salva localmente.",
          },
          {
            label: "Nada é registrado — a demo não afeta seu progresso real",
            feedback:
              "Correto: o laboratório é isolado. O progresso de lições reais usa uma área própria e nunca mistura atividade de demonstração.",
          },
        ],
        correctIndex: 2,
        explanation:
          "O progresso real é guardado apenas para lições validadas das trilhas; atividade do laboratório não entra nas suas estatísticas.",
      },
    },
  ],
};
