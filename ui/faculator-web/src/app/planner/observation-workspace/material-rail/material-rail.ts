import { AfterViewInit, Component, ElementRef, computed, inject, input, output, viewChildren } from "@angular/core";

import { GameIcon } from "../../../components/shared/game-icon/game-icon";
import { TransportTile } from "../../../components/shared/transport-tile/transport-tile";
import { BlockObservationDto, BomNodeDto, GameCatalogDto, MaterialDto, ProcessDto } from "../../../core/faculator-api/models/faculator-dtos";
import { Locale } from "../../../core/faculator-api/models/locale";
import { ProcessConfigurationChange, RecipeStation } from "../recipe-station/recipe-station";

export class TargetProcessSelection {
    public constructor(public readonly lineId: string, public readonly processId: string) {}
}

@Component({
    selector: "app-material-rail",
    imports: [GameIcon, TransportTile, RecipeStation],
    templateUrl: "./material-rail.html",
    styleUrl: "./material-rail.scss"
})
export class MaterialRail implements AfterViewInit {
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly targetCards = viewChildren<ElementRef<HTMLButtonElement>>("targetCard");
    public readonly observations = input.required<ReadonlyArray<BlockObservationDto>>();
    public readonly catalog = input.required<GameCatalogDto>();
    public readonly activeLineId = input.required<string>();
    public readonly locale = input.required<Locale>();
    public readonly selectedProcessId = input.required<string>();
    public readonly nameOf = input.required<(type: string, name: string) => string>();
    public readonly lineSelected = output<string>();
    public readonly targetProcessSelected = output<TargetProcessSelection>();
    public readonly targetRequested = output<string>();
    public readonly processSelected = output<string>();
    public readonly replacementRequested = output<ProcessDto>();
    public readonly configurationChanged = output<ProcessConfigurationChange>();
    protected readonly layout = computed(() => this.buildLayout(this.observations()));

    protected targetName(root: BomNodeDto): string {
        return this.nameOf()(root.material.type, root.material.name);
    }

    protected formatRate(value: number): string {
        if (!Number.isFinite(value)) return "—";
        if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
        if (Math.abs(value) >= 100) return value.toFixed(0);
        if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
        return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }

    /** Mirrors the prototype: choosing a delivery anchor also focuses its root recipe instance. */
    protected selectTarget(target: RailTargetView): void {
        const rootProcessId = target.root?.processId;
        if (!rootProcessId) {
            this.lineSelected.emit(target.observation.line.id);
            return;
        }
        this.targetProcessSelected.emit(new TargetProcessSelection(target.observation.line.id, rootProcessId));
    }

    /** Byproducts are separate rail anchors in the prototype and focus their supplying recipe. */
    protected selectByproduct(output: RailByproductView): void {
        this.targetProcessSelected.emit(new TargetProcessSelection(output.lineId, output.process.id));
    }

    public ngAfterViewInit(): void {
        queueMicrotask(() => this.centerActiveTarget());
    }

    private centerActiveTarget(): void {
        const targetIndex = Math.max(0, this.observations().findIndex((entry) => entry.line.id === this.activeLineId()));
        const target = this.targetCards()[targetIndex]?.nativeElement;
        if (!target) return;
        const scroller = this.host.nativeElement;
        scroller.scrollLeft = 0;
        scroller.scrollTop = Math.max(0, target.offsetTop + target.offsetHeight / 2 - scroller.clientHeight / 2);
    }

