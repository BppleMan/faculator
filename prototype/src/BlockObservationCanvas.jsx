import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { formatRate, iconPath, localeText } from "./domain.js";
import materialRailViewIcon from "../design-assets/ui/view-material-rail.svg";
import dependencyRingsViewIcon from "../design-assets/ui/view-dependency-rings.svg";
import finderColumnsViewIcon from "../design-assets/ui/view-finder-columns.svg";
import flowSankeyViewIcon from "../design-assets/ui/view-flow-sankey.svg";

const BRANCH_HUES = [188, 143, 37, 274, 338, 213, 18, 164];
const TRANSPORT_TILE_SIZE = 40;
const RAIL_TARGET_X = 40;
const RAIL_CARD_WIDTH = 360;
const RAIL_CARD_HEIGHT = 160;
const RAIL_TARGET_WIDTH = RAIL_CARD_WIDTH;
const RAIL_TARGET_HEIGHT = RAIL_CARD_HEIGHT;
const RAIL_RECIPE_X = RAIL_TARGET_X + RAIL_TARGET_WIDTH + TRANSPORT_TILE_SIZE;
const RAIL_COLUMN_GAP = RAIL_CARD_WIDTH + TRANSPORT_TILE_SIZE * 3;
const RAIL_ROW_GAP = 240;
const RAIL_STAGE_TOP = 40;
const RAIL_TRANSPORT_TYPE = "belt";
const MODULE_CATEGORY_ORDER = ["speed", "productivity", "quality", "efficiency"];
const MODULE_CATEGORY_ICON = {
  speed: "speed-module",
  productivity: "productivity-module",
  quality: "quality-module",
  efficiency: "efficiency-module",
};

const NORTH = 1;
const EAST = 2;
const SOUTH = 4;
const WEST = 8;

function GameIcon({ type, name, size = 32, className = "" }) {
  return (
    <img
      className={`game-icon ${className}`}
      src={iconPath(type, name)}
      alt=""
      width={size}
      height={size}
      draggable="false"
    />
  );
}

function nodeColor(branchIndex, depth = 0) {
  const hue = BRANCH_HUES[Math.abs(branchIndex) % BRANCH_HUES.length];
  return `hsl(${hue} 68% ${Math.min(67, 52 + depth * 2)}%)`;
}

function walkBom(node, visitor, parent = null, depth = 0, branchIndex = 0) {
  if (!node) return;
  visitor(node, parent, depth, branchIndex);
  (node.children ?? []).forEach((child, index) => {
    walkBom(child, visitor, node, depth + 1, depth === 0 ? index : branchIndex);
  });
}

function countBomNodes(node) {
  let count = 0;
  walkBom(node, () => { count += 1; });
  return count;
}

function maxBomDepth(node) {
  let maximum = 0;
  walkBom(node, (_current, _parent, depth) => { maximum = Math.max(maximum, depth + 1); });
  return maximum;
}

function instanceCode(node) {
  const path = node.nodePath ?? node.id.replace(/^bom:/, "");
  return path.replace(/^target-/, "T").replaceAll(".", "·");
}

function indexLine(entry) {
  const nodes = new Map();
  const parents = new Map();
  const roots = new Map();
  entry.result.bomRoots?.forEach((root) => {
    if (!root.expansion) return;
    walkBom(root.expansion, (node, parent) => {
      nodes.set(node.id, node);
      if (parent) parents.set(node.id, parent.id);
      roots.set(node.id, root.id);
    });
  });
  return { nodes, parents, roots };
}

function processFor(entry, node) {
  if (!node?.processId) return null;
  return entry.result.processes.find((process) => process.id === node.processId) ?? null;
}

function defaultNodePath(root) {
  return root?.expansion ? [root.expansion.id] : [];
}

function LineIdentity({ entry, lineIndex, active, locale, nameOf, onSelectLine, t }) {
  const targets = entry.line.targets;
  const target = targets[0];
  return (
    <button className={`block-line-identity ${active ? "is-active" : ""}`} type="button" onClick={() => onSelectLine(entry.line)}>
      <span className="block-line-code">LINE {String(lineIndex + 1).padStart(2, "0")}</span>
      <span className="block-line-icons">
        {targets.length === 0 ? (
          <GameIcon type="item" name="blueprint-book" size={28} />
        ) : targets.slice(0, 3).map((target, index) => (
          <GameIcon key={`${target.type}:${target.name}:${index}`} type={target.type} name={target.name} size={28} />
        ))}
      </span>
      <span className="block-line-copy">
        <strong>{localeText(entry.line.title, locale)}</strong>
        <small>{target ? `${nameOf(target.type, target.name)} · ≥ ${formatRate(target.minimum)} / min` : t("draftLine")}</small>
      </span>
      <span className={`block-line-state ${targets.length === 0 ? "is-draft" : entry.line.dirty ? "is-pending" : "is-ready"}`} />
    </button>
  );
}

const expectedRate = (entry, cycles, multiplier = 1) =>
  Number(entry.amount ?? 0) * Number(entry.probability ?? 1) * cycles * multiplier;

const materialEquals = (left, right) =>
  left?.type === right?.type && left?.name === right?.name;

const gridLine = (coordinate) => Math.round(coordinate / TRANSPORT_TILE_SIZE) + 1;

const gridCardPlacement = (x, y, width = RAIL_CARD_WIDTH, height = RAIL_CARD_HEIGHT) => ({
  gridColumn: `${gridLine(x)} / span ${Math.round(width / TRANSPORT_TILE_SIZE)}`,
  gridRow: `${gridLine(y)} / span ${Math.round(height / TRANSPORT_TILE_SIZE)}`,
});

const gridTilePlacement = (tile) => ({
  gridColumnStart: gridLine(tile.x - TRANSPORT_TILE_SIZE / 2),
  gridRowStart: gridLine(tile.y - TRANSPORT_TILE_SIZE / 2),
});

const oppositeDirection = (direction) => ({
  [NORTH]: SOUTH,
  [EAST]: WEST,
  [SOUTH]: NORTH,
  [WEST]: EAST,
})[direction];

function directionBetween(left, right) {
  if (right.x > left.x) return EAST;
  if (right.x < left.x) return WEST;
  if (right.y > left.y) return SOUTH;
  return NORTH;
}

function topologyName(mask) {
  const connections = [NORTH, EAST, SOUTH, WEST].filter((direction) => mask & direction).length;
  if (connections === 0) return "single";
  if (connections === 1) return "endpoint";
  if (connections === 3) return "tee";
  if (connections === 4) return "cross";
  return mask === (NORTH | SOUTH) || mask === (EAST | WEST) ? "straight" : "corner";
}

function directionCode(mask) {
  return [
    mask & NORTH ? "N" : null,
    mask & EAST ? "E" : null,
    mask & SOUTH ? "S" : null,
    mask & WEST ? "W" : null,
  ].filter(Boolean).join("");
}

function getTransportCell(cells, point) {
  const key = `${point.x}:${point.y}`;
  if (!cells.has(key)) cells.set(key, { ...point, mask: 0 });
  return cells.get(key);
}

function connectTransportCells(cells, origin, destination) {
  const start = getTransportCell(cells, origin);
  if (origin.x === destination.x && origin.y === destination.y) return start;
  const deltaX = destination.x - origin.x;
  const deltaY = destination.y - origin.y;
  const steps = Math.max(1, Math.round(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / TRANSPORT_TILE_SIZE));
  let previous = start;
  for (let step = 1; step <= steps; step += 1) {
    const current = getTransportCell(cells, {
      x: origin.x + (deltaX / steps) * step,
      y: origin.y + (deltaY / steps) * step,
    });
    const direction = directionBetween(previous, current);
    previous.mask |= direction;
    current.mask |= oppositeDirection(direction);
    previous = current;
  }
  return previous;
}

function transportTiles(link) {
  const leftToRight = link.fromX <= link.toX;
  const x1 = leftToRight ? link.fromX : link.toX;
  const x2 = leftToRight ? link.toX : link.fromX;
  const y1 = leftToRight ? link.fromY : link.toY;
  const y2 = leftToRight ? link.toY : link.fromY;
  const start = { x: x1 + TRANSPORT_TILE_SIZE / 2, y: y1 };
  const end = { x: x2 - TRANSPORT_TILE_SIZE / 2, y: y2 };
  const horizontalSteps = Math.max(0, Math.round((end.x - start.x) / TRANSPORT_TILE_SIZE));
  const bendRatio = link.kind === "byproduct" ? 0.78 : 0.44;
  const innerSteps = Math.max(1, horizontalSteps - 1);
  const laneStep = Number.isFinite(link.laneIndex) && link.laneCount > 0
    ? link.kind === "byproduct"
      ? Math.max(1, innerSteps - link.laneIndex - 1)
      : Math.round(((link.laneIndex + 1) * innerSteps) / (link.laneCount + 1))
    : null;
  const bendStep = Math.min(
    innerSteps,
    Math.max(1, laneStep ?? Math.round(horizontalSteps * bendRatio)),
  );
  const bendX = start.x + bendStep * TRANSPORT_TILE_SIZE;
  const waypoints = y1 === y2 || horizontalSteps < 2
    ? [start, end]
    : [start, { x: bendX, y: y1 }, { x: bendX, y: y2 }, end];
  const cells = new Map();

  waypoints.slice(1).forEach((waypoint, waypointIndex) => {
    connectTransportCells(cells, waypoints[waypointIndex], waypoint);
  });

  getTransportCell(cells, start).mask |= WEST;
  getTransportCell(cells, end).mask |= EAST;
  return [...cells.values()];
}

