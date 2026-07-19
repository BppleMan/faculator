import { TestBed } from "@angular/core/testing";

import { ModuleDto, ModuleSelectionDto, QualityDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";
import { ModulePicker } from "./module-picker";

describe("ModulePicker", () => {
    it("emits the selected module and quality from the compact slot matrix", async () => {
        const fixture = TestBed.createComponent(ModulePicker);
        fixture.componentRef.setInput("owner", "machine");
        fixture.componentRef.setInput("slotIndex", 0);
        fixture.componentRef.setInput("modules", [new ModuleDto("speed-module", "a", 0.2, 0, 0, 0.5)]);
        fixture.componentRef.setInput("qualities", [new QualityDto("normal", "a", 0), new QualityDto("rare", "c", 2)]);
        fixture.componentRef.setInput("selection", null);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const chosen = vi.fn();
        fixture.componentInstance.chosen.subscribe(chosen);
        await fixture.whenStable();

        const choice = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[aria-label="speed-module · 2 星品质"]');
        expect(choice).toBeTruthy();
        choice?.click();

        expect(chosen).toHaveBeenCalledOnce();
        expect(chosen.mock.calls[0][0]).toEqual(new ModuleSelectionDto("speed-module", "rare"));
    });

    it("emits null when the slot is cleared", async () => {
        const fixture = TestBed.createComponent(ModulePicker);
        fixture.componentRef.setInput("owner", "beacon");
        fixture.componentRef.setInput("slotIndex", 1);
        fixture.componentRef.setInput("modules", []);
        fixture.componentRef.setInput("qualities", []);
        fixture.componentRef.setInput("selection", new ModuleSelectionDto("speed-module", "normal"));
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const chosen = vi.fn();
        fixture.componentInstance.chosen.subscribe(chosen);
        await fixture.whenStable();

        const clear = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>("footer button");
        clear?.click();
        expect(chosen).toHaveBeenCalledWith(null);
    });
});
