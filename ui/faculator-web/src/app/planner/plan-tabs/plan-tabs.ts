import { Component, input, output } from "@angular/core";

import { ProductionPlanDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";

@Component({
    selector: "app-plan-tabs",
    templateUrl: "./plan-tabs.html",
    styleUrl: "./plan-tabs.scss"
})
export class PlanTabs {
    public readonly plans = input.required<ReadonlyArray<ProductionPlanDto>>();
    public readonly activePlanId = input.required<string>();
    public readonly locale = input.required<Locale>();
    public readonly planSelected = output<string>();
    public readonly planAdded = output<void>();
    public readonly planClosed = output<string>();

    protected name(plan: ProductionPlanDto): string {
        return plan.name.value(this.locale());
    }

    protected dirty(plan: ProductionPlanDto): boolean {
        return plan.blocks.some((block) => block.lines.some((line) => line.dirty));
    }
}
