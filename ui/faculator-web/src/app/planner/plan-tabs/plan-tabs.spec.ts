import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { LocalizedTextDto, ProductionBlockDto, ProductionLineDto, ProductionPlanDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { PlanTabs } from "./plan-tabs";

describe("PlanTabs", () => {
    it("selects, creates and closes plans while retaining the last-plan guard", async () => {
        const cleanLine = new ProductionLineDto("line-a", new LocalizedTextDto("线 A", "Line A"), [], [], new Map(), new Map(), [], false);
        const dirtyLine = new ProductionLineDto("line-b", new LocalizedTextDto("线 B", "Line B"), [], [], new Map(), new Map(), [], true);
        const cleanPlan = new ProductionPlanDto("plan-a", new LocalizedTextDto("基础规划", "Base plan"), [new ProductionBlockDto("block-a", new LocalizedTextDto("区块 A", "Block A"), [cleanLine])]);
        const dirtyPlan = new ProductionPlanDto("plan-b", new LocalizedTextDto("扩展规划", "Expansion"), [new ProductionBlockDto("block-b", new LocalizedTextDto("区块 B", "Block B"), [dirtyLine])]);
        const fixture = TestBed.createComponent(PlanTabs);
        fixture.componentRef.setInput("plans", [cleanPlan, dirtyPlan]);
        fixture.componentRef.setInput("activePlanId", cleanPlan.id);
        fixture.componentRef.setInput("locale", Locale.Chinese);
        const selected = vi.fn();
        const added = vi.fn();
        const closed = vi.fn();
        fixture.componentInstance.planSelected.subscribe(selected);
        fixture.componentInstance.planAdded.subscribe(added);
        fixture.componentInstance.planClosed.subscribe(closed);
        await fixture.whenStable();

        const root = fixture.nativeElement as HTMLElement;
        const selects = [...root.querySelectorAll<HTMLButtonElement>(".plan-select")];
        const closes = [...root.querySelectorAll<HTMLButtonElement>(".plan-close")];
        expect(selects.map((button) => button.textContent?.trim())).toEqual(["基础规划", "扩展规划"]);
        expect(root.querySelectorAll(".plan-tab.is-dirty")).toHaveLength(1);
        selects[1].click();
        closes[0].click();
        root.querySelector<HTMLButtonElement>(".plan-add")?.click();
        expect(selected).toHaveBeenCalledWith("plan-b");
        expect(closed).toHaveBeenCalledWith("plan-a");
        expect(added).toHaveBeenCalledOnce();

        fixture.componentRef.setInput("plans", [cleanPlan]);
        await fixture.whenStable();
        expect(root.querySelector<HTMLButtonElement>(".plan-close")?.disabled).toBe(true);
    });
});
