import { Component, input, output } from "@angular/core";

import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { PanelShell, PanelShellVariant } from "../../components/ui/panel-shell";
import { ProductionBlockDto, ProductionPlanDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";

@Component({
    selector: "app-block-sidebar",
    imports: [GameIcon, PanelShell],
    templateUrl: "./block-sidebar.html",
    styleUrl: "./block-sidebar.scss"
})
export class BlockSidebar {
    protected readonly PanelShellVariant = PanelShellVariant;
    public readonly plan = input.required<ProductionPlanDto>();
    public readonly activeBlockId = input.required<string>();
    public readonly locale = input.required<Locale>();
    public readonly blockSelected = output<string>();
    public readonly blockAdded = output<void>();
    public readonly blockDeleted = output<string>();

    protected blockNumber(index: number): string {
        return String(index + 1).padStart(2, "0");
    }

    protected status(block: ProductionBlockDto): string {
        if (block.lines.some((line) => line.dirty)) return "is-pending";
        return block.lines.every((line) => line.targets.length === 0) ? "is-draft" : "is-ready";
    }
}
