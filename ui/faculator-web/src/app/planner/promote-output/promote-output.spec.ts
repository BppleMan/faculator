import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { MaterialDto, TargetDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { PromoteOutput } from "./promote-output";

describe("PromoteOutput", () => {
    it("shows current targets as locked and emits only an available output", async () => {
        const fixture = TestBed.createComponent(PromoteOutput);
        const currentTarget = new TargetDto("item", "utility-science-pack", 60);
        const availableOutput = new MaterialDto("item", "processing-unit");
        fixture.componentRef.setInput("outputs", [currentTarget, availableOutput]);
        fixture.componentRef.setInput("targets", [currentTarget]);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const selected = vi.fn();
        fixture.componentInstance.selected.subscribe(selected);
        await fixture.whenStable();

        const buttons = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>("section > div > button")];
        expect(buttons).toHaveLength(2);
        expect(buttons[0].disabled).toBe(true);
        expect(buttons[0].textContent).toContain("已是目标");
        expect(buttons[0].textContent).toContain("LOCKED");
        expect(buttons[1].disabled).toBe(false);
        expect(buttons[1].textContent).toContain("新建 Production Line");

        buttons[0].click();
        buttons[1].click();
        await fixture.whenStable();
        expect(selected).toHaveBeenCalledOnce();
        expect(selected).toHaveBeenCalledWith(availableOutput);
    });
});
