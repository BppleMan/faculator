import { TestBed } from "@angular/core/testing";

import { GameCatalogDto, MachineDto, MaterialDto, ModuleDto, ProcessConfigurationDto, ProcessDto, QualityDto, RecipeDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";
import { RecipeStation } from "./recipe-station";

describe("RecipeStation", () => {
    it("updates machines, beacon count and an individual module slot inline", async () => {
        const fixture = TestBed.createComponent(RecipeStation);
        const stone = new MachineDto("stone-furnace", "a", 1, ["smelting"], 0);
        const steel = new MachineDto("steel-furnace", "b", 2, ["smelting"], 0);
        const plate = new MaterialDto("item", "iron-plate", 1);
        const recipe = new RecipeDto("iron-plate", "intermediate", "raw", "a", "smelting", 1, [], [plate], plate, false, 0);
        const process = new ProcessDto("process", "choice", recipe, plate, 60, stone, [stone, steel], 0, 2, 1, 13.333, 14, 0, 0, new ProcessConfigurationDto("stone-furnace", [], 0, []));
        const catalog = new GameCatalogDto("2.0.76", "test", [], [], [recipe], [stone, steel], [new ModuleDto("speed-module-3", "a", .5, 0, 0, .7)], [new QualityDto("normal", "a", 0)], new Map());
        fixture.componentRef.setInput("process", process);
        fixture.componentRef.setInput("catalog", catalog);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const changed = vi.fn();
        fixture.componentInstance.configurationChanged.subscribe(changed);
        await fixture.whenStable();
        const root = fixture.nativeElement as HTMLElement;

        expect(root.querySelector(".module-bay")?.getAttribute("aria-label")).toBe("机器插件 · 0 槽");
        expect(root.querySelector(".beacon-slots")?.getAttribute("aria-label")).toBe("信标插件 · 2 槽");
        expect(root.querySelector(".metrics")?.textContent).toContain("13.3");

        root.querySelector<HTMLButtonElement>('[aria-label="steel-furnace"]')?.click();
        root.querySelector<HTMLButtonElement>('[aria-label="增加信标数量"]')?.click();
        root.querySelector<HTMLButtonElement>('[aria-label="插件塔槽 1 · 不装插件"]')?.click();
        await fixture.whenStable();
        expect(root.style.zIndex).toBe("40");
        root.querySelector<HTMLButtonElement>('[aria-label="speed-module-3 · 1 星品质"]')?.click();
        await fixture.whenStable();

        expect(changed).toHaveBeenCalledTimes(3);
        expect(changed.mock.calls[0][0].configuration.machineName).toBe("steel-furnace");
        expect(changed.mock.calls[1][0].configuration.beaconCount).toBe(1);
        expect(changed.mock.calls[2][0].configuration.beaconModuleSlots[0]).toEqual({ moduleName: "speed-module-3", qualityName: "normal" });
        expect(root.querySelector('[role="dialog"]')).toBeNull();
        expect(root.style.zIndex).toBe("");
    });
});
