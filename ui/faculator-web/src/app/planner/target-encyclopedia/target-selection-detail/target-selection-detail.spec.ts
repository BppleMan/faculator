import { TestBed } from "@angular/core/testing";

import { CatalogMaterialDto, MaterialDto, RecipeDto, TargetCatalogEntryDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";
import { TargetSelectionDetail } from "./target-selection-detail";

describe("TargetSelectionDetail", () => {
    it("renders the explicit empty state when no target is selected", async () => {
        const fixture = TestBed.createComponent(TargetSelectionDetail);
        fixture.componentRef.setInput("entry", null);
        fixture.componentRef.setInput("recipes", []);
        fixture.componentRef.setInput("selectedRecipe", null);
        fixture.componentRef.setInput("minimum", 60);
        fixture.componentRef.setInput("createLine", false);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);

        await fixture.whenStable();

        expect((fixture.nativeElement as HTMLElement).textContent).toContain("从左侧百科选择一个目标");
    });

    it("keeps the default recipe informational and exposes only the confirmation action", async () => {
        const material = new CatalogMaterialDto("item", "utility-science-pack", "intermediate-products", "science-pack", "f", false, 200);
        const entry = new TargetCatalogEntryDto(material, 1);
        const recipe = new RecipeDto("utility-science-pack", "intermediate-products", "science-pack", "f", "crafting", 21, [], [new MaterialDto("item", "utility-science-pack", 3)], material, false, 0);
        const fixture = TestBed.createComponent(TargetSelectionDetail);
        fixture.componentRef.setInput("entry", entry);
        fixture.componentRef.setInput("recipes", [recipe]);
        fixture.componentRef.setInput("selectedRecipe", recipe);
        fixture.componentRef.setInput("minimum", 60);
        fixture.componentRef.setInput("createLine", false);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);

        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        expect(root.querySelector(".default-recipe")).not.toBeNull();
        expect(root.querySelectorAll("button")).toHaveLength(1);
        expect(root.querySelector("button")?.textContent).toContain("设为当前 Line 目标");
    });
});
