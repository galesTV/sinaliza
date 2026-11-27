import { describe, expect, it } from "vitest";

import { CULTURAL_CATEGORIES } from "./cultural-catalog-model";
import {
  CULTURAL_CATEGORY_PRESENTATIONS,
  getCulturalCategoryBySegment,
  getCulturalCategoryHref,
  getCulturalCategoryPresentation,
} from "./cultural-taxonomy";

describe("cultural taxonomy", () => {
  it("covers exactly the four public cultural categories", () => {
    expect(CULTURAL_CATEGORY_PRESENTATIONS.map((item) => item.category).sort()).toEqual(
      [...CULTURAL_CATEGORIES].sort(),
    );
  });

  it("maps Portuguese route segments in both directions", () => {
    expect(getCulturalCategoryBySegment("historia")).toBe("history");
    expect(getCulturalCategoryBySegment("curiosidades")).toBe("curiosity");
    expect(getCulturalCategoryBySegment("personalidades")).toBe("personality");
    expect(getCulturalCategoryBySegment("biblioteca")).toBe("library");
    expect(getCulturalCategoryBySegment("categoria-inexistente")).toBeUndefined();
    expect(getCulturalCategoryHref("library")).toBe("/explorar/biblioteca");
    expect(getCulturalCategoryPresentation("history").label).toBe("História");
  });
});
