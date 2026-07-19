import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { BalanceDto, CalculationResultDto, LocalizedTextDto, MaterialDto, ProductionLineDto, TargetDto } from "../../core/faculator-api/models/faculator-dtos";
import { CalculationStatus } from "../../core/faculator-api/models/calculation-status";
import { Locale } from "../../core/faculator-api/models/locale";
import { GoalRail } from "./goal-rail";

describe("GoalRail", () => {
    it("opens target selection from a draft line", async () => {
        const fixture = TestBed.createComponent(GoalRail);
        fixture.componentRef.setInput("line", lineWith([]));
        fixture.componentRef.setInput("result", resultWith([]));
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const requested = vi.fn();
        fixture.componentInstance.targetRequested.subscribe(requested);
        await fixture.whenStable();

        (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(".empty-state button")?.click();
        expect(requested).toHaveBeenCalledOnce();
    });

    it("emits pending target edits and all line actions", async () => {
        const targets = [new TargetDto("item", "utility-science-pack", 60), new TargetDto("item", "processing-unit", 30)];
        const fixture = TestBed.createComponent(GoalRail);
        fixture.componentRef.setInput("line", lineWith(targets));
        fixture.componentRef.setInput("result", resultWith(targets.map((target) => new BalanceDto(target, target.minimum, target.minimum, 0, 0, true))));
        fixture.componentRef.setInput("locale", Locale.Chinese);
        fixture.componentRef.setInput("nameOf", (_type: string, name: string) => name);
        const rateChanged = vi.fn();
        const removed = vi.fn();
        const promoted = vi.fn();
        const solved = vi.fn();
        fixture.componentInstance.targetRateChanged.subscribe(rateChanged);
        fixture.componentInstance.targetRemoved.subscribe(removed);
        fixture.componentInstance.promoteRequested.subscribe(promoted);
        fixture.componentInstance.solveRequested.subscribe(solved);
        await fixture.whenStable();

        try {
            vi.useFakeTimers();
            const root = fixture.nativeElement as HTMLElement;
            const rate = root.querySelector<HTMLInputElement>("input[type=number]")!;
            rate.value = "120";
            rate.dispatchEvent(new Event("input"));
            root.querySelectorAll<HTMLButtonElement>(".fac-button--danger")[1].click();
            root.querySelector<HTMLButtonElement>(".promote-button")?.click();
            const solve = root.querySelector<HTMLButtonElement>(".solve-button")!;
            solve.click();
            fixture.detectChanges();
            expect(rateChanged).toHaveBeenCalledWith({ index: 0, minimum: 120 });
            expect(removed).toHaveBeenCalledWith(1);
            expect(promoted).toHaveBeenCalledOnce();
            expect(solved).toHaveBeenCalledOnce();
            expect(solve.disabled).toBe(true);
            expect(solve.textContent).toContain("正在配平…");
            vi.advanceTimersByTime(520);
            fixture.detectChanges();
            expect(solve.disabled).toBe(false);
            expect(solve.textContent).toContain("应用约束并解算");
        } finally {
            vi.useRealTimers();
        }
    });
});

function lineWith(targets: ReadonlyArray<TargetDto>): ProductionLineDto {
    return new ProductionLineDto("line", new LocalizedTextDto("生产线", "Line"), targets, targets, new Map(), new Map(), [], false);
}

function resultWith(balances: ReadonlyArray<BalanceDto>): CalculationResultDto {
    return new CalculationResultDto("line", CalculationStatus.Feasible, "bom-expansion", [], [], balances, [], []);
}
