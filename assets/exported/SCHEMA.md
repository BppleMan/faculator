# game-data.json Schema 文档

> 由 faculator-export mod 从 Factorio 2.0 运行时 API 导出，包含计算器所需的全部游戏数据。
> 当前版本: export_mod `0.1.0`, Factorio `2.0.76` (含 Space Age DLC)

## 概览

```
game-data.json (~1.8MB)
├── _meta                    # 导出元信息
├── recipe_categories [29]   # 配方类别（crafting, smelting, chemistry...）
├── fuel_categories [5]      # 燃料类别（chemical, nuclear, food...）
├── resource_categories [3]  # 资源类别（basic-solid, basic-fluid, hard-solid）
├── module_categories [4]    # 模块类别（speed, productivity, efficiency, quality）
├── item_groups [13]         # 物品分组（大分类 → subgroups 子分类）
├── items [342]              # 物品（原料、产物、建筑蓝图、弹药等）
├── fluids [33]              # 流体（水、石油、蒸汽等）
├── recipes [663]            # 配方（制作、冶炼、化工、回收等）
├── entities [36]            # 生产实体（组装机、熔炉、矿机、实验室等）
├── technologies [275]       # 科技树
├── qualities [6]            # 品质等级（normal → uncommon → rare → epic → legendary）
├── space_locations [8]      # 星球/空间位置
├── space_connections [9]    # 星际航线
├── equipment [18]           # 装甲模块（电池、护盾、夜视仪等）
└── equipment_grids [6]      # 装甲网格（装备槽大小定义）
```

---

## 数据关系图

```
item_groups ──has_many──→ subgroups ←── items.subgroup / recipes.subgroup
                                    ←── entities.subgroup
                                    ←── technologies.subgroup

items ←──ingredients── recipes ──products──→ items/fluids
  │                       │
  │                       ├── category ──→ recipe_categories
  │                       └── surface_conditions (星球限制)
  │
  ├── fuel_category ──→ fuel_categories
  ├── place_result ──→ entities (放置后变成的实体)
  ├── place_as_equipment_result ──→ equipment
  └── spoil_result ──→ items (腐烂后变成)

entities ──crafting_categories──→ recipe_categories (能制作哪些类别的配方)
   │
   ├── resource_categories ──→ resource_categories (矿机能挖什么)
   └── lab_inputs ──→ items (实验室接受哪些科技包)

technologies ──effects──→ unlock-recipe → recipes
   │                   → unlock-space-location → space_locations
   │
   ├── prerequisites ──→ technologies (前置科技)
   ├── successors ──→ technologies (后继科技)
   └── research_unit_ingredients ──→ items (需要的科技包)

space_locations ←──from/to── space_connections

qualities ──next──→ qualities (下一品质等级)

equipment ──equipment_categories──→ equipment_grids.equipment_categories
```

---

## 各集合详细 Schema

### `_meta`

| 字段               | 类型   | 说明                                      |
| ------------------ | ------ | ----------------------------------------- |
| export_mod_version | string | 导出 mod 版本号                           |
| factorio_version   | string | Factorio 游戏版本                         |
| active_mods        | object | 当前启用的 mod 列表 `{mod_name: version}` |

---

### 四种类别集合 — 理解关联关系的关键

这四个类别集合本身只是简单的名称列表（每条只有 `name: string`），但它们是**关联键**，负责把不同集合的数据连接起来。

---

#### `recipe_categories` — 配方类别（29 条）

**关联谁和谁**：把 **recipes（配方）** 和 **entities（机器）** 连接起来。

**提供什么约束**：决定"哪个配方必须在哪种机器上制作"。

**工作原理**：

```
                    recipe_categories
                    (关联键 / 中间桥梁)
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  "smelting"         "crafting"         "chemistry"
        │                  │                  │
  ┌─────┴─────┐      ┌────┴────┐        ┌────┴────┐
  │  recipes   │      │ recipes │        │ recipes │
  │  每条配方  │      │ 每条有  │        │         │
  │  有一个    │      │ 一个    │        │         │
  │  category  │      │ category│        │         │
  └─────┬─────┘      └────┬────┘        └────┬────┘
        │                  │                  │
        ▼                  ▼                  ▼
  iron-plate:         iron-gear-wheel:   sulfuric-acid:
  category="smelting" category="crafting" category="chemistry"
```

