# Figma `use_figma` 种子脚本

适用文件：

- `https://www.figma.com/design/bxdg1Xn8h8siDOFW4m4IwO/Untitled?node-id=0-1`

用途：

- 从空白 Figma 文件开始，建立页面结构
- 搭出首版 `Planner / Graph View` 原型骨架

说明：

- 这些脚本是为 `use_figma` 设计的分步调用稿
- 每一段都应单独运行
- 如果会话里真的暴露了 `use_figma`，优先按这个顺序执行

## Step 1: 创建页面结构

```js
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Medium" });
await figma.loadFontAsync({ family: "JetBrains Mono", style: "Medium" });
await figma.loadFontAsync({ family: "Space Grotesk", style: "SemiBold" });

const existingPages = figma.root.children.map((p) => p.name);
const pageNames = ["Cover", "Foundations", "Components", "Prototype / Desktop"];
const createdPageIds = [];

for (const name of pageNames) {
  let page = figma.root.children.find((p) => p.name === name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
    createdPageIds.push(page.id);
  }
}

return {
  createdPageIds,
  pageNames: figma.root.children.map((p) => p.name),
};
```

## Step 2: 创建 Cover

```js
const page = figma.root.children.find((p) => p.name === "Cover");
await figma.setCurrentPageAsync(page);

await figma.loadFontAsync({ family: "Space Grotesk", style: "SemiBold" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "JetBrains Mono", style: "Medium" });

const frame = figma.createFrame();
frame.name = "Faculator Cover";
frame.resize(1440, 1024);
frame.x = 200;
frame.y = 120;
frame.layoutMode = "VERTICAL";
frame.primaryAxisSizingMode = "AUTO";
frame.counterAxisSizingMode = "FIXED";
frame.paddingTop = 96;
frame.paddingRight = 96;
frame.paddingBottom = 96;
frame.paddingLeft = 96;
frame.itemSpacing = 24;
frame.fills = [{ type: "SOLID", color: { r: 14/255, g: 20/255, b: 24/255 } }];

const eyebrow = figma.createText();
eyebrow.characters = "Factorio 2.0 / Space Age";
eyebrow.fontName = { family: "JetBrains Mono", style: "Medium" };
eyebrow.fontSize = 14;
eyebrow.fills = [{ type: "SOLID", color: { r: 126/255, g: 215/255, b: 193/255 } }];

const title = figma.createText();
title.characters = "Faculator";
title.fontName = { family: "Space Grotesk", style: "SemiBold" };
title.fontSize = 52;
title.fills = [{ type: "SOLID", color: { r: 241/255, g: 245/255, b: 242/255 } }];

const subtitle = figma.createText();
subtitle.characters = "面向品质系统的产线量化与规划工作台";
subtitle.fontName = { family: "IBM Plex Sans", style: "Regular" };
subtitle.fontSize = 20;
subtitle.fills = [{ type: "SOLID", color: { r: 170/255, g: 184/255, b: 182/255 } }];

frame.appendChild(eyebrow);
frame.appendChild(title);
frame.appendChild(subtitle);
page.appendChild(frame);

return {
  createdNodeIds: [frame.id, eyebrow.id, title.id, subtitle.id],
};
```

## Step 3: 创建 Foundations 色板

