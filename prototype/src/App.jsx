import { useEffect, useMemo, useState } from "react";
import {
  buildCatalog,
  createDraftLine,
  createInitialPlans,
  createLineFromRecipe,
  formatRate,
  iconPath,
  localeText,
  localized,
  recipesForMaterial,
  solveLine,
  translationFor,
} from "./domain.js";
import { BlockObservationCanvas } from "./BlockObservationCanvas.jsx";

const UI = {
  "zh-CN": {
    plan: "计划",
    newPlan: "新建计划",
    block: "生产区块",
    newBlock: "新增 Block",
    rootLine: "Root Line",
    newLine: "新增 Root Line",
    independent: "独立解算",
    localDomain: "局部解算域",
    goals: "交付目标",
    constraints: "净边界产出约束",
    promote: "提升现有产物为目标",
    solve: "应用约束并解算",
    solving: "正在配平…",
    feasible: "目标可满足",
    infeasible: "存在缺口",
    pending: "约束已修改",
    minimum: "不少于",
    perMinute: "/ 分钟",
    remove: "移除",
    fit: "适配视图",
    focus: "聚焦选择",
    changeRecipe: "目标百科",
    blockViews: "Block 多 Line 观察视图",
    blockViewHint: "当前 ProductionBlock 的所有 Root Line 都留在同一画布中；切换视图只改变观察方式。",
    materialRail: "物料轨道",
    materialRailHint: "目标物品 → 配方实例",
    recipeRailRule: "除目标外均为配方实例 · 每条边是一种独立物料",
    targetItemNode: "用户目标 · 物品节点",
    recipeInstance: "配方实例",
    recipeOutputSide: "产出物料 / 向左交付",
    recipeInputSide: "输入物料 / 向右追溯",
    recipeExecutions: "次 / 分钟",
    requiredMachines: "所需机器",
    effectiveSpeed: "有效速度",
    productivityEffect: "产能加成",
    qualityEffect: "品质加成",
    productionMachine: "生产机器",
    machineModuleFill: "机器插件",
    modulePicker: "插件槽位选择器",
    machineModuleSlot: "机器插件槽",
    beaconModuleSlot: "插件塔槽",
    moduleCategorySpeed: "速度",
    moduleCategoryProductivity: "产能",
    moduleCategoryQuality: "品质",
    moduleCategoryEfficiency: "节能",
    clearModuleSlot: "清空槽位",
    closePicker: "关闭",
    starQuality: "星品质",
    beaconModule: "信标插件",
    beaconCount: "信标数量",
    moduleSlots: "槽",
    noModule: "不装插件",
    downstreamOutput: "下游所需",
    upstreamExpanded: "配方展开",
    externalSupplyShort: "边界外供",
    outputColumn: "OUTPUT COLUMN · 目标 / 副产物",
    byproductOutput: "副产物 · 独立产出",
    suppliedByRecipe: "来自",
    transportBelt: "传送带",
    fluidPipe: "管道",
    returnToOutput: "返回目标 / 产出列",
    dependencyRings: "依赖环",
    dependencyRingsHint: "DaisyDisk 式全链占比",
    finderColumns: "分栏钻取",
    finderColumnsHint: "Line → 目标 → 逐级输入",
    flowSankey: "流量桑基",
    flowSankeyHint: "标准守恒 · 线性机时带宽",
    flowInspector: "守恒负荷实例",
    flowWidth: "总生产负荷",
    materialRate: "物料速率",
    localWorkload: "本级加工负荷",
    upstreamWorkload: "上游生产负荷",
    machineSecondsPerMinute: "机器秒 / 分钟",
    conservationCheck: "守恒校验",
    conserved: "已守恒",
    sankeyEquation: "总负荷 = 本级加工 + Σ 上游子树",
    sankeyMetric: "线性带宽：域内机器秒 / 分钟",
    sankeyLocalLegend: "琥珀流：本级加工",
    sankeyBoundaryLegend: "虚线：域外供入",
    boundaryShort: "域外",
    boundaryExcluded: "域外供入仅保留依赖引导，不计入域内机器负荷。",
    sankeyInstanceHint: "每个节点都严格分解为本级加工与独立上游子树；同名物料实例不合并。",
    sankeyLineRule: "线性机时带宽 · 节点严格守恒 · 外供虚线",
    targetAnchor: "目标锚点",
    instanceLabel: "需求实例",
    instanceInspector: "实例检查器",
    instances: "独立实例",
    sameMaterialIndependent: "同名物料不合并 · 每个需求实例独立展开",
    radialInstanceHint: "每一段圆弧都对应一个独立需求实例；同名物料会保留为不同圆弧。",
    lineColumn: "Root Lines",
    targetColumn: "交付目标",
    topologyView: "ProductionLine 依赖树",
    topologyGenerated: "按下游需求展开的全链路 BOM",
    topologyStage: "工艺阶段",
    dependencyDepth: "依赖层级",
    dependencyHint: "从交付目标向上游展开；每一级缩进都明确表示当前物料供给哪个下游配方。",
    expandBranches: "展开全链",
    collapseBranches: "收起上游",
    inputBranches: "上游分支",
    branchesMerge: "路输入汇入此配方",
    branchOverview: "配方输入总览",
    branchFocusHint: "所有直接输入保持同级；选择任一支路查看它的完整上游。",
    viewFullChain: "查看全链",
    focusedChain: "当前支路",
    feeds: "供给",
    deliveredToTarget: "交付给目标",
    producedBy: "由此配方生产",
    branchDemand: "下游需求",
    boundaryLeaf: "外部边界供入",
    rawResource: "原始资源",
    cycleBoundary: "循环在此截断",
    missingRecipe: "无可用配方",
    byproducts: "伴随产出",
    existingNetworkSupply: "已由当前生产网络的伴随产出满足",
    consumed: "消耗",
    produced: "产出",
    internalFlow: "内部流",
    boundaryFlow: "边界供入",
    deliveryFlow: "净边界交付",
    byproductFlow: "副产物 / 剩余",
    recipeLibrary: "真实配方库",
    recipeLibraryHint: "选择任意真实配方。画布会使用同一套拓扑规则重新生成，不存在配方专属蓝图。",
    recipeSearch: "搜索配方、物料或分类",
    recipeMatches: "个匹配配方",
    useRecipe: "使用此配方",
    noRecipeMatches: "没有匹配的配方",
    singleRecipeNotice: "替换后，当前 ProductionLine 会收敛为一个单配方解算域；目标默认取该配方的主产物。",
    choosePrimaryTarget: "选择第一个目标",
    noTargetTitle: "尚未选择生产目标",
    noTargetHint: "这个 Root Line 目前只是草稿。选择目标后，才会建立第一条配方与交付约束。",
    openTargetSelector: "打开目标百科",
    targetEncyclopedia: "目标百科",
    targetEncyclopediaHint: "按游戏 item group、subgroup 与 order 原序浏览；确认目标与速率后，系统自动展开 BOM。",
    allSubgroups: "全部",
    searchTargets: "搜索物品、流体或配方",
    entries: "项",
    groupLabel: "分类",
    subgroupLabel: "子分类",
    orderLabel: "order",
    stackSize: "堆叠上限",
    producerRecipes: "可用生产配方",
    noProducerRecipe: "game-data 中没有可用生产配方",
    selectEntryHint: "从左侧百科选择一个目标",
    targetRate: "目标速率",
    createLineWithTarget: "创建 Root Line",
    applyTarget: "设为当前 Line 目标",
    draftLine: "无目标草稿",
    itemType: "物品",
    fluidType: "流体",
    recipeCount: "配方",
    browseByGameOrder: "按游戏原始顺序浏览",
    chooseRecipe: "选择生产配方",
    selectedRecipe: "当前配方",
    recipeProduces: "该配方产出",
    targetPendingCommit: "确认后才会写入当前 ProductionLine",
    draftStatus: "等待选择目标",
    notConfigured: "未配置",
    noTargetResults: "选择目标后才会生成解算结果",
    noEntries: "当前分类没有匹配项目",
    encyclopediaIndex: "FACTOPEDIA / TARGET INDEX",
    autoExpandedRecipe: "系统默认展开配方",
    changeAfterExpansion: "创建后可在每个 BOM 节点替换为同产物配方",
    replaceRecipe: "更换配方",
    fulfillsDemand: "承接下游需求",
    alternativeRecipes: "可替换配方",
    alternativeHint: "只列出能产出相同下游物料的配方；替换后保持需求量不变，并重新展开上游 BOM。",
    currentRecipe: "当前使用",
    useAlternative: "改用此配方",
    preserveDemand: "下游需求保持不变",
    bomExpansion: "BOM 物料展开",
    currentDomain: "当前解算域",
    childBoundary: "子域边界",
    delivery: "交付平衡",
    machines: "机器换算",
    boundaries: "边界与外供",
    debug: "调试矩阵",
    material: "物料",
    target: "目标",
    netOutput: "净产出",
    gap: "缺口",
    surplus: "剩余",
    status: "状态",
    met: "满足",
    process: "过程",
    machine: "机器",
    executions: "执行次数 / 分钟",
    exactMachines: "理论台数",
    roundedMachines: "向上取整",
    capacityMargin: "容量余量",
    externalInputs: "外部供入 / 边界输入",
    externalOutputs: "可外供剩余",
    declareExport: "声明外供",
    exported: "已声明",
    noExport: "当前没有可外供剩余",
    isolationNote: "外供只做显式声明，不会自动喂给其他 Block 或 Plan。",
    domainId: "解算域 ID",
    rootVariables: "父域变量",
    childVariables: "子域变量",
    objective: "求解策略",
    minCrude: "先满足净产出下限，再最小化边界原油输入",
    expansion: "按真实配方做需求展开与稳态平衡",
    coefficient: "物料变化系数 / 次",
    inspector: "过程检查器",
    duration: "配方时间",
    category: "配方类别",
    inputs: "输入",
    outputs: "输出",
    sink: "下沉为子 Line",
    raise: "上升至当前域",
    linkOn: "link 已开启",
    linkOff: "link 已关闭",
    followsParent: "子级目标跟随父级边界需求",
    customChildRate: "子级独立目标",
    boundaryContract: "边界契约",
    noBoundary: "当前过程仍在 Root Line 解算域内",
    targetDialog: "提升现有产物",
    targetDialogHint: "只能选择当前 ProductionLine 工艺图已经能够产出的物料；这里不提供全局物料搜索。",
    alreadyTarget: "已是目标",
    addAsTarget: "设为目标",
    allPromoted: "当前可产出物都已成为目标。你可以先移除一个目标，再通过这里提升回来。",
    lineDialog: "选择 Root Line 模板",
    oilTemplate: "多目标炼油配平",
    acidTemplate: "硫酸需求展开",
    plasticTemplate: "塑料需求展开",
    oilTemplateDesc: "高等原油处理 + 两级裂解；支持石油气、轻油、重油共同约束。",
    acidTemplateDesc: "硫磺与硫酸两级真实配方链。",
    plasticTemplateDesc: "煤与石油气边界输入，产出塑料。",
    add: "添加",
    cancel: "取消",
    dataReady: "真实游戏数据",
    loading: "正在装载 Factorio 游戏数据与翻译…",
    loadFailed: "无法装载真实数据源",
    retry: "重新加载",
    blocks: "Blocks",
    roots: "Root Lines",
    targetsCount: "目标",
    recipes: "真实配方",
    netBoundaryNote: "目标比较的是 ProductionLine 内部消耗之后的净边界产出。",
    boundaryInput: "边界输入",
    processRate: "执行率",
    machinesShort: "理论机器",
    selected: "已选择",
    linked: "跟随父级",
    unlinked: "独立目标",
    collapseResults: "收起结果",
    expandResults: "展开结果",
    expand: "展开",
    collapse: "收起",
    dataVersion: "数据版本",
    solverMode: "解算模式",
    processCount: "过程变量",
    machineCount: "取整机器",
    blockCanvas: "Block 组织画布",
    switchCanvas: "切换画布",
    organizesOnly: "组织容器 · Root Line 不共同解算",
    rootDomains: "Root 独立域",
    childDomains: "子级局部域",
    currentBlock: "当前 Block",
    addRootLine: "新增 Root Line",
    sourceLabel: "game-data.json + icons + i18n",
  },
  en: {
    plan: "Plan",
    newPlan: "New plan",
    block: "Production blocks",
    newBlock: "Add block",
    rootLine: "Root Line",
    newLine: "Add Root Line",
    independent: "Independent solve",
    localDomain: "Local solve domain",
    goals: "Delivery targets",
    constraints: "Net boundary constraints",
    promote: "Promote existing output",
    solve: "Apply constraints & solve",
    solving: "Balancing…",
    feasible: "Targets feasible",
    infeasible: "Shortage detected",
    pending: "Constraints changed",
    minimum: "At least",
    perMinute: "/ min",
    remove: "Remove",
    fit: "Fit view",
    focus: "Focus selection",
    changeRecipe: "Target encyclopedia",
    blockViews: "Block multi-Line views",
    blockViewHint: "Every Root Line in this ProductionBlock stays on one canvas; switching views only changes how it is observed.",
    materialRail: "Material rail",
    materialRailHint: "Target item → recipe instances",
    recipeRailRule: "Every graph node after the target is a recipe instance · one material per edge",
    targetItemNode: "User target · item node",
    recipeInstance: "Recipe instance",
    recipeOutputSide: "Outputs / deliver left",
    recipeInputSide: "Inputs / trace right",
    recipeExecutions: "exec / min",
    requiredMachines: "Machines required",
    effectiveSpeed: "Effective speed",
    productivityEffect: "Productivity",
    qualityEffect: "Quality",
    productionMachine: "Production machine",
    machineModuleFill: "Machine modules",
    modulePicker: "Module slot picker",
    machineModuleSlot: "Machine module slot",
    beaconModuleSlot: "Beacon slot",
    moduleCategorySpeed: "Speed",
    moduleCategoryProductivity: "Productivity",
    moduleCategoryQuality: "Quality",
    moduleCategoryEfficiency: "Efficiency",
    clearModuleSlot: "Clear slot",
    closePicker: "Close",
    starQuality: "star quality",
    beaconModule: "Beacon module",
    beaconCount: "Beacon count",
    moduleSlots: "slots",
    noModule: "No module",
    downstreamOutput: "Downstream",
    upstreamExpanded: "Recipe expanded",
    externalSupplyShort: "External supply",
    outputColumn: "OUTPUT COLUMN · TARGET / CO-PRODUCTS",
    byproductOutput: "Co-product · independent output",
    suppliedByRecipe: "From",
    transportBelt: "belt",
    fluidPipe: "pipe",
    returnToOutput: "Return to target / outputs",
    dependencyRings: "Dependency rings",
    dependencyRingsHint: "DaisyDisk-style full-chain share",
    finderColumns: "Column drilldown",
    finderColumnsHint: "Line → target → upstream inputs",
    flowSankey: "Flow Sankey",
    flowSankeyHint: "Conserved · linear machine-time width",
    flowInspector: "Conserved workload instance",
    flowWidth: "Total production workload",
    materialRate: "Material rate",
    localWorkload: "Local processing workload",
    upstreamWorkload: "Upstream production workload",
    machineSecondsPerMinute: "machine-sec / min",
    conservationCheck: "Conservation check",
    conserved: "Conserved",
    sankeyEquation: "Total workload = local processing + Σ upstream subtrees",
    sankeyMetric: "Linear width: in-domain machine-sec / min",
    sankeyLocalLegend: "Amber flow: local processing",
    sankeyBoundaryLegend: "Dashed: external supply",
    boundaryShort: "external",
    boundaryExcluded: "External supply remains a dependency guide and is excluded from in-domain machine workload.",
    sankeyInstanceHint: "Every node decomposes exactly into local processing and independent upstream subtrees; repeated materials never merge.",
    sankeyLineRule: "Linear machine-time width · strict node conservation · external guides",
    targetAnchor: "Target anchor",
    instanceLabel: "Demand instance",
    instanceInspector: "Instance inspector",
    instances: "Independent instances",
    sameMaterialIndependent: "Same-named materials never merge · every demand instance expands independently",
    radialInstanceHint: "Each arc is one demand instance; identical materials remain separate arcs.",
    lineColumn: "Root Lines",
    targetColumn: "Delivery targets",
    topologyView: "ProductionLine dependency tree",
    topologyGenerated: "Full-chain BOM expanded from downstream demand",
    topologyStage: "Process stage",
    dependencyDepth: "Dependency depth",
    dependencyHint: "Read from delivery target toward upstream supply. Every indentation states exactly which downstream recipe this material feeds.",
    expandBranches: "Expand full chain",
    collapseBranches: "Collapse upstream",
    inputBranches: "Upstream branches",
    branchesMerge: "inputs converge into this recipe",
    branchOverview: "Recipe input overview",
    branchFocusHint: "All direct inputs stay at the same level. Select one branch to inspect its complete upstream chain.",
    viewFullChain: "View full chain",
    focusedChain: "Focused branch",
    feeds: "Feeds",
    deliveredToTarget: "Delivered to target",
    producedBy: "Produced by this recipe",
    branchDemand: "Downstream demand",
    boundaryLeaf: "External boundary supply",
    rawResource: "Raw resource",
    cycleBoundary: "Cycle stops here",
    missingRecipe: "No available recipe",
    byproducts: "Co-products",
    existingNetworkSupply: "Already satisfied by a co-product in this production network",
    consumed: "Consumed",
    produced: "Produced",
    internalFlow: "Internal flow",
    boundaryFlow: "Boundary supply",
    deliveryFlow: "Net boundary delivery",
    byproductFlow: "Byproduct / surplus",
    recipeLibrary: "Real recipe library",
    recipeLibraryHint: "Choose any real recipe. The canvas regenerates with the same topology rules; there are no recipe-specific blueprints.",
    recipeSearch: "Search recipes, materials, or category",
    recipeMatches: "matching recipes",
    useRecipe: "Use recipe",
    noRecipeMatches: "No matching recipes",
    singleRecipeNotice: "Replacing collapses the current ProductionLine into one single-recipe solve domain; its main product becomes the default target.",
    choosePrimaryTarget: "Choose first target",
    noTargetTitle: "No production target selected",
    noTargetHint: "This Root Line is still a draft. Its first recipe and delivery constraint are created only after you choose a target.",
    openTargetSelector: "Open target encyclopedia",
    targetEncyclopedia: "Target encyclopedia",
    targetEncyclopediaHint: "Browse in the game's item group, subgroup, and order sequence; confirm a target and rate, then the system expands its BOM.",
    allSubgroups: "All",
    searchTargets: "Search items, fluids, or recipes",
    entries: "entries",
    groupLabel: "Group",
    subgroupLabel: "Subgroup",
    orderLabel: "order",
    stackSize: "Stack size",
    producerRecipes: "Producing recipes",
    noProducerRecipe: "No producing recipe is available in game-data",
    selectEntryHint: "Choose a target from the encyclopedia",
    targetRate: "Target rate",
    createLineWithTarget: "Create Root Line",
    applyTarget: "Set current Line target",
    draftLine: "Targetless draft",
    itemType: "Item",
    fluidType: "Fluid",
    recipeCount: "recipes",
    browseByGameOrder: "Browse in the game's original order",
    chooseRecipe: "Choose producing recipe",
    selectedRecipe: "Selected recipe",
    recipeProduces: "Recipe output",
    targetPendingCommit: "Nothing is written to the ProductionLine until you confirm",
    draftStatus: "Waiting for a target",
    notConfigured: "Not configured",
    noTargetResults: "Solve results appear after a target is selected",
    noEntries: "No matching entries in this group",
    encyclopediaIndex: "FACTOPEDIA / TARGET INDEX",
    autoExpandedRecipe: "Automatically selected recipe",
    changeAfterExpansion: "After creation, each BOM node can switch to another recipe for the same product",
    replaceRecipe: "Change recipe",
    fulfillsDemand: "Fulfills downstream demand",
    alternativeRecipes: "Alternative recipes",
    alternativeHint: "Only recipes producing the same downstream material are shown. Replacement preserves demand and recalculates the upstream BOM.",
    currentRecipe: "Current recipe",
    useAlternative: "Use this recipe",
    preserveDemand: "Downstream demand stays unchanged",
    bomExpansion: "BOM expansion",
    currentDomain: "Current domain",
    childBoundary: "Child boundary",
    delivery: "Delivery balance",
    machines: "Machine conversion",
    boundaries: "Boundaries & export",
    debug: "Debug matrix",
    material: "Material",
    target: "Target",
    netOutput: "Net output",
    gap: "Gap",
    surplus: "Surplus",
    status: "Status",
    met: "Met",
    process: "Process",
    machine: "Machine",
    executions: "Executions / min",
    exactMachines: "Exact machines",
    roundedMachines: "Rounded up",
    capacityMargin: "Capacity margin",
    externalInputs: "External / boundary inputs",
    externalOutputs: "Exportable surplus",
    declareExport: "Declare export",
    exported: "Declared",
    noExport: "No exportable surplus",
    isolationNote: "Exports are explicit declarations and never auto-feed another Block or Plan.",
    domainId: "Domain ID",
    rootVariables: "Parent variables",
    childVariables: "Child variables",
    objective: "Solve strategy",
    minCrude: "Meet net output floors, then minimize boundary crude oil",
    expansion: "Real-recipe requirement expansion and steady-state balance",
    coefficient: "Material coefficient / execution",
    inspector: "Process inspector",
    duration: "Recipe time",
    category: "Recipe category",
    inputs: "Inputs",
    outputs: "Outputs",
    sink: "Sink into child Line",
    raise: "Raise into current domain",
    linkOn: "link is on",
    linkOff: "link is off",
    followsParent: "Child target follows parent boundary demand",
    customChildRate: "Independent child target",
    boundaryContract: "Boundary contract",
    noBoundary: "This process remains inside the Root Line solve domain",
    targetDialog: "Promote existing output",
    targetDialogHint: "Only materials already produced by this ProductionLine graph are available. There is no global material search here.",
    alreadyTarget: "Already a target",
    addAsTarget: "Set target",
    allPromoted: "Every producible material is already a target. Remove one and promote it again to exercise this flow.",
    lineDialog: "Choose a Root Line template",
    oilTemplate: "Multi-target oil balance",
    acidTemplate: "Sulfuric acid expansion",
    plasticTemplate: "Plastic expansion",
    oilTemplateDesc: "Advanced processing plus both cracking recipes; jointly constrains all three oil products.",
    acidTemplateDesc: "A real two-step sulfur and sulfuric acid chain.",
    plasticTemplateDesc: "Boundary coal and petroleum gas produce plastic bars.",
    add: "Add",
    cancel: "Cancel",
    dataReady: "Real game data",
    loading: "Loading Factorio game data and translations…",
    loadFailed: "Could not load the real data source",
    retry: "Reload",
    blocks: "Blocks",
    roots: "Root Lines",
    targetsCount: "Targets",
    recipes: "Real recipes",
    netBoundaryNote: "Targets compare against net boundary output after internal consumption.",
    boundaryInput: "Boundary input",
    processRate: "Execution rate",
    machinesShort: "Exact machines",
    selected: "Selected",
    linked: "Follows parent",
    unlinked: "Independent target",
    collapseResults: "Collapse results",
    expandResults: "Expand results",
    expand: "Expand",
    collapse: "Collapse",
    dataVersion: "Data version",
    solverMode: "Solve mode",
    processCount: "Process variables",
    machineCount: "Rounded machines",
    blockCanvas: "Block organization canvas",
    switchCanvas: "Switch canvas",
    organizesOnly: "Organization container · Root Lines never joint-solve",
    rootDomains: "Independent Root domains",
    childDomains: "Child local domains",
    currentBlock: "Current Block",
    addRootLine: "Add Root Line",
    sourceLabel: "game-data.json + icons + i18n",
  },
};

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