```
  entities 每个机器有 crafting_categories[] 数组（可包含多个类别）

  stone-furnace:         assembling-machine-3:       chemical-plant:
  crafting_categories=   crafting_categories=        crafting_categories=
  ["smelting"]           ["crafting",                ["chemistry",
                          "basic-crafting",            "organic"]
                          "advanced-crafting",
                          "electronics",
                          "pressing"]
```

**查询示例**：

| 问题                     | 查法                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| "铁板"能在哪些机器里做？ | 铁板配方 `category = "smelting"` → 找所有 `crafting_categories` 包含 `"smelting"` 的实体 → 石炉、钢炉、电炉  |
| 组装机3能制作哪些配方？  | 组装机3的 `crafting_categories = ["crafting", "basic-crafting", ...]` → 找所有 `category` 在这个列表中的配方 |
| 化工厂能做铁板吗？       | 化工厂 `crafting_categories = ["chemistry", "organic"]` 不包含 `"smelting"` → ❌ 不能                        |

> **一句话总结**：`recipe.category`（一对一）→ `recipe_categories` ← `entity.crafting_categories[]`（一对多），这是个 **多对多** 关系。

---

#### `fuel_categories` — 燃料类别（5 条）

**关联谁和谁**：把 **items（物品）** 和 **消耗燃料的实体** 连接起来。

**提供什么约束**：决定"哪个物品能作为燃料放进哪种机器"。

| 类别      | 可用燃料示例                 | 消耗该燃料的实体           |
| --------- | ---------------------------- | -------------------------- |
| chemical  | 木头、煤、固体燃料、火箭燃料 | 燃烧矿机、石炉、钢炉、火车 |
| nuclear   | 铀燃料棒                     | 核反应堆                   |
| food      | 鱼                           | 角色                       |
| nutrients | 营养物质                     | 农业塔、生化舱             |
| fusion    | 聚变能量包                   | 聚变反应堆                 |

**查法**：`item.fuel_category = "chemical"` → 这个物品可以放进需要 `"chemical"` 燃料的机器。

---

#### `resource_categories` — 资源类别（3 条）

**关联谁和谁**：把 **矿机（mining-drill 实体）** 和 **地面资源** 连接起来。

**提供什么约束**：决定"哪种矿机能开采哪种资源"。

| 类别        | 资源示例             | 可开采的矿机               |
| ----------- | -------------------- | -------------------------- |
| basic-solid | 铁矿、铜矿、石头、煤 | 燃烧矿机、电矿机、大型矿机 |
| basic-fluid | 原油                 | 抽油机                     |
| hard-solid  | 钨矿等               | 大型矿机                   |

**查法**：`entity.resource_categories = ["basic-solid"]` → 这个矿机只能挖 basic-solid 类型的资源。

---

#### `module_categories` — 模块类别（4 条）

**关联谁和谁**：把 **items 中的模块** 和 **entities 中的 allowed_effects** 连接起来。

**提供什么约束**：决定"哪种模块能插进哪个机器"。

| 类别         | 模块物品       | 效果         |
| ------------ | -------------- | ------------ |
| speed        | 速度模块 1/2/3 | 加速制作     |
| productivity | 产能模块 1/2/3 | 额外产出     |
| efficiency   | 节能模块 1/2/3 | 降低能耗     |
| quality      | 品质模块 1/2/3 | 提升品质概率 |

**查法**：模块的 `item.category = "speed"` → 看机器的 `entity.allowed_effects` 是否包含 `"speed"` → 如果包含就能插。

---

> **总结：四种类别的统一模式**
>
> 类别集合本身只是一组字符串标签。它们的价值在于作为**两张表之间的关联键**：
>
> | 类别集合            | 左侧（被约束方）                        | 右侧（提供能力方）                                | 回答的问题             |
> | ------------------- | --------------------------------------- | ------------------------------------------------- | ---------------------- |
> | recipe_categories   | `recipe.category`（每个配方属于1类）    | `entity.crafting_categories[]`（每个机器支持N类） | 哪个机器能做哪个配方？ |
> | fuel_categories     | `item.fuel_category`（每个燃料属于1类） | 消耗燃料的实体类型                                | 哪个物品能当哪种燃料？ |
> | resource_categories | 地面资源类型                            | `entity.resource_categories[]`（矿机支持N类）     | 哪个矿机能挖哪种矿？   |
> | module_categories   | `item.category`（每个模块属于1类）      | `entity.allowed_effects[]`（机器允许N种效果）     | 哪个模块能插哪个机器？ |

