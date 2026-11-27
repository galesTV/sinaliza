import { HonestNote } from "@/components/honest-note";

export function CulturalEmptyState({
  categoryLabel,
}: {
  categoryLabel: string;
}) {
  return (
    <HonestNote title="Novos conteúdos em preparação">
      A seção de {categoryLabel} ainda está sendo preparada. Quando novos
      conteúdos estiverem prontos, você poderá descobri-los aqui.
    </HonestNote>
  );
}