function StatusBadge({ status, dirty, t, compact = false }) {
  const current = dirty ? "pending" : status;
  return (
    <span className={`status-badge status-${current} ${compact ? "is-compact" : ""}`}>
      <span className="status-dot" />
      {t(current)}
    </span>
  );
}

function PlanTabs({ plans, activePlan, locale, onSelect, onAdd, t }) {
  return (
    <nav className="plan-tabs" aria-label={t("plan")}>
      {plans.map((plan) => {
        const rootCount = plan.blocks.reduce((count, block) => count + block.lines.length, 0);
        const dirty = plan.blocks.some((block) => block.lines.some((line) => line.dirty));
        return (
          <button
            className={`plan-tab ${plan.id === activePlan.id ? "is-active" : ""}`}
            key={plan.id}
            onClick={() => onSelect(plan)}
          >
            <span className="plan-tab-name">{localeText(plan.name, locale)}</span>
            <span className="plan-tab-meta">
              {plan.blocks.length} {t("blocks")} · {rootCount} {t("roots")}
            </span>
            {dirty && <span className="plan-tab-dirty" aria-label={t("pending")} />}
          </button>
        );
      })}
      <button className="plan-add" onClick={onAdd} title={t("newPlan")}>
        {t("newPlan")}
      </button>
    </nav>
  );
}

