import { Component, ElementRef, input, output, viewChild } from "@angular/core";

import { GameIcon } from "../../components/shared/game-icon/game-icon";
import { PanelShell, PanelShellVariant } from "../../components/ui/panel-shell";
import { BlockObservationDto, BomNodeDto, GameCatalogDto, ProcessDto, ProductionLineDto } from "../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../core/faculator-api/models/locale";
import { ObservationView } from "../../core/faculator-api/models/observation-view";
import { MaterialRail, TargetProcessSelection } from "./material-rail/material-rail";
import { DependencyRings } from "./dependency-rings/dependency-rings";
import { FinderColumns } from "./finder-columns/finder-columns";
import { WorkloadSankey } from "./workload-sankey/workload-sankey";
import { ProcessConfigurationChange } from "./recipe-station/recipe-station";

@Component({
    selector: "app-observation-workspace",
    imports: [GameIcon, PanelShell, MaterialRail, DependencyRings, FinderColumns, WorkloadSankey],
    templateUrl: "./observation-workspace.html",
    styleUrl: "./observation-workspace.scss"
})
export class ObservationWorkspace {
    protected readonly PanelShellVariant = PanelShellVariant;
    private readonly stage = viewChild<ElementRef<HTMLDivElement>>("stage");
    private readonly scrollPositions = new Map<ObservationView, { left: number; top: number }>();
    public readonly observations = input.required<ReadonlyArray<BlockObservationDto>>();
    public readonly catalog = input.required<GameCatalogDto>();
    public readonly activeLine = input.required<ProductionLineDto>();
    public readonly locale = input.required<Locale>();
    public readonly view = input.required<ObservationView>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly selectedProcessId = input.required<string>();
    public readonly viewChanged = output<ObservationView>();
    public readonly targetRequested = output<string>();
    public readonly lineRequested = output<void>();
    public readonly lineSelected = output<string>();
    public readonly targetProcessSelected = output<TargetProcessSelection>();
    public readonly processSelected = output<string>();
    public readonly replacementRequested = output<ProcessDto>();
    public readonly configurationChanged = output<ProcessConfigurationChange>();
    protected readonly ObservationView = ObservationView;
    protected selectView(next: ObservationView): void {
        const stage = this.stage()?.nativeElement;
        if (stage) this.scrollPositions.set(this.view(), { left: stage.scrollLeft, top: stage.scrollTop });
        this.viewChanged.emit(next);
        queueMicrotask(() => {
            const nextStage = this.stage()?.nativeElement;
            if (!nextStage) return;
            const position = this.scrollPositions.get(next) ?? { left: 0, top: 0 };
            nextStage.scrollLeft = position.left;
            nextStage.scrollTop = position.top;
        });
    }
    protected chooseTarget(lineId: string): void {
        this.targetRequested.emit(lineId);
    }
    protected moveView(event: KeyboardEvent, current: ObservationView): void {
        const views = [ObservationView.MaterialRail, ObservationView.DependencyRings, ObservationView.FinderColumns, ObservationView.WorkloadSankey];
        const offset = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
        const next = event.key === "Home" ? views[0] : event.key === "End" ? views.at(-1)! : offset ? views[(views.indexOf(current) + offset + views.length) % views.length] : null;
        if (!next) return;
        event.preventDefault();
        this.selectView(next);
        const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>("[role=tab]");
        tabs?.[views.indexOf(next)]?.focus();
    }
    protected targetCount(): number { return this.observations().reduce((sum, entry) => sum + entry.line.targets.length, 0); }
    protected instanceCount(): number { return this.observations().reduce((sum, entry) => sum + entry.result.roots.reduce((count, root) => count + this.nodeCount(root), 0), 0); }
    protected maximumDepth(): number { return Math.max(0, ...this.observations().flatMap((entry) => entry.result.roots.map((root) => this.depth(root) + 1))); }
    /** The block canvas remains comparable across lines once any line has a configured target. */
    protected allLinesAreDrafts(): boolean { return this.observations().every((entry) => entry.line.targets.length === 0); }
    private nodeCount(node: BomNodeDto): number { return 1 + node.children.reduce((count, child) => count + this.nodeCount(child), 0); }
    private depth(node: BomNodeDto): number { return node.children.length ? 1 + Math.max(...node.children.map((child) => this.depth(child))) : 0; }
}