---

### `item_groups` — 物品分组（顶层分类）

| 字段      | 类型         | 说明                |
| --------- | ------------ | ------------------- |
| name      | string       | 分组名，共 13 个    |
| order     | string       | 排序键              |
| type      | string       | 固定 `"item-group"` |
| subgroups | `SubGroup[]` | 子分组列表          |

**SubGroup**: `{ name: string, order: string }`

13 个分组及其子分组:

| 分组                                    | 子分组数 | 说明                                              |
| --------------------------------------- | -------- | ------------------------------------------------- |
| logistics                               | 9        | 仓储、传送带、机械臂、管道、火车、物流网络...     |
| production                              | 8        | 工具、能源、采矿机、冶炼、农业、生产机器、模块... |
| intermediate-products                   | 17       | 流体配方、原矿、中间产物、铀处理、各星球工序...   |
| space                                   | 10       | 太空平台、火箭、星球、星际航线...                 |
| combat                                  | 10       | 枪械、弹药、胶囊、装甲、炮塔...                   |
| fluids                                  | 1        | 流体                                              |
| signals                                 | 13       | 虚拟信号（数字、字母、颜色等）                    |
| other                                   | 4        | 参数、品质、其他                                  |
| helmod                                  | 6        | Helmod mod 的分类                                 |
| enemies / tiles / environment / effects | —        | 非计算器相关                                      |

**用途**：在 UI 中按分组+子分组组织显示物品和配方。`items.group` / `recipes.group` / `items.subgroup` / `recipes.subgroup` 都引用这里的名称。

---

### `items` — 物品（342 条）

| 字段                             | 类型     | 必填 | 说明                                                                                             |
| -------------------------------- | -------- | ---- | ------------------------------------------------------------------------------------------------ |
| **name**                         | string   | ✅   | 物品内部 ID                                                                                      |
| **type**                         | string   | ✅   | 物品类型，共 18 种：item, tool, ammo, armor, module, capsule, blueprint, repair-tool...          |
| **stack_size**                   | int      | ✅   | 堆叠数量，1~100000                                                                               |
| **weight**                       | number   | ✅   | 重量（太空平台运载相关），0~10000000                                                             |
| **group**                        | string   | ✅   | 所属大分组：combat / intermediate-products / logistics / production / space / other              |
| **subgroup**                     | string   | ✅   | 所属子分组，46 种                                                                                |
| **order**                        | string   | ✅   | 排序键                                                                                           |
| **hidden**                       | bool     | ✅   | 是否隐藏（39 个隐藏）                                                                            |
| **default_import_location**      | string   | ✅   | 默认导入星球：nauvis / vulcanus / fulgora / gleba / aquilo                                       |
| **fuel_value**                   | int      | ✅   | 燃料热值（焦耳），0 表示不是燃料                                                                 |
| **fuel_acceleration_multiplier** | number   | ✅   | 燃料加速倍率                                                                                     |
| **fuel_top_speed_multiplier**    | number   | ✅   | 燃料极速倍率                                                                                     |
| **fuel_emissions_multiplier**    | int      | ✅   | 燃料排放倍率                                                                                     |
| **flags**                        | string[] | ✅   | 物品标记，可能值：not-stackable, only-in-cursor, spawnable, hide-from-bonus-gui, spoil-result... |
| fuel_category                    | string   | ❌   | 燃料类别（仅 20 个有）：chemical / nuclear / food / nutrients / fusion                           |
| category                         | string   | ❌   | 模块类别（仅 12 个模块有）：speed / productivity / efficiency / quality                          |
| tier                             | int      | ❌   | 模块等级（仅 12 个模块有）：1~3                                                                  |
| place_result                     | string   | ❌   | 放置后变成的实体名（137 个有）                                                                   |
| place_as_equipment_result        | string   | ❌   | 放置后变成的装备名（17 个有）                                                                    |
| spoil_result                     | string   | ❌   | 腐烂产物（10 个有）：spoilage / iron-ore / copper-ore                                            |
| burnt_result                     | string   | ❌   | 燃烧产物（仅 1 个：depleted-uranium-fuel-cell）                                                  |