```js
const page = figma.root.children.find((p) => p.name === "Foundations");
await figma.setCurrentPageAsync(page);

await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Medium" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });

const colors = [
  ["bg/base", "0E1418"],
  ["bg/elevated", "162028"],
  ["bg/panel", "1D2A33"],
  ["bg/grid", "243742"],
  ["text/primary", "F1F5F2"],
  ["text/secondary", "AAB8B6"],
  ["text/muted", "6E8483"],
  ["accent/flow", "7ED7C1"],
  ["accent/warn", "F5A65B"],
  ["accent/alert", "EF6B62"],
  ["accent/info", "7CB8F6"],
  ["quality/normal", "8C9AA5"],
  ["quality/uncommon", "67C587"],
  ["quality/rare", "53A6FF"],
  ["quality/epic", "B278FF"],
  ["quality/legendary", "F3C75F"],
];

const wrapper = figma.createFrame();
wrapper.name = "Color Foundations";
wrapper.resize(1600, 900);
wrapper.x = 200;
wrapper.y = 120;
wrapper.layoutMode = "VERTICAL";
wrapper.counterAxisSizingMode = "AUTO";
wrapper.primaryAxisSizingMode = "AUTO";
wrapper.paddingTop = 40;
wrapper.paddingRight = 40;
wrapper.paddingBottom = 40;
wrapper.paddingLeft = 40;
wrapper.itemSpacing = 24;
wrapper.fills = [{ type: "SOLID", color: { r: 14/255, g: 20/255, b: 24/255 } }];

const title = figma.createText();
title.characters = "Foundations / Color Tokens";
title.fontName = { family: "IBM Plex Sans", style: "Medium" };
title.fontSize = 28;
title.fills = [{ type: "SOLID", color: { r: 241/255, g: 245/255, b: 242/255 } }];
wrapper.appendChild(title);

const grid = figma.createFrame();
grid.name = "Color Grid";
grid.layoutMode = "HORIZONTAL";
grid.layoutWrap = "WRAP";
grid.counterAxisSizingMode = "AUTO";
grid.primaryAxisSizingMode = "AUTO";
grid.itemSpacing = 16;
grid.counterAxisSpacing = 16;
grid.fills = [];
wrapper.appendChild(grid);

const createdNodeIds = [wrapper.id, title.id, grid.id];

function hexToRgb(hex) {
  const n = parseInt(hex, 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

for (const [name, hex] of colors) {
  const card = figma.createFrame();
  card.name = name;
  card.resize(220, 120);
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO";
  card.counterAxisSizingMode = "FIXED";
  card.paddingTop = 12;
  card.paddingRight = 12;
  card.paddingBottom = 12;
  card.paddingLeft = 12;
  card.itemSpacing = 8;
  card.cornerRadius = 12;
  card.strokes = [{ type: "SOLID", color: { r: 36/255, g: 55/255, b: 66/255 } }];
  card.strokeWeight = 1;
  card.fills = [{ type: "SOLID", color: hexToRgb(hex) }];

  const nameText = figma.createText();
  nameText.characters = name;
  nameText.fontName = { family: "IBM Plex Sans", style: "Medium" };
  nameText.fontSize = 12;
  nameText.fills = [{ type: "SOLID", color: { r: 241/255, g: 245/255, b: 242/255 } }];

  const hexText = figma.createText();
  hexText.characters = `#${hex}`;
  hexText.fontName = { family: "IBM Plex Sans", style: "Regular" };
  hexText.fontSize = 12;
  hexText.fills = [{ type: "SOLID", color: { r: 241/255, g: 245/255, b: 242/255 } }];

  card.appendChild(nameText);
  card.appendChild(hexText);
  grid.appendChild(card);
  createdNodeIds.push(card.id, nameText.id, hexText.id);
}

page.appendChild(wrapper);

return { createdNodeIds };
```

## Step 4: 创建 `Planner / Graph View`

```js
const page = figma.root.children.find((p) => p.name === "Prototype / Desktop");
await figma.setCurrentPageAsync(page);

await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Medium" });
await figma.loadFontAsync({ family: "JetBrains Mono", style: "Medium" });
await figma.loadFontAsync({ family: "Space Grotesk", style: "SemiBold" });

function solid(hex) {
  const n = parseInt(hex, 16);
  return [{
    type: "SOLID",
    color: {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
    },
  }];
}

function makeLabel(text, font, size, hex) {
  const node = figma.createText();
  node.characters = text;
  node.fontName = font;
  node.fontSize = size;
  node.fills = solid(hex);
  return node;
}

