const cloneTargets = (targets) => targets.map((target) => ({ ...target }));

const localized = (zh, en) => ({ "zh-CN": zh, en });

const makeTargets = (values) =>
  Object.entries(values).map(([name, minimum]) => ({
    type: ["plastic-bar", "sulfur"].includes(name) ? "item" : "fluid",
    name,
    minimum,
  }));

export function createLineTemplate(template, suffix = "seed") {
  if (template === "acid") {
    const targets = makeTargets({ "sulfuric-acid": 600 });
    return {
      id: `acid-${suffix}`,
      title: localized("硫酸供应", "Sulfuric acid supply"),
      template: "acid",
      recipeNames: ["sulfur", "sulfuric-acid"],
      processConfigs: {},
      targets,
      solvedTargets: cloneTargets(targets),
      childLines: [],
      exportedOutputs: [],
      dirty: false,
    };
  }

  if (template === "plastic") {
    const targets = makeTargets({ "plastic-bar": 300 });
    return {
      id: `plastic-${suffix}`,
      title: localized("塑料供应", "Plastic supply"),
      template: "plastic",
      recipeNames: ["plastic-bar"],
      processConfigs: {},
      targets,
      solvedTargets: cloneTargets(targets),
      childLines: [],
      exportedOutputs: [],
      dirty: false,
    };
  }

  const targets = makeTargets({
    "petroleum-gas": 600,
    "light-oil": 240,
    "heavy-oil": 120,
  });

  return {
    id: `oil-${suffix}`,
    title: localized("基地炼油", "Base oil balance"),
    template: "oil",
    recipeNames: [
      "advanced-oil-processing",
      "heavy-oil-cracking",
      "light-oil-cracking",
    ],
    processConfigs: {},
    targets,
    solvedTargets: cloneTargets(targets),
    childLines: [
      {
        id: `heavy-domain-${suffix}`,
        title: localized("重油裂解子域", "Heavy cracking subdomain"),
        recipeName: "heavy-oil-cracking",
        output: { type: "fluid", name: "light-oil" },
        sunk: true,
        link: true,
        customRate: 300,
      },
    ],
    exportedOutputs: [],
    dirty: false,
  };
}

export function createDraftLine(suffix = "seed") {
  return {
    id: `draft-${suffix}`,
    title: localized("尚未选择目标", "Target not selected"),
    template: "draft",
    recipeNames: [],
    recipeChoices: {},
    processConfigs: {},
    targets: [],
    solvedTargets: [],
    childLines: [],
    exportedOutputs: [],
    dirty: false,
  };
}

export function createLineFromRecipe(recipe, suffix = "seed", selectedTarget = null, minimum = 60) {
  const mainProduct = selectedTarget ?? recipe.main_product ?? recipe.products[0];
  const targets = [
    {
      type: mainProduct.type,
      name: mainProduct.name,
      minimum,
    },
  ];

  return {
    id: `recipe-${suffix}`,
    title: localized(recipe.name.replaceAll("-", " "), recipe.name.replaceAll("-", " ")),
    template: "generic",
    recipeNames: [recipe.name],
    recipeChoices: { [`${mainProduct.type}:${mainProduct.name}`]: recipe.name },
    processConfigs: {},
    targets,
    solvedTargets: cloneTargets(targets),
    childLines: [],
    exportedOutputs: [],
    dirty: false,
  };
}

export function createInitialPlans() {
  return [
    {
      id: "base-plan",
      name: localized("基地规划", "Base plan"),
      blocks: [
        {
          id: "production-block-1",
          name: localized("生产区块 01", "Production block 01"),
          expanded: true,
          lines: [createDraftLine("base")],
        },
      ],
    },
  ];
}

function recipePreferenceScore(recipe, type, name) {
  const product = recipe.products.find((entry) => entry.type === type && entry.name === name);
  let score = 0;
  if (recipe.name === name) score -= 1000;
  if (recipe.main_product?.type === type && recipe.main_product?.name === name) score -= 600;
  if (recipe.name.startsWith("empty-") && recipe.name.endsWith("-barrel")) score += 1200;
  if (recipe.name.includes("recycling") || recipe.category.includes("recycling")) score += 900;
  if ((product?.ignored_by_stats ?? 0) >= (product?.amount ?? Number.POSITIVE_INFINITY)) score += 500;
  if (recipe.ingredients.some((entry) => entry.type === type && entry.name === name)) score += 400;
  return score;
}

