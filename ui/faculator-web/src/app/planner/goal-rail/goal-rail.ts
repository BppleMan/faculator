import { Component, computed, input, output, signal } from "@angular/core";

import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { CalculationResultDto, ProductionLineDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";

@Component({
    selector: "app-goal-rail",
    imports: [GameIcon],
    templateUrl: "./goal-rail.html",
    styleUrl: "./goal-rail.scss"
})
export class GoalRail {
    public readonly line = input.required<ProductionLineDto>();
    public readonly result = input.required<CalculationResultDto>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly solving = input(false);
    public readonly targetRequested = output<void>();
    public readonly targetRateChanged = output<{ index: number; minimum: number }>();
    public readonly targetRemoved = output<number>();
    public readonly promoteRequested = output<void>();
    public readonly solveRequested = output<void>();
    private readonly localSolveFeedback = signal(false);
    protected readonly isSolving = computed(() => this.solving() || this.localSolveFeedback());

    protected updateRate(index: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        this.targetRateChanged.emit({ index, minimum: Math.max(0, Number(input.value) || 0) });
    }

    /**
     * The prototype acknowledges every solve click immediately, including a
     * re-apply of unchanged constraints. The parent gateway state can extend
     * this minimum when a future backend takes longer to respond.
     */
    protected requestSolve(): void {
        if (this.isSolving()) return;
        this.localSolveFeedback.set(true);
        this.solveRequested.emit();
        setTimeout(() => this.localSolveFeedback.set(false), 520);
    }

    /** Mirrors the prototype's compact display formatting; calculations retain full precision. */
    protected formatRate(value: number): string {
        if (!Number.isFinite(value)) return "—";
        const absolute = Math.abs(value);
        if (absolute >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        if (absolute >= 100) return value.toFixed(0);
        if (absolute >= 10) return value.toFixed(1).replace(/\.0$/, "");
        return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }
}