const frame = figma.createFrame();
frame.name = "Planner / Graph View";
frame.resize(1440, 1024);
frame.x = 200;
frame.y = 120;
frame.fills = solid("0E1418");
frame.clipsContent = true;

const topbar = figma.createFrame();
topbar.name = "Top Bar";
topbar.resize(1440, 72);
topbar.x = 0;
topbar.y = 0;
topbar.fills = solid("162028");

const sidebar = figma.createFrame();
sidebar.name = "Sidebar / Recipe Library";
sidebar.resize(280, 864);
sidebar.x = 0;
sidebar.y = 72;
sidebar.fills = solid("162028");

const inspector = figma.createFrame();
inspector.name = "Panel / Inspector";
inspector.resize(360, 864);
inspector.x = 1080;
inspector.y = 72;
inspector.fills = solid("1D2A33");

const canvas = figma.createFrame();
canvas.name = "Graph Canvas";
canvas.resize(800, 864);
canvas.x = 280;
canvas.y = 72;
canvas.fills = solid("0E1418");

const summary = figma.createFrame();
summary.name = "Bottom Summary";
summary.resize(1440, 88);
summary.x = 0;
summary.y = 936;
summary.fills = solid("162028");

const topTitle = makeLabel("Legendary Blue Circuit", { family: "Space Grotesk", style: "SemiBold" }, 24, "F1F5F2");
topTitle.x = 24;
topTitle.y = 22;

const topMeta = makeLabel("Target: Processing Unit 120/min", { family: "JetBrains Mono", style: "Medium" }, 13, "7ED7C1");
topMeta.x = 320;
topMeta.y = 28;

topbar.appendChild(topTitle);
topbar.appendChild(topMeta);

const sideTitle = makeLabel("Recipe Library", { family: "IBM Plex Sans", style: "Medium" }, 16, "F1F5F2");
sideTitle.x = 20;
sideTitle.y = 18;
sidebar.appendChild(sideTitle);

const sideItems = [
  "Processing Unit",
  "Advanced Circuit",
  "Electronic Circuit",
  "Copper Cable",
  "Recycler",
  "EM Plant",
];

const createdNodeIds = [frame.id, topbar.id, sidebar.id, inspector.id, canvas.id, summary.id, topTitle.id, topMeta.id, sideTitle.id];

sideItems.forEach((item, i) => {
  const row = figma.createFrame();
  row.name = `Recipe / ${item}`;
  row.resize(240, 44);
  row.x = 20;
  row.y = 56 + i * 52;
  row.cornerRadius = 10;
  row.fills = solid("1D2A33");

  const label = makeLabel(item, { family: "IBM Plex Sans", style: "Regular" }, 13, "AAB8B6");
  label.x = 12;
  label.y = 14;
  row.appendChild(label);
  sidebar.appendChild(row);
  createdNodeIds.push(row.id, label.id);
});

function createProdNode(name, quality, throughput, machines, x, y, accentHex) {
  const card = figma.createFrame();
  card.name = `Node / ${name}`;
  card.resize(220, 124);
  card.x = x;
  card.y = y;
  card.cornerRadius = 14;
  card.strokes = [{ type: "SOLID", color: { r: 36/255, g: 55/255, b: 66/255 } }];
  card.strokeWeight = 1;
  card.fills = solid("1D2A33");

  const title = makeLabel(name, { family: "IBM Plex Sans", style: "Medium" }, 15, "F1F5F2");
  title.x = 14;
  title.y = 14;

  const q = makeLabel(quality, { family: "JetBrains Mono", style: "Medium" }, 11, accentHex);
  q.x = 14;
  q.y = 38;

  const rate = makeLabel(throughput, { family: "JetBrains Mono", style: "Medium" }, 18, "F1F5F2");
  rate.x = 14;
  rate.y = 60;

  const machine = makeLabel(machines, { family: "IBM Plex Sans", style: "Regular" }, 12, "AAB8B6");
  machine.x = 14;
  machine.y = 92;

  card.appendChild(title);
  card.appendChild(q);
  card.appendChild(rate);
  card.appendChild(machine);
  canvas.appendChild(card);
  createdNodeIds.push(card.id, title.id, q.id, rate.id, machine.id);
}