function Sidebar({ plan, activeBlock, locale, onSelectBlock, onAddBlock, t }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-heading">
        <div>
          <span className="eyebrow">{t("plan")}</span>
          <h2>{localeText(plan.name, locale)}</h2>
        </div>
        <button className="quiet-button" onClick={onAddBlock}>
          {t("newBlock")}
        </button>
      </div>

      <div className="block-list">
        {plan.blocks.map((block, blockIndex) => (
          <button
            className={`block-canvas-card block-switcher ${block.id === activeBlock.id ? "is-active" : ""}`}
            key={block.id}
            onClick={() => onSelectBlock(block)}
          >
            <span className="block-switcher-icon">
              <GameIcon type="item" name="blueprint-book" size={30} />
            </span>
            <span className="block-switcher-copy">
              <small>BLOCK {String(blockIndex + 1).padStart(2, "0")}</small>
              <strong>{localeText(block.name, locale)}</strong>
              <em>{block.lines.length} {t("roots")}</em>
            </span>
            <i className={block.lines.some((line) => line.dirty) ? "is-pending" : block.lines.every((line) => line.targets.length === 0) ? "is-draft" : "is-ready"} />
          </button>
        ))}
      </div>

      <div className="sidebar-footnote">
        <span className="status-dot status-feasible" />
        <p>{t("isolationNote")}</p>
      </div>
    </aside>
  );
}