export function buildCatalog(raw) {
  const recipesByName = Object.fromEntries(raw.recipes.map((recipe) => [recipe.name, recipe]));
  const modules = raw.items
    .filter((item) => item.type === "module")
    .sort((left, right) => (left.order ?? "").localeCompare(right.order ?? "", "en"));
  const qualities = (raw.qualities ?? [])
    .filter((quality) => !quality.hidden)
    .sort((left, right) => (left.order ?? "").localeCompare(right.order ?? "", "en"));
  const recipesByProduct = {};
  Object.values(recipesByName)
    .filter((recipe) => !recipe.hidden && recipe.ingredients.length > 0 && recipe.products.length > 0)
    .forEach((recipe) => {
      recipe.products.forEach((product) => {
        const key = `${product.type}:${product.name}`;
        recipesByProduct[key] = [...(recipesByProduct[key] ?? []), recipe];
      });
    });
  Object.entries(recipesByProduct).forEach(([key, recipes]) => {
    const separator = key.indexOf(":");
    const type = key.slice(0, separator);
    const name = key.slice(separator + 1);
    recipes.sort((left, right) =>
      recipePreferenceScore(left, type, name) - recipePreferenceScore(right, type, name)
      || (left.order ?? "").localeCompare(right.order ?? "", "en")
      || left.name.localeCompare(right.name));
  });

  return {
    ...raw,
    qualities,
    recipesByName,
    recipesByProduct,
    entitiesByName: Object.fromEntries(raw.entities.map((entity) => [entity.name, entity])),
    itemsByName: Object.fromEntries(raw.items.map((item) => [item.name, item])),
    fluidsByName: Object.fromEntries(raw.fluids.map((fluid) => [fluid.name, fluid])),
    modules,
    modulesByName: Object.fromEntries(modules.map((item) => [item.name, item])),
    qualitiesByName: Object.fromEntries(qualities.map((quality) => [quality.name, quality])),
  };
}

export function recipesForMaterial(catalog, type, name) {
  return catalog.recipesByProduct[`${type}:${name}`] ?? [];
}

const amountOf = (entries, type, name) =>
  entries.find((entry) => entry.type === type && entry.name === name)?.amount ?? 0;

const expectedAmount = (entry) => entry.amount * (entry.probability ?? 1);

const targetMap = (line) =>
  Object.fromEntries(line.solvedTargets.map((target) => [target.name, Number(target.minimum) || 0]));

export function machinesForRecipe(catalog, recipe) {
  return catalog.entities
    .filter((entity) =>
      Number(entity.crafting_speed) > 0
      && entity.crafting_categories?.includes(recipe.category),
    )
    .sort((left, right) =>
      (left.order ?? "").localeCompare(right.order ?? "", "en")
      || left.name.localeCompare(right.name, "en"));
}

function chooseMachine(recipe, catalog) {
  const preferred = recipe.category === "oil-processing" ? "oil-refinery" : "chemical-plant";
  const preferredEntity = catalog.entitiesByName[preferred];
  if (preferredEntity?.crafting_categories?.includes(recipe.category)) return preferredEntity;

  return machinesForRecipe(catalog, recipe)[0];
}

export function modulesForProcess(catalog, recipe, machine, { beacon = false } = {}) {
  const allowedEffects = new Set([
    ...(recipe.allowed_effects ?? []),
    ...(machine?.allowed_effects ?? []),
  ]);
  return (catalog.modules ?? []).filter((module) => {
    if (beacon && !["speed", "efficiency"].includes(module.category)) return false;
    return Object.keys(module.module_effects ?? {}).every((effect) => allowedEffects.has(effect));
  });
}

const addEffects = (target, effects, multiplier = 1) => {
  Object.entries(effects ?? {}).forEach(([effect, value]) => {
    target[effect] = (target[effect] ?? 0) + Number(value) * multiplier;
  });
};

