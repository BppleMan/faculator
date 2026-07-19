import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { CalculationStatus } from "../../core/faculator-api/models/calculation-status";
import { BalanceDto, CalculationResultDto, LocalizedTextDto, MaterialDto, ProductionLineDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { ResultTab } from "../../core/faculator-api/models/result-tab";
import { ResultDrawer } from "./result-drawer";

describe("ResultDrawer", () => {
    it("reports selected tabs and exposes the drawer expansion state", async () => {
        const fixture = TestBed.createComponent(ResultDrawer);
        fixture.componentRef.setInput("line", new ProductionLineDto("line", new LocalizedTextDto("生产线", "Line"), [], [], new Map(), new Map(), [], false));
        fixture.componentRef.setInput("result", new CalculationResultDto("line", CalculationStatus.Feasible, "bom-expansion", [], [], [], [], []));
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("tab", ResultTab.Delivery);
        fixture.componentRef.setInput("collapsed", true);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const tabChanged = vi.fn();
        const collapsedChanged = vi.fn();
        fixture.componentInstance.tabChanged.subscribe(tabChanged);
        fixture.componentInstance.collapsedChanged.subscribe(collapsedChanged);
        await fixture.whenStable();

        const element = fixture.nativeElement as HTMLElement;
        const tabs = [...element.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
        expect(tabs[0].getAttribute("aria-selected")).toBe("true");
        expect(tabs[0].tabIndex).toBe(0);
        expect(tabs[1].tabIndex).toBe(-1);
        tabs[3].click();
        tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
        element.querySelector<HTMLButtonElement>(".collapse")?.click();
        await fixture.whenStable();
        expect(tabChanged).toHaveBeenCalledWith(ResultTab.Debug);
        expect(tabChanged).toHaveBeenCalledTimes(2);
        expect(collapsedChanged).toHaveBeenCalledWith(false);
        expect(element.querySelector(".collapse")?.getAttribute("aria-expanded")).toBe("false");

        fixture.componentRef.setInput("collapsed", false);
        await fixture.whenStable();
        expect(element.classList.contains("is-expanded")).toBe(true);
        expect(element.querySelector(".drawer-body")).not.toBeNull();
        expect(element.querySelector(".collapse")?.getAttribute("aria-expanded")).toBe("true");
    });

    it("exposes surplus output declaration as a stateful button", async () => {
        const fixture = TestBed.createComponent(ResultDrawer);
        const material = new MaterialDto("item", "petroleum-gas", 20);
        const line = new ProductionLineDto("line", new LocalizedTextDto("生产线", "Line"), [], [], new Map(), new Map(), [], false);
        const result = new CalculationResultDto("line", CalculationStatus.Feasible, "bom-expansion", [], [], [new BalanceDto(material, 0, 20, 0, 20, true)], [], []);
        fixture.componentRef.setInput("line", line);
        fixture.componentRef.setInput("result", result);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("tab", ResultTab.Boundaries);
        fixture.componentRef.setInput("collapsed", false);
        fixture.componentRef.setInput("selectedProcessId", "");
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const toggled = vi.fn();
        fixture.componentInstance.exportToggled.subscribe(toggled);
        await fixture.whenStable();

        const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(".export-toggle")!;
        expect(button.textContent?.trim()).toBe("声明外供");
        expect(button.getAttribute("aria-pressed")).toBe("false");
        button.click();
        expect(toggled).toHaveBeenCalledWith("petroleum-gas");

        fixture.componentRef.setInput("line", new ProductionLineDto("line", line.title, [], [], new Map(), new Map(), ["petroleum-gas"], false));
        await fixture.whenStable();
        expect(button.textContent?.trim()).toBe("已声明");
        expect(button.getAttribute("aria-pressed")).toBe("true");
    });
});
