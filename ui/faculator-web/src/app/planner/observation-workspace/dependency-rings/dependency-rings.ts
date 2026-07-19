import { Component, input, output, signal } from "@angular/core";
import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { BlockObservationDto, BomNodeDto, ProcessDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";
import { DependencyRingCanvas } from "./dependency-ring-canvas";

@Component({
    selector: "app-dependency-rings",
    imports: [GameIcon, DependencyRingCanvas],
    templateUrl: "./dependency-rings.html",
    styleUrl: "./dependency-rings.scss"
})
export class DependencyRings {
    public readonly observations = input.required<ReadonlyArray<BlockObservationDto>>();
    public readonly activeLineId = input.required<string>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly lineSelected = output<string>();
    public readonly targetRequested = output<string>();
    public readonly processSelected = output<string>();
    public readonly replacementRequested = output<ProcessDto>();
    protected readonly selectedNodeId = signal<string | null>(null);
    private readonly selectedRootIds = signal<ReadonlyMap<string, string>>(new Map());

    /** Keeps multi-target root navigation view-local; the solver remains the observation DTO owner. */
    protected selectedRoot(entry: BlockObservationDto): BomNodeDto | null {
        const selectedId = this.selectedRootIds().get(entry.line.id);
        return entry.result.roots.find((root) => root.id === selectedId) ?? entry.result.roots[0] ?? null;
    }

    protected selectRoot(lineId: string, rootId: string): void {
        this.selectedRootIds.update((current) => new Map(current).set(lineId, rootId));
        this.selectedNodeId.set(null);
    }

    protected selectNode(node: BomNodeDto): void {
        this.selectedNodeId.set(node.id);
        if (node.processId) this.processSelected.emit(node.processId);
    }

    protected selectedNode(root: BomNodeDto): BomNodeDto {
        const selectedId = this.selectedNodeId();
        if (!selectedId) return root;
        const find = (node: BomNodeDto): BomNodeDto | null => {
            if (node.id === selectedId) return node;
            for (const child of node.children) {
                const match = find(child);
                if (match) return match;
            }
            return null;
        };
        return find(root) ?? root;
    }

    protected selectedProcess(entry: BlockObservationDto, node: BomNodeDto): ProcessDto | null {
        return node.processId ? entry.result.processes.find((process) => process.id === node.processId) ?? null : null;
    }
}
