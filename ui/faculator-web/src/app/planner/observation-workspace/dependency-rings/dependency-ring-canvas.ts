import { AfterViewInit, Component, ElementRef, input, OnDestroy, output, signal, viewChild } from "@angular/core";

import { BomNodeDto, ProcessDto } from "../../../core/faculator-api/models/faculator-dtos";

interface RingArc {
    readonly node: BomNodeDto;
    readonly processId: string | null;
    readonly branch: number;
    readonly depth: number;
    readonly start: number;
    readonly end: number;
    readonly inner: number;
    readonly outer: number;
}

@Component({
    selector: "app-dependency-ring-canvas",
    template: `<canvas #canvas width="460" height="460" tabindex="0" role="application"
        [attr.aria-label]="ariaLabel()" (pointermove)="move($event)" (pointerleave)="leave()"
        (click)="activate($event)" (keydown)="navigate($event)"></canvas>
        @if (hovered(); as arc) {
            <div class="tooltip" [style.left.px]="tooltipX" [style.top.px]="tooltipY">
                <strong>{{ nameOf()(arc.node.material.type, arc.node.material.name) }}</strong>
                <small>{{ arc.node.demand.toFixed(2) }} / min · {{ arc.node.nodePath }}</small>
            </div>
        }`,
    styles: `
        :host { display: block; position: relative; width: 460px; height: 460px; max-width: 100%; }
        canvas { display: block; width: 100%; height: 100%; cursor: crosshair; }
        .tooltip { position: absolute; z-index: 5; display: grid; max-width: 210px; gap: 3px; padding: 7px 9px; color: #eee2ca; border: 1px solid #6b6253; background: #171916f2; box-shadow: 0 5px 12px #000; pointer-events: none; }
        .tooltip strong { overflow: hidden; font: 700 11px "Avenir Next", "PingFang SC", sans-serif; text-overflow: ellipsis; white-space: nowrap; }
        .tooltip small { overflow: hidden; color: #a79f90; font: 8px "DIN Alternate", monospace; text-overflow: ellipsis; white-space: nowrap; }
    `
})
export class DependencyRingCanvas implements AfterViewInit, OnDestroy {
    public readonly root = input.required<BomNodeDto>();
    public readonly processes = input.required<ReadonlyArray<ProcessDto>>();
    public readonly selectedProcessId = input<string | null>(null);
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly nodeSelected = output<BomNodeDto>();
    protected readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>("canvas");
    protected readonly hovered = signal<RingArc | null>(null);
    protected tooltipX = 0;
    protected tooltipY = 0;
    private arcs: ReadonlyArray<RingArc> = [];
    private hoverArc: RingArc | null = null;
    private keyboardIndex = -1;
    private observer: ResizeObserver | null = null;

    public ngAfterViewInit(): void {
        this.arcs = this.layout(this.root());
        this.draw();
        if (typeof ResizeObserver === "undefined") return;
        this.observer = new ResizeObserver(() => this.draw());
        this.observer.observe(this.canvas().nativeElement);
    }

    public ngOnDestroy(): void { this.observer?.disconnect(); }

    protected ariaLabel(): string { return `依赖环，共 ${this.layout(this.root()).length} 个可选择生产实例`; }

    protected move(event: PointerEvent): void {
        this.hoverArc = this.hit(event.clientX, event.clientY);
        this.hovered.set(this.hoverArc);
        const rect = this.canvas().nativeElement.getBoundingClientRect();
        this.tooltipX = Math.min(rect.width - 220, Math.max(6, event.clientX - rect.left + 12));
        this.tooltipY = Math.min(rect.height - 58, Math.max(6, event.clientY - rect.top + 12));
        this.draw();
    }

    protected leave(): void { this.hoverArc = null; this.hovered.set(null); this.draw(); }

    protected activate(event: MouseEvent): void {
        const node = this.hit(event.clientX, event.clientY)?.node;
        if (node) this.nodeSelected.emit(node);
    }