function RootLineDock({ block, activeLine, locale, onSelectLine, onSelectChild, onAddLine, t }) {
  const childLines = activeLine.childLines.filter((child) => child.sunk);
  return (
    <section className="root-line-dock">
      <div className="root-line-dock-heading">
        <span className="eyebrow">{t("rootDomains")}</span>
        <small>{t("organizesOnly")}</small>
      </div>
      <div className="root-domain-list">
        {block.lines.map((line, index) => (
          <button
            className={`root-domain-card ${line.id === activeLine.id ? "is-active" : ""}`}
            key={line.id}
            onClick={() => onSelectLine(line)}
          >
            <span className="root-domain-index">ROOT {String(index + 1).padStart(2, "0")} · L0</span>
            <span className="root-domain-icons">
              {line.targets.length === 0 ? (
                <GameIcon type="item" name="blueprint-book" size={24} />
              ) : line.targets.slice(0, 3).map((target) => (
                <GameIcon key={`${target.type}:${target.name}`} type={target.type} name={target.name} size={24} />
              ))}
            </span>
            <span className="root-domain-copy">
              <strong>{localeText(line.title, locale)}</strong>
              <small>{line.targets.length === 0 ? t("draftLine") : `${line.targets.length} ${t("targetsCount")} · ${t("independent")}`}</small>
            </span>
            <i className={line.targets.length === 0 ? "root-domain-draft" : line.dirty ? "root-domain-dirty" : "root-domain-ready"} />
          </button>
        ))}
        <button className="root-domain-add" onClick={onAddLine}>{t("addRootLine")}</button>
      </div>
      {childLines.length > 0 && (
        <div className="child-domain-dock">
          <span>{t("childDomains")} · L1</span>
          {childLines.map((child) => (
            <button key={child.id} onClick={() => onSelectChild(child)}>
              <GameIcon type="recipe" name={child.recipeName} size={24} />
              <strong>{localeText(child.title, locale)}</strong>
              <small>{child.link ? t("linked") : t("unlinked")}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

const flowKey = (entry) => `${entry.type}:${entry.name}`;
const flowAmount = (entry, cycles = 1) => entry.amount * (entry.probability ?? 1) * cycles;

function buildProcessTopology(result) {
  const processes = result.processes;
  const processIndex = new Map(processes.map((process, index) => [process.id, index]));
  const producers = new Map();
  const consumers = new Map();

  const addRelation = (map, key, processId) => {
    const values = map.get(key) ?? new Set();
    values.add(processId);
    map.set(key, values);
  };

  processes.forEach((process) => {
    process.recipe.products.forEach((product) => addRelation(producers, flowKey(product), process.id));
    process.recipe.ingredients.forEach((ingredient) => addRelation(consumers, flowKey(ingredient), process.id));
  });

  const dependencies = new Map(processes.map((process) => [process.id, new Set()]));
  processes.forEach((process) => {
    process.recipe.ingredients.forEach((ingredient) => {
      (producers.get(flowKey(ingredient)) ?? []).forEach((producerId) => {
        if (producerId !== process.id) dependencies.get(process.id).add(producerId);
      });
    });
  });

  const remaining = new Set(processes.map((process) => process.id));
  const stageByProcess = new Map();
  while (remaining.size > 0) {
    const ready = [...remaining]
      .filter((processId) => [...dependencies.get(processId)].every((dependency) => !remaining.has(dependency)))
      .sort((left, right) => processIndex.get(left) - processIndex.get(right));

    if (ready.length === 0) {
      const cycleStage = Math.max(-1, ...stageByProcess.values()) + 1;
      [...remaining]
        .sort((left, right) => processIndex.get(left) - processIndex.get(right))
        .forEach((processId) => stageByProcess.set(processId, cycleStage));
      break;
    }

    ready.forEach((processId) => {
      const dependenciesForProcess = [...dependencies.get(processId)];
      const stage = dependenciesForProcess.length === 0
        ? 0
        : Math.max(...dependenciesForProcess.map((dependency) => stageByProcess.get(dependency) ?? 0)) + 1;
      stageByProcess.set(processId, stage);
      remaining.delete(processId);
    });
  }

  const boundaryKeys = new Set(result.inputs.map(flowKey));
  const deliveryByKey = new Map(result.balances.map((row) => [flowKey(row), row]));
  const stageMap = new Map();

  processes.forEach((process) => {
    const stageIndex = stageByProcess.get(process.id) ?? 0;
    const stage = stageMap.get(stageIndex) ?? [];
    stage.push({
      process,
      inputs: process.recipe.ingredients.map((ingredient) => ({
        ...ingredient,
        amount: flowAmount(ingredient, process.cycles),
        role: boundaryKeys.has(flowKey(ingredient)) ? "boundary" : "internal",
      })),
      outputs: process.recipe.products.map((product) => {
        const key = flowKey(product);
        const hasConsumer = (consumers.get(key)?.size ?? 0) > 0;
        const delivery = deliveryByKey.get(key);
        return {
          ...product,
          amount: flowAmount(product, process.cycles),
          role: hasConsumer ? "internal" : delivery?.target > 0 ? "delivery" : "surplus",
        };
      }),
    });
    stageMap.set(stageIndex, stage);
  });

  return {
    stages: [...stageMap.entries()].sort(([left], [right]) => left - right),
    boundaryInputs: result.inputs.map((input) => ({ ...input, role: "boundary" })),
    deliveries: result.balances.map((row) => ({
      ...row,
      amount: row.output,
      role: row.target > 0 ? "delivery" : "surplus",
    })),
  };
}

function FlowChip({ flow, nameOf, t, onSelect }) {
  const roleLabel = {
    boundary: t("boundaryFlow"),
    internal: t("internalFlow"),
    delivery: t("deliveryFlow"),
    surplus: t("byproductFlow"),
  }[flow.role];

  const content = (
    <>
      <GameIcon type={flow.type} name={flow.name} size={32} />
      <span>
        <strong>{nameOf(flow.type, flow.name)}</strong>
        <small>{formatRate(flow.amount)} / min</small>
      </span>
      <em>{roleLabel}</em>
    </>
  );

  return onSelect ? (
    <button className={`flow-chip is-${flow.role}`} onClick={onSelect}>{content}</button>
  ) : (
    <div className={`flow-chip is-${flow.role}`}>{content}</div>
  );
}

function TopologyProcessRow({ row, nameOf, selectedNode, onSelectNode, onReplaceProcess, t }) {
  const { process } = row;
  const fulfills = process.fulfills ?? process.recipe.products[0];
  return (
    <article className={`topology-process-row ${process.boundary ? "is-boundary" : ""} ${row.outputs.length > 4 ? "has-many-outputs" : ""}`}>
      <div className="topology-io topology-inputs">
        <span className="topology-io-label">{t("consumed")}</span>
        <div className="topology-flow-list">
          {row.inputs.map((flow) => (
            <FlowChip key={`in:${flow.type}:${flow.name}`} flow={flow} nameOf={nameOf} t={t} />
          ))}
        </div>
      </div>

      <div className="topology-process-stack">
        <button
          className={`topology-process-card ${selectedNode === process.id ? "is-selected" : ""}`}
          onClick={() => onSelectNode(process.id)}
        >
          <span className="topology-machine-visual">
            <GameIcon type="entity" name={process.machine?.name ?? "assembling-machine-3"} size={68} />
            <GameIcon type="recipe" name={process.recipe.name} size={28} />
          </span>
          <span className="topology-process-copy">
            <strong>{nameOf("recipe", process.recipe.name)}</strong>
            <small>{formatRate(process.cycles)} {t("processRate")}</small>
            <small>{formatRate(process.exactMachines)} {t("machinesShort")}</small>
          </span>
          <span className="topology-domain-tag">
            {process.boundary ? `L1 · ${t("childBoundary")}` : `L0 · ${t("currentDomain")}`}
          </span>
        </button>
        <button className="topology-process-replace" onClick={() => onReplaceProcess(process)}>
          <span>{t("replaceRecipe")}</span>
          <small><GameIcon type={fulfills.type} name={fulfills.name} size={18} />{t("fulfillsDemand")} · {nameOf(fulfills.type, fulfills.name)}</small>
        </button>
      </div>

      <div className="topology-io topology-outputs">
        <span className="topology-io-label">{t("produced")}</span>
        <div className="topology-flow-list">
          {row.outputs.map((flow) => (
            <FlowChip key={`out:${flow.type}:${flow.name}`} flow={flow} nameOf={nameOf} t={t} />
          ))}
        </div>
      </div>
    </article>
  );
}

function StageTopologyCanvasLegacy({
  line,
  result,
  nameOf,
  selectedNode,
  onSelectNode,
  onReplaceProcess,
  onChangeRecipe,
  locale,
  t,
}) {
  const [compact, setCompact] = useState(false);
  const topology = useMemo(() => buildProcessTopology(result), [result]);
  const isDraft = line.targets.length === 0;

  return (
    <section className={`canvas-shell topology-canvas-shell ${compact ? "is-compact" : ""}`}>
      <div className="canvas-toolbar">
        <div>
          <span className="eyebrow">ProductionLine · L0 · {t("topologyView")}</span>
          <strong>{isDraft ? `${t("draftLine")} · ${t("draftStatus")}` : `${localeText(line.title, locale)} · ${t("topologyGenerated")}`}</strong>
        </div>
        <div className="canvas-actions">
          {!isDraft && <button onClick={() => setCompact((value) => !value)}>{compact ? t("expand") : t("fit")}</button>}
          {!isDraft && <button onClick={() => onSelectNode(result.processes[0]?.id ?? "")}>{t("focus")}</button>}
          <button className="change-recipe-button" onClick={onChangeRecipe}>{t("changeRecipe")}</button>
        </div>
      </div>

      {isDraft ? (
        <div className="topology-empty-state">
          <div className="topology-empty-visual">
            <span className="empty-plate"><GameIcon type="item" name="blueprint-book" size={92} /></span>
            <span className="empty-domain-code">ROOT / L0 / DRAFT</span>
          </div>
          <div className="topology-empty-copy">
            <span className="eyebrow">{t("choosePrimaryTarget")}</span>
            <h2>{t("noTargetTitle")}</h2>
            <p>{t("noTargetHint")}</p>
            <button onClick={onChangeRecipe}>{t("openTargetSelector")}</button>
            <small>{t("targetPendingCommit")}</small>
          </div>
        </div>
      ) : <div className="topology-scroll">
        <div className="topology-summary">
          <div><span>{t("boundaryFlow")}</span><strong>{topology.boundaryInputs.length}</strong></div>
          <div><span>{t("recipes")}</span><strong>{result.processes.length}</strong></div>
          <div><span>{t("topologyStage")}</span><strong>{topology.stages.length}</strong></div>
          <div><span>{t("deliveryFlow")}</span><strong>{topology.deliveries.length}</strong></div>
        </div>

        <section className="topology-boundary-strip">
          <div className="topology-strip-heading">
            <span className="eyebrow">INPUT BOUNDARY</span>
            <strong>{t("boundaryFlow")}</strong>
          </div>
          <div className="topology-strip-flows">
            {topology.boundaryInputs.map((flow) => (
              <FlowChip key={`boundary:${flow.type}:${flow.name}`} flow={flow} nameOf={nameOf} t={t} />
            ))}
          </div>
        </section>

        <div className="topology-stage-list">
          {topology.stages.map(([stageIndex, rows]) => (
            <section className="topology-stage" key={stageIndex}>
              <header>
                <span>STAGE {String(stageIndex + 1).padStart(2, "0")}</span>
                <strong>{t("topologyStage")} {stageIndex + 1}</strong>
                <small>{rows.length} {t("recipes")}</small>
              </header>
              <div className="topology-stage-rows">
                {rows.map((row) => (
                  <TopologyProcessRow
                    key={row.process.id}
                    row={row}
                    nameOf={nameOf}
                    selectedNode={selectedNode}
                    onSelectNode={onSelectNode}
                    onReplaceProcess={onReplaceProcess}
                    t={t}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="topology-boundary-strip is-delivery">
          <div className="topology-strip-heading">
            <span className="eyebrow">OUTPUT BOUNDARY</span>
            <strong>{t("deliveryFlow")}</strong>
          </div>
          <div className="topology-strip-flows">
            {topology.deliveries.map((flow) => (
              <FlowChip
                key={`delivery:${flow.type}:${flow.name}`}
                flow={flow}
                nameOf={nameOf}
                t={t}
                onSelect={() => onSelectNode(`material:${flow.name}`)}
              />
            ))}
          </div>
        </section>
      </div>}

      {!isDraft && <div className="canvas-legend topology-legend">
        <span><i className="legend-boundary-input" />{t("boundaryFlow")}</span>
        <span><i className="legend-current" />{t("internalFlow")}</span>
        <span><i className="legend-delivery" />{t("deliveryFlow")}</span>
        <span><i className="legend-surplus" />{t("byproductFlow")}</span>
      </div>}
    </section>
  );
}

function buildFallbackBomRoots(line, result) {
  const producers = new Map();
  result.processes.forEach((process) => {
    process.recipe.products.forEach((product) => {
      if (!producers.has(flowKey(product))) producers.set(flowKey(product), process);
    });
  });

  const expand = (material, demand, path = new Set(), nodePath = "fallback") => {
    const process = producers.get(flowKey(material));
    if (!process || path.has(process.id)) {
      return {
        id: `bom:${nodePath}`,
        kind: "boundary",
        material: { ...material },
        demand,
        reason: path.has(process?.id) ? "cycle" : "no-recipe",
        children: [],
      };
    }

    const nextPath = new Set(path);
    nextPath.add(process.id);
    return {
      id: `bom:${nodePath}`,
      kind: "process",
      material: { ...material },
      demand,
      processId: process.id,
      recipeName: process.recipe.name,
      cycles: process.cycles,
      children: process.recipe.ingredients.map((ingredient, index) =>
        expand(
          { type: ingredient.type, name: ingredient.name },
          flowAmount(ingredient, process.cycles),
          nextPath,
          `${nodePath}.${index}`,
        ),
      ),
    };
  };

  return line.solvedTargets.map((target, index) => ({
    id: `target:${target.type}:${target.name}:${index}`,
    kind: "target",
    material: { type: target.type, name: target.name },
    demand: Number(target.minimum) || 0,
    remainingDemand: Number(target.minimum) || 0,
    expansion: expand(
      { type: target.type, name: target.name },
      Number(target.minimum) || 0,
      new Set(),
      `fallback-${index}`,
    ),
  }));
}

function countBomNodes(node) {
  if (!node) return 0;
  return 1 + (node.children ?? []).reduce((total, child) => total + countBomNodes(child), 0);
}

function maxBomDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(0, ...(node.children ?? []).map(maxBomDepth));
}

function collectUpstreamCollapseIds(node, depth = 0, ids = new Set()) {
  if (!node) return ids;
  if (depth > 0 && (node.children?.length ?? 0) > 0) ids.add(node.id);
  (node.children ?? []).forEach((child) => collectUpstreamCollapseIds(child, depth + 1, ids));
  return ids;
}

function BomDependencyNode({
  node,
  consumer,
  isRoot = false,
  processById,
  collapsedNodes,
  onToggle,
  nameOf,
  selectedNode,
  onSelectNode,
  onReplaceProcess,
  t,
}) {
  const process = node.processId ? processById.get(node.processId) : null;
  const children = node.children ?? [];
  const collapsed = collapsedNodes.has(node.id);
  const branchMachines = process?.capacity > 0 ? node.cycles / process.capacity : process?.exactMachines ?? 0;
  const byproducts = process?.recipe.products
    .filter((product) => product.type !== node.material.type || product.name !== node.material.name)
    .map((product) => ({ ...product, amount: flowAmount(product, node.cycles) })) ?? [];
  const boundaryReason = {
    raw: t("rawResource"),
    cycle: t("cycleBoundary"),
    "no-recipe": t("missingRecipe"),
    "no-output": t("missingRecipe"),
  }[node.reason] ?? t("boundaryLeaf");

  return (
    <li className={`bom-tree-node ${node.kind === "boundary" ? "is-boundary" : "is-process"}`}>
      <article className={`bom-node-card ${isRoot ? "is-root" : ""}`}>
        {(!isRoot || !process) && (
          <div className="bom-demand-row">
            {children.length > 0 ? (
              <button
                className="bom-branch-toggle"
                type="button"
                aria-label={collapsed ? t("expand") : t("collapse")}
                onClick={() => onToggle(node.id)}
              >
                {collapsed ? "+" : "−"}
              </button>
            ) : <span className="bom-leaf-marker" />}
            <GameIcon type={node.material.type} name={node.material.name} size={36} />
            <span className="bom-demand-copy">
              <small>{consumer ? `${t("feeds")} → ${nameOf(consumer.type, consumer.name)}` : t("deliveredToTarget")}</small>
              <strong>{nameOf(node.material.type, node.material.name)}</strong>
              <em>{t("branchDemand")} {formatRate(node.demand)} / min</em>
            </span>
            <span className={`bom-demand-tag ${node.kind === "boundary" ? "is-boundary" : ""}`}>
              {node.kind === "boundary" ? t("boundaryLeaf") : `${children.length} ${t("inputBranches")}`}
            </span>
          </div>
        )}

        {isRoot && process && <div className="bom-root-recipe-bridge"><i />{t("producedBy")}</div>}

        {process ? (
          <div className="bom-process-row">
            <button
              className={`bom-process-card ${selectedNode === process.id ? "is-selected" : ""}`}
              type="button"
              data-testid={`bom-process-${node.id}`}
              onClick={() => onSelectNode(process.id)}
            >
              <span className="bom-machine-visual">
                <GameIcon type="entity" name={process.machine?.name ?? "assembling-machine-3"} size={52} />
                <GameIcon type="recipe" name={process.recipe.name} size={24} />
              </span>
              <span className="bom-process-copy">
                <small>{isRoot ? t("deliveredToTarget") : `${t("feeds")} ${nameOf(node.material.type, node.material.name)}`}</small>
                <strong>{nameOf("recipe", process.recipe.name)}</strong>
                <em>{formatRate(node.cycles)} {t("processRate")} · {formatRate(branchMachines)} {t("machinesShort")}</em>
              </span>
              <span className="bom-process-output">
                <GameIcon type={node.material.type} name={node.material.name} size={28} />
                <span><small>{t("produced")}</small><strong>{formatRate(node.demand)} / min</strong></span>
              </span>
            </button>
            <button
              className="bom-replace-button"
              type="button"
              data-testid={`bom-replace-${node.id}`}
              onClick={() => onReplaceProcess(process)}
            >
              <span>{t("replaceRecipe")}</span>
              <small>{t("preserveDemand")}</small>
            </button>
          </div>
        ) : (
          <div className="bom-boundary-note">
            <span>{t("boundaryLeaf")}</span>
            <strong>{boundaryReason}</strong>
          </div>
        )}

        {byproducts.length > 0 && (
          <div className="bom-byproduct-row">
            <span>{t("byproducts")}</span>
            {byproducts.map((product) => (
              <span className="bom-byproduct-chip" key={`${product.type}:${product.name}`}>
                <GameIcon type={product.type} name={product.name} size={20} />
                {nameOf(product.type, product.name)} · {formatRate(product.amount)} / min
              </span>
            ))}
          </div>
        )}
      </article>

      {children.length > 0 && !collapsed && (
        <div className="bom-upstream-group">
          <div className="bom-junction-label"><strong>{children.length}</strong> {t("branchesMerge")}</div>
          <ol className="bom-children">
            {children.map((child) => (
              <BomDependencyNode
                key={child.id}
                node={child}
                consumer={node.material}
                processById={processById}
                collapsedNodes={collapsedNodes}
                onToggle={onToggle}
                nameOf={nameOf}
                selectedNode={selectedNode}
                onSelectNode={onSelectNode}
                onReplaceProcess={onReplaceProcess}
                t={t}
              />
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}

function GenericTopologyCanvas({
  line,
  result,
  nameOf,
  selectedNode,
  onSelectNode,
  onReplaceProcess,
  onChangeRecipe,
  locale,
  t,
}) {
  const [collapsedNodes, setCollapsedNodes] = useState(() => new Set());
  const [activeBranchByRoot, setActiveBranchByRoot] = useState({});
  const roots = useMemo(
    () => result.bomRoots?.length ? result.bomRoots : buildFallbackBomRoots(line, result),
    [line, result],
  );
  const processById = useMemo(
    () => new Map(result.processes.map((process) => [process.id, process])),
    [result],
  );
  const treeVersion = result.processes.map((process) => `${process.id}:${formatRate(process.cycles)}`).join("|");
  const isDraft = line.targets.length === 0;
  const nodeCount = roots.reduce((total, root) => total + countBomNodes(root.expansion), 0);
  const dependencyDepth = Math.max(0, ...roots.map((root) => maxBomDepth(root.expansion)));
  const rootBranches = roots.reduce((total, root) => total + (root.expansion?.children?.length ?? 0), 0);

  useEffect(() => {
    setCollapsedNodes(new Set());
    setActiveBranchByRoot(Object.fromEntries(
      roots.map((root) => [root.id, root.expansion?.children?.[0]?.id ?? ""]),
    ));
  }, [line.id, treeVersion]);

  const toggleNode = (nodeId) => {
    setCollapsedNodes((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const collapseUpstream = () => {
    const ids = new Set();
    roots.forEach((root) => collectUpstreamCollapseIds(root.expansion, 0, ids));
    setCollapsedNodes(ids);
  };

  return (
    <section className="canvas-shell topology-canvas-shell bom-tree-canvas">
      <div className="canvas-toolbar">
        <div>
          <span className="eyebrow">ProductionLine · L0 · {t("topologyView")}</span>
          <strong>{isDraft ? `${t("draftLine")} · ${t("draftStatus")}` : `${localeText(line.title, locale)} · ${t("topologyGenerated")}`}</strong>
          {!isDraft && <small className="canvas-toolbar-hint">{t("dependencyHint")}</small>}
        </div>
        <div className="canvas-actions">
          {!isDraft && (
            <button onClick={collapsedNodes.size > 0 ? () => setCollapsedNodes(new Set()) : collapseUpstream}>
              {collapsedNodes.size > 0 ? t("expandBranches") : t("collapseBranches")}
            </button>
          )}
          <button className="change-recipe-button" onClick={onChangeRecipe}>{t("changeRecipe")}</button>
        </div>
      </div>

      {isDraft ? (
        <div className="topology-empty-state">
          <div className="topology-empty-visual">
            <span className="empty-plate"><GameIcon type="item" name="blueprint-book" size={92} /></span>
            <span className="empty-domain-code">ROOT / L0 / DRAFT</span>
          </div>
          <div className="topology-empty-copy">
            <span className="eyebrow">{t("choosePrimaryTarget")}</span>
            <h2>{t("noTargetTitle")}</h2>
            <p>{t("noTargetHint")}</p>
            <button onClick={onChangeRecipe}>{t("openTargetSelector")}</button>
            <small>{t("targetPendingCommit")}</small>
          </div>
        </div>
      ) : <div className="topology-scroll bom-tree-scroll">
        <div className="topology-summary">
          <div><span>{t("targetsCount")}</span><strong>{roots.length}</strong></div>
          <div><span>{t("recipes")}</span><strong>{result.processes.length}</strong></div>
          <div><span>{t("inputBranches")}</span><strong>{rootBranches}</strong></div>
          <div><span>{t("dependencyDepth")}</span><strong>{dependencyDepth}</strong></div>
        </div>

        <div className="bom-target-list" data-testid="bom-dependency-tree">
          {roots.map((root, rootIndex) => {
            const balance = result.balances.find((row) => flowKey(row) === flowKey(root.material));
            const directBranches = root.expansion?.children ?? [];
            const activeBranchId = activeBranchByRoot[root.id] ?? directBranches[0]?.id;
            const activeBranch = directBranches.find((branch) => branch.id === activeBranchId) ?? directBranches[0];
            const rootProcessOnly = root.expansion ? { ...root.expansion, children: [] } : null;
            return (
              <section className="bom-target-tree" key={root.id}>
                <header className="bom-target-header">
                  <span className="bom-target-index">GOAL {String(rootIndex + 1).padStart(2, "0")}</span>
                  <GameIcon type={root.material.type} name={root.material.name} size={42} />
                  <span className="bom-target-copy">
                    <small>{t("deliveryFlow")}</small>
                    <strong>{nameOf(root.material.type, root.material.name)}</strong>
                    <em>≥ {formatRate(root.demand)} / min</em>
                  </span>
                  <span className={`bom-target-status ${balance?.met === false ? "is-gap" : "is-met"}`}>
                    {balance?.met === false ? t("infeasible") : t("feasible")}
                  </span>
                </header>

                {root.expansion ? (
                  <>
                    <ol className="bom-root-list">
                      <BomDependencyNode
                        node={rootProcessOnly}
                        isRoot
                        processById={processById}
                        collapsedNodes={collapsedNodes}
                        onToggle={toggleNode}
                        nameOf={nameOf}
                        selectedNode={selectedNode}
                        onSelectNode={onSelectNode}
                        onReplaceProcess={onReplaceProcess}
                        t={t}
                      />
                    </ol>

                    {directBranches.length > 0 && (
                      <section className="bom-branch-overview">
                        <header>
                          <span>
                            <strong>{t("branchOverview")}</strong>
                            <small>{t("branchFocusHint")}</small>
                          </span>
                          <em>{directBranches.length} {t("inputBranches")}</em>
                        </header>
                        <div className="bom-root-branches">
                          {directBranches.map((branch, branchIndex) => (
                            <button
                              className={branch.id === activeBranch?.id ? "is-active" : ""}
                              type="button"
                              data-testid={`bom-root-branch-${rootIndex}-${branchIndex}`}
                              key={branch.id}
                              onClick={() => setActiveBranchByRoot((current) => ({ ...current, [root.id]: branch.id }))}
                            >
                              <span className="bom-branch-number">{String(branchIndex + 1).padStart(2, "0")}</span>
                              <GameIcon type={branch.material.type} name={branch.material.name} size={34} />
                              <span className="bom-branch-copy">
                                <small>{t("feeds")} → {nameOf(root.material.type, root.material.name)}</small>
                                <strong>{nameOf(branch.material.type, branch.material.name)}</strong>
                                <em>{formatRate(branch.demand)} / min</em>
                              </span>
                              <span className="bom-branch-action">{t("viewFullChain")}</span>
                            </button>
                          ))}
                        </div>

                        {activeBranch && (
                          <div className="bom-focused-branch">
                            <div className="bom-focused-heading">
                              <span>{t("focusedChain")}</span>
                              <strong>{nameOf(root.material.type, root.material.name)} ← {nameOf(activeBranch.material.type, activeBranch.material.name)}</strong>
                              <em>{maxBomDepth(activeBranch)} {t("dependencyDepth")}</em>
                            </div>
                            <ol className="bom-focus-list">
                              <BomDependencyNode
                                node={activeBranch}
                                consumer={root.material}
                                processById={processById}
                                collapsedNodes={collapsedNodes}
                                onToggle={toggleNode}
                                nameOf={nameOf}
                                selectedNode={selectedNode}
                                onSelectNode={onSelectNode}
                                onReplaceProcess={onReplaceProcess}
                                t={t}
                              />
                            </ol>
                          </div>
                        )}
                      </section>
                    )}
                  </>
                ) : (
                  <div className="bom-existing-supply">
                    <i />
                    <span>{t("existingNetworkSupply")}</span>
                    <strong>{formatRate(root.demand)} / min</strong>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="bom-tree-footnote">
          <span>{nodeCount} {t("entries")}</span>
          <span>{result.inputs.length} {t("boundaryFlow")}</span>
        </div>
      </div>}

      {!isDraft && <div className="canvas-legend topology-legend">
        <span><i className="legend-delivery" />{t("deliveryFlow")}</span>
        <span><i className="legend-current" />{t("branchDemand")}</span>
        <span><i className="legend-boundary-input" />{t("boundaryFlow")}</span>
        <span><i className="legend-surplus" />{t("byproductFlow")}</span>
      </div>}
    </section>
  );
}

function GoalRail({ line, result, nameOf, onTargetChange, onRemoveTarget, onPromote, onChooseTarget, onSolve, solving, t }) {
  const resultByName = Object.fromEntries(result.balances.map((row) => [row.name, row]));
  const isDraft = line.targets.length === 0;
  return (
    <aside className="goal-rail">
      <div className="goal-rail-heading">
        <div>
          <span className="eyebrow">ProductionLine</span>
          <h3>{t("goals")}</h3>
        </div>
        <span className="goal-count">{line.targets.length}</span>
      </div>
      <p className="goal-rail-note">{t("constraints")}</p>

      {isDraft ? (
        <div className="goal-empty-state">
          <GameIcon type="item" name="blueprint-book" size={58} />
          <strong>{t("noTargetTitle")}</strong>
          <p>{t("noTargetHint")}</p>
          <button onClick={onChooseTarget}>{t("openTargetSelector")}</button>
        </div>
      ) : <div className="goal-card-list">
        {line.targets.map((target, index) => {
          const row = resultByName[target.name];
          return (
            <article className={`goal-card ${row?.met && !line.dirty ? "is-met" : ""}`} key={`${target.type}:${target.name}`}>
              <div className="goal-card-title">
                <GameIcon type={target.type} name={target.name} size={38} />
                <div>
                  <strong>{nameOf(target.type, target.name)}</strong>
                  <small>{t("minimum")}</small>
                </div>
                <span className={`goal-state ${line.dirty ? "is-pending" : row?.met ? "is-met" : "is-gap"}`} />
              </div>
              <label className="rate-field">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={target.minimum}
                  onChange={(event) => onTargetChange(index, event.target.value)}
                />
                <span>{t("perMinute")}</span>
              </label>
              <div className="goal-result-mini">
                <span>{t("netOutput")}</span>
                <strong>{line.dirty ? "—" : formatRate(row?.output ?? 0)}</strong>
                <button disabled={line.targets.length === 1} onClick={() => onRemoveTarget(index)}>
                  {t("remove")}
                </button>
              </div>
            </article>
          );
        })}
      </div>}

      {!isDraft && <button className="promote-button" onClick={onPromote}>
        {t("promote")}
      </button>}
      {!isDraft && <button className="solve-button" onClick={onSolve} disabled={solving}>
        <span className="solve-indicator" />
        {solving ? t("solving") : t("solve")}
      </button>}
      {!isDraft && <p className="solve-hint">{t("netBoundaryNote")}</p>}
    </aside>
  );
}

function BalanceTable({ result, nameOf, t }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{t("material")}</th>
            <th>{t("target")}</th>
            <th>{t("netOutput")}</th>
            <th>{t("gap")}</th>
            <th>{t("surplus")}</th>
            <th>{t("status")}</th>
          </tr>
        </thead>
        <tbody>
          {result.balances.map((row) => (
            <tr key={`${row.type}:${row.name}`}>
              <td>
                <span className="table-material">
                  <GameIcon type={row.type} name={row.name} size={26} />
                  {nameOf(row.type, row.name)}
                </span>
              </td>
              <td>{formatRate(row.target)}</td>
              <td>{formatRate(row.output)}</td>
              <td className={row.gap > 0.01 ? "text-danger" : "text-muted"}>{formatRate(row.gap)}</td>
              <td className={row.surplus > 0.01 ? "text-amber" : "text-muted"}>{formatRate(row.surplus)}</td>
              <td><span className={`table-state ${row.met ? "is-met" : "is-gap"}`}>{row.met ? t("met") : t("infeasible")}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MachineTable({ result, nameOf, t }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>{t("process")}</th>
            <th>{t("machine")}</th>
            <th>{t("executions")}</th>
            <th>{t("exactMachines")}</th>
            <th>{t("roundedMachines")}</th>
            <th>{t("capacityMargin")}</th>
          </tr>
        </thead>
        <tbody>
          {result.processes.map((process) => (
            <tr key={process.id}>
              <td><span className="table-material"><GameIcon type="recipe" name={process.recipe.name} size={26} />{nameOf("recipe", process.recipe.name)}</span></td>
              <td><span className="table-material"><GameIcon type="entity" name={process.machine.name} size={26} />{nameOf("entity", process.machine.name)}</span></td>
              <td>{formatRate(process.cycles)}</td>
              <td>{formatRate(process.exactMachines)}</td>
              <td>{process.roundedMachines}</td>
              <td>{formatRate(process.capacityMargin)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BoundaryPanel({ line, result, nameOf, onToggleExport, t }) {
  const surpluses = result.balances.filter((row) => row.surplus > 0.01);
  return (
    <div className="boundary-panel">
      <section>
        <span className="eyebrow">{t("externalInputs")}</span>
        <div className="boundary-list">
          {result.inputs.map((input) => (
            <div className="boundary-row" key={`${input.type}:${input.name}`}>
              <GameIcon type={input.type} name={input.name} size={30} />
              <span><strong>{nameOf(input.type, input.name)}</strong><small>{t("boundaryInput")}</small></span>
              <b>{formatRate(input.amount)} / min</b>
            </div>
          ))}
        </div>
      </section>
      <section>
        <span className="eyebrow">{t("externalOutputs")}</span>
        <div className="boundary-list">
          {surpluses.length === 0 && <p className="empty-copy">{t("noExport")}</p>}
          {surpluses.map((row) => {
            const exported = line.exportedOutputs.includes(row.name);
            return (
              <div className="boundary-row" key={row.name}>
                <GameIcon type={row.type} name={row.name} size={30} />
                <span><strong>{nameOf(row.type, row.name)}</strong><small>{t("surplus")}</small></span>
                <b>{formatRate(row.surplus)} / min</b>
                <button className={exported ? "is-declared" : ""} onClick={() => onToggleExport(row.name)}>
                  {exported ? t("exported") : t("declareExport")}
                </button>
              </div>
            );
          })}
        </div>
      </section>
      <p className="boundary-note">{t("isolationNote")}</p>
    </div>
  );
}

function DebugPanel({ line, result, nameOf, t }) {
  const objectiveLabel = result.objective === "min-boundary-crude"
    ? t("minCrude")
    : result.objective === "unconfigured"
      ? t("notConfigured")
      : result.objective === "bom-expansion"
        ? t("bomExpansion")
        : t("expansion");
  return (
    <div className="debug-panel">
      <div className="debug-facts">
        <div><span>{t("domainId")}</span><strong>{line.id}:L0</strong></div>
        <div><span>{t("rootVariables")}</span><strong>{result.variables.length}</strong></div>
        <div><span>{t("childVariables")}</span><strong>{result.childVariables.length}</strong></div>
        <div><span>{t("objective")}</span><strong>{objectiveLabel}</strong></div>
      </div>
      <div className="matrix-wrap">
        <span className="eyebrow">{t("coefficient")}</span>
        <table className="matrix-table">
          <thead>
            <tr>
              <th>{t("material")}</th>
              {result.processes.map((process) => <th key={process.id}>{nameOf("recipe", process.recipe.name)}</th>)}
            </tr>
          </thead>
          <tbody>
            {result.matrix.map((row) => (
              <tr key={row.material}>
                <td>{nameOf(row.type ?? (row.material === "sulfur" || row.material === "plastic-bar" ? "item" : "fluid"), row.material)}</td>
                {row.coefficients.map((value, index) => <td key={`${row.material}:${index}`}>{value > 0 ? "+" : ""}{formatRate(value)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.boundaryContract && (
        <div className="contract-strip">
          <span>{t("boundaryContract")}</span>
          <strong>
            {nameOf(result.boundaryContract.input.type, result.boundaryContract.input.name)} {formatRate(result.boundaryContract.input.amount)}
            <i> / </i>
            {nameOf(result.boundaryContract.output.type, result.boundaryContract.output.name)} {formatRate(result.boundaryContract.output.amount)}
          </strong>
          <em>{result.boundaryContract.link ? t("linked") : t("unlinked")}</em>
        </div>
      )}
    </div>
  );
}

function Inspector({ line, result, catalog, selectedNode, nameOf, onUpdateChild, t }) {
  if (line.targets.length === 0 || result.processes.length === 0) {
    return (
      <aside className="inspector inspector-empty">
        <GameIcon type="item" name="blueprint-book" size={54} />
        <span className="eyebrow">{t("inspector")}</span>
        <h3>{t("noTargetTitle")}</h3>
        <p>{t("noTargetResults")}</p>
      </aside>
    );
  }

  const process = result.processes.find((candidate) => candidate.id === selectedNode) ?? result.processes[0];
  const recipe = process.recipe;
  const child = line.childLines.find((candidate) => candidate.recipeName === recipe.name);

  return (
    <aside className="inspector">
      <div className="inspector-heading">
        <span className="eyebrow">{t("inspector")}</span>
        <div>
          <GameIcon type="recipe" name={recipe.name} size={42} />
          <h3>{nameOf("recipe", recipe.name)}</h3>
        </div>
      </div>
      <div className="inspector-facts">
        <span><small>{t("processRate")}</small><strong>{formatRate(process?.cycles ?? 0)} / min</strong></span>
        <span><small>{t("duration")}</small><strong>{formatRate(recipe.energy)} s</strong></span>
        <span><small>{t("category")}</small><strong>{recipe.category}</strong></span>
      </div>
      <div className="recipe-io">
        <div>
          <small>{t("inputs")}</small>
          <div className="io-icons">
            {recipe.ingredients.map((entry) => (
              <span key={`${entry.type}:${entry.name}`} title={nameOf(entry.type, entry.name)}>
                <GameIcon type={entry.type} name={entry.name} size={30} /><b>{entry.amount}</b>
              </span>
            ))}
          </div>
        </div>
        <div>
          <small>{t("outputs")}</small>
          <div className="io-icons">
            {recipe.products.map((entry) => (
              <span key={`${entry.type}:${entry.name}`} title={nameOf(entry.type, entry.name)}>
                <GameIcon type={entry.type} name={entry.name} size={30} /><b>{entry.amount}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      {child ? (
        <div className="child-controls">
          <button
            className={`domain-action ${child.sunk ? "is-raised-action" : ""}`}
            onClick={() => onUpdateChild({ sunk: !child.sunk, link: child.sunk ? child.link : true })}
          >
            {child.sunk ? t("raise") : t("sink")}
          </button>
          {child.sunk && (
            <>
              <button
                className={`link-switch ${child.link ? "is-on" : ""}`}
                role="switch"
                aria-checked={child.link}
                onClick={() => onUpdateChild({ link: !child.link })}
              >
                <span />
                <strong>{child.link ? t("linkOn") : t("linkOff")}</strong>
              </button>
              <p>{child.link ? t("followsParent") : t("customChildRate")}</p>
              {!child.link && (
                <label className="child-rate-field">
                  <span>{t("customChildRate")}</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={child.customRate}
                    onChange={(event) => onUpdateChild({ customRate: Number(event.target.value) || 0 })}
                  />
                  <em>/ min</em>
                </label>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="no-boundary-copy">{t("noBoundary")}</p>
      )}
    </aside>
  );
}

function ResultDrawer({
  line,
  result,
  catalog,
  selectedNode,
  nameOf,
  onUpdateChild,
  onToggleExport,
  tab,
  onTabChange,
  collapsed,
  onToggleCollapsed,
  t,
}) {
  const tabs = ["delivery", "machines", "boundaries", "debug"];
  return (
    <section className={`result-drawer ${collapsed ? "is-collapsed" : ""}`}>
      <div className="drawer-tabs">
        {tabs.map((item) => (
          <button className={tab === item ? "is-active" : ""} onClick={() => onTabChange(item)} key={item}>
            {t(item)}
          </button>
        ))}
        <button className="drawer-collapse" onClick={onToggleCollapsed}>
          {collapsed ? t("expandResults") : t("collapseResults")}
        </button>
      </div>
      {!collapsed && (
        <div className="drawer-content">
          <div className="drawer-main">
            {tab === "delivery" && <BalanceTable result={result} nameOf={nameOf} t={t} />}
            {tab === "machines" && <MachineTable result={result} nameOf={nameOf} t={t} />}
            {tab === "boundaries" && (
              <BoundaryPanel line={line} result={result} nameOf={nameOf} onToggleExport={onToggleExport} t={t} />
            )}
            {tab === "debug" && <DebugPanel line={line} result={result} nameOf={nameOf} t={t} />}
          </div>
          <Inspector
            line={line}
            result={result}
            catalog={catalog}
            selectedNode={selectedNode}
            nameOf={nameOf}
            onUpdateChild={onUpdateChild}
            t={t}
          />
        </div>
      )}
    </section>
  );
}

const compareOrder = (left, right) => (left ?? "").localeCompare(right ?? "", "en");

function buildTargetIndex(catalog) {
  const entries = [
    ...catalog.items.filter((item) => !item.hidden).map((item) => ({ ...item, prototypeType: item.type, type: "item" })),
    ...catalog.fluids.filter((fluid) => !fluid.hidden).map((fluid) => ({ ...fluid, prototypeType: "fluid", type: "fluid" })),
  ];
  const recipesByProduct = new Map(Object.entries(catalog.recipesByProduct));

  const groups = [...catalog.item_groups]
    .sort((left, right) => compareOrder(left.order, right.order) || left.name.localeCompare(right.name))
    .map((group) => {
      const subgroups = [...group.subgroups].sort((left, right) => compareOrder(left.order, right.order) || left.name.localeCompare(right.name));
      const subgroupRank = new Map(subgroups.map((subgroup, index) => [subgroup.name, index]));
      const groupEntries = entries
        .filter((entry) => entry.group === group.name)
        .sort((left, right) =>
          (subgroupRank.get(left.subgroup) ?? Number.MAX_SAFE_INTEGER) - (subgroupRank.get(right.subgroup) ?? Number.MAX_SAFE_INTEGER)
          || compareOrder(left.order, right.order)
          || left.name.localeCompare(right.name));
      return { ...group, subgroups, entries: groupEntries };
    })
    .filter((group) => group.entries.length > 0);

  return { groups, recipesByProduct };
}

function TargetEncyclopedia({ catalog, nameOf, mode, onSelect, t }) {
  const targetIndex = useMemo(() => buildTargetIndex(catalog), [catalog]);
  const [activeGroupName, setActiveGroupName] = useState(() => targetIndex.groups[0]?.name ?? "");
  const [activeSubgroup, setActiveSubgroup] = useState("");
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [minimum, setMinimum] = useState(60);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const activeGroup = targetIndex.groups.find((group) => group.name === activeGroupName) ?? targetIndex.groups[0];

  const matchesQuery = (entry) => {
    if (!normalizedQuery) return true;
    const recipes = targetIndex.recipesByProduct.get(`${entry.type}:${entry.name}`) ?? [];
    const searchable = [
      entry.name,
      nameOf(entry.type, entry.name),
      entry.group,
      entry.subgroup,
      ...recipes.flatMap((recipe) => [recipe.name, nameOf("recipe", recipe.name)]),
    ].join(" ").toLocaleLowerCase();
    return searchable.includes(normalizedQuery);
  };

  const activeEntries = (activeGroup?.entries ?? []).filter((entry) =>
    (!activeSubgroup || entry.subgroup === activeSubgroup) && matchesQuery(entry));
  const visibleSubgroups = (activeGroup?.subgroups ?? []).filter((subgroup) =>
    activeGroup.entries.some((entry) => entry.subgroup === subgroup.name));
  const producerRecipes = selectedEntry
    ? targetIndex.recipesByProduct.get(`${selectedEntry.type}:${selectedEntry.name}`) ?? []
    : [];
  const selectedRecipe = producerRecipes[0] ?? null;

  const selectEntry = (entry) => {
    setSelectedEntry(entry);
  };

  const switchGroup = (groupName) => {
    setActiveGroupName(groupName);
    setActiveSubgroup("");
    setSelectedEntry(null);
  };

  const confirm = () => {
    if (!selectedEntry || !selectedRecipe || minimum <= 0) return;
    onSelect({
      entry: { type: selectedEntry.type, name: selectedEntry.name },
      recipe: selectedRecipe,
      minimum: Number(minimum),
      mode,
    });
  };

  return (
    <div className="target-encyclopedia">
      <nav className="target-group-rail" aria-label={t("groupLabel")}>
        <span className="target-group-rail-label">GROUPS</span>
        {targetIndex.groups.map((group) => {
          const matchCount = group.entries.filter(matchesQuery).length;
          return (
            <button
              className={group.name === activeGroup?.name ? "is-active" : ""}
              key={group.name}
              onClick={() => switchGroup(group.name)}
              title={nameOf("item_group", group.name)}
            >
              <GameIcon type="item-group" name={group.name} size={38} />
              <span>{nameOf("item_group", group.name)}</span>
              <em>{matchCount}</em>
            </button>
          );
        })}
      </nav>

      <section className="target-index-pane">
        <div className="target-index-intro">
          <span className="eyebrow">{t("encyclopediaIndex")}</span>
          <strong>{t("targetEncyclopediaHint")}</strong>
        </div>
        <label className="target-search">
          <span>{t("searchTargets")}</span>
          <input
            autoFocus
            type="search"
            value={query}
            placeholder={t("searchTargets")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <em>{activeEntries.length} {t("entries")}</em>
        </label>
        <div className="target-subgroup-tabs">
          <button className={!activeSubgroup ? "is-active" : ""} onClick={() => setActiveSubgroup("")}>{t("allSubgroups")}</button>
          {visibleSubgroups.map((subgroup) => (
            <button
              className={activeSubgroup === subgroup.name ? "is-active" : ""}
              key={subgroup.name}
              onClick={() => setActiveSubgroup(subgroup.name)}
            >
              {nameOf("item_subgroup", subgroup.name)}
            </button>
          ))}
        </div>
        <div className="target-grid-scroll">
          <div className="target-grid-heading">
            <span><strong>{nameOf("item_group", activeGroup?.name ?? "")}</strong><small>{t("browseByGameOrder")}</small></span>
            <em>{activeSubgroup ? nameOf("item_subgroup", activeSubgroup) : t("allSubgroups")}</em>
          </div>
          <div className="target-entry-grid">
            {activeEntries.map((entry) => {
              const key = `${entry.type}:${entry.name}`;
              const isSelected = selectedEntry && `${selectedEntry.type}:${selectedEntry.name}` === key;
              const recipeCount = targetIndex.recipesByProduct.get(key)?.length ?? 0;
              return (
                <button
                  className={`${isSelected ? "is-selected" : ""} ${recipeCount === 0 ? "has-no-recipe" : ""}`}
                  key={key}
                  onClick={() => selectEntry(entry)}
                  title={`${nameOf(entry.type, entry.name)} · ${entry.order ?? "—"}`}
                >
                  <GameIcon type={entry.type} name={entry.name} size={42} />
                  <span>{nameOf(entry.type, entry.name)}</span>
                  <em>{recipeCount}</em>
                </button>
              );
            })}
          </div>
          {activeEntries.length === 0 && <p className="target-grid-empty">{t("noEntries")}</p>}
        </div>
      </section>

      <aside className={`target-detail ${selectedEntry ? "has-selection" : ""}`}>
        {selectedEntry ? (
          <>
            <div className="target-detail-heading">
              <span className="target-detail-icon"><GameIcon type={selectedEntry.type} name={selectedEntry.name} size={68} /></span>
              <div>
                <span className="eyebrow">{selectedEntry.type === "item" ? t("itemType") : t("fluidType")}</span>
                <h3>{nameOf(selectedEntry.type, selectedEntry.name)}</h3>
                <code>{selectedEntry.name}</code>
              </div>
            </div>
            <dl className="target-detail-facts">
              <div><dt>{t("groupLabel")}</dt><dd>{nameOf("item_group", selectedEntry.group)}</dd></div>
              <div><dt>{t("subgroupLabel")}</dt><dd>{nameOf("item_subgroup", selectedEntry.subgroup)}</dd></div>
              <div><dt>{t("orderLabel")}</dt><dd>{selectedEntry.order ?? "—"}</dd></div>
              {selectedEntry.type === "item" && <div><dt>{t("stackSize")}</dt><dd>{selectedEntry.stack_size ?? "—"}</dd></div>}
            </dl>

            <div className="target-recipe-section">
              <div className="target-recipe-heading">
                <span>{t("autoExpandedRecipe")}</span>
                <em>{producerRecipes.length} {t("recipeCount")}</em>
              </div>
              <div className="target-recipe-list">
                {selectedRecipe && (
                  <div className="target-default-recipe">
                    <GameIcon type="recipe" name={selectedRecipe.name} size={34} />
                    <span><strong>{nameOf("recipe", selectedRecipe.name)}</strong><small>{selectedRecipe.category} · {formatRate(selectedRecipe.energy)} s</small></span>
                    <em>DEFAULT</em>
                  </div>
                )}
                {producerRecipes.length === 0 && <p>{t("noProducerRecipe")}</p>}
                {producerRecipes.length > 0 && <small className="target-recipe-change-note">{t("changeAfterExpansion")}</small>}
              </div>
            </div>

            <div className="target-confirmation">
              <label>
                <span>{t("targetRate")}</span>
                <div><input type="number" min="0.01" step="10" value={minimum} onChange={(event) => setMinimum(Math.max(0, Number(event.target.value) || 0))} /><em>{t("perMinute")}</em></div>
              </label>
              <button disabled={!selectedRecipe || minimum <= 0} onClick={confirm}>
                {mode === "create-line" ? t("createLineWithTarget") : t("applyTarget")}
              </button>
              <small>{t("targetPendingCommit")}</small>
            </div>
          </>
        ) : (
          <div className="target-detail-empty">
            <GameIcon type="item" name="blueprint-book" size={62} />
            <span className="eyebrow">TARGET / RECIPE / RATE</span>
            <h3>{t("selectEntryHint")}</h3>
            <p>{t("targetPendingCommit")}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function RecipeAlternativePicker({ dialog, catalog, nameOf, onSelect, t }) {
  const { material, currentRecipeName, demand } = dialog;
  const candidates = recipesForMaterial(catalog, material.type, material.name);

  return (
    <div className="recipe-alternative-picker">
      <div className="recipe-alternative-context">
        <span className="recipe-alternative-material"><GameIcon type={material.type} name={material.name} size={60} /></span>
        <div>
          <span className="eyebrow">{t("fulfillsDemand")}</span>
          <h3>{nameOf(material.type, material.name)}</h3>
          <p>{t("alternativeHint")}</p>
        </div>
        <span className="recipe-demand-lock"><small>{t("preserveDemand")}</small><strong>{formatRate(demand)} / min</strong></span>
      </div>
      <div className="recipe-alternative-list">
        {candidates.map((recipe) => {
          const isCurrent = recipe.name === currentRecipeName;
          const output = recipe.products.find((product) => product.type === material.type && product.name === material.name);
          return (
            <button className={isCurrent ? "is-current" : ""} disabled={isCurrent} key={recipe.name} onClick={() => onSelect(dialog, recipe)}>
              <span className="alternative-recipe-icon"><GameIcon type="recipe" name={recipe.name} size={50} /></span>
              <span className="alternative-recipe-copy">
                <strong>{nameOf("recipe", recipe.name)}</strong>
                <small>{recipe.category} · {formatRate(recipe.energy)} s · {formatRate((output?.amount ?? 0) * (output?.probability ?? 1))} / cycle</small>
              </span>
              <span className="alternative-recipe-io">
                <small>{t("inputs")}</small>
                <i>{recipe.ingredients.slice(0, 6).map((ingredient) => (
                  <span key={`${ingredient.type}:${ingredient.name}`} title={nameOf(ingredient.type, ingredient.name)}>
                    <GameIcon type={ingredient.type} name={ingredient.name} size={27} /><b>{formatRate(ingredient.amount)}</b>
                  </span>
                ))}</i>
              </span>
              <em>{isCurrent ? t("currentRecipe") : t("useAlternative")}</em>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Modal({ dialog, line, result, catalog, nameOf, onClose, onSelectTarget, onReplaceBomRecipe, onPromote, t }) {
  if (!dialog) return null;

  const products = [];
  const productKeys = new Set();
  (result?.processes ?? []).forEach((process) => process.recipe.products.forEach((product) => {
    const key = `${product.type}:${product.name}`;
    if (!productKeys.has(key)) {
      productKeys.add(key);
      products.push({ type: product.type, name: product.name });
    }
  }));
  const targetKeys = new Set(line?.targets.map((target) => `${target.type}:${target.name}`));
  const availableCount = products.filter((product) => !targetKeys.has(`${product.type}:${product.name}`)).length;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className={`modal ${dialog.type === "target-selector" ? "is-target-encyclopedia" : dialog.type === "recipe-alternatives" ? "is-recipe-alternatives" : ""}`} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <span className="eyebrow">ProductionLine</span>
            <h2>{dialog.type === "promote" ? t("targetDialog") : dialog.type === "recipe-alternatives" ? `${t("replaceRecipe")} · ${nameOf(dialog.material.type, dialog.material.name)}` : t("targetEncyclopedia")}</h2>
          </div>
          <button onClick={onClose}>{t("cancel")}</button>
        </div>
        {dialog.type === "promote" ? (
          <>
            <p className="modal-note">{t("targetDialogHint")}</p>
            <div className="product-picker">
              {products.map((product) => {
                const key = `${product.type}:${product.name}`;
                const already = targetKeys.has(key);
                return (
                  <button key={key} disabled={already} onClick={() => onPromote(product)}>
                    <GameIcon type={product.type} name={product.name} size={40} />
                    <span><strong>{nameOf(product.type, product.name)}</strong><small>{already ? t("alreadyTarget") : t("addAsTarget")}</small></span>
                    <em>{already ? "LOCKED" : "+ GOAL"}</em>
                  </button>
                );
              })}
            </div>
            {availableCount === 0 && <p className="modal-empty-note">{t("allPromoted")}</p>}
          </>
        ) : dialog.type === "recipe-alternatives" ? (
          <RecipeAlternativePicker dialog={dialog} catalog={catalog} nameOf={nameOf} onSelect={onReplaceBomRecipe} t={t} />
        ) : (
          <TargetEncyclopedia catalog={catalog} nameOf={nameOf} mode={dialog.mode} onSelect={onSelectTarget} t={t} />
        )}
      </section>
    </div>
  );
}

function LoadingScreen({ error, onRetry, t }) {
  return (
    <main className="loading-screen">
      <GameIcon type="item" name="blueprint" size={54} className="loading-mark" />
      <h1>Faculator</h1>
      <p>{error ? t("loadFailed") : t("loading")}</p>
      {error ? <button onClick={onRetry}>{t("retry")}</button> : <span className="loading-bar"><i /></span>}
      {error && <code>{error}</code>}
    </main>
  );
}

function updateNestedLine(plans, planId, blockId, lineId, updater) {
  return plans.map((plan) =>
    plan.id !== planId
      ? plan
      : {
          ...plan,
          blocks: plan.blocks.map((block) =>
            block.id !== blockId
              ? block
              : {
                  ...block,
                  lines: block.lines.map((line) => (line.id === lineId ? updater(line) : line)),
                },
          ),
        },
  );
}

export function App() {
  const [locale, setLocale] = useState("zh-CN");
  const [resourceVersion, setResourceVersion] = useState(0);
  const [resources, setResources] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [plans, setPlans] = useState(createInitialPlans);
  const [activePlanId, setActivePlanId] = useState("base-plan");
  const [activeBlockId, setActiveBlockId] = useState("production-block-1");
  const [activeLineId, setActiveLineId] = useState("draft-base");
  const [selectedNode, setSelectedNode] = useState("");
  const [drawerTab, setDrawerTab] = useState("delivery");
  const [drawerCollapsed, setDrawerCollapsed] = useState(true);
  const [goalPanelOpen, setGoalPanelOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [solvingLineId, setSolvingLineId] = useState(null);

  const t = (key) => UI[locale][key] ?? key;

  useEffect(() => {
    const controller = new AbortController();
    setLoadError("");
    setResources(null);
    Promise.all([
      fetch("/exported/game-data.json", { signal: controller.signal }).then((response) => {
        if (!response.ok) throw new Error(`game-data.json: HTTP ${response.status}`);
        return response.json();
      }),
      fetch("/exported/translations-zh-CN.json", { signal: controller.signal }).then((response) => response.json()),
      fetch("/exported/translations-en.json", { signal: controller.signal }).then((response) => response.json()),
    ])
      .then(([gameData, zh, en]) => setResources({ catalog: buildCatalog(gameData), translations: { "zh-CN": zh, en } }))
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      });
    return () => controller.abort();
  }, [resourceVersion]);

  const activePlan = plans.find((plan) => plan.id === activePlanId) ?? plans[0];
  const activeBlock = activePlan.blocks.find((block) => block.id === activeBlockId) ?? activePlan.blocks[0];
  const activeLine = activeBlock.lines.find((line) => line.id === activeLineId) ?? activeBlock.lines[0];
  const translations = resources?.translations[locale];
  const nameOf = (type, name) => translationFor(translations, type, name);
  const blockLineEntries = useMemo(
    () => resources
      ? activeBlock.lines.map((line) => ({ line, result: solveLine(line, resources.catalog) }))
      : [],
    [resources, activeBlock],
  );
  const result = blockLineEntries.find((entry) => entry.line.id === activeLine.id)?.result ?? null;

  if (!resources || !result) {
    return <LoadingScreen error={loadError} onRetry={() => setResourceVersion((value) => value + 1)} t={t} />;
  }

  const updateActiveLine = (updater) => {
    setPlans((current) => updateNestedLine(current, activePlan.id, activeBlock.id, activeLine.id, updater));
  };

  const selectPlan = (plan) => {
    const block = plan.blocks[0];
    const line = block.lines[0];
    setActivePlanId(plan.id);
    setActiveBlockId(block.id);
    setActiveLineId(line.id);
    setSelectedNode("");
    setDrawerCollapsed(true);
  };

  const selectBlock = (block) => {
    if (block.id === activeBlock.id) return;
    const line = block.lines[0];
    setActiveBlockId(block.id);
    setActiveLineId(line.id);
    setSelectedNode("");
    setDrawerCollapsed(true);
    setGoalPanelOpen(false);
  };

  const selectLine = (block, line) => {
    setActiveBlockId(block.id);
    setActiveLineId(line.id);
    setSelectedNode("");
    setDrawerCollapsed(true);
    setGoalPanelOpen(false);
  };

  const addPlan = () => {
    const suffix = `${Date.now()}`;
    const line = createDraftLine(suffix);
    const index = plans.length + 1;
    const block = {
      id: `block-${suffix}`,
      name: localized(`生产区块 01`, `Production block 01`),
      expanded: true,
      lines: [line],
    };
    const plan = {
      id: `plan-${suffix}`,
      name: localized(`新计划 ${index}`, `New plan ${index}`),
      blocks: [block],
    };
    setPlans((current) => [...current, plan]);
    setActivePlanId(plan.id);
    setActiveBlockId(block.id);
    setActiveLineId(line.id);
    setSelectedNode("");
    setDrawerCollapsed(true);
  };

  const addBlock = () => {
    const suffix = `${Date.now()}`;
    const line = createDraftLine(suffix);
    const block = {
      id: `block-${suffix}`,
      name: localized(`生产区块 ${String(activePlan.blocks.length + 1).padStart(2, "0")}`, `Production block ${String(activePlan.blocks.length + 1).padStart(2, "0")}`),
      expanded: true,
      lines: [line],
    };
    setPlans((current) => current.map((plan) => plan.id === activePlan.id ? { ...plan, blocks: [...plan.blocks, block] } : plan));
    setActiveBlockId(block.id);
    setActiveLineId(line.id);
    setSelectedNode("");
    setDrawerCollapsed(true);
  };

  const applyTargetSelection = ({ entry, recipe, minimum, mode }) => {
    const suffix = `${Date.now()}`;
    const replacement = createLineFromRecipe(recipe, suffix, entry, minimum);
    replacement.title = localized(
      `${translationFor(resources.translations["zh-CN"], entry.type, entry.name)}生产线`,
      `${translationFor(resources.translations.en, entry.type, entry.name)} line`,
    );

    if (mode === "create-line") {
      setPlans((current) => current.map((plan) =>
        plan.id !== activePlan.id ? plan : {
          ...plan,
          blocks: plan.blocks.map((block) => block.id === activeBlock.id ? { ...block, lines: [...block.lines, replacement] } : block),
        },
      ));
      setActiveLineId(replacement.id);
    } else {
      replacement.id = activeLine.id;
      updateActiveLine(() => replacement);
    }

    setSelectedNode(recipe.name);
    setDrawerCollapsed(true);
    setDialog(null);
  };

  const updateTarget = (index, value) => {
    updateActiveLine((line) => ({
      ...line,
      targets: line.targets.map((target, targetIndex) => targetIndex === index ? { ...target, minimum: Math.max(0, Number(value) || 0) } : target),
      dirty: true,
    }));
  };

  const removeTarget = (index) => {
    updateActiveLine((line) => line.targets.length <= 1 ? line : {
      ...line,
      targets: line.targets.filter((_, targetIndex) => targetIndex !== index),
      dirty: true,
    });
  };

  const promoteTarget = (product) => {
    updateActiveLine((line) => ({
      ...line,
      targets: [...line.targets, { ...product, minimum: 60 }],
      dirty: true,
    }));
    setDialog(null);
  };

  const replaceBomRecipe = (selection, recipe) => {
    const { material } = selection;
    const materialKey = `${material.type}:${material.name}`;
    const choiceKey = selection.choiceKey ?? materialKey;
    const targetLineId = selection.lineId ?? activeLine.id;
    setPlans((current) => updateNestedLine(current, activePlan.id, activeBlock.id, targetLineId, (line) => {
      const primaryKey = line.targets[0] ? `${line.targets[0].type}:${line.targets[0].name}` : "";
      return {
        ...line,
        recipeNames: materialKey === primaryKey ? [recipe.name] : line.recipeNames,
        recipeChoices: { ...(line.recipeChoices ?? {}), [choiceKey]: recipe.name },
        dirty: false,
      };
    }));
    const nodePath = choiceKey.startsWith("instance:") ? choiceKey.slice("instance:".length) : materialKey;
    setSelectedNode(`${recipe.name}::${nodePath}`);
    setDrawerCollapsed(true);
    setDialog(null);
  };

  const runSolver = () => {
    if (activeLine.targets.length === 0) return;
    const planId = activePlan.id;
    const blockId = activeBlock.id;
    const lineId = activeLine.id;
    setSolvingLineId(lineId);
    window.setTimeout(() => {
      setPlans((current) => updateNestedLine(current, planId, blockId, lineId, (line) => ({
        ...line,
        solvedTargets: line.targets.map((target) => ({ ...target })),
        dirty: false,
      })));
      setSolvingLineId(null);
    }, 520);
  };

  const updateChild = (patch) => {
    updateActiveLine((line) => ({
      ...line,
      childLines: line.childLines.map((child) => child.recipeName === "heavy-oil-cracking" ? { ...child, ...patch } : child),
      dirty: true,
    }));
  };

  const toggleExport = (name) => {
    updateActiveLine((line) => ({
      ...line,
      exportedOutputs: line.exportedOutputs.includes(name)
        ? line.exportedOutputs.filter((output) => output !== name)
        : [...line.exportedOutputs, name],
    }));
  };

  const roundedMachineCount = result.processes.reduce(
    (total, process) => total + process.roundedMachines,
    0,
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <GameIcon type="item" name="blueprint" size={42} className="brand-mark" />
          <span><strong>Faculator</strong><small>PRODUCTION SYSTEMS</small></span>
        </div>
        <PlanTabs plans={plans} activePlan={activePlan} locale={locale} onSelect={selectPlan} onAdd={addPlan} t={t} />
        <div className="header-tools">
          <span className="data-source"><i />{t("dataReady")}<small>{t("sourceLabel")}</small></span>
          <div className="locale-switch" aria-label="Language">
            <button className={locale === "zh-CN" ? "is-active" : ""} onClick={() => setLocale("zh-CN")}>中</button>
            <button className={locale === "en" ? "is-active" : ""} onClick={() => setLocale("en")}>EN</button>
          </div>
        </div>
      </header>

      <div className="workspace">
        <Sidebar
          plan={activePlan}
          activeBlock={activeBlock}
          locale={locale}
          onSelectBlock={selectBlock}
          onAddBlock={addBlock}
          t={t}
        />

        <section className="line-workspace">
          <div className="upper-workspace">
            <div className="main-line-column">
              <div className="line-header">
                <div className="line-title-block">
                  <span className="breadcrumb">
                    {localeText(activePlan.name, locale)} / ProductionBlock / {activeBlock.id}
                  </span>
                  <div>
                    <h1>{localeText(activeBlock.name, locale)}</h1>
                    <span className="block-canvas-badge">{t("blockCanvas")}</span>
                  </div>
                </div>
                <div className="line-header-actions">
                  <span className="line-domain-caption">{activeBlock.lines.length} ROOT · {t("organizesOnly")}</span>
                  <button className={`goal-panel-toggle ${goalPanelOpen ? "is-active" : ""}`} type="button" onClick={() => setGoalPanelOpen((value) => !value)}>{t("goals")}</button>
                </div>
              </div>
              <BlockObservationCanvas
                entries={blockLineEntries}
                activeLine={activeLine}
                nameOf={nameOf}
                selectedNode={selectedNode}
                locale={locale}
                onSelectLine={(line) => selectLine(activeBlock, line)}
                onSelectNode={(line, node) => {
                  selectLine(activeBlock, line);
                  setSelectedNode(node);
                }}
                onChooseTarget={(line) => {
                  selectLine(activeBlock, line);
                  setDialog({ type: "target-selector", mode: "replace-current" });
                }}
                onAddLine={() => setDialog({ type: "target-selector", mode: "create-line" })}
                onReplaceProcess={(line, process, node) => {
                  selectLine(activeBlock, line);
                  const material = process.fulfills ?? process.recipe.products[0];
                  setDialog({
                    type: "recipe-alternatives",
                    lineId: line.id,
                    choiceKey: node?.choiceKey ?? process.choiceKey,
                    material: { type: material.type, name: material.name },
                    demand: node?.demand ?? material.amount ?? 0,
                    currentRecipeName: process.recipe.name,
                  });
                }}
                onUpdateProcessConfig={(line, process, patch) => {
                  setActiveLineId(line.id);
                  setSelectedNode(process.id);
                  setPlans((current) => updateNestedLine(current, activePlan.id, activeBlock.id, line.id, (currentLine) => ({
                    ...currentLine,
                    processConfigs: {
                      ...(currentLine.processConfigs ?? {}),
                      [process.choiceKey]: {
                        ...(currentLine.processConfigs?.[process.choiceKey] ?? {}),
                        ...patch,
                      },
                    },
                    dirty: false,
                  })));
                }}
                t={t}
              />
            </div>
            <div className={`goal-rail-frame ${goalPanelOpen ? "is-open" : ""}`}>
              <GoalRail
                line={activeLine}
                result={result}
                nameOf={nameOf}
                onTargetChange={updateTarget}
                onRemoveTarget={removeTarget}
                onPromote={() => setDialog({ type: "promote" })}
                onChooseTarget={() => setDialog({ type: "target-selector", mode: "replace-current" })}
                onSolve={runSolver}
                solving={solvingLineId === activeLine.id}
                t={t}
              />
            </div>
          </div>

          <ResultDrawer
            line={activeLine}
            result={result}
            catalog={resources.catalog}
            selectedNode={selectedNode}
            nameOf={nameOf}
            onUpdateChild={updateChild}
            onToggleExport={toggleExport}
            tab={drawerTab}
            onTabChange={(nextTab) => {
              setDrawerTab(nextTab);
              setDrawerCollapsed(false);
            }}
            collapsed={drawerCollapsed}
            onToggleCollapsed={() => setDrawerCollapsed((value) => !value)}
            t={t}
          />
        </section>
      </div>

      <footer className="app-statusbar">
        <span><i className={`footer-lamp status-${activeLine.targets.length === 0 ? "draft" : activeLine.dirty ? "pending" : result.status}`} />{activeLine.targets.length === 0 ? t("draftStatus") : activeLine.dirty ? t("pending") : t(result.status)}</span>
        <span><small>{t("solverMode")}</small><strong>{result.objective === "unconfigured" ? t("notConfigured").toLocaleUpperCase() : result.objective === "min-boundary-crude" ? "STEADY BALANCE" : result.objective === "bom-expansion" ? "BOM EXPANSION" : "REQUIREMENT EXPANSION"}</strong></span>
        <span><small>{t("processCount")}</small><strong>{result.processes.length}</strong></span>
        <span><small>{t("machineCount")}</small><strong>{roundedMachineCount}</strong></span>
        <span className="statusbar-version"><small>{t("dataVersion")}</small><strong>Factorio {resources.catalog.game.factorio_version} · exporter {resources.catalog.game.exporter_version}</strong></span>
      </footer>

      <Modal
        dialog={dialog}
        line={activeLine}
        result={result}
        catalog={resources.catalog}
        nameOf={nameOf}
        onClose={() => setDialog(null)}
        onSelectTarget={applyTargetSelection}
        onReplaceBomRecipe={replaceBomRecipe}
        onPromote={promoteTarget}
        t={t}
      />
    </main>
  );
}
