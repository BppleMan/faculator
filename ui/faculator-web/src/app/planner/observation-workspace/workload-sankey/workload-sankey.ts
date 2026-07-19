import { AfterViewInit, Component, ElementRef, input, output, signal, viewChildren } from "@angular/core";
import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { BlockObservationDto, BomNodeDto, ProcessDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";

class SankeyNodeView {
    public constructor(
        public readonly node: BomNodeDto,
        public readonly depth: number,
        public readonly x: number,
        public readonly y: number,
        public readonly barHeight: number,
        public readonly height: number,
        public readonly segments: ReadonlyArray<SankeySegmentView>
    ) {}
}
class SankeySegmentView {
    public constructor(public readonly top: number, public readonly height: number, public readonly color: string, public readonly local: boolean) {}
}
class SankeyLinkView {
    public constructor(public readonly id: string, public readonly x: number, public readonly y: number, public readonly width: number, public readonly height: number, public readonly rising: boolean, public readonly branch: number) {}
}
class SankeyLayout {
    public constructor(public readonly nodes: ReadonlyArray<SankeyNodeView>, public readonly links: ReadonlyArray<SankeyLinkView>, public readonly depths: ReadonlyArray<number>, public readonly width: number, public readonly height: number) {}
}

@Component({ selector: "app-workload-sankey", imports: [GameIcon], templateUrl: "./workload-sankey.html", styleUrl: "./workload-sankey.scss" })
export class WorkloadSankey implements AfterViewInit {
    private readonly graphScrollers = viewChildren<ElementRef<HTMLDivElement>>("graphScroll");
    public readonly observations = input.required<ReadonlyArray<BlockObservationDto>>();
    public readonly activeLineId = input.required<string>();
    public readonly locale = input.required<Locale>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly lineSelected = output<string>();
    public readonly targetRequested = output<string>();
    public readonly processSelected = output<string>();
    public readonly replacementRequested = output<ProcessDto>();
    protected readonly selectedNodeId = signal<string | null>(null);

    protected layout(entry: BlockObservationDto): SankeyLayout {
        type WorkloadNode = {
            node: BomNodeDto;
            depth: number;
            branch: number;
            children: WorkloadNode[];
            localLoad: number;
            totalLoad: number;
            flowHeight: number;
            subtreeHeight: number;
            x: number;
            centerY: number;
        };
        const processById = new Map(entry.result.processes.map((process) => [process.id, process]));
        const workloadNodes: WorkloadNode[] = [];
        const pendingLinks: Array<{ parent: BomNodeDto; child: BomNodeDto; branch: number }> = [];
        const createNode = (node: BomNodeDto, depth: number, branch: number): WorkloadNode => {
            const process = node.processId ? processById.get(node.processId) : null;
            const item: WorkloadNode = {
                node,
                depth,
                branch,
                children: [],
                localLoad: process ? Math.max(0, process.exactMachines) * 60 : 0,
                totalLoad: 0,
                flowHeight: 10,
                subtreeHeight: 42,
                x: 0,
                centerY: 0
            };
            workloadNodes.push(item);
            item.children = node.children.map((child, childIndex) => {
                pendingLinks.push({ parent: node, child, branch: childIndex });
                return createNode(child, depth + 1, depth === 0 ? childIndex : branch);
            });
            return item;
        };
        const roots = entry.result.roots.map((root, index) => createNode(root, 0, index));
        const sumLoads = (item: WorkloadNode): number => {
            item.totalLoad = item.localLoad + item.children.reduce((sum, child) => sum + sumLoads(child), 0);
            return item.totalLoad;
        };
        roots.forEach(sumLoads);
        const rootLoad = roots.reduce((sum, root) => sum + root.totalLoad, 0);
        const scale = rootLoad > 0.000001 ? 196 / rootLoad : 0;
        const measure = (item: WorkloadNode): void => {
            item.children.forEach(measure);
            item.flowHeight = item.totalLoad > 0.000001 ? item.totalLoad * scale : 10;
            const childHeight = item.children.length
                ? item.children.reduce((sum, child) => sum + child.subtreeHeight, 0) + (item.children.length - 1) * 18
                : 0;
            item.subtreeHeight = Math.max(item.flowHeight + 26, childHeight, 42);
        };
        roots.forEach(measure);
        const place = (item: WorkloadNode, top: number): void => {
            item.x = 26 + item.depth * 210;
            item.centerY = top + item.subtreeHeight / 2;
            const childrenHeight = item.children.reduce((sum, child) => sum + child.subtreeHeight, 0) + Math.max(0, item.children.length - 1) * 18;
            let childTop = top + (item.subtreeHeight - childrenHeight) / 2;
            item.children.forEach((child) => {
                place(child, childTop);
                childTop += child.subtreeHeight + 18;
            });
        };
        let rootTop = 66;
        roots.forEach((root) => {
            place(root, rootTop);
            rootTop += root.subtreeHeight + 18;
        });
        const nodes = workloadNodes.map((item) => {
            const height = Math.max(36, item.flowHeight);
            const flowingChildren = item.children.filter((child) => child.totalLoad > 0.000001);
            const localHeight = item.localLoad * scale;
            let insertionIndex = flowingChildren.length;
            if (localHeight > 0.000001) {
                let cumulativeHeight = 0;
                let closestDistance = Number.POSITIVE_INFINITY;
                for (let index = 0; index <= flowingChildren.length; index += 1) {
                    const localCenter = cumulativeHeight + localHeight / 2;
                    const distance = Math.abs(localCenter - item.flowHeight / 2);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        insertionIndex = index;
                    }
                    cumulativeHeight += flowingChildren[index]?.flowHeight ?? 0;
                }
            }
            const segments: SankeySegmentView[] = [];
            let top = 0;
            const appendLocal = (): void => {
                if (localHeight <= 0.000001) return;
                segments.push(new SankeySegmentView(top, localHeight, "#d99a42", true));
                top += localHeight;
            };
            flowingChildren.forEach((child, index) => {
                if (index === insertionIndex) appendLocal();
                segments.push(new SankeySegmentView(top, child.flowHeight, this.nodeColor(child.branch, child.depth), false));
                top += child.flowHeight;
            });
            if (insertionIndex === flowingChildren.length) appendLocal();
            return new SankeyNodeView(item.node, item.depth, item.x, item.centerY - height / 2, item.flowHeight, height, segments);
        });
        const maximumDepth = Math.max(0, ...nodes.map((node) => node.depth));
        const byId = new Map(nodes.map((node) => [node.node.id, node]));
        const links = pendingLinks.flatMap(({ parent, child, branch }) => {
            const source = byId.get(parent.id); const target = byId.get(child.id);
            if (!source || !target) return [];
            const sourceY = source.y + source.height / 2; const targetY = target.y + target.height / 2;
            return [new SankeyLinkView(`${parent.id}:${child.id}`, source.x + 172, Math.min(sourceY, targetY) - 8, target.x - source.x - 172, Math.abs(targetY - sourceY) + 16, targetY < sourceY, branch)];
        });
        const totalRootHeight = roots.reduce((sum, root) => sum + root.subtreeHeight, 0) + Math.max(0, roots.length - 1) * 18;
        return new SankeyLayout(
            nodes,
            links,
            Array.from({ length: maximumDepth + 1 }, (_, index) => index),
            Math.max(640, (maximumDepth + 1) * 210 + 200),
            Math.max(520, totalRootHeight + 132)
        );
    }

    protected selectNode(node: BomNodeDto): void {
        this.selectedNodeId.update((current) => current === node.id ? null : node.id);
        if (node.processId) this.processSelected.emit(node.processId);
    }
    protected selectedNode(entry: BlockObservationDto): BomNodeDto | null {
        return this.layout(entry).nodes.find(item => item.node.id === this.selectedNodeId())?.node ?? null;
    }
    protected selectedProcess(entry: BlockObservationDto): ProcessDto | null {
        const processId = this.selectedNode(entry)?.processId;
        return processId ? entry.result.processes.find((process) => process.id === processId) ?? null : null;
    }

    public ngAfterViewInit(): void {
        queueMicrotask(() => this.centerRoots());
    }

    private centerRoots(): void {
        this.graphScrollers().forEach((reference, index) => {
            const entry = this.observations()[index];
            if (!entry) return;
            const root = this.layout(entry).nodes.find((node) => node.depth === 0);
            if (!root) return;
            reference.nativeElement.scrollLeft = 0;
            reference.nativeElement.scrollTop = Math.max(0, root.y + root.height / 2 - reference.nativeElement.clientHeight / 2);
        });
    }

    private nodeColor(branch: number, depth: number): string {
        const hues = [188, 143, 37, 274, 338, 213, 18, 164];
        const hue = hues[Math.abs(branch) % hues.length];
        return `hsl(${hue} 68% ${Math.min(67, 52 + depth * 2)}%)`;
    }
}