const qualityEffectMultiplier = (quality) => 1 + Math.max(0, Number(quality?.level) || 0) * 0.3;

const qualityAdjustedModuleEffects = (module, quality) => {
  const multiplier = qualityEffectMultiplier(quality);
  return Object.fromEntries(Object.entries(module?.module_effects ?? {}).map(([effect, rawValue]) => {
    const value = Number(rawValue) || 0;
    const beneficial = (
      (["speed", "productivity", "quality"].includes(effect) && value > 0)
      || (["consumption", "pollution"].includes(effect) && value < 0)
    );
    if (!beneficial || multiplier === 1) return [effect, value];
    const adjustedMagnitude = Math.floor((Math.abs(value) * multiplier + 1e-9) * 100) / 100;
    return [effect, Math.sign(value) * adjustedMagnitude];
  }));
};

const resolveModuleSlots = ({ slotCount, configuredSlots, legacyModuleName, modules, qualities, enabled }) => {
  const defaultQuality = qualities.find((quality) => quality.name === "normal") ?? qualities[0] ?? null;
  return Array.from({ length: slotCount }, (_, slotIndex) => {
    if (!enabled) return null;
    const explicit = Array.isArray(configuredSlots) ? configuredSlots[slotIndex] : undefined;
    const moduleName = typeof explicit === "string"
      ? explicit
      : explicit?.moduleName ?? (!Array.isArray(configuredSlots) ? legacyModuleName : "");
    const module = modules.find((candidate) => candidate.name === moduleName);
    if (!module) return null;
    const qualityName = typeof explicit === "object" ? explicit?.qualityName : "normal";
    const quality = qualities.find((candidate) => candidate.name === qualityName) ?? defaultQuality;
    return {
      module,
      quality,
      moduleName: module.name,
      qualityName: quality?.name ?? "normal",
      qualityMultiplier: qualityEffectMultiplier(quality),
    };
  });
};