createProdNode("Processing Unit", "Rare", "120 / min", "48 Assembler 3", 500, 180, "53A6FF");
createProdNode("Advanced Circuit", "Epic", "240 / min", "64 Assembler 3", 240, 360, "B278FF");
createProdNode("Electronic Circuit", "Rare", "480 / min", "72 Assembler 3", 500, 560, "53A6FF");
createProdNode("Copper Cable", "Normal", "960 / min", "88 Assembler 3", 120, 560, "8C9AA5");
createProdNode("Sulfuric Acid", "Normal", "300 / min", "12 Chemical Plant", 760, 360, "8C9AA5");

const inspectorTitle = makeLabel("Inspector / Processing Unit", { family: "IBM Plex Sans", style: "Medium" }, 16, "F1F5F2");
inspectorTitle.x = 20;
inspectorTitle.y = 20;
inspector.appendChild(inspectorTitle);
createdNodeIds.push(inspectorTitle.id);

[
  "Recipe Time: 10s",
  "Net Output: 120 / min",
  "Machine Count: 48",
  "Modules: 2x Prod 3 + 2x Quality 3",
  "Power: 22.4 MW",
  "Quality Yield: Rare 61% / Epic 28% / Legendary 3.4%",
].forEach((line, i) => {
  const text = makeLabel(line, { family: "IBM Plex Sans", style: "Regular" }, 13, i === 5 ? "7ED7C1" : "AAB8B6");
  text.x = 20;
  text.y = 64 + i * 28;
  inspector.appendChild(text);
  createdNodeIds.push(text.id);
});

[
  ["Machines 284", 20],
  ["Power 112 MW", 220],
  ["Ore 4.8k / min", 430],
  ["Fluids 1.2k / min", 690],
  ["Unresolved Inputs 3", 940],
].forEach(([label, x]) => {
  const text = makeLabel(label, { family: "JetBrains Mono", style: "Medium" }, 13, "F1F5F2");
  text.x = x;
  text.y = 34;
  summary.appendChild(text);
  createdNodeIds.push(text.id);
});

frame.appendChild(topbar);
frame.appendChild(sidebar);
frame.appendChild(canvas);
frame.appendChild(inspector);
frame.appendChild(summary);
page.appendChild(frame);

return { createdNodeIds };
```

## 建议执行顺序

1. 先跑 `Step 1`
2. 跑 `Step 2` 和 `Step 3`
3. 最后跑 `Step 4`

## Step 5: 创建 `Planner / Quality Loop Lab`

```js
const page = figma.root.children.find((p) => p.name === "Prototype / Desktop");
await figma.setCurrentPageAsync(page);

await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Medium" });
await figma.loadFontAsync({ family: "JetBrains Mono", style: "Medium" });
await figma.loadFontAsync({ family: "Space Grotesk", style: "SemiBold" });

function solid(hex) {
  const n = parseInt(hex, 16);
  return [{
    type: "SOLID",
    color: {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
    },
  }];
}

function label(text, font, size, hex, x, y) {
  const node = figma.createText();
  node.characters = text;
  node.fontName = font;
  node.fontSize = size;
  node.fills = solid(hex);
  node.x = x;
  node.y = y;
  return node;
}

const frame = figma.createFrame();
frame.name = "Planner / Quality Loop Lab";
frame.resize(1440, 1024);
frame.x = 1800;
frame.y = 120;
frame.fills = solid("0E1418");
frame.clipsContent = true;

const topbar = figma.createFrame();
topbar.name = "Top Bar";
topbar.resize(1440, 72);
topbar.x = 0;
topbar.y = 0;
topbar.fills = solid("162028");