    private buildLayout(observations: ReadonlyArray<BlockObservationDto>): RailLayout {
        const cards: RailCardView[] = [];
        const targets: RailTargetView[] = [];
        const byproducts: RailByproductView[] = [];
        const tileMasks = new Map<string, RailTileView>();
        let lineTop = 40;
        let maximumX = 920;

        observations.forEach((observation, lineIndex) => {
            const processById = new Map(observation.result.processes.map((process) => [process.id, process]));
            const lineCards: RailCardView[] = [];
            let leafCursor = 0;
            const positions = new Map<string, RailCardView>();
            const place = (node: BomNodeDto, depth: number): number | null => {
                if (!node.processId) return null;
                const process = processById.get(node.processId);
                if (!process) return null;
                const childCenters = node.children.flatMap((child) => {
                    const center = place(child, depth + 1);
                    return center === null ? [] : [center];
                });
                const centerY = childCenters.length > 0
                    ? (Math.min(...childCenters) + Math.max(...childCenters)) / 2
                    : lineTop + 80 + leafCursor++ * 240;
                const card = new RailCardView(process, 440 + depth * 480, centerY - 70, observation.line.id);
                cards.push(card);
                lineCards.push(card);
                positions.set(process.id, card);
                maximumX = Math.max(maximumX, card.x + 400);
                node.children.forEach((child) => {
                    if (!child.processId) return;
                    const childCard = positions.get(child.processId);
                    if (childCard) this.route(card, childCard, tileMasks, observation.line.id);
                });
                return centerY;
            };
            const roots = observation.result.roots;
            const rootCenters = roots.map((root) => place(root, 0));
            roots.forEach((root, rootIndex) => {
                const targetCenter = rootCenters[rootIndex] ?? lineTop + 80;
                targets.push(new RailTargetView(observation, root, lineIndex, 40, targetCenter - 60));
                const rootCard = root.processId ? positions.get(root.processId) : null;
                if (!rootCard) return;
                const targetTile = this.ensureTile(10, Math.round(targetCenter / 40), tileMasks, observation.line.id, `target-${root.id}`);
                targetTile.mask |= 10;
            });
            if (roots.length === 0) targets.push(new RailTargetView(observation, null, lineIndex, 40, lineTop + 20));
            const lineByproducts = lineCards.flatMap((card) => card.process.recipe.products
                .filter((product) => product.key !== card.process.fulfills.key)
                .map((product) => new RailByproductView(
                    observation.line.id,
                    card.process,
                    product,
                    product.amount * card.process.cyclesPerMinute * (1 + card.process.productivityBonus),
                    40,
                    0
                ))
            ).filter((output) => output.rate > 0.000001)
                .sort((left, right) => left.process.nodePath.localeCompare(right.process.nodePath) || left.material.key.localeCompare(right.material.key));
            const lowestTarget = Math.max(lineTop + 120, ...rootCenters.map((center) => (center ?? lineTop + 80) + 120));
            lineByproducts.forEach((output, outputIndex) => {
                byproducts.push(new RailByproductView(
                    output.lineId,
                    output.process,
                    output.material,
                    output.rate,
                    output.x,
                    lowestTarget + outputIndex * 160
                ));
            });
            const lineHeight = Math.max(240, leafCursor * 240, lowestTarget - lineTop + lineByproducts.length * 160);
            lineTop += lineHeight + 80;
        });
        return new RailLayout(targets, byproducts, cards, [...tileMasks.values()], maximumX, Math.max(560, lineTop));
    }

    private route(parent: RailCardView, child: RailCardView, tiles: Map<string, RailTileView>, lineId: string): void {
        const startX = Math.round((parent.x + 360) / 40);
        const branchX = startX + 1;
        const endX = Math.round(child.x / 40) - 1;
        const startY = Math.round((parent.y + 70) / 40);
        const endY = Math.round((child.y + 70) / 40);
        this.connectCells(startX, startY, branchX, startY, tiles, lineId, parent.process.id);
        this.connectCells(branchX, startY, branchX, endY, tiles, lineId, parent.process.id);
        this.connectCells(branchX, endY, endX, endY, tiles, lineId, child.process.id);
    }

    private connectCells(
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        tiles: Map<string, RailTileView>,
        lineId: string,
        owner: string
    ): void {
        let x = startX;
        let y = startY;
        this.ensureTile(x, y, tiles, lineId, owner);
        while (x !== endX) {
            const nextX = x + Math.sign(endX - x);
            this.join(x, y, nextX, y, tiles, lineId, owner);
            x = nextX;
        }
        while (y !== endY) {
            const nextY = y + Math.sign(endY - y);
            this.join(x, y, x, nextY, tiles, lineId, owner);
            y = nextY;
        }
    }

    private join(x1: number, y1: number, x2: number, y2: number, tiles: Map<string, RailTileView>, lineId: string, owner: string): void {
        const firstDirection = x2 > x1 ? 2 : x2 < x1 ? 8 : y2 > y1 ? 4 : 1;
        const secondDirection = firstDirection === 1 ? 4 : firstDirection === 2 ? 8 : firstDirection === 4 ? 1 : 2;
        this.ensureTile(x1, y1, tiles, lineId, owner).mask |= firstDirection;
        this.ensureTile(x2, y2, tiles, lineId, owner).mask |= secondDirection;
    }

    private ensureTile(x: number, y: number, tiles: Map<string, RailTileView>, lineId: string, owner: string): RailTileView {
        const key = `${lineId}:${x}:${y}`;
        const current = tiles.get(key);
        if (current) return current;
        const tile = new RailTileView(`${lineId}:${owner}`, x, y, 0);
        tiles.set(key, tile);
        return tile;
    }
}

class RailLayout {
    public constructor(
        public readonly targets: ReadonlyArray<RailTargetView>,
        public readonly byproducts: ReadonlyArray<RailByproductView>,
        public readonly cards: ReadonlyArray<RailCardView>,
        public readonly tiles: ReadonlyArray<RailTileView>,
        public readonly width: number,
        public readonly height: number
    ) {}
}

class RailByproductView {
    public constructor(
        public readonly lineId: string,
        public readonly process: ProcessDto,
        public readonly material: MaterialDto,
        public readonly rate: number,
        public readonly x: number,
        public readonly y: number
    ) {}
}

class RailTargetView {
    public constructor(
        public readonly observation: BlockObservationDto,
        public readonly root: BomNodeDto | null,
        public readonly lineIndex: number,
        public readonly x: number,
        public readonly y: number
    ) {}
}

class RailCardView {
    public constructor(
        public readonly process: ProcessDto,
        public readonly x: number,
        public readonly y: number,
        public readonly lineId: string
    ) {}
}

class RailTileView {
    public constructor(
        public readonly ownerId: string,
        public readonly gridX: number,
        public readonly gridY: number,
        public mask: number
    ) {}
}