**常见查询**：

- 找所有可作为燃料的物品 → `fuel_value > 0`
- 找所有模块 → `type == "module"`, 看 `category` 和 `tier`
- 找物品对应的可放置实体 → `place_result`
- 找某个分组下的物品 → `group == "xxx"` 或 `subgroup == "xxx"`

---

### `fluids` — 流体（33 条）

| 字段                     | 类型        | 必填 | 说明                       |
| ------------------------ | ----------- | ---- | -------------------------- |
| **name**                 | string      | ✅   | 流体内部 ID                |
| **group**                | string      | ✅   | 分组                       |
| **subgroup**             | string      | ✅   | 子分组                     |
| **order**                | string      | ✅   | 排序键                     |
| **hidden**               | bool        | ✅   | 是否隐藏（仅 1 个）        |
| **default_temperature**  | int         | ✅   | 默认温度                   |
| **max_temperature**      | int         | ✅   | 最高温度                   |
| **gas_temperature**      | int         | ✅   | 气化温度                   |
| **heat_capacity**        | int         | ✅   | 热容                       |
| **fuel_value**           | int         | ✅   | 燃料热值（仅少数流体有值） |
| **emissions_multiplier** | int         | ✅   | 排放倍率                   |
| **base_color**           | `{r,g,b,a}` | ✅   | 基础颜色                   |
| **flow_color**           | `{r,g,b,a}` | ✅   | 流动颜色                   |

---

### `recipes` — 配方（663 条）⭐ 核心数据

| 字段                          | 类型                 | 必填 | 说明                                         |
| ----------------------------- | -------------------- | ---- | -------------------------------------------- |
| **name**                      | string               | ✅   | 配方内部 ID                                  |
| **category**                  | string               | ✅   | 配方类别（28 种），决定需要什么机器来制作    |
| **energy**                    | number               | ✅   | 制作时间（秒），0.0125~90                    |
| **group**                     | string               | ✅   | 所属大分组                                   |
| **subgroup**                  | string               | ✅   | 所属子分组                                   |
| **order**                     | string               | ✅   | 排序键                                       |
| **enabled**                   | bool                 | ✅   | 是否初始可用（335 个是，328 个需要科技解锁） |
| **hidden**                    | bool                 | ✅   | 是否隐藏（321 个隐藏，主要是回收配方）       |
| **ingredients**               | `Ingredient[]`       | ✅   | 原料列表                                     |
| **products**                  | `Product[]`          | ✅   | 产物列表                                     |
| **allowed_effects**           | string[]             | ✅   | 允许的模块效果，通常 5 种全部允许            |
| **maximum_productivity**      | int                  | ✅   | 最大产能加成，固定 3 (300%)                  |
| **emissions_multiplier**      | int                  | ✅   | 排放倍率                                     |
| **allow_as_intermediate**     | bool                 | ✅   | 可否作为中间产物自动制作                     |
| **allow_decomposition**       | bool                 | ✅   | 可否拆解（273 个不可）                       |
| **allow_intermediates**       | bool                 | ✅   | 可否使用中间产物                             |
| **always_show_made_in**       | bool                 | ✅   | 是否总显示制作场所                           |
| **always_show_products**      | bool                 | ✅   | 是否总显示产物                               |
| **show_amount_in_title**      | bool                 | ✅   | 是否在标题显示数量                           |
| **hide_from_player_crafting** | bool                 | ✅   | 是否从手工制作中隐藏                         |
| main_product                  | `{type, name}`       | ❌   | 主产物（423 个有），用于显示配方图标         |
| surface_conditions            | `SurfaceCondition[]` | ❌   | 星球条件限制（36 个有）                      |

**Ingredient**: `{ type: "item"|"fluid", name: string, amount: number }`

**Product**: `{ type: "item"|"fluid", name: string, amount: number, probability: number, temperature?: number }`

- `probability`: 产出概率，通常为 1，部分小行星破碎配方 < 1
- `temperature`: 仅某些流体产物有（如蒸汽产出温度 500°）

**SurfaceCondition**: `{ property: string, min: number, max: number }`

- property 常见值: `"pressure"`, `"gravity"`, `"magnetic-field"`

**常见查询**：