export function processProfile(recipe, catalog, configuration = {}) {
  const machines = machinesForRecipe(catalog, recipe);
  const machine = machines.find((candidate) => candidate.name === configuration.machineName)
    ?? chooseMachine(recipe, catalog)
    ?? catalog.entitiesByName["assembling-machine-3"];
  const machineSlots = Math.max(0, Number(machine?.module_inventory_size) || 0);
  const machineModules = modulesForProcess(catalog, recipe, machine);
  const usesMachineModules = machineSlots > 0 && machine?.effect_receiver?.uses_module_effects !== false;
  const qualities = (catalog.qualities ?? []).filter((quality) => !quality.hidden);
  const machineModuleSlots = resolveModuleSlots({
    slotCount: machineSlots,
    configuredSlots: configuration.machineModuleSlots,
    legacyModuleName: configuration.machineModuleName,
    modules: machineModules,
    qualities,
    enabled: usesMachineModules,
  });
  const machineModule = machineModuleSlots.find(Boolean)?.module ?? null;

  const beacon = catalog.entitiesByName.beacon;
  const beaconModules = modulesForProcess(catalog, recipe, machine, { beacon: true });
  const usesBeacons = machine?.effect_receiver?.uses_beacon_effects !== false;
  const beaconCount = usesBeacons
    ? Math.max(0, Math.min(64, Math.round(Number(configuration.beaconCount) || 0)))
    : 0;
  const beaconSlots = Math.max(0, Number(beacon?.module_inventory_size) || 0);
  const beaconModuleSlots = resolveModuleSlots({
    slotCount: beaconSlots,
    configuredSlots: configuration.beaconModuleSlots,
    legacyModuleName: configuration.beaconModuleName,
    modules: beaconModules,
    qualities,
    enabled: usesBeacons,
  });
  const beaconModule = beaconModuleSlots.find(Boolean)?.module ?? null;

  const baseEffects = { ...(machine?.effect_receiver?.base_effect ?? {}) };
  const machineEffects = {};
  machineModuleSlots.filter(Boolean).forEach((slot) => {
    addEffects(machineEffects, qualityAdjustedModuleEffects(slot.module, slot.quality));
  });

  const beaconEffects = {};
  if (beaconModule && beacon && beaconCount > 0) {
    const profileIndex = Math.min(beaconCount, beacon.beacon_profile?.length ?? 1) - 1;
    const profile = beacon.beacon_profile?.[Math.max(0, profileIndex)] ?? 1;
    const effectivity = (Number(beacon.distribution_effectivity) || 0) * profile;
    beaconModuleSlots.filter(Boolean).forEach((slot) => {
      addEffects(beaconEffects, qualityAdjustedModuleEffects(slot.module, slot.quality), beaconCount * effectivity);
    });
  }

  const speedBonus = (Number(baseEffects.speed) || 0)
    + (Number(machineEffects.speed) || 0)
    + (Number(beaconEffects.speed) || 0);
  const productivityLimit = Number.isFinite(Number(recipe.maximum_productivity))
    ? Number(recipe.maximum_productivity)
    : Number.POSITIVE_INFINITY;
  const productivityBonus = Math.max(0, Math.min(
    productivityLimit,
    (Number(baseEffects.productivity) || 0) + (Number(machineEffects.productivity) || 0),
  ));
  const speedMultiplier = Math.max(0.2, 1 + speedBonus);
  const productivityMultiplier = 1 + productivityBonus;
  const qualityBonus = Math.max(0, (
    (Number(baseEffects.quality) || 0)
    + (Number(machineEffects.quality) || 0)
    + (Number(beaconEffects.quality) || 0)
  ) / 10);

  return {
    machine,
    machines,
    machineSlots,
    machineModule,
    machineModuleSlots,
    machineModules,
    beacon,
    beaconSlots,
    beaconCount,
    beaconModule,
    beaconModuleSlots,
    beaconModules,
    qualities,
    speedBonus,
    speedMultiplier,
    productivityBonus,
    productivityMultiplier,
    qualityBonus,
    effectiveCraftingSpeed: (Number(machine?.crafting_speed) || 0) * speedMultiplier,
    configuration: {
      machineName: machine?.name ?? "",
      machineModuleName: machineModule?.name ?? "",
      machineModuleSlots: machineModuleSlots.map((slot) => slot ? { moduleName: slot.moduleName, qualityName: slot.qualityName } : null),
      beaconModuleName: beaconModule?.name ?? "",
      beaconModuleSlots: beaconModuleSlots.map((slot) => slot ? { moduleName: slot.moduleName, qualityName: slot.qualityName } : null),
      beaconCount,
    },
  };
}

function processResult(recipe, cycles, catalog, extra = {}, configuration = {}) {
  const profile = processProfile(recipe, catalog, configuration);
  const capacity = profile.machine ? (60 / recipe.energy) * profile.effectiveCraftingSpeed : 0;
  const exactMachines = capacity > 0 ? cycles / capacity : 0;
  const roundedMachines = exactMachines > 0 ? Math.ceil(exactMachines) : 0;

  return {
    id: recipe.name,
    recipe,
    cycles,
    ...profile,
    capacity,
    exactMachines,
    roundedMachines,
    capacityMargin: roundedMachines * capacity - cycles,
    ...extra,
  };
}

function balanceRow(type, name, target, output) {
  const gap = Math.max(0, target - output);
  const surplus = Math.max(0, output - target);
  return { type, name, target, output, gap, surplus, met: gap < 0.01 };
}