    protected navigate(event: KeyboardEvent): void {
        if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Enter" || event.key === " ") {
            const node = this.arcs[this.keyboardIndex]?.node;
            if (node) this.nodeSelected.emit(node);
            return;
        }
        const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        this.keyboardIndex = event.key === "Home" ? 0 : event.key === "End" ? this.arcs.length - 1 : (this.keyboardIndex + delta + this.arcs.length) % this.arcs.length;
        this.hoverArc = this.arcs[this.keyboardIndex] ?? null;
        this.hovered.set(this.hoverArc);
        this.draw();
    }

    private layout(root: BomNodeDto): ReadonlyArray<RingArc> {
        const arcs: RingArc[] = [];
        const depth = Math.max(1, this.depth(root) - 1);
        const width = Math.max(22, Math.min(37, 178 / depth));
        const weight = (node: BomNodeDto): number => node.children.length ? node.children.reduce((sum, child) => sum + weight(child), 0) : Math.max(1, Math.sqrt(Math.max(1, node.demand)));
        const place = (nodes: ReadonlyArray<BomNodeDto>, start: number, end: number, level: number, branch: number): void => {
            const total = nodes.reduce((sum, node) => sum + weight(node), 0) || 1;
            let cursor = start;
            nodes.forEach((node, index) => {
                const finish = cursor + (end - start) * weight(node) / total;
                const currentBranch = level === 0 ? index : branch;
                arcs.push({ node, processId: node.processId, branch: currentBranch, depth: level, start: cursor, end: finish, inner: 78 + level * width, outer: 78 + (level + 1) * width - 3 });
                if (node.children.length) place(node.children, cursor, finish, level + 1, currentBranch);
                cursor = finish;
            });
        };
        place(root.children, -Math.PI / 2, Math.PI * 1.5, 0, 0);
        return arcs;
    }

    private depth(node: BomNodeDto): number { return node.children.length ? 1 + Math.max(...node.children.map(child => this.depth(child))) : 0; }

    private draw(): void {
        const canvas = this.canvas().nativeElement;
        const context = canvas.getContext("2d");
        if (!context) return;
        const ratio = window.devicePixelRatio || 1;
        if (canvas.width !== 460 * ratio || canvas.height !== 460 * ratio) { canvas.width = 460 * ratio; canvas.height = 460 * ratio; }
        context.setTransform(ratio, 0, 0, ratio, 230 * ratio, 230 * ratio);
        context.clearRect(-230, -230, 460, 460);
        const hues = [188, 143, 37, 274, 338, 213, 18, 164];
        for (const arc of this.arcs) {
            const active = arc === this.hoverArc || (!!arc.processId && arc.processId === this.selectedProcessId());
            context.beginPath();
            context.arc(0, 0, arc.outer, arc.start + 0.006, arc.end - 0.006);
            context.arc(0, 0, arc.inner, arc.end - 0.006, arc.start + 0.006, true);
            context.closePath();
            context.fillStyle = `hsl(${hues[Math.abs(arc.branch) % hues.length]} 68% ${Math.min(67, 52 + arc.depth * 2)}%)`;
            context.globalAlpha = active ? 1 : 0.78;
            context.fill();
            context.globalAlpha = 1;
            context.strokeStyle = active ? "#f5f1e8" : "#0c141b";
            context.lineWidth = active ? 2 : 1;
            context.stroke();
        }
    }

    private hit(clientX: number, clientY: number): RingArc | null {
        const rect = this.canvas().nativeElement.getBoundingClientRect();
        const x = (clientX - rect.left) * 460 / rect.width - 230;
        const y = (clientY - rect.top) * 460 / rect.height - 230;
        const radius = Math.hypot(x, y);
        let angle = Math.atan2(y, x);
        if (angle < -Math.PI / 2) angle += Math.PI * 2;
        return [...this.arcs].reverse().find(arc => radius >= arc.inner && radius <= arc.outer && angle >= arc.start && angle <= arc.end) ?? null;
    }
}