- 找配方的制作时间 → `energy`
- 找配方需要的机器类型 → `category` → 找 `entities` 中 `crafting_categories` 包含该 category 的
- 找物品的所有制作配方 → 遍历 recipes，检查 `products` 中有该物品的
- 找隐藏的回收配方 → `hidden == true` 且 name 含 `-recycling`
- 找星球专属配方 → 有 `surface_conditions`

---

### `entities` — 生产实体（36 条）⭐ 核心数据

| 字段                         | 类型                 | 必填 | 说明                                 |
| ---------------------------- | -------------------- | ---- | ------------------------------------ |
| **name**                     | string               | ✅   | 实体内部 ID                          |
| **type**                     | string               | ✅   | 实体类型，15 种                      |
| **group**                    | string               | ✅   | 分组                                 |
| **subgroup**                 | string               | ✅   | 子分组                               |
| **order**                    | string               | ✅   | 排序键                               |
| **hidden**                   | bool                 | ✅   | 是否隐藏（全部 false）               |
| **module_inventory_size**    | int                  | ✅   | 模块槽数量，0~8                      |
| **items_to_place_this**      | `{name,count}[]`     | ✅   | 放置该实体需要的物品                 |
| energy_usage                 | number               | ❌   | 能耗（瓦），26 个有                  |
| crafting_categories          | string[]             | ❌   | 可制作的配方类别（17 个有），1~14 种 |
| allowed_effects              | string[]             | ❌   | 允许的模块效果（24 个有）            |
| mining_speed                 | number               | ❌   | 采矿速度（4 个矿机有）               |
| mining_drill_radius          | number               | ❌   | 采矿半径（4 个矿机有）               |
| resource_categories          | string[]             | ❌   | 可采哪些资源类别（4 个矿机有）       |
| lab_inputs                   | string[]             | ❌   | 接受的科技包（2 个实验室有）         |
| next_upgrade                 | string               | ❌   | 下一级升级实体（3 个有）             |
| distribution_effectivity     | number               | ❌   | 信标分配效率（仅 beacon 有）         |
| quality_affects_module_slots | bool                 | ❌   | 品质是否影响模块槽（24 个有）        |
| surface_conditions           | `SurfaceCondition[]` | ❌   | 星球条件限制（12 个有）              |

**实体类型分布**：

| type               | 数量 | 实例                                                                                                                    |
| ------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| assembling-machine | 12   | assembling-machine-1/2/3, chemical-plant, oil-refinery, cryogenic-plant, foundry, crusher, biochamber...                |
| mining-drill       | 4    | burner-mining-drill, electric-mining-drill, big-mining-drill, pumpjack                                                  |
| furnace            | 4    | stone-furnace, steel-furnace, electric-furnace, recycler                                                                |
| lab                | 2    | lab, biolab                                                                                                             |
| boiler             | 2    | boiler, heat-exchanger                                                                                                  |
| reactor            | 2    | nuclear-reactor, heating-tower                                                                                          |
| generator          | 2    | steam-engine, steam-turbine                                                                                             |
| 其他               | 8    | accumulator, solar-panel, beacon, rocket-silo, agricultural-tower, cargo-landing-pad, offshore-pump, space-platform-hub |

**常见查询**：

- 找能制作某category配方的机器 → `crafting_categories` 包含该 category
- 找机器的制作速度 → `energy_usage`（注意这是能耗，制作速度在 data-raw 的 `crafting_speed` 中，mod 未导出，需补充⚠️）
- 找可以放模块的机器 → `module_inventory_size > 0`

---

### `technologies` — 科技（275 条）