function solveOil(line, catalog) {
  const advanced = catalog.recipesByName["advanced-oil-processing"];
  const heavyCracking = catalog.recipesByName["heavy-oil-cracking"];
  const lightCracking = catalog.recipesByName["light-oil-cracking"];
  const targets = targetMap(line);

  const ah = amountOf(advanced.products, "fluid", "heavy-oil");
  const al = amountOf(advanced.products, "fluid", "light-oil");
  const ag = amountOf(advanced.products, "fluid", "petroleum-gas");
  const hh = amountOf(heavyCracking.ingredients, "fluid", "heavy-oil");
  const hl = amountOf(heavyCracking.products, "fluid", "light-oil");
  const ll = amountOf(lightCracking.ingredients, "fluid", "light-oil");
  const lg = amountOf(lightCracking.products, "fluid", "petroleum-gas");
  const targetHeavy = targets["heavy-oil"] ?? 0;
  const targetLight = targets["light-oil"] ?? 0;
  const targetGas = targets["petroleum-gas"] ?? 0;
  const child = line.childLines.find((candidate) => candidate.recipeName === "heavy-oil-cracking");
  const fixedHeavyCycles = child?.sunk && !child.link ? child.customRate / hl : null;

  const minimumA = Math.max(
    0,
    targetHeavy / ah,
    fixedHeavyCycles == null ? 0 : (targetHeavy + hh * fixedHeavyCycles) / ah,
  );
  const roughDemand = targetHeavy + targetLight + targetGas;
  const maximumA = Math.max(50, minimumA + roughDemand / Math.max(ag, 1) + 20);
  let solution = null;

  for (let step = Math.ceil(minimumA * 100); step <= Math.ceil(maximumA * 100); step += 1) {
    const a = step / 100;
    let h;

    if (fixedHeavyCycles == null) {
      const hMax = (ah * a - targetHeavy) / hh;
      if (hMax < -1e-9) continue;
      h = Math.max(0, hMax);
    } else {
      h = Math.max(0, fixedHeavyCycles);
    }

    const availableLight = al * a + hl * h;
    const lMinForGas = Math.max(0, (targetGas - ag * a) / lg);
    const lMaxForLight = (availableLight - targetLight) / ll;
    if (lMaxForLight + 1e-9 < lMinForGas || lMaxForLight < -1e-9) continue;

    const l = Math.max(0, lMaxForLight);
    const heavy = ah * a - hh * h;
    const light = availableLight - ll * l;
    const gas = ag * a + lg * l;
    if (
      heavy + 0.01 >= targetHeavy &&
      light + 0.01 >= targetLight &&
      gas + 0.01 >= targetGas
    ) {
      solution = { a, h, l, heavy, light, gas };
      break;
    }
  }

  if (!solution) {
    solution = { a: 0, h: 0, l: 0, heavy: 0, light: 0, gas: 0 };
  }

  const childIsBoundary = Boolean(child?.sunk);
  const processes = [
    processResult(advanced, solution.a, catalog, { domain: "root" }),
    processResult(heavyCracking, solution.h, catalog, {
      domain: childIsBoundary ? "child" : "root",
      boundary: childIsBoundary,
      boundaryId: child?.id,
    }),
    processResult(lightCracking, solution.l, catalog, { domain: "root" }),
  ];

  const crude =
    amountOf(advanced.ingredients, "fluid", "crude-oil") * solution.a;
  const water =
    amountOf(advanced.ingredients, "fluid", "water") * solution.a +
    amountOf(heavyCracking.ingredients, "fluid", "water") * solution.h +
    amountOf(lightCracking.ingredients, "fluid", "water") * solution.l;

  const balances = [
    balanceRow("fluid", "heavy-oil", targetHeavy, solution.heavy),
    balanceRow("fluid", "light-oil", targetLight, solution.light),
    balanceRow("fluid", "petroleum-gas", targetGas, solution.gas),
  ];

  return {
    status: balances.every((row) => row.met) ? "feasible" : "infeasible",
    balances,
    inputs: [
      { type: "fluid", name: "crude-oil", amount: crude },
      { type: "fluid", name: "water", amount: water },
    ],
    processes,
    objective: "min-boundary-crude",
    variables: childIsBoundary
      ? ["advanced-oil-processing", `boundary:${child.id}`, "light-oil-cracking"]
      : processes.map((process) => process.id),
    childVariables: childIsBoundary ? ["heavy-oil-cracking"] : [],
    matrix: [
      { material: "heavy-oil", coefficients: [ah, -hh, 0] },
      { material: "light-oil", coefficients: [al, hl, -ll] },
      { material: "petroleum-gas", coefficients: [ag, 0, lg] },
    ],
    boundaryContract: childIsBoundary
      ? {
          id: child.id,
          input: { type: "fluid", name: "heavy-oil", amount: hh * solution.h },
          output: { type: "fluid", name: "light-oil", amount: hl * solution.h },
          link: child.link,
        }
      : null,
  };
}