function transportBundleTiles(links, bundleIndex, bundleCount) {
  const first = links[0];
  const parentOffset = (bundleIndex - (bundleCount - 1) / 2) * 2 * TRANSPORT_TILE_SIZE;
  const parentY = first.parentY + parentOffset;
  if (links.length === 1) {
    return {
      tiles: transportTiles({ ...first, fromY: parentY }),
      busX: null,
      parentY,
    };
  }
  const leftToRight = first.fromX <= first.toX;
  const x1 = leftToRight ? first.fromX : first.toX;
  const x2 = leftToRight ? first.toX : first.fromX;
  const startX = x1 + TRANSPORT_TILE_SIZE / 2;
  const endX = x2 - TRANSPORT_TILE_SIZE / 2;
  const horizontalSteps = Math.max(2, Math.round((endX - startX) / TRANSPORT_TILE_SIZE));
  const centerStep = Math.round(horizontalSteps / 2);
  const bundleOffset = (bundleIndex - (bundleCount - 1) / 2) * 2;
  const busStep = Math.max(1, Math.min(horizontalSteps - 1, Math.round(centerStep + bundleOffset)));
  const busX = startX + busStep * TRANSPORT_TILE_SIZE;
  const cells = new Map();
  const trunkYs = [parentY];
  const parentPoint = { x: startX, y: parentY };
  const parentBusPoint = { x: busX, y: parentY };

  connectTransportCells(cells, parentPoint, parentBusPoint);
  getTransportCell(cells, parentPoint).mask |= WEST;

  links.forEach((link) => {
    const linkLeftToRight = link.fromX <= link.toX;
    const childY = linkLeftToRight ? link.toY : link.fromY;
    const childBusPoint = { x: busX, y: childY };
    const childPoint = { x: endX, y: childY };
    connectTransportCells(cells, childBusPoint, childPoint);
    getTransportCell(cells, childPoint).mask |= EAST;
    trunkYs.push(childY);
  });

  const minimumY = Math.min(...trunkYs);
  const maximumY = Math.max(...trunkYs);
  connectTransportCells(cells, { x: busX, y: minimumY }, { x: busX, y: maximumY });
  return { tiles: [...cells.values()], busX, parentY };
}

function TransportTile({ tile, transportType, kind, ownerId }) {
  return (
    <span
      className={`transport-tile is-${transportType} ${kind === "byproduct" ? "is-byproduct" : ""}`}
      data-component="TransportTile"
      data-transport-owner={ownerId}
      data-transport-type={transportType}
      data-grid-x={tile.x}
      data-grid-y={tile.y}
      data-tile-mask={tile.mask}
      data-tile-shape={topologyName(tile.mask)}
      data-tile-directions={directionCode(tile.mask)}
      style={{
        ...gridTilePlacement(tile),
        backgroundPosition: `${-(tile.mask % 4) * TRANSPORT_TILE_SIZE}px ${-Math.floor(tile.mask / 4) * TRANSPORT_TILE_SIZE}px`,
        backgroundSize: `${TRANSPORT_TILE_SIZE * 4}px ${TRANSPORT_TILE_SIZE * 4}px`,
      }}
    />
  );
}

function TransportLink({ link }) {
  const tiles = transportTiles(link);
  return (
    <span
      className={`recipe-supply-link is-${RAIL_TRANSPORT_TYPE} is-${link.kind}`}
      data-component="TransportLink"
      data-transport-id={link.id}
      data-transport-type={RAIL_TRANSPORT_TYPE}
      data-material-type={link.material.type}
      data-material-name={link.material.name}
      data-flow-rate={link.rate}
      data-flow-direction="right-to-left"
      data-tile-count={tiles.length}
    >
      {tiles.map((tile) => (
        <TransportTile
          key={`${tile.x}:${tile.y}`}
          tile={tile}
          transportType={RAIL_TRANSPORT_TYPE}
          kind={link.kind}
          ownerId={link.id}
        />
      ))}
    </span>
  );
}

function TransportBundle({ id, links, bundleIndex, bundleCount }) {
  const { tiles, busX, parentY } = transportBundleTiles(links, bundleIndex, bundleCount);
  const materialTypes = [...new Set(links.map((link) => link.material.type))];
  return (
    <span
      className={`recipe-supply-bundle is-${RAIL_TRANSPORT_TYPE}`}
      data-component="TransportBundle"
      data-transport-id={id}
      data-bundle-id={id}
      data-bundle-size={links.length}
      data-bus-x={busX}
      data-parent-y={parentY}
      data-parent-connector-count="1"
      data-transport-type={RAIL_TRANSPORT_TYPE}
      data-material-types={materialTypes.join(",")}
    >
      {tiles.map((tile) => (
        <TransportTile
          key={`${tile.x}:${tile.y}`}
          tile={tile}
          transportType={RAIL_TRANSPORT_TYPE}
          kind="supply"
          ownerId={id}
        />
      ))}
      {links.map((link) => (
        <span
          className={`recipe-supply-link is-${link.material.type} is-supply is-bundled`}
          data-material-type={link.material.type}
          data-material-name={link.material.name}
          data-flow-rate={link.rate}
          data-flow-direction="right-to-left"
          key={link.id}
        />
      ))}
    </span>
  );
}

function groupTransportLayers(links) {
  const independentLinks = [];
  const parentGroups = new Map();

  links.forEach((link) => {
    if (link.kind !== "supply" || !link.bundleId) {
      independentLinks.push(link);
      return;
    }
    if (!parentGroups.has(link.bundleId)) parentGroups.set(link.bundleId, []);
    parentGroups.get(link.bundleId).push(link);
  });

  const supplyBundles = [...parentGroups.entries()].map(([bundleId, groupedLinks]) => ({
    id: `${bundleId}:${RAIL_TRANSPORT_TYPE}`,
    links: groupedLinks,
    bundleIndex: 0,
    bundleCount: 1,
  }));

  return { independentLinks, supplyBundles };
}

function OutputAnchor({ output, nameOf, onSelectNode, t }) {
  const target = output.kind === "target";
  return (
    <button
      className={`rail-output-anchor ${target ? "is-target" : "is-byproduct"}`}
      type="button"
      style={gridCardPlacement(output.x, output.y, RAIL_TARGET_WIDTH, RAIL_TARGET_HEIGHT)}
      onClick={() => output.process && onSelectNode(output.line, output.process.id)}
      data-material-type={output.material.type}
      data-material-name={output.material.name}
      data-card-kind={output.kind}
    >
      <span className="rail-output-icon"><GameIcon type={output.material.type} name={output.material.name} size={target ? 48 : 42} /></span>
      <span>
        <small>{t(target ? "targetItemNode" : "byproductOutput")}</small>
        <strong>{nameOf(output.material.type, output.material.name)}</strong>
        <em>{target ? "≥ " : "+ "}{formatRate(output.rate)} / min</em>
        {!target && <b>{t("suppliedByRecipe")} · {nameOf("recipe", output.process.recipe.name)}</b>}
      </span>
    </button>
  );
}

function RecipeMaterialPort({ entry, rate, status, nameOf, t, output = false }) {
  const materialName = nameOf(entry.type, entry.name);
  return (
    <div
      className={`recipe-material-port ${output ? "is-output" : "is-input"}`}
      data-material-type={entry.type}
      title={`${materialName} · ${formatRate(rate)} / min · ${t(status)}`}
    >
      <span className="recipe-material-port-icon"><GameIcon type={entry.type} name={entry.name} size={16} /></span>
      <span className="recipe-material-port-copy">
        <strong>{materialName}</strong>
        <small>{formatRate(rate)} / min</small>
      </span>
    </div>
  );
}

function qualityColor(quality) {
  const color = quality?.color;
  if (!color) return "#aeb6b8";
  return `rgb(${Math.round(color.r * 255)} ${Math.round(color.g * 255)} ${Math.round(color.b * 255)})`;
}

function moduleCategoryLabel(category, t) {
  return t({
    speed: "moduleCategorySpeed",
    productivity: "moduleCategoryProductivity",
    quality: "moduleCategoryQuality",
    efficiency: "moduleCategoryEfficiency",
  }[category]);
}

function ModuleSlotButton({ owner, slotIndex, selection, nameOf, onOpen, t }) {
  const slotLabel = t(owner === "machine" ? "machineModuleSlot" : "beaconModuleSlot");
  const selectionLabel = selection
    ? `${nameOf("item", selection.module.name)} · ${nameOf("quality", selection.quality.name)}`
    : t("noModule");
  return (
    <button
      className={`recipe-module-slot ${selection ? "is-filled" : "is-empty"}`}
      type="button"
      title={`${slotLabel} ${slotIndex + 1} · ${selectionLabel}`}
      aria-label={`${slotLabel} ${slotIndex + 1} · ${selectionLabel}`}
      style={{ "--quality-color": selection ? qualityColor(selection.quality) : "#667176" }}
      onClick={onOpen}
    >
      <GameIcon type="item" name={selection?.module.name ?? "empty-module-slot"} size={14} />
      {selection && <GameIcon type="quality" name={selection.quality.name} size={7} className="recipe-module-quality-badge" />}
      <span>{slotIndex + 1}</span>
    </button>
  );
}