const left = figma.createFrame();
left.name = "Loop Setup";
left.resize(320, 864);
left.x = 0;
left.y = 72;
left.fills = solid("162028");

const center = figma.createFrame();
center.name = "Loop Flow Matrix";
center.resize(760, 864);
center.x = 320;
center.y = 72;
center.fills = solid("0E1418");

const right = figma.createFrame();
right.name = "Stability + Yield";
right.resize(360, 864);
right.x = 1080;
right.y = 72;
right.fills = solid("1D2A33");

const summary = figma.createFrame();
summary.name = "Bottom Summary";
summary.resize(1440, 88);
summary.x = 0;
summary.y = 936;
summary.fills = solid("162028");

const createdNodeIds = [frame.id, topbar.id, left.id, center.id, right.id, summary.id];

[
  label("Quality Loop Lab / Upcycling", { family: "Space Grotesk", style: "SemiBold" }, 24, "F1F5F2", 24, 22),
  label("Target: Legendary Processing Unit", { family: "JetBrains Mono", style: "Medium" }, 13, "7ED7C1", 400, 28),
].forEach((n) => { topbar.appendChild(n); createdNodeIds.push(n.id); });

[
  label("Loop Setup", { family: "IBM Plex Sans", style: "Medium" }, 16, "F1F5F2", 20, 18),
  label("Recycler Q: 24.8%", { family: "JetBrains Mono", style: "Medium" }, 13, "AAB8B6", 20, 60),
  label("Assembler Q: 24.8%", { family: "JetBrains Mono", style: "Medium" }, 13, "AAB8B6", 20, 86),
  label("Prod Bonus: +40%", { family: "JetBrains Mono", style: "Medium" }, 13, "AAB8B6", 20, 112),
  label("Unlocked Quality: N/U/R/E/L", { family: "JetBrains Mono", style: "Medium" }, 13, "AAB8B6", 20, 138),
  label("Matrix Preview", { family: "IBM Plex Sans", style: "Medium" }, 14, "F1F5F2", 20, 190),
  label("M(Qr) · M(Qc) · λ", { family: "JetBrains Mono", style: "Medium" }, 14, "7ED7C1", 20, 216),
  label("A block radius < 1 ✅", { family: "JetBrains Mono", style: "Medium" }, 12, "67C587", 20, 252),
].forEach((n) => { left.appendChild(n); createdNodeIds.push(n.id); });

for (let i = 0; i < 5; i++) {
  const row = figma.createFrame();
  row.name = `Quality Row ${i + 1}`;
  row.resize(720, 120);
  row.x = 20;
  row.y = 24 + i * 152;
  row.cornerRadius = 12;
  row.strokes = [{ type: "SOLID", color: { r: 36/255, g: 55/255, b: 66/255 } }];
  row.strokeWeight = 1;
  row.fills = solid("1D2A33");

  const n1 = label(`Tier ${i + 1}`, { family: "JetBrains Mono", style: "Medium" }, 12, "AAB8B6", 14, 16);
  const n2 = label("Inflow  ->  Recycle  ->  Recraft  ->  Graduate", { family: "IBM Plex Sans", style: "Regular" }, 13, "F1F5F2", 14, 46);
  const n3 = label(`h${i + 1} = ${(0.0032 * (i + 1)).toFixed(4)}`, { family: "JetBrains Mono", style: "Medium" }, 12, "7ED7C1", 14, 74);

  row.appendChild(n1);
  row.appendChild(n2);
  row.appendChild(n3);
  center.appendChild(row);
  createdNodeIds.push(row.id, n1.id, n2.id, n3.id);
}