function solveAcid(line, catalog) {
  const sulfur = catalog.recipesByName.sulfur;
  const acid = catalog.recipesByName["sulfuric-acid"];
  const targets = targetMap(line);
  const acidTarget = targets["sulfuric-acid"] ?? 0;
  const sulfurTarget = targets.sulfur ?? 0;
  const acidPerCycle = amountOf(acid.products, "fluid", "sulfuric-acid");
  const sulfurPerCycle = amountOf(sulfur.products, "item", "sulfur");
  const acidCycles = acidTarget / acidPerCycle;
  const sulfurNeed = amountOf(acid.ingredients, "item", "sulfur") * acidCycles;
  const sulfurCycles = (sulfurNeed + sulfurTarget) / sulfurPerCycle;
  const sulfurNet = sulfurPerCycle * sulfurCycles - sulfurNeed;

  const inputs = [
    {
      type: "fluid",
      name: "water",
      amount:
        amountOf(sulfur.ingredients, "fluid", "water") * sulfurCycles +
        amountOf(acid.ingredients, "fluid", "water") * acidCycles,
    },
    {
      type: "fluid",
      name: "petroleum-gas",
      amount: amountOf(sulfur.ingredients, "fluid", "petroleum-gas") * sulfurCycles,
    },
    {
      type: "item",
      name: "iron-plate",
      amount: amountOf(acid.ingredients, "item", "iron-plate") * acidCycles,
    },
  ];

  const balances = [
    balanceRow("fluid", "sulfuric-acid", acidTarget, acidPerCycle * acidCycles),
    balanceRow("item", "sulfur", sulfurTarget, sulfurNet),
  ];

  return {
    status: "feasible",
    balances,
    inputs,
    processes: [
      processResult(sulfur, sulfurCycles, catalog, { domain: "root" }),
      processResult(acid, acidCycles, catalog, { domain: "root" }),
    ],
    objective: "requirement-expansion",
    variables: ["sulfur", "sulfuric-acid"],
    childVariables: [],
    matrix: [
      {
        material: "sulfur",
        coefficients: [sulfurPerCycle, -amountOf(acid.ingredients, "item", "sulfur")],
      },
      { material: "sulfuric-acid", coefficients: [0, acidPerCycle] },
    ],
    boundaryContract: null,
  };
}

function solvePlastic(line, catalog) {
  const plastic = catalog.recipesByName["plastic-bar"];
  const targets = targetMap(line);
  const target = targets["plastic-bar"] ?? 0;
  const perCycle = amountOf(plastic.products, "item", "plastic-bar");
  const cycles = target / perCycle;
  const inputs = plastic.ingredients.map((ingredient) => ({
    type: ingredient.type,
    name: ingredient.name,
    amount: ingredient.amount * cycles,
  }));

  return {
    status: "feasible",
    balances: [balanceRow("item", "plastic-bar", target, perCycle * cycles)],
    inputs,
    processes: [processResult(plastic, cycles, catalog, { domain: "root" })],
    objective: "requirement-expansion",
    variables: ["plastic-bar"],
    childVariables: [],
    matrix: [{ material: "plastic-bar", coefficients: [perCycle] }],
    boundaryContract: null,
  };
}

const naturalBoundaryFluids = new Set([
  "water",
  "crude-oil",
  "lava",
  "ammoniacal-solution",
  "fluorine",
  "lithium-brine",
]);
const naturalBoundaryItems = new Set([
  "calcite",
  "tungsten-ore",
  "scrap",
  "holmium-ore",
  "metallic-asteroid-chunk",
  "carbonic-asteroid-chunk",
  "oxide-asteroid-chunk",
  "promethium-asteroid-chunk",
]);

function isBoundaryMaterial(material, catalog) {
  const prototype = material.type === "item"
    ? catalog.itemsByName[material.name]
    : catalog.fluidsByName[material.name];
  return prototype?.subgroup === "raw-resource"
    || (material.type === "item" && naturalBoundaryItems.has(material.name))
    || (material.type === "fluid" && naturalBoundaryFluids.has(material.name));
}