| 字段                          | 类型              | 必填 | 说明                                                                                                               |
| ----------------------------- | ----------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| **name**                      | string            | ✅   | 科技内部 ID                                                                                                        |
| **group** / **subgroup**      | string            | ✅   | 分组（当前全部为 "other"）                                                                                         |
| **order**                     | string            | ✅   | 排序键                                                                                                             |
| **enabled** / **hidden**      | bool              | ✅   | 状态（当前全部 enabled, 全部不 hidden）                                                                            |
| **level**                     | int               | ✅   | 当前等级，1~7                                                                                                      |
| **max_level**                 | int               | ✅   | 最大等级，1~4294967295（无限研究用 uint32 max）                                                                    |
| **upgrade**                   | bool              | ✅   | 是否为升级型科技（106 个是）                                                                                       |
| **essential**                 | bool              | ✅   | 是否为关键科技（17 个是）                                                                                          |
| **allows_productivity**       | bool              | ✅   | 是否允许产能加成（全部 true）                                                                                      |
| **visible_when_disabled**     | bool              | ✅   | 禁用时是否可见（全部 false）                                                                                       |
| **prerequisites**             | string[]          | ✅   | 前置科技名列表                                                                                                     |
| **successors**                | string[]          | ✅   | 后继科技名列表                                                                                                     |
| **effects**                   | `Effect[]`        | ✅   | 科技效果列表                                                                                                       |
| **research_unit_count**       | int               | ✅   | 研究所需科技包数量，1~5000                                                                                         |
| **research_unit_energy**      | int               | ✅   | 每个研究单元耗时（tick，60tick=1秒），0~7200                                                                       |
| **research_unit_ingredients** | `{name,amount}[]` | ✅   | 需要的科技包种类和数量                                                                                             |
| research_unit_count_formula   | string            | ❌   | 无限研究的数量公式（23 个有），如 `"1.5^L*1000"`                                                                   |
| research_trigger              | object            | ❌   | 触发型研究条件（32 个有），type: craft-item / build-entity / mine-entity / capture-spawner / create-space-platform |

**Effect 类型**（31 种）：

| 类型                                                     | 说明              | 额外字段                 |
| -------------------------------------------------------- | ----------------- | ------------------------ |
| **unlock-recipe**                                        | 解锁配方          | `recipe: string`         |
| **unlock-space-location**                                | 解锁星球          | `space_location: string` |
| **unlock-quality**                                       | 解锁品质系统      | —                        |
| change-recipe-productivity                               | 修改配方产能      | —                        |
| mining-drill-productivity-bonus                          | 矿机产能          | `modifier: number`       |
| laboratory-productivity / laboratory-speed               | 实验室效果        | `modifier: number`       |
| worker-robot-speed / worker-robot-storage                | 机器人            | `modifier: number`       |
| character-mining-speed / character-health-bonus          | 角色属性          | `modifier: number`       |
| ammo-damage / gun-speed / turret-attack                  | 战斗属性          | `modifier: number`       |
| inserter-stack-size-bonus / bulk-inserter-capacity-bonus | 机械臂            | `modifier: number`       |
| belt-stack-size-bonus                                    | 传送带堆叠        | `modifier: number`       |
| train-braking-force-bonus                                | 火车制动          | `modifier: number`       |
| artillery-range                                          | 炮台射程          | `modifier: number`       |
| 其他                                                     | 各种解锁/布尔效果 | `modifier: bool`         |

**常见查询**：

- 找解锁某配方的科技 → 遍历 technologies，检查 effects 中 `type == "unlock-recipe" && recipe == "xxx"`
- 构建科技树 → 用 `prerequisites` + `successors`
- 计算研究成本 → `research_unit_count * research_unit_ingredients`，时间 = `research_unit_count * research_unit_energy / 60` 秒

---

### `qualities` — 品质等级（6 条）

| 字段                                   | 类型        | 说明                                                     |
| -------------------------------------- | ----------- | -------------------------------------------------------- |
| name                                   | string      | normal, uncommon, rare, epic, legendary, quality-unknown |
| level                                  | int         | 0~5                                                      |
| next                                   | string?     | 下一品质名                                               |
| next_probability                       | number      | 升级概率，0~0.1                                          |
| color                                  | `{r,g,b,a}` | 品质颜色                                                 |
| beacon_power_usage_multiplier          | number      | 信标能耗倍率                                             |
| mining_drill_resource_drain_multiplier | number      | 矿机资源消耗倍率                                         |
| science_pack_drain_multiplier          | number      | 科技包消耗倍率                                           |

---

### `space_locations` — 星球（8 条）

| 字段                 | 类型     | 说明                                                                                                  |
| -------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| name                 | string   | nauvis, vulcanus, gleba, fulgora, aquilo, solar-system-edge, shattered-planet, space-location-unknown |
| position             | `{x, y}` | 星图坐标                                                                                              |
| solar_power_in_space | int      | 太空太阳能功率，1~600                                                                                 |
| surface_properties   | object?  | 表面属性（仅 5 个有）：day-night-cycle, gravity, magnetic-field, pressure, solar-power                |

### `space_connections` — 星际航线（9 条）