[
  label("Yield Forecast", { family: "IBM Plex Sans", style: "Medium" }, 16, "F1F5F2", 20, 20),
  label("Legendary Output / min", { family: "IBM Plex Sans", style: "Regular" }, 12, "AAB8B6", 20, 64),
  label("38.42", { family: "JetBrains Mono", style: "Medium" }, 28, "F3C75F", 20, 82),
  label("Loop Throughput", { family: "IBM Plex Sans", style: "Regular" }, 12, "AAB8B6", 20, 146),
  label("1,240 items/min", { family: "JetBrains Mono", style: "Medium" }, 18, "F1F5F2", 20, 166),
  label("Resource Burn", { family: "IBM Plex Sans", style: "Regular" }, 12, "AAB8B6", 20, 224),
  label("Iron Plate 3.1k/min", { family: "JetBrains Mono", style: "Medium" }, 14, "F5A65B", 20, 246),
  label("Sulfuric Acid 420/min", { family: "JetBrains Mono", style: "Medium" }, 14, "EF6B62", 20, 272),
].forEach((n) => { right.appendChild(n); createdNodeIds.push(n.id); });

[
  label("Cycles simulated: ∞ (closed form)", { family: "JetBrains Mono", style: "Medium" }, 13, "F1F5F2", 20, 34),
  label("A-spectrum max: 0.742", { family: "JetBrains Mono", style: "Medium" }, 13, "67C587", 420, 34),
  label("Fluid loss tracked: enabled", { family: "JetBrains Mono", style: "Medium" }, 13, "F5A65B", 780, 34),
].forEach((n) => { summary.appendChild(n); createdNodeIds.push(n.id); });

frame.appendChild(topbar);
frame.appendChild(left);
frame.appendChild(center);
frame.appendChild(right);
frame.appendChild(summary);
page.appendChild(frame);

return { createdNodeIds };
```

## Step 6: 创建 `Planner / Scenario Compare`

```js
const page = figma.root.children.find((p) => p.name === "Prototype / Desktop");
await figma.setCurrentPageAsync(page);

await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Regular" });
await figma.loadFontAsync({ family: "IBM Plex Sans", style: "Medium" });
await figma.loadFontAsync({ family: "JetBrains Mono", style: "Medium" });
await figma.loadFontAsync({ family: "Space Grotesk", style: "SemiBold" });

function solid(hex) {
  const n = parseInt(hex, 16);
  return [{
    type: "SOLID",
    color: {
      r: ((n >> 16) & 255) / 255,
      g: ((n >> 8) & 255) / 255,
      b: (n & 255) / 255,
    },
  }];
}

function textNode(text, font, size, hex, x, y) {
  const t = figma.createText();
  t.characters = text;
  t.fontName = font;
  t.fontSize = size;
  t.fills = solid(hex);
  t.x = x;
  t.y = y;
  return t;
}

function scenarioCard(title, metrics, x, toneHex) {
  const card = figma.createFrame();
  card.name = `Scenario / ${title}`;
  card.resize(420, 760);
  card.x = x;
  card.y = 140;
  card.cornerRadius = 16;
  card.strokes = [{ type: "SOLID", color: { r: 36/255, g: 55/255, b: 66/255 } }];
  card.strokeWeight = 1;
  card.fills = solid("1D2A33");

  const header = textNode(title, { family: "Space Grotesk", style: "SemiBold" }, 22, "F1F5F2", 20, 20);
  const badge = textNode("Industrial Blueprint", { family: "JetBrains Mono", style: "Medium" }, 11, toneHex, 20, 56);
  card.appendChild(header);
  card.appendChild(badge);

  metrics.forEach((m, i) => {
    const label = textNode(m.label, { family: "IBM Plex Sans", style: "Regular" }, 12, "AAB8B6", 20, 112 + i * 84);
    const value = textNode(m.value, { family: "JetBrains Mono", style: "Medium" }, 24, "F1F5F2", 20, 132 + i * 84);
    const delta = textNode(m.delta, { family: "JetBrains Mono", style: "Medium" }, 12, m.deltaHex, 220, 140 + i * 84);
    card.appendChild(label);
    card.appendChild(value);
    card.appendChild(delta);
  });

  const note = textNode("Assumptions: Space Age + Quality, Ore expansion enabled", { family: "IBM Plex Sans", style: "Regular" }, 12, "6E8483", 20, 704);
  card.appendChild(note);
  return card;
}

