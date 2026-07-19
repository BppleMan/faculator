import { Component, computed, input, output, signal } from "@angular/core";
import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { BlockObservationDto, BomNodeDto, ProcessDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";

class FinderColumn {
    public constructor(public readonly parent: BomNodeDto, public readonly items: ReadonlyArray<BomNodeDto>, public readonly level: number) {}
}

@Component({
    selector: "app-finder-columns",
    imports: [GameIcon],
    templateUrl: "./finder-columns.html",
    styleUrl: "./finder-columns.scss"
})
export class FinderColumns {
    public readonly observation = input.required<BlockObservationDto>();
    public readonly observations = input<ReadonlyArray<BlockObservationDto>>([]);
    public readonly activeLineId = input.required<string>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly lineSelected = output<string>();
    public readonly targetRequested = output<string>();
    public readonly processSelected = output<string>();
    public readonly replacementRequested = output<ProcessDto>();
    protected readonly path = signal<ReadonlyArray<BomNodeDto>>([]);
    protected readonly root = computed(() => this.observation().result.roots[0] ?? null);
    protected readonly pathNodes = computed(() => this.root() ? [this.root()!, ...this.path()] : this.path());
    protected readonly selectedNode = computed(() => this.path().at(-1) ?? this.root());
    protected readonly selectedProcess = computed(() => {
        const processId = this.selectedNode()?.processId;
        return processId ? this.observation().result.processes.find((process) => process.id === processId) ?? null : null;
    });
    protected readonly dependencyColumns = computed(() => {
        const columns: FinderColumn[] = [];
        let parent = this.root();
        let level = 0;
        while (parent?.children.length) {
            columns.push(new FinderColumn(parent, parent.children, level));
            parent = this.path()[level] ?? null;
            level += 1;
        }
        return columns;
    });
    protected readonly lineEntries = computed(() => this.observations().length > 0 ? this.observations() : [this.observation()]);

    protected choose(node: BomNodeDto, level: number): void {
        if (level === 0 && node.id === this.root()?.id) {
            this.path.set([]);
        } else {
            this.path.set([...this.path().slice(0, level), node]);
        }
        if (node.processId) this.processSelected.emit(node.processId);
    }

    protected instanceCode(node: BomNodeDto): string {
        return (node.nodePath || node.id).replace(/^bom:/, "").replace(/^target-/, "T").replaceAll(".", "·");
    }
    protected columnNumber(value: number): string { return value.toString().padStart(2, "0"); }
    protected formatRate(value: number): string {
        if (!Number.isFinite(value)) return "—";
        if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        if (Math.abs(value) >= 100) return value.toFixed(0);
        if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
        return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }
    protected inputLabel(node: BomNodeDto): string {
        if (!node.children.length) return this.locale() === "zh-CN" ? "边界供入" : "BOUNDARY";
        return `${node.children.length} ${this.locale() === "zh-CN" ? "输入" : "INPUTS"}`;
    }
    protected lineTitle(entry: BlockObservationDto): string {
        const target = entry.line.targets[0];
        if (target) return `${this.nameOf()(target.type, target.name)}${this.locale() === "zh-CN" ? "生产线" : " line"}`;
        return this.locale() === "zh-CN" ? entry.line.title.chinese : entry.line.title.english;
    }
    protected processFor(node: BomNodeDto): ProcessDto | null {
        return node.processId ? this.observation().result.processes.find((process) => process.id === node.processId) ?? null : null;
    }
}