function ModuleSlotPicker({ owner, slotIndex, modules, qualities, selection, nameOf, onChoose, onClear, onClose, t }) {
  const availableCategories = MODULE_CATEGORY_ORDER.filter((category) => modules.some((module) => module.category === category));
  const [category, setCategory] = useState(
    selection?.module.category ?? availableCategories[0] ?? MODULE_CATEGORY_ORDER[0],
  );
  const categoryModules = modules
    .filter((module) => module.category === category)
    .sort((left, right) => Number(left.tier) - Number(right.tier));
  const slotLabel = t(owner === "machine" ? "machineModuleSlot" : "beaconModuleSlot");
  return (
    <div className="recipe-module-picker" role="dialog" aria-label={t("modulePicker")}>
      <header>
        <span><strong>{slotLabel} {slotIndex + 1}</strong><small>{selection ? `${nameOf("item", selection.module.name)} · ${nameOf("quality", selection.quality.name)}` : t("noModule")}</small></span>
        <button type="button" onClick={onClose}>{t("closePicker")}</button>
      </header>
      <nav aria-label={t("modulePicker")}>
        {MODULE_CATEGORY_ORDER.map((entry) => {
          const enabled = availableCategories.includes(entry);
          return (
            <button
              className={category === entry ? "is-active" : ""}
              type="button"
              disabled={!enabled}
              aria-pressed={category === entry}
              key={entry}
              onClick={() => setCategory(entry)}
            >
              <GameIcon type="item" name={MODULE_CATEGORY_ICON[entry]} size={17} />
              <span>{moduleCategoryLabel(entry, t)}</span>
            </button>
          );
        })}
      </nav>
      <div className="recipe-module-quality-head" aria-hidden="true">
        <span />
        {qualities.map((quality, qualityIndex) => (
          <span style={{ "--quality-color": qualityColor(quality) }} key={quality.name}>
            <GameIcon type="quality" name={quality.name} size={11} />
            <em>{qualityIndex + 1}</em>
          </span>
        ))}
      </div>
      <div className="recipe-module-matrix">
        {categoryModules.map((module) => (
          <div className="recipe-module-tier-row" key={module.name}>
            <span>{["", "I", "II", "III"][Number(module.tier)] ?? module.tier}</span>
            {qualities.map((quality, qualityIndex) => {
              const active = selection?.module.name === module.name && selection?.quality.name === quality.name;
              return (
                <button
                  className={active ? "is-active" : ""}
                  type="button"
                  title={`${nameOf("item", module.name)} · ${qualityIndex + 1} ${t("starQuality")} · ${nameOf("quality", quality.name)}`}
                  aria-label={`${nameOf("item", module.name)} · ${qualityIndex + 1} ${t("starQuality")}`}
                  style={{ "--quality-color": qualityColor(quality) }}
                  key={quality.name}
                  onClick={() => onChoose(module, quality)}
                >
                  <GameIcon type="item" name={module.name} size={18} />
                  <GameIcon type="quality" name={quality.name} size={9} className="recipe-module-quality-badge" />
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <footer>
        <button type="button" onClick={onClear}>
          <GameIcon type="item" name="empty-module-slot" size={14} />
          <span>{t("clearModuleSlot")}</span>
        </button>
      </footer>
    </div>
  );
}

function RecipeStation({ entry, item, selectedNode, nameOf, onSelectNode, onReplaceProcess, onUpdateProcessConfig, t }) {
  const { node, process } = item;
  const selected = selectedNode === process.id;
  const configuration = process.configuration ?? {};
  const patchConfiguration = (patch) => onUpdateProcessConfig(entry.line, process, patch);
  const beaconCount = Math.max(0, Math.min(64, Math.floor(Number(configuration.beaconCount) || 0)));
  const setBeaconCount = (value) => patchConfiguration({ beaconCount: Math.max(0, Math.min(64, Math.floor(Number(value) || 0))) });
  const [modulePicker, setModulePicker] = useState(null);
  const updateModuleSlot = (owner, slotIndex, module, quality) => {
    const resolvedSlots = owner === "machine" ? process.machineModuleSlots : process.beaconModuleSlots;
    const slotCount = owner === "machine" ? process.machineSlots : process.beaconSlots;
    const configurationKey = owner === "machine" ? "machineModuleSlots" : "beaconModuleSlots";
    const legacyKey = owner === "machine" ? "machineModuleName" : "beaconModuleName";
    const nextSlots = Array.from({ length: slotCount }, (_, index) => {
      const current = resolvedSlots[index];
      return current ? { moduleName: current.module.name, qualityName: current.quality.name } : null;
    });
    nextSlots[slotIndex] = module && quality ? { moduleName: module.name, qualityName: quality.name } : null;
    patchConfiguration({ [configurationKey]: nextSlots, [legacyKey]: "" });
    setModulePicker(null);
  };
  const pickerSlots = modulePicker?.owner === "machine" ? process.machineModuleSlots : process.beaconModuleSlots;
  const pickerModules = modulePicker?.owner === "machine" ? process.machineModules : process.beaconModules;
  return (
    <article
      className={`recipe-station ${selected ? "is-selected" : ""}`}
      style={{ "--branch-color": nodeColor(item.branchIndex, item.depth) }}
      data-process-id={process.id}
      data-choice-key={process.choiceKey}
    >
      <section className="recipe-card-port-column is-output" aria-label={t("recipeOutputSide")}>
        <div className="recipe-card-port-list">
          {process.recipe.products.map((product, productIndex) => (
            <RecipeMaterialPort
              key={`${product.type}:${product.name}:${productIndex}`}
              entry={product}
              output
              rate={expectedRate(product, process.cycles, process.productivityMultiplier)}
              status={materialEquals(product, process.fulfills) ? "downstreamOutput" : "byproductOutput"}
              nameOf={nameOf}
              t={t}
            />
          ))}
        </div>
      </section>

      <section className="recipe-card-core">
        <header className="recipe-card-identity">
          <button
            type="button"
            className="recipe-card-title"
            title={t("replaceRecipe")}
            onClick={() => {
              onSelectNode(entry.line, process.id);
              onReplaceProcess(entry.line, process, node);
            }}
          >
            <span className="recipe-card-recipe-icon"><GameIcon type="recipe" name={process.recipe.name} size={24} /></span>
            <span className="recipe-card-title-copy">
              <small>{t("recipeInstance")} {instanceCode(node)} · D{item.depth + 1}</small>
              <strong>{nameOf("recipe", process.recipe.name)}</strong>
              <em>{formatRate(process.cycles)} {t("recipeExecutions")}</em>
            </span>
          </button>
        </header>

        <section className="recipe-card-machine-bay">
          <span className="recipe-card-machine-label">{t("productionMachine")}</span>
          <div className="recipe-card-machine-options" data-testid={`machine-select-${process.nodePath}`}>
            {process.machines.map((machine) => (
              <button
                className={machine.name === configuration.machineName ? "is-active" : ""}
                type="button"
                title={nameOf("entity", machine.name)}
                aria-label={nameOf("entity", machine.name)}
                aria-pressed={machine.name === configuration.machineName}
                key={machine.name}
                onClick={() => patchConfiguration({ machineName: machine.name })}
              >
                <GameIcon type="entity" name={machine.name} size={18} />
              </button>
            ))}
          </div>
          <em className="recipe-card-machine-count"><strong>{process.roundedMachines}</strong> ×</em>
        </section>

        <section className="recipe-card-module-bay" aria-label={`${t("machineModuleFill")} · ${process.machineSlots} ${t("moduleSlots")}`}>
          <div className="recipe-card-module-rack">
            {Array.from({ length: process.machineSlots }, (_, slotIndex) => (
              <ModuleSlotButton
                owner="machine"
                slotIndex={slotIndex}
                selection={process.machineModuleSlots[slotIndex]}
                nameOf={nameOf}
                onOpen={() => setModulePicker({ owner: "machine", slotIndex })}
                t={t}
                key={slotIndex}
              />
            ))}
          </div>
        </section>

        <section className="recipe-card-beacon-bay">
          <div className="recipe-card-beacon-count" role="group" aria-label={t("beaconCount")}>
            <GameIcon type="entity" name="beacon" size={16} />
            <span className="recipe-card-beacon-stepper">
              <button type="button" disabled={beaconCount === 0} aria-label={t("decreaseBeaconCount")} onClick={() => setBeaconCount(beaconCount - 1)}>−</button>
              <input aria-label={t("beaconCount")} type="number" min="0" max="64" value={beaconCount} onChange={(event) => setBeaconCount(event.target.value)} />
              <button type="button" disabled={beaconCount === 64} aria-label={t("increaseBeaconCount")} onClick={() => setBeaconCount(beaconCount + 1)}>+</button>
            </span>
          </div>
          <div className="recipe-card-beacon-slots" aria-label={`${t("beaconModule")} · ${process.beaconSlots} ${t("moduleSlots")}`}>
            <div>
              {Array.from({ length: process.beaconSlots }, (_, slotIndex) => (
                <ModuleSlotButton
                  owner="beacon"
                  slotIndex={slotIndex}
                  selection={process.beaconModuleSlots[slotIndex]}
                  nameOf={nameOf}
                  onOpen={() => setModulePicker({ owner: "beacon", slotIndex })}
                  t={t}
                  key={slotIndex}
                />
              ))}
            </div>
          </div>
        </section>

        <footer className="recipe-card-metrics">
          <span><small>{t("requiredMachines")}</small><strong>{formatRate(process.exactMachines)}</strong><em>→ {process.roundedMachines}</em></span>
          <span><small>{t("effectiveSpeed")}</small><strong>×{formatRate(process.speedMultiplier)}</strong></span>
          <span><small>{t("productivityEffect")}</small><strong>+{formatRate(process.productivityBonus * 100)}%</strong></span>
          <span><small>{t("qualityEffect")}</small><strong>+{formatRate(process.qualityBonus * 100)}%</strong></span>
        </footer>

        {modulePicker && (
          <ModuleSlotPicker
            key={`${modulePicker.owner}:${modulePicker.slotIndex}`}
            owner={modulePicker.owner}
            slotIndex={modulePicker.slotIndex}
            modules={pickerModules}
            qualities={process.qualities}
            selection={pickerSlots[modulePicker.slotIndex]}
            nameOf={nameOf}
            onChoose={(module, quality) => updateModuleSlot(modulePicker.owner, modulePicker.slotIndex, module, quality)}
            onClear={() => updateModuleSlot(modulePicker.owner, modulePicker.slotIndex, null, null)}
            onClose={() => setModulePicker(null)}
            t={t}
          />
        )}
      </section>

      <section className="recipe-card-port-column is-input" aria-label={t("recipeInputSide")}>
        <div className="recipe-card-port-list">
          {process.recipe.ingredients.map((ingredient, ingredientIndex) => (
            <RecipeMaterialPort
              key={`${ingredient.type}:${ingredient.name}:${ingredientIndex}`}
              entry={ingredient}
              rate={expectedRate(ingredient, process.cycles)}
              status={node.children?.[ingredientIndex]?.kind === "process" ? "upstreamExpanded" : "externalSupplyShort"}
              nameOf={nameOf}
              t={t}
            />
          ))}
        </div>
      </section>
    </article>
  );
}

function createRailLayout(entry, root) {
  const nodes = [];
  let maximumDepth = 0;
  let maximumRow = 0;

  const place = (node, depth, branchIndex = 0, row = 0) => {
    if (node?.kind !== "process") return row;
    const process = processFor(entry, node);
    if (!process) return row;
    maximumDepth = Math.max(maximumDepth, depth);
    maximumRow = Math.max(maximumRow, row);
    const item = { node, process, depth, branchIndex, row, cardHeight: RAIL_CARD_HEIGHT };
    nodes.push(item);
    let nextAvailableRow = row + 1;
    (node.children ?? []).filter((child) => child.kind === "process").forEach((child, index) => {
      const childRow = index === 0 ? row : nextAvailableRow;
      nextAvailableRow = Math.max(
        nextAvailableRow,
        place(child, depth + 1, depth === 0 ? index : branchIndex, childRow),
      );
    });
    return Math.max(nextAvailableRow, row + 1);
  };

  place(root.expansion, 0, 0, 0);
  nodes.forEach((item) => {
    item.x = RAIL_RECIPE_X + item.depth * RAIL_COLUMN_GAP;
    item.y = RAIL_STAGE_TOP + item.row * RAIL_ROW_GAP;
  });
  const positions = new Map(nodes.map((item) => [item.node.id, item]));
  const links = [];
  nodes.forEach((parent) => {
    (parent.node.children ?? []).forEach((child) => {
      const childItem = positions.get(child.id);
      if (!childItem) return;
      links.push({
        id: `${parent.node.id}:${child.nodePath}`,
        kind: "supply",
        bundleId: parent.node.id,
        material: child.material,
        rate: child.demand,
        fromX: parent.x + RAIL_CARD_WIDTH,
        fromY: parent.y + RAIL_CARD_HEIGHT / 2,
        parentY: parent.y + RAIL_CARD_HEIGHT / 2,
        toX: childItem.x,
        toY: childItem.y + RAIL_CARD_HEIGHT / 2,
      });
    });
  });

  const rootItem = positions.get(root.expansion.id);
  const targetOutput = {
    id: `${root.id}:output`,
    kind: "target",
    line: entry.line,
    material: root.material,
    rate: root.demand,
    process: rootItem?.process ?? null,
    x: RAIL_TARGET_X,
    y: RAIL_STAGE_TOP,
  };
  if (rootItem) {
    links.unshift({
      id: `${root.id}:target-link`,
      kind: "target",
      material: root.material,
      rate: root.demand,
      fromX: RAIL_TARGET_X + RAIL_TARGET_WIDTH,
      fromY: RAIL_STAGE_TOP + RAIL_TARGET_HEIGHT / 2,
      toX: rootItem.x,
      toY: rootItem.y + RAIL_CARD_HEIGHT / 2,
    });
  }

  const byproducts = nodes.flatMap((item) => item.process.recipe.products.flatMap((product, productIndex) => {
    if (materialEquals(product, item.process.fulfills)) return [];
    const rate = expectedRate(product, item.process.cycles, item.process.productivityMultiplier);
    if (!(rate > 0.000001)) return [];
    return [{
      id: `${item.node.id}:byproduct:${productIndex}`,
      kind: "byproduct",
      line: entry.line,
      material: { type: product.type, name: product.name },
      rate,
      process: item.process,
      source: item,
      sourceY: item.y + RAIL_CARD_HEIGHT / 2,
    }];
  })).sort((left, right) => left.sourceY - right.sourceY || left.id.localeCompare(right.id));

  byproducts.forEach((output, index) => {
    output.x = RAIL_TARGET_X;
    output.y = RAIL_STAGE_TOP + (index + 1) * RAIL_ROW_GAP;
    links.push({
      id: `${output.id}:return`,
      kind: "byproduct",
      material: output.material,
      rate: output.rate,
      fromX: output.x + RAIL_TARGET_WIDTH,
      fromY: output.y + RAIL_TARGET_HEIGHT / 2,
      toX: output.source.x,
      toY: output.sourceY,
      laneIndex: index,
      laneCount: byproducts.length,
    });
  });

  return {
    nodes,
    links,
    outputs: [targetOutput, ...byproducts],
    width: Math.max(840, RAIL_RECIPE_X + maximumDepth * RAIL_COLUMN_GAP + RAIL_CARD_WIDTH + 80),
    height: Math.max(560, RAIL_STAGE_TOP + (Math.max(maximumRow, byproducts.length) + 1) * RAIL_ROW_GAP),
  };
}

function offsetRailLayout(layout, offsetY) {
  const move = (value) => value + offsetY;
  return {
    ...layout,
    nodes: layout.nodes.map((item) => ({ ...item, y: move(item.y) })),
    outputs: layout.outputs.map((output) => ({ ...output, y: move(output.y), sourceY: output.sourceY == null ? output.sourceY : move(output.sourceY) })),
    links: layout.links.map((link) => ({
      ...link,
      fromY: move(link.fromY),
      toY: move(link.toY),
      parentY: link.parentY == null ? link.parentY : move(link.parentY),
    })),
  };
}

function MaterialRailView({ entries, activeLineId, selectedNode, locale, nameOf, onSelectLine, onSelectNode, onReplaceProcess, onUpdateProcessConfig, onChooseTarget, t }) {
  const canvas = useMemo(() => {
    const graphs = [];
    const drafts = [];
    let cursorY = 0;
    let width = 840;

    entries.forEach((entry) => {
      if (entry.line.targets.length === 0) {
        drafts.push({ entry, y: cursorY + RAIL_STAGE_TOP });
        cursorY += RAIL_ROW_GAP;
        return;
      }

      (entry.result.bomRoots ?? []).forEach((root) => {
        if (!root.expansion) return;
        const layout = offsetRailLayout(createRailLayout(entry, root), cursorY);
        graphs.push({ entry, root, layout, transportLayers: groupTransportLayers(layout.links) });
        width = Math.max(width, layout.width);
        cursorY += layout.height + TRANSPORT_TILE_SIZE * 2;
      });
    });

    return { graphs, drafts, width, height: Math.max(560, cursorY || 560) };
  }, [entries]);

  return (
    <div
      className="block-view-scroll material-rail-view"
      data-testid="block-view-rail"
      data-scroll-axis="both"
      tabIndex="0"
      aria-label={t("materialRail")}
    >
      <div
        className="material-rail-stage"
        data-layout-mode="css-grid"
        data-supported-transport-topologies="single straight corner tee cross"
        data-transport-model="nesw-bitmask"
        data-line-count={entries.length}
        style={{
          "--rail-grid-columns": Math.ceil(canvas.width / TRANSPORT_TILE_SIZE),
          "--rail-grid-rows": Math.ceil(canvas.height / TRANSPORT_TILE_SIZE),
          "--rail-grid-size": `${TRANSPORT_TILE_SIZE}px`,
        }}
      >
        <div className="rail-output-column-label" style={gridCardPlacement(RAIL_TARGET_X, 0, RAIL_TARGET_WIDTH, TRANSPORT_TILE_SIZE)}>{t("outputColumn")}</div>
        {canvas.graphs.map(({ entry, root, layout, transportLayers }) => (
          <Fragment key={`${entry.line.id}:${root.id}`}>
            {transportLayers.independentLinks.map((link) => <TransportLink key={link.id} link={link} />)}
            {transportLayers.supplyBundles.map((bundle) => <TransportBundle key={bundle.id} {...bundle} />)}
            {layout.outputs.map((output) => <OutputAnchor key={output.id} output={output} nameOf={nameOf} onSelectNode={onSelectNode} t={t} />)}
            {layout.nodes.map((item) => (
              <div
                className={`recipe-rail-node ${selectedNode === item.process.id ? "is-selected" : ""}`}
                key={item.node.id}
                style={{ ...gridCardPlacement(item.x, item.y), "--branch-color": nodeColor(item.branchIndex, item.depth) }}
              >
                <RecipeStation
                  entry={entry}
                  item={item}
                  selectedNode={selectedNode}
                  nameOf={nameOf}
                  onSelectNode={onSelectNode}
                  onReplaceProcess={onReplaceProcess}
                  onUpdateProcessConfig={onUpdateProcessConfig}
                  t={t}
                />
              </div>
            ))}
          </Fragment>
        ))}
        {canvas.drafts.map(({ entry, y }) => (
          <div className="line-draft-panel material-rail-draft" key={entry.line.id} style={gridCardPlacement(RAIL_TARGET_X, y, 720, RAIL_TARGET_HEIGHT)}>
            <GameIcon type="item" name="blueprint-book" size={56} />
            <span><strong>{t("noTargetTitle")}</strong><small>{t("noTargetHint")}</small></span>
            <button type="button" onClick={() => onChooseTarget(entry.line)}>{t("openTargetSelector")}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function subtreeWeight(node) {
  const children = node.children ?? [];
  if (children.length === 0) return Math.max(1, Math.sqrt(Math.max(1, node.demand ?? 1)));
  return children.reduce((total, child) => total + subtreeWeight(child), 0);
}

function buildSunburst(root) {
  const arcs = [];
  const children = root?.expansion?.children ?? [];
  const maxDepth = Math.max(1, maxBomDepth(root?.expansion) - 1);
  const ringWidth = Math.max(22, Math.min(37, 178 / maxDepth));
  const innerStart = 78;

  const placeChildren = (items, start, end, depth, inheritedBranch) => {
    const total = items.reduce((sum, item) => sum + subtreeWeight(item), 0) || 1;
    let cursor = start;
    items.forEach((node, index) => {
      const span = (end - start) * (subtreeWeight(node) / total);
      const itemStart = cursor;
      const itemEnd = cursor + span;
      const branchIndex = depth === 0 ? index : inheritedBranch;
      arcs.push({
        node,
        depth,
        branchIndex,
        start: itemStart,
        end: itemEnd,
        inner: innerStart + depth * ringWidth,
        outer: innerStart + (depth + 1) * ringWidth - 3,
      });
      if (node.children?.length) placeChildren(node.children, itemStart, itemEnd, depth + 1, branchIndex);
      cursor = itemEnd;
    });
  };

  placeChildren(children, -Math.PI / 2, Math.PI * 1.5, 0, 0);
  return { arcs, ringWidth, maxDepth };
}

function RadialDisk({ entry, root, selectedNode, nameOf, onSelectNode, onReplaceProcess, t }) {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const layout = useMemo(() => buildSunburst(root), [root]);
  const processByNode = (node) => processFor(entry, node);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const size = 460;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, size, size);
    context.save();
    context.translate(size / 2, size / 2);
    layout.arcs.forEach((arc) => {
      const process = processByNode(arc.node);
      const active = hovered?.id === arc.node.id || (process && selectedNode === process.id);
      context.beginPath();
      context.arc(0, 0, arc.outer, arc.start + 0.006, arc.end - 0.006);
      context.arc(0, 0, arc.inner, arc.end - 0.006, arc.start + 0.006, true);
      context.closePath();
      context.fillStyle = nodeColor(arc.branchIndex, arc.depth);
      context.globalAlpha = active ? 1 : 0.78;
      context.fill();
      context.globalAlpha = 1;
      context.strokeStyle = active ? "#f5f1e8" : "#0c141b";
      context.lineWidth = active ? 2 : 1;
      context.stroke();
    });
    context.restore();
  }, [layout, hovered, selectedNode]);

  const findArc = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scale = 460 / rect.width;
    const x = (event.clientX - rect.left) * scale - 230;
    const y = (event.clientY - rect.top) * scale - 230;
    const radius = Math.hypot(x, y);
    let angle = Math.atan2(y, x);
    if (angle < -Math.PI / 2) angle += Math.PI * 2;
    return layout.arcs.slice().reverse().find((arc) => radius >= arc.inner && radius <= arc.outer && angle >= arc.start && angle <= arc.end) ?? null;
  };

  const handleMove = (event) => {
    const arc = findArc(event);
    setHovered(arc?.node ?? null);
    setTooltip(arc ? { x: event.nativeEvent.offsetX + 12, y: event.nativeEvent.offsetY + 12, node: arc.node } : null);
  };

  const selectedArcNode = hovered ?? layout.arcs.find((arc) => processByNode(arc.node)?.id === selectedNode)?.node ?? root.expansion;
  const selectedProcess = processByNode(selectedArcNode);

  return (
    <div className="radial-disk-layout">
      <div className="radial-disk-stage">
        <canvas
          ref={canvasRef}
          aria-label={t("dependencyRings")}
          onPointerMove={handleMove}
          onPointerLeave={() => { setHovered(null); setTooltip(null); }}
          onClick={(event) => {
            const arc = findArc(event);
            const process = processByNode(arc?.node);
            if (process) onSelectNode(entry.line, process.id);
          }}
        />
        <div className="radial-target-core">
          <GameIcon type={root.material.type} name={root.material.name} size={58} />
          <strong>{nameOf(root.material.type, root.material.name)}</strong>
          <em>{formatRate(root.demand)} / min</em>
          <small>{t("targetAnchor")}</small>
        </div>
        {tooltip && (
          <div className="radial-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            <GameIcon type={tooltip.node.material.type} name={tooltip.node.material.name} size={26} />
            <span><strong>{nameOf(tooltip.node.material.type, tooltip.node.material.name)}</strong><small>{formatRate(tooltip.node.demand)} / min · {instanceCode(tooltip.node)}</small></span>
          </div>
        )}
      </div>
      <aside className="radial-inspector">
        <span className="eyebrow">{t("instanceInspector")}</span>
        <div className="radial-inspector-material">
          <GameIcon type={selectedArcNode.material.type} name={selectedArcNode.material.name} size={48} />
          <span><strong>{nameOf(selectedArcNode.material.type, selectedArcNode.material.name)}</strong><small>{t("instanceLabel")} {instanceCode(selectedArcNode)}</small></span>
        </div>
        <dl>
          <div><dt>{t("branchDemand")}</dt><dd>{formatRate(selectedArcNode.demand)} / min</dd></div>
          <div><dt>{t("dependencyDepth")}</dt><dd>{instanceCode(selectedArcNode).split("·").length - 1}</dd></div>
          <div><dt>{t("inputBranches")}</dt><dd>{selectedArcNode.children?.length ?? 0}</dd></div>
        </dl>
        {selectedProcess ? (
          <div className="radial-recipe-card">
            <GameIcon type="recipe" name={selectedProcess.recipe.name} size={34} />
            <span><small>{t("producedBy")}</small><strong>{nameOf("recipe", selectedProcess.recipe.name)}</strong></span>
            <button type="button" onClick={() => onReplaceProcess(entry.line, selectedProcess, selectedArcNode)}>{t("replaceRecipe")}</button>
          </div>
        ) : <div className="radial-boundary-card">{t("boundaryFlow")} · {t("rawResource")}</div>}
        <p>{t("radialInstanceHint")}</p>
      </aside>
    </div>
  );
}

function RadialLineCard({ entry, lineIndex, active, selectedNode, locale, nameOf, onSelectLine, onSelectNode, onReplaceProcess, onChooseTarget, t }) {
  const roots = entry.result.bomRoots ?? [];
  const [activeRootId, setActiveRootId] = useState(roots[0]?.id ?? "");
  useEffect(() => setActiveRootId(roots[0]?.id ?? ""), [entry.line.id, roots.map((root) => root.id).join("|")]);
  const root = roots.find((candidate) => candidate.id === activeRootId) ?? roots[0];
  return (
    <section className={`radial-line-card ${active ? "is-active" : ""}`}>
      {roots.length > 1 && (
        <div className="radial-root-tabs is-floating">
          {roots.map((candidate, index) => (
            <button className={candidate.id === root?.id ? "is-active" : ""} type="button" key={candidate.id} onClick={() => setActiveRootId(candidate.id)}>
              <GameIcon type={candidate.material.type} name={candidate.material.name} size={22} />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      )}
      {entry.line.targets.length === 0 ? (
        <div className="line-draft-panel is-radial">
          <GameIcon type="item" name="blueprint-book" size={56} />
          <span><strong>{t("noTargetTitle")}</strong><small>{t("noTargetHint")}</small></span>
          <button type="button" onClick={() => onChooseTarget(entry.line)}>{t("openTargetSelector")}</button>
        </div>
      ) : root?.expansion ? (
        <RadialDisk entry={entry} root={root} selectedNode={selectedNode} nameOf={nameOf} onSelectNode={onSelectNode} onReplaceProcess={onReplaceProcess} t={t} />
      ) : (
        <div className="existing-output-root is-radial">
          <GameIcon type={root.material.type} name={root.material.name} size={48} />
          <span><small>{t("existingNetworkSupply")}</small><strong>{nameOf(root.material.type, root.material.name)}</strong></span>
          <em>{formatRate(root.demand)} / min</em>
        </div>
      )}
    </section>
  );
}

function DependencyRingsView(props) {
  return (
    <div className="block-view-scroll radial-block-view" data-testid="block-view-radial">
      {props.entries.map((entry, index) => (
        <RadialLineCard
          {...props}
          entry={entry}
          lineIndex={index}
          active={entry.line.id === props.activeLineId}
          key={entry.line.id}
        />
      ))}
    </div>
  );
}

const SANKEY_NODE_WIDTH = 154;
const SANKEY_NODE_BAR_WIDTH = 10;
const SANKEY_COLUMN_GAP = 210;
const SANKEY_SIBLING_GAP = 18;
const SANKEY_NODE_PADDING = 26;
const SANKEY_ROOT_FLOW_HEIGHT = 196;
const SANKEY_LOCAL_SINK_LENGTH = 32;
const SANKEY_FLOW_EPSILON = 0.000001;

function buildSankeyLayout(entry, root) {
  const nodes = [];
  let maximumDepth = 0;

  const createItem = (node, parent, depth, branchIndex) => {
    maximumDepth = Math.max(maximumDepth, depth);
    const process = processFor(entry, node);
    const localLoad = process ? Math.max(0, Number(process.exactMachines) || 0) * 60 : 0;
    const item = {
      node,
      process,
      parent,
      depth,
      branchIndex,
      children: [],
      x: 0,
      y: 0,
      localLoad,
      childLoad: 0,
      totalLoad: 0,
      flowWidth: 0,
      localWidth: 0,
      displayBarHeight: 10,
      segments: [],
      subtreeHeight: 0,
    };
    nodes.push(item);
    item.children = (node.children ?? []).map((child, index) => createItem(
      child,
      item,
      depth + 1,
      depth === 0 ? index : branchIndex,
    ));
    return item;
  };

  const rootItem = createItem(root.expansion, null, 0, 0);

  const sumWorkload = (item) => {
    item.children.forEach(sumWorkload);
    item.childLoad = item.children.reduce((sum, child) => sum + child.totalLoad, 0);
    item.totalLoad = item.localLoad + item.childLoad;
    item.conservationError = item.totalLoad - item.localLoad - item.childLoad;
  };
  sumWorkload(rootItem);

  const scale = rootItem.totalLoad > SANKEY_FLOW_EPSILON
    ? SANKEY_ROOT_FLOW_HEIGHT / rootItem.totalLoad
    : 0;

  const measure = (item) => {
    item.children.forEach(measure);
    item.flowWidth = item.totalLoad * scale;
    item.localWidth = item.localLoad * scale;
    item.displayBarHeight = item.totalLoad > SANKEY_FLOW_EPSILON ? item.flowWidth : 10;
    const childHeight = item.children.length > 0
      ? item.children.reduce((sum, child) => sum + child.subtreeHeight, 0) + (item.children.length - 1) * SANKEY_SIBLING_GAP
      : 0;
    item.subtreeHeight = Math.max(item.displayBarHeight + SANKEY_NODE_PADDING, childHeight, 42);
  };
  measure(rootItem);

  const place = (item, top) => {
    item.x = 26 + item.depth * SANKEY_COLUMN_GAP;
    item.y = top + item.subtreeHeight / 2;
    if (item.children.length === 0) return;
    const childrenHeight = item.children.reduce((sum, child) => sum + child.subtreeHeight, 0)
      + (item.children.length - 1) * SANKEY_SIBLING_GAP;
    let childTop = top + (item.subtreeHeight - childrenHeight) / 2;
    item.children.forEach((child) => {
      place(child, childTop);
      childTop += child.subtreeHeight + SANKEY_SIBLING_GAP;
    });
  };
  place(rootItem, 66);

  const links = [];
  const guides = [];
  const localSinks = [];
  nodes.forEach((parent) => {
    const flowingChildren = parent.children.filter((child) => child.totalLoad > SANKEY_FLOW_EPSILON);
    const barTop = parent.y - parent.flowWidth / 2;

    let insertionIndex = 0;
    if (parent.localWidth > SANKEY_FLOW_EPSILON) {
      let cumulativeWidth = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index <= flowingChildren.length; index += 1) {
        const localCenter = barTop + cumulativeWidth + parent.localWidth / 2;
        const distance = Math.abs(localCenter - parent.y);
        if (distance < closestDistance) {
          closestDistance = distance;
          insertionIndex = index;
        }
        cumulativeWidth += flowingChildren[index]?.flowWidth ?? 0;
      }
    }

    let sourceTop = barTop;
    const appendLocalSink = () => {
      if (parent.localWidth <= SANKEY_FLOW_EPSILON) return;
      const localSink = {
        parent,
        sourceTop,
        sourceBottom: sourceTop + parent.localWidth,
        width: parent.localWidth,
      };
      localSinks.push(localSink);
      parent.segments.push({
        kind: "local",
        top: sourceTop - barTop,
        height: parent.localWidth,
      });
      parent.localSlot = localSink;
      sourceTop += parent.localWidth;
    };

    flowingChildren.forEach((child, index) => {
      if (index === insertionIndex) appendLocalSink();
      links.push({
        parent,
        child,
        branchIndex: child.branchIndex,
        width: child.flowWidth,
        sourceTop,
        sourceBottom: sourceTop + child.flowWidth,
        targetTop: child.y - child.flowWidth / 2,
        targetBottom: child.y + child.flowWidth / 2,
      });
      parent.segments.push({
        kind: "flow",
        child,
        top: sourceTop - barTop,
        height: child.flowWidth,
      });
      sourceTop += child.flowWidth;
    });
    if (insertionIndex === flowingChildren.length) appendLocalSink();

    parent.children
      .filter((child) => child.totalLoad <= SANKEY_FLOW_EPSILON)
      .forEach((child) => {
        guides.push({
          parent,
          child,
          branchIndex: child.branchIndex,
          sourceY: parent.localSlot
            ? (parent.localSlot.sourceTop + parent.localSlot.sourceBottom) / 2
            : parent.y,
          targetY: child.y,
        });
      });
  });

  return {
    nodes,
    links,
    guides,
    localSinks,
    rootItem,
    maximumDepth,
    scale,
    width: Math.max(640, (maximumDepth + 1) * SANKEY_COLUMN_GAP + SANKEY_NODE_WIDTH + 46),
    height: Math.max(520, rootItem.subtreeHeight + 132),
  };
}

function SankeyGraph({ entry, root, nameOf, onSelectNode, onReplaceProcess, t }) {
  const layout = useMemo(() => buildSankeyLayout(entry, root), [entry, root]);
  const canvasRef = useRef(null);
  const scrollerRef = useRef(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState(null);
  useEffect(() => setSelectedInstanceId(null), [root.id]);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = 0;
    scroller.scrollTop = Math.max(0, layout.rootItem.y - scroller.clientHeight / 2);
  }, [layout]);
  const selectedItem = layout.nodes.find((item) => item.node.id === selectedInstanceId) ?? null;
  const selectedInstance = selectedItem?.node ?? null;
  const selectedProcess = selectedItem?.process ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    canvas.width = layout.width * ratio;
    canvas.height = layout.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, layout.width, layout.height);

    layout.guides.forEach((guide) => {
      const sourceX = guide.parent.x + SANKEY_NODE_BAR_WIDTH + SANKEY_LOCAL_SINK_LENGTH;
      const targetX = guide.child.x;
      const controlX = sourceX + (targetX - sourceX) * 0.52;
      context.beginPath();
      context.moveTo(sourceX, guide.sourceY);
      context.bezierCurveTo(controlX, guide.sourceY, controlX, guide.targetY, targetX, guide.targetY);
      context.setLineDash([4, 5]);
      context.strokeStyle = nodeColor(guide.branchIndex, guide.child.depth);
      context.globalAlpha = 0.38;
      context.lineWidth = 1;
      context.stroke();
      context.setLineDash([]);
      context.globalAlpha = 1;
    });

    layout.links.forEach((link) => {
      const sourceX = link.parent.x + SANKEY_NODE_BAR_WIDTH;
      const targetX = link.child.x;
      const controlX = sourceX + (targetX - sourceX) * 0.52;
      const active = selectedInstanceId === link.child.node.id || selectedInstanceId === link.parent.node.id;
      context.beginPath();
      context.moveTo(sourceX, link.sourceTop);
      context.bezierCurveTo(controlX, link.sourceTop, controlX, link.targetTop, targetX, link.targetTop);
      context.lineTo(targetX, link.targetBottom);
      context.bezierCurveTo(controlX, link.targetBottom, controlX, link.sourceBottom, sourceX, link.sourceBottom);
      context.closePath();
      context.fillStyle = nodeColor(link.branchIndex, link.child.depth);
      context.globalAlpha = active ? 0.92 : 0.68;
      context.fill();
      context.globalAlpha = 1;
    });

    layout.localSinks.forEach((sink) => {
      const sourceX = sink.parent.x + SANKEY_NODE_BAR_WIDTH;
      const sinkX = sourceX + SANKEY_LOCAL_SINK_LENGTH;
      const active = selectedInstanceId === sink.parent.node.id;
      context.fillStyle = "#d99a42";
      context.globalAlpha = active ? 0.95 : 0.72;
      context.fillRect(sourceX, sink.sourceTop, SANKEY_LOCAL_SINK_LENGTH, sink.width);
      context.globalAlpha = 1;
      context.fillStyle = "#f0b65d";
      context.fillRect(sinkX - 2, sink.sourceTop, 2, sink.width);
    });
  }, [layout, selectedInstanceId]);

  return (
    <>
      <div className="sankey-method-strip">
        <strong>{t("sankeyEquation")}</strong>
        <span><i className="is-flow" />{t("sankeyMetric")}</span>
        <span><i className="is-local" />{t("sankeyLocalLegend")}</span>
        <span><i className="is-boundary" />{t("sankeyBoundaryLegend")}</span>
      </div>
      <div className="sankey-graph-layout">
        <div className="sankey-scroll" ref={scrollerRef}>
          <div className="sankey-stage" style={{ width: layout.width, height: layout.height }}>
            <canvas ref={canvasRef} style={{ width: layout.width, height: layout.height }} aria-label={t("flowSankey")} />
            {Array.from({ length: layout.maximumDepth + 1 }, (_, depth) => (
              <span className="sankey-depth-label" key={depth} style={{ left: 26 + depth * SANKEY_COLUMN_GAP }}>
                D{depth} · {depth === 0 ? t("deliveryFlow") : t("dependencyDepth")}
              </span>
            ))}
            {layout.nodes.map((item) => {
              const process = item.process;
              const active = item.node.id === selectedInstanceId;
              const nodeHeight = Math.max(36, item.displayBarHeight);
              const childSegmentLoad = item.children.reduce((sum, child) => sum + child.totalLoad, 0);
              return (
                <button
                  className={`sankey-node ${item.depth === 0 ? "is-target" : ""} ${item.node.kind === "boundary" ? "is-boundary" : ""} ${active ? "is-active" : ""}`}
                  type="button"
                  key={item.node.id}
                  data-total-load={item.totalLoad.toFixed(6)}
                  data-local-load={item.localLoad.toFixed(6)}
                  data-child-load={childSegmentLoad.toFixed(6)}
                  data-conservation-error={item.conservationError.toFixed(9)}
                  style={{
                    left: item.x,
                    top: item.y - nodeHeight / 2,
                    height: nodeHeight,
                    "--bar-height": `${item.displayBarHeight}px`,
                    "--node-color": item.depth === 0 ? "#58c996" : nodeColor(item.branchIndex, item.depth),
                  }}
                  onClick={() => {
                    setSelectedInstanceId((current) => current === item.node.id ? null : item.node.id);
                    if (process) onSelectNode(entry.line, process.id);
                  }}
                >
                  <i className="sankey-node-bar" aria-hidden="true">
                    {item.segments.map((segment, index) => (
                      <b
                        className={segment.kind === "local" ? "sankey-node-local-segment" : "sankey-node-flow-segment"}
                        key={`${segment.kind}:${segment.child?.node.id ?? index}`}
                        style={{
                          top: segment.top,
                          height: segment.height,
                          "--segment-color": segment.kind === "local"
                            ? "#d99a42"
                            : nodeColor(segment.child.branchIndex, segment.child.depth),
                        }}
                      />
                    ))}
                  </i>
                  <span>
                    <strong>{nameOf(item.node.material.type, item.node.material.name)}</strong>
                    <small>{formatRate(item.node.demand)} / min{item.node.kind === "boundary" ? ` · ${t("boundaryShort")}` : ""}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {selectedItem && (
          <aside className="sankey-inspector" data-testid="sankey-inspector">
            <span className="eyebrow">{t("flowInspector")}</span>
            <div className="sankey-inspector-material">
              <GameIcon type={selectedInstance.material.type} name={selectedInstance.material.name} size={38} />
              <span><strong>{nameOf(selectedInstance.material.type, selectedInstance.material.name)}</strong><small>{t("instanceLabel")} {instanceCode(selectedInstance)}</small></span>
            </div>
            <dl>
              <div><dt>{t("materialRate")}</dt><dd>{formatRate(selectedInstance.demand)} / min</dd></div>
              <div><dt>{t("flowWidth")}</dt><dd>{formatRate(selectedItem.totalLoad)} {t("machineSecondsPerMinute")}</dd></div>
              <div><dt>{t("localWorkload")}</dt><dd>{formatRate(selectedItem.localLoad)} {t("machineSecondsPerMinute")}</dd></div>
              <div><dt>{t("upstreamWorkload")}</dt><dd>{formatRate(selectedItem.childLoad)} {t("machineSecondsPerMinute")}</dd></div>
              <div><dt>{t("conservationCheck")}</dt><dd className="is-conserved">{t("conserved")}</dd></div>
              <div><dt>{t("inputBranches")}</dt><dd>{selectedInstance.children?.length ?? 0}</dd></div>
            </dl>
            {selectedProcess ? (
              <button className="sankey-recipe-action" type="button" onClick={() => onReplaceProcess(entry.line, selectedProcess, selectedInstance)}>
                <GameIcon type="recipe" name={selectedProcess.recipe.name} size={28} />
                <span><small>{t("producedBy")}</small><strong>{nameOf("recipe", selectedProcess.recipe.name)}</strong></span>
                <em>{t("replaceRecipe")}</em>
              </button>
            ) : <div className="radial-boundary-card">{t("boundaryExcluded")}</div>}
          </aside>
        )}
      </div>
    </>
  );
}

function FlowSankeyView({ entries, activeLineId, selectedNode, locale, nameOf, onSelectLine, onSelectNode, onReplaceProcess, onChooseTarget, t }) {
  return (
    <div className="block-view-scroll sankey-block-view" data-testid="block-view-sankey">
      {entries.map((entry, lineIndex) => (
        <section className={`sankey-line-lane ${entry.line.id === activeLineId ? "is-active" : ""}`} key={entry.line.id}>
          <header>
            <LineIdentity entry={entry} lineIndex={lineIndex} active={entry.line.id === activeLineId} locale={locale} nameOf={nameOf} onSelectLine={onSelectLine} t={t} />
            <span>{t("sankeyLineRule")}</span>
          </header>
          {entry.line.targets.length === 0 ? (
            <div className="line-draft-panel">
              <GameIcon type="item" name="blueprint-book" size={56} />
              <span><strong>{t("noTargetTitle")}</strong><small>{t("noTargetHint")}</small></span>
              <button type="button" onClick={() => onChooseTarget(entry.line)}>{t("openTargetSelector")}</button>
            </div>
          ) : (
            <div className="sankey-root-list">
              {(entry.result.bomRoots ?? []).map((root) => root.expansion ? (
                <section className="sankey-root" key={root.id}>
                  <div className="line-root-label">
                    <GameIcon type={root.material.type} name={root.material.name} size={28} />
                    <span><small>{t("deliveryFlow")}</small><strong>{nameOf(root.material.type, root.material.name)}</strong></span>
                    <em>≥ {formatRate(root.demand)} / min</em>
                  </div>
                  <SankeyGraph entry={entry} root={root} selectedNode={selectedNode} nameOf={nameOf} onSelectNode={onSelectNode} onReplaceProcess={onReplaceProcess} t={t} />
                </section>
              ) : (
                <div className="existing-output-root" key={root.id}>
                  <GameIcon type={root.material.type} name={root.material.name} size={30} />
                  <span><small>{t("existingNetworkSupply")}</small><strong>{nameOf(root.material.type, root.material.name)}</strong></span>
                  <em>{formatRate(root.demand)} / min</em>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function ColumnMaterialRow({ entry, node, selected, nameOf, onSelect, t }) {
  const process = processFor(entry, node);
  return (
    <button className={`finder-material-row ${selected ? "is-selected" : ""}`} type="button" onClick={onSelect}>
      <GameIcon type={node.material.type} name={node.material.name} size={30} />
      <span><strong>{nameOf(node.material.type, node.material.name)}</strong><small>{formatRate(node.demand)} / min · {instanceCode(node)}</small></span>
      <em>{node.children?.length ? `${node.children.length} ${t("inputs")}` : t("boundaryFlow")}</em>
      {process && <GameIcon type="recipe" name={process.recipe.name} size={20} className="finder-row-recipe" />}
    </button>
  );
}

function FinderColumnsView({ entries, activeLineId, selectedNode, locale, nameOf, onSelectLine, onSelectNode, onReplaceProcess, onChooseTarget, t }) {
  const activeEntry = entries.find((entry) => entry.line.id === activeLineId) ?? entries[0];
  const roots = activeEntry?.result.bomRoots ?? [];
  const activeRoot = roots[0];
  const [path, setPath] = useState(() => defaultNodePath(activeRoot));

  useEffect(() => {
    const nextRoots = activeEntry?.result.bomRoots ?? [];
    const nextRoot = nextRoots[0];
    setPath(defaultNodePath(nextRoot));
  }, [activeEntry?.line.id]);

  const lineIndex = useMemo(() => activeEntry ? indexLine(activeEntry) : { nodes: new Map() }, [activeEntry]);
  const pathNodes = path.map((id) => lineIndex.nodes.get(id)).filter(Boolean);
  const selectedNodeInstance = pathNodes[pathNodes.length - 1] ?? activeRoot?.expansion ?? null;
  const selectedProcess = processFor(activeEntry, selectedNodeInstance);

  const selectNodeAtLevel = (node, level) => {
    setPath([...path.slice(0, level), node.id]);
    const process = processFor(activeEntry, node);
    if (process) onSelectNode(activeEntry.line, process.id);
  };

  const dependencyColumns = [];
  if (activeRoot?.expansion) {
    let parent = activeRoot.expansion;
    let level = 1;
    while (parent?.children?.length) {
      dependencyColumns.push({ parent, items: parent.children, level });
      const selectedId = path[level];
      parent = parent.children.find((child) => child.id === selectedId) ?? null;
      level += 1;
    }
  }

  return (
    <div className="finder-columns-shell" data-testid="block-view-columns">
      <div className="finder-pathbar">
        <span>{localeText(activeEntry?.line.title, locale)}</span>
        {pathNodes.map((node) => <strong key={node.id}>{nameOf(node.material.type, node.material.name)}</strong>)}
      </div>
      <div className="finder-columns-scroll">
        <section className="finder-column is-lines">
          <header><span>01</span><strong>{t("lineColumn")}</strong><em>{entries.length}</em></header>
          <div className="finder-column-list">
            {entries.map((entry, index) => (
              <LineIdentity key={entry.line.id} entry={entry} lineIndex={index} active={entry.line.id === activeLineId} locale={locale} nameOf={nameOf} onSelectLine={onSelectLine} t={t} />
            ))}
          </div>
        </section>

        {activeEntry?.line.targets.length === 0 && (
          <section className="finder-column is-targets">
            <header><span>02</span><strong>{t("targetColumn")}</strong><em>0</em></header>
            <div className="finder-column-list">
              <button className="finder-create-target" type="button" onClick={() => onChooseTarget(activeEntry.line)}>
                <GameIcon type="item" name="blueprint-book" size={38} />
                <span><strong>{t("noTargetTitle")}</strong><small>{t("openTargetSelector")}</small></span>
              </button>
            </div>
          </section>
        )}

        {activeRoot?.expansion && (
          <section className="finder-column is-root-process">
            <header><span>02</span><strong>{t("rootNode")}</strong><em>1</em></header>
            <div className="finder-column-list">
              <ColumnMaterialRow entry={activeEntry} node={activeRoot.expansion} selected nameOf={nameOf} onSelect={() => selectNodeAtLevel(activeRoot.expansion, 0)} t={t} />
            </div>
          </section>
        )}

        {dependencyColumns.map((column, columnIndex) => (
          <section className="finder-column" key={column.parent.id}>
            <header><span>{String(columnIndex + 3).padStart(2, "0")}</span><strong>{nameOf(column.parent.material.type, column.parent.material.name)} · {t("inputs")}</strong><em>{column.items.length}</em></header>
            <div className="finder-column-list">
              {column.items.map((node) => (
                <ColumnMaterialRow
                  key={node.id}
                  entry={activeEntry}
                  node={node}
                  selected={path[column.level] === node.id}
                  nameOf={nameOf}
                  onSelect={() => selectNodeAtLevel(node, column.level)}
                  t={t}
                />
              ))}
            </div>
          </section>
        ))}

        {selectedNodeInstance && (
          <aside className="finder-preview-column">
            <header><span>{String(dependencyColumns.length + 4).padStart(2, "0")}</span><strong>{t("instanceInspector")}</strong></header>
            <div className="finder-preview-card">
              <GameIcon type={selectedNodeInstance.material.type} name={selectedNodeInstance.material.name} size={72} />
              <span className="finder-preview-instance">{t("instanceLabel")} {instanceCode(selectedNodeInstance)}</span>
              <h3>{nameOf(selectedNodeInstance.material.type, selectedNodeInstance.material.name)}</h3>
              <strong>{formatRate(selectedNodeInstance.demand)} / min</strong>
              <dl>
                <div><dt>{t("inputBranches")}</dt><dd>{selectedNodeInstance.children?.length ?? 0}</dd></div>
                <div><dt>{t("boundaryFlow")}</dt><dd>{selectedNodeInstance.kind === "boundary" ? t("rawResource") : "—"}</dd></div>
              </dl>
              {selectedProcess && (
                <button type="button" onClick={() => onReplaceProcess(activeEntry.line, selectedProcess, selectedNodeInstance)}>
                  <GameIcon type="recipe" name={selectedProcess.recipe.name} size={26} />
                  <span><small>{t("producedBy")}</small><strong>{nameOf("recipe", selectedProcess.recipe.name)}</strong></span>
                  <em>{t("replaceRecipe")}</em>
                </button>
              )}
              <p>{t("sameMaterialIndependent")}</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export function BlockObservationCanvas({
  entries,
  activeLine,
  selectedNode,
  locale,
  nameOf,
  onSelectLine,
  onSelectNode,
  onReplaceProcess,
  onUpdateProcessConfig,
  onChooseTarget,
  onAddLine,
  t,
}) {
  const [viewMode, setViewMode] = useState("rail");
  const targetCount = entries.reduce((total, entry) => total + entry.line.targets.length, 0);
  const instanceCount = entries.reduce((total, entry) => total + (entry.result.bomRoots ?? []).reduce((subtotal, root) => subtotal + countBomNodes(root.expansion), 0), 0);
  const maximumDepth = Math.max(0, ...entries.flatMap((entry) => (entry.result.bomRoots ?? []).map((root) => maxBomDepth(root.expansion))));
  const allLinesAreDrafts = entries.every((entry) => entry.line.targets.length === 0);
  const sharedProps = {
    entries,
    activeLineId: activeLine.id,
    selectedNode,
    locale,
    nameOf,
    onSelectLine,
    onSelectNode,
    onReplaceProcess,
    onUpdateProcessConfig,
    onChooseTarget,
    t,
  };

  return (
    <section className="canvas-shell block-observation-canvas">
      <div className="block-canvas-toolbar">
        <div className="block-view-heading">
          <span className="eyebrow">PRODUCTIONBLOCK · {t("blockViews")}</span>
          <strong>{t("blockViewHint")}</strong>
        </div>
        <div className="block-view-switch" role="tablist" aria-label={t("blockViews")}>
          <button className={viewMode === "rail" ? "is-active" : ""} type="button" role="tab" aria-label={t("materialRail")} data-tooltip={t("materialRail")} data-testid="view-rail" onClick={() => setViewMode("rail")}>
            <img src={materialRailViewIcon} alt="" />
          </button>
          <button className={viewMode === "radial" ? "is-active" : ""} type="button" role="tab" aria-label={t("dependencyRings")} data-tooltip={t("dependencyRings")} data-testid="view-radial" onClick={() => setViewMode("radial")}>
            <img src={dependencyRingsViewIcon} alt="" />
          </button>
          <button className={viewMode === "columns" ? "is-active" : ""} type="button" role="tab" aria-label={t("finderColumns")} data-tooltip={t("finderColumns")} data-testid="view-columns" onClick={() => setViewMode("columns")}>
            <img src={finderColumnsViewIcon} alt="" />
          </button>
          <button className={viewMode === "sankey" ? "is-active" : ""} type="button" role="tab" aria-label={t("flowSankey")} data-tooltip={t("flowSankey")} data-testid="view-sankey" onClick={() => setViewMode("sankey")}>
            <img src={flowSankeyViewIcon} alt="" />
          </button>
        </div>
        <button className="block-add-line" type="button" onClick={onAddLine}>{t("addRootLine")}</button>
      </div>

      <div className="block-view-summary">
        <span><small>{t("rootDomains")}</small><strong>{entries.length}</strong></span>
        <span><small>{t("targetsCount")}</small><strong>{targetCount}</strong></span>
        <span><small>{t("instances")}</small><strong>{instanceCount}</strong></span>
        <span><small>{t("dependencyDepth")}</small><strong>{maximumDepth}</strong></span>
      </div>

      <div className="block-view-stage">
        {viewMode === "rail" && allLinesAreDrafts && (
          <div className="line-draft-panel is-block-draft">
            <GameIcon type="item" name="blueprint-book" size={56} />
            <span><strong>{t("noTargetTitle")}</strong><small>{t("noTargetHint")}</small></span>
            <button type="button" onClick={() => onChooseTarget(activeLine)}>{t("openTargetSelector")}</button>
          </div>
        )}
        {viewMode === "rail" && !allLinesAreDrafts && <MaterialRailView {...sharedProps} />}
        {viewMode === "radial" && <DependencyRingsView {...sharedProps} />}
        {viewMode === "columns" && <FinderColumnsView {...sharedProps} />}
        {viewMode === "sankey" && <FlowSankeyView {...sharedProps} />}
      </div>
    </section>
  );
}