| 字段   | 类型   | 说明                            |
| ------ | ------ | ------------------------------- |
| name   | string | 航线 ID，如 `"nauvis-vulcanus"` |
| from   | string | 起点星球                        |
| to     | string | 终点星球                        |
| length | int    | 航线长度，15000~4000000         |

---

### `equipment` — 装甲装备（18 条）

| 字段                 | 类型              | 说明                                                                                                 |
| -------------------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| name                 | string            | 装备内部 ID                                                                                          |
| type                 | string            | 11 种类型：battery-equipment, energy-shield-equipment, solar-panel-equipment, generator-equipment... |
| shape                | `{width, height}` | 占用的网格大小                                                                                       |
| energy_production    | number            | 能量产出                                                                                             |
| energy_per_shield    | int               | 每点护盾能量消耗                                                                                     |
| equipment_categories | string[]          | 适用的装备类别（armor / atp-equipment-category）                                                     |
| take_result          | string?           | 拆下后得到的物品                                                                                     |

### `equipment_grids` — 装甲网格（6 条）

| 字段                 | 类型     | 说明                   |
| -------------------- | -------- | ---------------------- |
| name                 | string   | 网格 ID                |
| width / height       | int      | 网格尺寸，2×4 到 10×12 |
| equipment_categories | string[] | 兼容的装备类别         |

---

## 快速查询指南

| 我想知道...                        | 去哪找                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------- |
| 物品的基本信息（堆叠、重量、分组） | `items`                                                                 |
| 物品是否可作为燃料                 | `items` → `fuel_value > 0` + `fuel_category`                            |
| 物品是否是模块                     | `items` → `type == "module"`, 看 `category` 和 `tier`                   |
| 物品对应的建筑实体                 | `items` → `place_result` → `entities`                                   |
| 流体的温度范围                     | `fluids` → `default_temperature` / `max_temperature`                    |
| 配方的原料和产物                   | `recipes` → `ingredients` / `products`                                  |
| 配方的制作时间                     | `recipes` → `energy`（秒）                                              |
| 配方需要什么机器做                 | `recipes` → `category` → 找 `entities.crafting_categories` 包含它的     |
| 哪些机器能做这个配方               | `entities` → 筛选 `crafting_categories` 包含 `recipe.category`          |
| 机器有几个模块槽                   | `entities` → `module_inventory_size`                                    |
| 配方允许哪些模块效果               | `recipes` → `allowed_effects`                                           |
| 配方是否初始可用                   | `recipes` → `enabled`                                                   |
| 科技解锁了哪些配方                 | `technologies` → `effects` 中 `type == "unlock-recipe"`                 |
| 哪个科技解锁了某配方               | 遍历 `technologies`，匹配 `effects`                                     |
| 科技的前置和后继                   | `technologies` → `prerequisites` / `successors`                         |
| 科技研究成本                       | `technologies` → `research_unit_count` × `research_unit_ingredients`    |
| 研究所需时间                       | `technologies` → `research_unit_count` × `research_unit_energy` / 60 秒 |
| 配方有星球限制吗                   | `recipes` → `surface_conditions`                                        |
| 某星球有哪些专属配方               | 遍历 `recipes`，匹配 `surface_conditions.property`                      |
| 品质升级概率                       | `qualities` → `next_probability`                                        |
| 星球之间的距离                     | `space_connections` → `length`                                          |
| 物品分类的层级结构                 | `item_groups` → `subgroups`                                             |

---

## 已知缺失 ⚠️

以下数据在 `game-data.json` 中**未导出**，如需要需从 `data-raw-dump.json` 补充：

| 缺失字段                             | 所属集合 | 说明                                                                               |
| ------------------------------------ | -------- | ---------------------------------------------------------------------------------- |
| `crafting_speed`                     | entities | 机器制作速度倍率（如 assembling-machine-1 = 0.5）。当前只有 `energy_usage`（能耗） |
| `energy_source`                      | entities | 能源类型（电力/燃烧/热能）和排放数据                                               |
| `module_slots` 被品质影响的具体计算  | entities | `quality_affects_module_slots` 为 bool，但具体公式未知                             |
| `pollution` / `emissions_per_minute` | entities | 每分钟排放量                                                                       |
| `icon` 路径                          | 所有集合 | 图标文件路径（已通过 icon atlas 独立处理）                                         |
