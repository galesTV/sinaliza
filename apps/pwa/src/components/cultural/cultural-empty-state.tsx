import { HonestNote } from "@/components/honest-note";

export function CulturalEmptyState({
  categoryLabel,
}: {
  categoryLabel: string;
}) {
  return (
    <HonestNote title="Nada publicado ainda">
      A seção de {categoryLabel} está em preparação editorial. Novos registros
      aparecerão aqui somente depois da revisão especializada, da autorização
      final de publicação e da verificação de direitos de uso.
    </HonestNote>
  );
}