function solveBom(line, catalog) {
  const processInstances = [];
  const externalInputs = new Map();
  const inputInstances = [];
  const bomRoots = [];

  const addExternalInput = (material, amount, nodePath, reason) => {
    const key = `${material.type}:${material.name}`;
    const current = externalInputs.get(key) ?? { ...material, amount: 0 };
    current.amount += amount;
    externalInputs.set(key, current);
    inputInstances.push({
      id: `input:${nodePath}`,
      ...material,
      amount,
      reason,
      nodePath,
    });
  };

  const expand = (material, amount, path = new Set(), nodePath = "root") => {
    if (!(amount > 0.000001)) return null;
    const materialKey = `${material.type}:${material.name}`;
    const candidates = recipesForMaterial(catalog, material.type, material.name);
    const choiceKey = `instance:${nodePath}`;
    const selectedName = line.recipeChoices?.[choiceKey] ?? line.recipeChoices?.[materialKey];
    const recipe = candidates.find((candidate) => candidate.name === selectedName) ?? candidates[0];
    const boundary = isBoundaryMaterial(material, catalog);
    const cyclic = path.has(materialKey);

    if (!recipe || boundary || cyclic) {
      const reason = cyclic ? "cycle" : boundary ? "raw" : "no-recipe";
      addExternalInput(material, amount, nodePath, reason);
      return {
        id: `bom:${nodePath}`,
        kind: "boundary",
        material: { ...material },
        demand: amount,
        reason,
        choiceKey,
        nodePath,
        children: [],
      };
    }

    const configuration = line.processConfigs?.[choiceKey] ?? {};
    const profile = processProfile(recipe, catalog, configuration);
    const output = recipe.products.find((product) => product.type === material.type && product.name === material.name);
    const outputPerCycle = output ? expectedAmount(output) * profile.productivityMultiplier : 0;
    if (!(outputPerCycle > 0)) {
      addExternalInput(material, amount, nodePath, "no-output");
      return {
        id: `bom:${nodePath}`,
        kind: "boundary",
        material: { ...material },
        demand: amount,
        reason: "no-output",
        choiceKey,
        nodePath,
        children: [],
      };
    }

    const cycles = amount / outputPerCycle;
    const processId = `${recipe.name}::${nodePath}`;
    const process = {
      id: processId,
      recipe,
      cycles,
      fulfills: { ...material, amount },
      choiceKey,
      nodePath,
      configuration,
      productivityMultiplier: profile.productivityMultiplier,
    };
    processInstances.push(process);

    const nextPath = new Set(path);
    nextPath.add(materialKey);
    const children = recipe.ingredients.map((ingredient, ingredientIndex) =>
      expand(
        { type: ingredient.type, name: ingredient.name },
        expectedAmount(ingredient) * cycles,
        nextPath,
        `${nodePath}.${ingredientIndex}`,
      ),
    ).filter(Boolean);

    return {
      id: `bom:${nodePath}`,
      kind: "process",
      material: { ...material },
      demand: amount,
      processId,
      recipeName: recipe.name,
      cycles,
      productivityMultiplier: profile.productivityMultiplier,
      choiceKey,
      nodePath,
      children,
    };
  };

  const netAmount = (type, name) => {
    let total = 0;
    processInstances.forEach((process) => {
      process.recipe.products.forEach((product) => {
        if (product.type === type && product.name === name) {
          total += expectedAmount(product) * process.cycles * process.productivityMultiplier;
        }
      });
      process.recipe.ingredients.forEach((ingredient) => {
        if (ingredient.type === type && ingredient.name === name) total -= expectedAmount(ingredient) * process.cycles;
      });
    });
    return total;
  };

  line.solvedTargets.forEach((target, targetIndex) => {
    const targetAmount = Number(target.minimum) || 0;
    const remainingDemand = Math.max(0, targetAmount - Math.max(0, netAmount(target.type, target.name)));
    bomRoots.push({
      id: `target:${target.type}:${target.name}:${targetIndex}`,
      kind: "target",
      material: { type: target.type, name: target.name },
      demand: targetAmount,
      remainingDemand,
      expansion: expand(
        { type: target.type, name: target.name },
        remainingDemand,
        new Set(),
        `target-${targetIndex}`,
      ),
    });
  });

  const processes = processInstances.map((process) => processResult(
    process.recipe,
    process.cycles,
    catalog,
    {
      id: process.id,
      domain: "root",
      fulfills: process.fulfills,
      choiceKey: process.choiceKey,
      nodePath: process.nodePath,
    },
    process.configuration,
  ));
  const targetByKey = new Map(line.solvedTargets.map((target) => [`${target.type}:${target.name}`, Number(target.minimum) || 0]));
  const materialTypes = new Map();
  const ledger = new Map();
  const addLedger = (entry, amount) => {
    const key = `${entry.type}:${entry.name}`;
    materialTypes.set(key, { type: entry.type, name: entry.name });
    ledger.set(key, (ledger.get(key) ?? 0) + amount);
  };

  processes.forEach((process) => {
    process.recipe.products.forEach((product) => addLedger(
      product,
      expectedAmount(product) * process.cycles * process.productivityMultiplier,
    ));
    process.recipe.ingredients.forEach((ingredient) => addLedger(ingredient, -expectedAmount(ingredient) * process.cycles));
  });
  line.solvedTargets.forEach((target) => materialTypes.set(`${target.type}:${target.name}`, { type: target.type, name: target.name }));

  const balances = [...materialTypes.entries()]
    .filter(([key]) => targetByKey.has(key) || (ledger.get(key) ?? 0) > 0.000001)
    .map(([key, material]) => balanceRow(
      material.type,
      material.name,
      targetByKey.get(key) ?? 0,
      Math.max(0, ledger.get(key) ?? 0),
    ));
  const matrixMaterials = [...materialTypes.values()];

  return {
    status: balances.filter((row) => row.target > 0).every((row) => row.met) ? "feasible" : "infeasible",
    balances,
    inputs: [...externalInputs.values()].sort((left, right) => left.type.localeCompare(right.type) || left.name.localeCompare(right.name)),
    inputInstances,
    processes,
    bomRoots,
    objective: "bom-expansion",
    variables: processes.map((process) => process.id),
    childVariables: [],
    matrix: matrixMaterials.map((material) => ({
      ...material,
      material: material.name,
      coefficients: processes.map((process) =>
        process.recipe.products
          .filter((product) => product.type === material.type && product.name === material.name)
          .reduce((total, product) => total + expectedAmount(product) * process.productivityMultiplier, 0)
        - process.recipe.ingredients
          .filter((ingredient) => ingredient.type === material.type && ingredient.name === material.name)
          .reduce((total, ingredient) => total + expectedAmount(ingredient), 0)),
    })),
    boundaryContract: null,
  };
}

