import { StaggerGroup, StaggerItem } from "./StaggerGroup";

/**
 * Alphabet specimen grid — the catalog structure of the Libras manual
 * alphabet, grouped like the real learning path in the PWA
 * (`src/data/learning-paths.ts`).
 *
 * Each cell is a uniform specimen frame (MASTER.md §5): the letter as
 * the catalog label and an honest empty media slot — demonstrations of
 * each letter are still pending pedagogical validation, so no sign
 * illustration is drawn here.
 */

const SPECIMEN_GROUPS = [
  { label: "Letras A–E", letters: ["A", "B", "C", "D", "E"] },
  { label: "Letras F–J", letters: ["F", "G", "H", "I", "J"] },
  { label: "Letras K–O", letters: ["K", "L", "M", "N", "O"] },
  { label: "Letras P–T", letters: ["P", "Q", "R", "S", "T"] },
  { label: "Letras U–Z", letters: ["U", "V", "W", "X", "Y", "Z"] },
] as const;

export function SpecimenGrid() {
  return (
    <div className="specimen-grid">
      {SPECIMEN_GROUPS.map((group) => (
        <div className="specimen-group" key={group.label}>
          <span className="specimen-group-label">{group.label}</span>

          <StaggerGroup className="specimen-row" as="ol" staggerDelay={0.04}>
            {group.letters.map((letter) => (
              <StaggerItem
                className="specimen"
                key={letter}
                as="li"
                duration={0.4}
              >
                <span className="specimen-frame" aria-hidden="true">
                  <span className="specimen-letter">{letter}</span>
                </span>
                <span className="specimen-label">{letter}</span>
                <span className="specimen-status">em breve</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      ))}
    </div>
  );
}