const frame = figma.createFrame();
frame.name = "Planner / Scenario Compare";
frame.resize(1440, 1024);
frame.x = 3400;
frame.y = 120;
frame.fills = solid("0E1418");
frame.clipsContent = true;

const top = figma.createFrame();
top.name = "Top Bar";
top.resize(1440, 92);
top.x = 0;
top.y = 0;
top.fills = solid("162028");

const createdNodeIds = [frame.id, top.id];

[
  textNode("Scenario Compare", { family: "Space Grotesk", style: "SemiBold" }, 28, "F1F5F2", 24, 26),
  textNode("Legendary Processing Unit / 120 min", { family: "JetBrains Mono", style: "Medium" }, 13, "7ED7C1", 320, 38),
].forEach((n) => { top.appendChild(n); createdNodeIds.push(n.id); });

const s1 = scenarioCard("A / Pure Quality", [
  { label: "Machines", value: "312", delta: "+9%", deltaHex: "F5A65B" },
  { label: "Power (MW)", value: "146.2", delta: "+14%", deltaHex: "EF6B62" },
  { label: "Legendary Yield", value: "34.8 / min", delta: "-6%", deltaHex: "F5A65B" },
  { label: "Iron Ore", value: "5.2k / min", delta: "+18%", deltaHex: "EF6B62" },
  { label: "Complexity Score", value: "0.48", delta: "-22%", deltaHex: "67C587" },
], 24, "53A6FF");

const s2 = scenarioCard("B / Hybrid Loop", [
  { label: "Machines", value: "284", delta: "baseline", deltaHex: "7ED7C1" },
  { label: "Power (MW)", value: "128.3", delta: "baseline", deltaHex: "7ED7C1" },
  { label: "Legendary Yield", value: "37.1 / min", delta: "baseline", deltaHex: "7ED7C1" },
  { label: "Iron Ore", value: "4.4k / min", delta: "baseline", deltaHex: "7ED7C1" },
  { label: "Complexity Score", value: "0.62", delta: "baseline", deltaHex: "7ED7C1" },
], 510, "7ED7C1");

const s3 = scenarioCard("C / Productivity Bias", [
  { label: "Machines", value: "266", delta: "-6%", deltaHex: "67C587" },
  { label: "Power (MW)", value: "121.0", delta: "-6%", deltaHex: "67C587" },
  { label: "Legendary Yield", value: "30.4 / min", delta: "-18%", deltaHex: "EF6B62" },
  { label: "Iron Ore", value: "3.7k / min", delta: "-16%", deltaHex: "67C587" },
  { label: "Complexity Score", value: "0.77", delta: "+24%", deltaHex: "F5A65B" },
], 996, "F3C75F");

[s1, s2, s3].forEach((card) => {
  frame.appendChild(card);
  createdNodeIds.push(card.id);
});

const footer = textNode("Telemetry note: deltas are relative to Scenario B / Hybrid Loop", { family: "IBM Plex Sans", style: "Regular" }, 12, "6E8483", 24, 984);
frame.appendChild(top);
frame.appendChild(footer);
page.appendChild(frame);
createdNodeIds.push(footer.id);

return { createdNodeIds };
```

## 建议执行顺序（完整）

1. 先跑 `Step 1`（页面结构）
2. 跑 `Step 2`（Cover）和 `Step 3`（Foundations）
3. 跑 `Step 4`（`Planner / Graph View`）
4. 跑 `Step 5`（`Planner / Quality Loop Lab`）
5. 跑 `Step 6`（`Planner / Scenario Compare`）

如果 6 步都成功，再补：

- `Bottleneck Dashboard`
- 组件页可复用组件（含 Variants + Auto Layout）
