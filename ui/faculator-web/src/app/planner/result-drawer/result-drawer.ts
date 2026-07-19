import { Component, input, output } from "@angular/core";

import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { CalculationResultDto, ProductionLineDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { ResultTab } from "../../core/faculator-api/models/result-tab";

@Component({
    selector: "app-result-drawer",
    imports: [GameIcon],
    templateUrl: "./result-drawer.html",
    styleUrl: "./result-drawer.scss",
    host: {
        "[class.is-expanded]": "!collapsed()"
    }
})
export class ResultDrawer {
    public readonly line = input.required<ProductionLineDto>();
    public readonly result = input.required<CalculationResultDto>();
    public readonly locale = input.required<Locale>();
    public readonly tab = input.required<ResultTab>();
    public readonly collapsed = input.required<boolean>();
    public readonly selectedProcessId = input.required<string>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly tabChanged = output<ResultTab>();
    public readonly collapsedChanged = output<boolean>();
    public readonly exportToggled = output<string>();
    protected readonly ResultTab = ResultTab;
    protected moveTab(event: KeyboardEvent, current: ResultTab): void {
        const tabs = [ResultTab.Delivery, ResultTab.Machines, ResultTab.Boundaries, ResultTab.Debug];
        const offset = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        const next = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs.at(-1)! : offset ? tabs[(tabs.indexOf(current) + offset + tabs.length) % tabs.length] : null;
        if (!next) return;
        event.preventDefault();
        this.tabChanged.emit(next);
        const elements = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>("[role=tab]");
        elements?.[tabs.indexOf(next)]?.focus();
    }
    protected selectedProcess() { return this.result().processes.find((process) => process.id === this.selectedProcessId()) ?? null; }
    protected surpluses() { return this.result().balances.filter((balance) => balance.surplus > 0.01); }
    protected isExported(materialName: string): boolean { return this.line().exportedOutputs.includes(materialName); }

    /** Compact rate display is a view concern; result DTOs retain solver precision. */
    protected formatRate(value: number): string {
        if (!Number.isFinite(value)) return "—";
        const absolute = Math.abs(value);
        if (absolute >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        if (absolute >= 100) return value.toFixed(0);
        if (absolute >= 10) return value.toFixed(1).replace(/\.0$/, "");
        return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }

    protected statusLabel(met: boolean): string {
        if (met) return this.locale() === Locale.Chinese ? "满足" : "Met";
        return this.locale() === Locale.Chinese ? "存在缺口" : "Shortage detected";
    }
}