function solveDraft() {
  return {
    status: "feasible",
    balances: [],
    inputs: [],
    processes: [],
    bomRoots: [],
    objective: "unconfigured",
    variables: [],
    childVariables: [],
    matrix: [],
    boundaryContract: null,
  };
}

export function solveLine(line, catalog) {
  if (line.recipeNames.length === 0) return solveDraft();
  if (line.template === "oil") return solveOil(line, catalog);
  if (line.template === "acid") return solveAcid(line, catalog);
  if (line.template === "plastic") return solvePlastic(line, catalog);
  return solveBom(line, catalog);
}

export function producibleMaterials(line, catalog) {
  const seen = new Set();
  return line.recipeNames.flatMap((name) => {
    const recipe = catalog.recipesByName[name];
    if (!recipe) return [];
    return recipe.products.flatMap((product) => {
      const key = `${product.type}:${product.name}`;
      if (seen.has(key)) return [];
      seen.add(key);
      return [{ type: product.type, name: product.name }];
    });
  });
}

export function translationFor(dictionary, type, name) {
  return dictionary?.[`${type}:${name}`] ?? name.replaceAll("-", " ");
}

export function localeText(value, locale) {
  return value?.[locale] ?? value?.["zh-CN"] ?? String(value ?? "");
}

export function iconPath(type, name) {
  return `/icons/${type}/${name}.png`;
}

export function formatRate(value) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, "");
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

export { localized };
