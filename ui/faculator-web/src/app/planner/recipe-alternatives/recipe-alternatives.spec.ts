import { TestBed } from "@angular/core/testing";

import { MachineDto, MaterialDto, ProcessConfigurationDto, ProcessDto, RecipeDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { RecipeAlternatives } from "./recipe-alternatives";

describe("RecipeAlternatives", () => {
    it("renders the fulfilled material, locked demand, recipe inputs, and one action per candidate", async () => {
        const target = new MaterialDto("item", "utility-science-pack", 60);
        const ingredient = new MaterialDto("item", "processing-unit", 2);
        const current = new RecipeDto("utility-science-pack", "intermediate-products", "science-pack", "a", "crafting", 21, [ingredient], [new MaterialDto("item", target.name, 3)], target, false, 0);
        const alternative = new RecipeDto("utility-science-pack-alt", "intermediate-products", "science-pack", "b", "crafting", 18, [new MaterialDto("item", "processing-unit", 1)], [new MaterialDto("item", target.name, 2)], target, false, 0);
        const machine = new MachineDto("assembling-machine-3", "a", 1.25, ["crafting"], 4);
        const process = new ProcessDto("process", "choice", current, target, 20, machine, [machine], 4, 2, 4, 4, 1.25, 0, 0, new ProcessConfigurationDto());
        const fixture = TestBed.createComponent(RecipeAlternatives);
        fixture.componentRef.setInput("process", process);
        fixture.componentRef.setInput("recipes", [current, alternative]);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);

        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        const candidates = root.querySelectorAll<HTMLButtonElement>(".recipe-alternative-list > button");
        expect(root.textContent).toContain("更换配方 · utility-science-pack");
        expect(root.textContent).toContain("60 / min");
        expect(root.textContent).toContain("2 / cycle");
        expect(root.querySelectorAll(".alternative-recipe-io app-game-icon")).toHaveLength(2);
        expect(candidates).toHaveLength(2);
        expect(candidates[0]?.disabled).toBe(true);
        expect(candidates[1]?.disabled).toBe(false);
    });

    it("emits the selected alternative and closes from the explicit cancel button", async () => {
        const target = new MaterialDto("item", "utility-science-pack", 60);
        const current = new RecipeDto("current", "g", "s", "a", "crafting", 1, [], [target], target, false, 0);
        const alternative = new RecipeDto("alternative", "g", "s", "b", "crafting", 1, [], [target], target, false, 0);
        const process = new ProcessDto("process", "choice", current, target, 60, null, [], 0, 0, 0, 0, 0, 0, 0, new ProcessConfigurationDto());
        const fixture = TestBed.createComponent(RecipeAlternatives);
        fixture.componentRef.setInput("process", process);
        fixture.componentRef.setInput("recipes", [current, alternative]);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        const closed = vi.fn();
        fixture.componentInstance.selected.subscribe(selected);
        fixture.componentInstance.closed.subscribe(closed);

        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;
        root.querySelectorAll<HTMLButtonElement>(".recipe-alternative-list > button")[1]?.click();
        root.querySelector<HTMLButtonElement>(".modal-heading button")?.click();

        expect(selected).toHaveBeenCalledWith("alternative");
        expect(closed).toHaveBeenCalledOnce();
    });
});
