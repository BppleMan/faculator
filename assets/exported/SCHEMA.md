# game-data.json Schema 文档

> 由 Faculator Exporter mod 从 Factorio 2.0 运行时 API 导出，包含计算器所需的全部游戏数据。
> 当前版本: export_mod `0.1.0`, Factorio `2.0.76` (含 Space Age DLC)

## 概览

```
game-data.json (~1.8MB)
├── game                     # 导出上下文信息
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

## 领域建模优先视角

> 本节优先定义各 JSON 集合在 DDD 中承担的角色。
> 本文同时覆盖当前仓库中的样例 `game-data.json`，以及导出 mod 已补充的目标 schema；若样例文件尚未重新导出，新增字段需在重新执行
> mod 导出后才会出现在 JSON 中。
> 本文定位为伪 UML / 开发指导文档，默认按“保真优先”原则组织：导出中存在的字段应尽量逐项列出，不预先进行领域裁剪。

### 1. 参与量化计算的核心对象

- `items` 和 `fluids` 在**物理存储上宜分表**，因为字段差异很大。
- 但在**领域层**它们属于同一类“可被配方消耗、也可被配方产出”的对象。
- 在 Rust 中宜统一抽象成 `Goods` 之类的枚举，而不是直接把两者混成一张宽表。

```rust
enum Goods {
    Item { name: String },
    Fluid { name: String },
}
```

`Goods` 一词用于强调“产线中流动的物料项”这一语义，而不是地图实体或 UI 项。

### 2. `item` 和 `entity` 不是同一个对象

- `item: assembling-machine-1` 表示背包里的物品，可被制造、运输、放置。
- `entity: assembling-machine-1` 表示地图上的机器，可执行配方、消耗能源、安装模块。
- 二者**名称相同但语义不同**，只能通过关系关联，不能直接等同。

对应关系是：

- `items.place_result -> entities.name`
- `entities.items_to_place_this[] -> items.name`

这也是为什么 `item` 和 `entity` 应该在 DDD 中是两个独立对象。

### 2.5 能源能力是“组件”，不是另一张隐藏实体表

- 像 `burner`、`electric`、`fluid`、`heat` 这种能力，在 Factorio 运行时 API 里表现为挂在 `LuaEntityPrototype` 上的**能量源子原型
  **。
- 它们确实在概念上像“给实体插了一个能力模块”，但在建模时更接近 **Entity 的组件 / Value Object**，而不是另一条独立 `entity`
  记录。
- 在 DDD/数据库中，“燃烧器”不宜再建成一张独立实体表与机器做 1:1 关联；更自然的建模方式如下：

```text
Entity
 ├── ProductionCapability
 ├── ModuleCapability
 └── EnergySource
      ├── BurnerEnergySource
      ├── ElectricEnergySource
      ├── FluidEnergySource
      ├── HeatEnergySource
      └── VoidEnergySource
```

- 其中 `BurnerEnergySource` 负责回答：这台机器能接受哪些燃料类别、燃料槽多大、燃烧效率是多少。
- “某个实体能烧什么”并不是由 `entity` 直接写死一个布尔值，而是由其挂载的 `energy_sources.burner` 组件提供该能力。

### 3. `recipe` 才拥有 `category`，`item` 本身没有

- `recipe.category` 决定这个配方需要什么类型的机器来执行。
- `entity.crafting_categories[]` 决定这台机器支持哪些配方类别。
- `item` 或 `fluid` 本身**不属于某个 crafting category**。

真实关系如下：

```text
Goods ──作为原料/产物──→ Recipe ──按 category 约束──→ Entity
```

### 4. `item_groups` 是“百科目录 / UI 导航树”

- `item_groups -> subgroups -> items/recipes/entities` 这条链路是给用户看的。
- 它适合在 DDD 中作为“目录/展示子域”，服务于百科浏览、搜索过滤、分组展示。
- 它不负责机器兼容性、能量学、模块效果这些量化规则。

### 5. `xxx_categories` 更像值对象/枚举，不是核心实体

- `recipe_categories`、`fuel_categories`、`resource_categories`、`module_categories` 本质上是**受控取值集合**。
- 它们的主要作用是给字符串字段提供边界、让关联更安全。
- 在 Rust 中可落成 enum / value object；若未来需要支持 mod，宜使用 `Unknown(String)` 作为兜底分支。

```rust
enum CraftingCategory {
    Crafting,
    Smelting,
    Chemistry,
    Unknown(String),
}
```

### 6. 可以粗分成三层子域

- **核心计算域**：`Goods`、`recipes`、`entities`
- **约束/能力域**：`technologies`、`qualities`、`space_locations`、各种 `*_categories`、能源系统字段、模块/信标字段
- **展示/百科域**：`item_groups`、翻译、图标、排序字段

### 7. 字段联动与用法规则

> 本节不重复罗列字段，而是说明字段用途、联动关系与建模解释方式。

#### 7.1 `group` / `subgroup` / `order` 是展示排序链，不是生产规则

- `group` 和 `subgroup` 主要用于 UI、百科目录、筛选面板、默认列表排序。
- `order` 是同一层级中的字符串排序键，Factorio UI 会按它做字典序排序，而不是按数值排序。
- `order` 被设计成字符串而不是整数，核心目的不是计数，而是提供**可人工编排、可插队、可分层表达**的排序键。
- 这三个字段通常一起使用：

```text
group -> subgroup -> order -> name
```

- 在数据库或 Rust 模型中，宜将它们视为“展示排序元数据”，不应误当成生产兼容性规则。
- `order` 的常见写法可以分成三类：- 单段排序：`a`、`b`、`c` - 多段排序：`a[speed]-b[speed-module-2]` - 预留插入位：`d` 与 `e`
  之间可以插入 `da`
- 这类写法的主要收益：- 不需要全局重编号；新增对象时只需插入新的字符串段 -
  可以把“先按大类，再按子类，再按具体对象”压进一个可比较的键 - 对 mod 也更友好；扩展内容可以在原有排序体系中插入而不必改动整列编号
- 当前导出中的真实例子：- `item_group.production.order = b` - `subgroup.production-machine.order = e` -
  `item.assembling-machine-1.order = a[assembling-machine-1]` -
  `item.assembling-machine-2.order = b[assembling-machine-2]` -
  `item.speed-module-1.order = a[speed]-a[speed-module-1]` - `item.speed-module-2.order = a[speed]-b[speed-module-2]` -
  `recipe.electronic-circuit.order = b[circuits]-a[electronic-circuit]` -
  `recipe.advanced-circuit.order = b[circuits]-b[advanced-circuit]`
- 这些值可以直接按字符串比较理解：

```text
a[assembling-machine-1]
< b[assembling-machine-2]
< c[assembling-machine-3]

a[speed]-a[speed-module-1]
< a[speed]-b[speed-module-2]
< a[speed]-c[speed-module-3]
```

- 因而 `order` 看起来“奇怪”，本质上是把“排序意图”写进了字符串，而不是采用单纯的数字序号。
- 建模时不应把 `order` 当成可计算业务字段；它更接近一段 UI 排序 DSL。
- 实现上最稳妥的做法是：原样存储 `order`，按 `group` / `subgroup` / `order` / `name` 排序展示，不对 `order` 的内部格式做强语义解析。

#### 7.2 `items.place_result` 和 `entities.items_to_place_this[]` 构成物品 <-> 实体双向映射

- `items.place_result -> entities.name` 表示“背包里的这个物品，放下后会变成哪台地图实体”。
- `entities.items_to_place_this[] -> items.name` 表示“要在地图上放出这个实体，需要消耗哪些物品”。
- 通常大多数简单机器是 1:1，例如：- `item: assembling-machine-2.place_result = assembling-machine-2` -
  `entity: assembling-machine-2.items_to_place_this = [{ name: assembling-machine-2, count: 1 }]`
- 但建模时不要假设永远 1:1，因为某些实体可能来自多个物品组合，或不同放置路径。

#### 7.3 `fuel_value` / `fuel_category` / `energy_sources.burner.fuel_categories[]` 一起决定燃料兼容性

- `items.fuel_value > 0` 或 `fluids.fuel_value > 0` 说明它是“有热值的可燃物”。
- `items.fuel_category` / `fluids.fuel_category` 说明它属于哪一类燃料。
- `entities.energy_sources.burner.fuel_categories[]` 说明这台机器接受哪些燃料类。
- 三者联动关系是：

```text
goods.fuel_value > 0
goods.fuel_category == chemical
entity.energy_sources.burner.fuel_categories contains chemical
=> 该 goods 可以作为该 entity 的燃料
```

- 例子：煤炭 `fuel_category = chemical`，锅炉 `energy_sources.burner.fuel_categories = [chemical]`，所以锅炉能烧煤。

#### 7.4 `item.category` / `item.module_effects` / `entity.allowed_effects` /

`entity.allowed_module_categories` 一起决定模块兼容性

- `item.category` 是模块所属类别，如 `speed` / `productivity` / `efficiency` / `quality`。
- `item.module_effects` 是该模块实际提供的效果数值。
- `entity.allowed_effects` 是机器允许接收哪些效果。
- `entity.allowed_module_categories` 是机器额外限制的模块类别白名单。
- 建模时宜按“先类别，再效果，再数值”的顺序理解：

```text
module.item.category == speed
module.item.module_effects.speed = +0.2
entity.allowed_effects contains speed
entity.allowed_module_categories is nil or contains speed
=> 该模块可插入该机器，并提供 speed 加成
```

- 例子：速度模块的 `category = speed`，组装机 `allowed_effects` 包含 `speed`，所以可插；炼油厂若禁止某效果，即使名字上像模块，也不应允许。

#### 7.5 `effect_receiver` 决定模块、beacon、地表效果是否真正生效

- `allowed_effects` 只回答“允许哪些效果类型进入规则系统”。
- `effect_receiver` 才回答“这台机器实际上是否接收模块效果 / beacon 效果 / surface 效果”。
- 联动时要同时判断：- `module_inventory_size > 0` - `allowed_effects` 包含该效果 -
  `effect_receiver.uses_module_effects == true`
- 对 beacon 也是同理：- `effect_receiver.uses_beacon_effects == true` - 再乘 `distribution_effectivity` 和
  `beacon_profile`

#### 7.6 `recipes.allowed_effects` / `recipes.allowed_module_categories` 是“配方层限制”，会覆盖机器层能力

- 机器允许插模块，不等于所有配方都允许吃该模块效果。
- `recipes.allowed_effects` 表示该配方允许哪些效果参与运算。
- `recipes.allowed_module_categories` 表示该配方允许哪些模块类别。
- 所以最终判断通常是“实体能力 ∩ 配方能力”。
- 例子：某机器允许 `productivity`，但某回收配方可能不允许 `productivity`，那么该配方执行时就不能吃产能插件。

#### 7.7 `lab_inputs` / `research_unit_ingredients` / `researching_speed` / `science_pack_drain_rate_percent` 一起决定科研速率

- `technologies.research_unit_ingredients` 定义某科技需要哪些科技包。
- `entities.lab_inputs` 定义某实验室接受哪些科技包。
- 只有当 `research_unit_ingredients` 中的每种科技包都包含在 `lab_inputs` 里，这个实验室才能研究该科技。
- `researching_speed` 是实验室研究速度倍率。
- `science_pack_drain_rate_percent` 是每个研究点消耗科技瓶耐久的比例。
- 常见计算：

```text
实验室每秒研究点数 = researching_speed
实验室每秒单种科技瓶消耗 = researching_speed * science_pack_drain_rate_percent / 100
```

#### 7.8 `technologies.effects` 与 `recipes` / `space_locations` / `qualities` 联动

- `unlock-recipe`：`technology.effects[].recipe -> recipes.name`
- `unlock-space-location`：`technology.effects[].space_location -> space_locations.name`
- `unlock-quality`：启用品质系统，与 `qualities` 集合联动
- 这意味着科技树不是独立表，而是“解锁其他域对象的规则表”。

#### 7.9 `qualities` 会反向影响实体与科研消耗

- `qualities.science_pack_drain_multiplier` 会影响科技包消耗倍率。
- `qualities.beacon_power_usage_multiplier` 会影响 beacon 的能耗。
- `entities.quality_affects_module_slots` 表示实体模块槽是否随品质变化。
- 所以品质不是单独的 UI 标签，而是会反过来改写生产和科研参数的约束层。

#### 7.10 `surface_conditions` / `space_locations.surface_properties` / `space_connections` 构成星球约束系统

- `recipes.surface_conditions` 和 `entities.surface_conditions` 说明对象在什么地表属性下可用。
- `space_locations.surface_properties` 给出星球实际属性。
- `space_connections` 描述地点之间如何相连。
- 例子：- 某配方要求 `pressure = 4000` - 只有满足该压力属性的 `space_location` 上才允许执行

#### 7.11 `hidden` / `enabled` / `visible_when_disabled` 是“可见性状态”，不要和“可计算性”混淆

- `hidden` 说明默认不面向玩家显示，但对象可能仍然存在并参与系统运算。
- `enabled` 说明是否初始可用，特别常见于配方和科技。
- `visible_when_disabled` 说明未解锁时是否仍展示在科技树中。
- 例子：很多回收配方是 `hidden = true`，但量化器仍可能需要识别它们。

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

### `game`

| 字段             | 类型   | 说明                                      |
| ---------------- | ------ | ----------------------------------------- |
| exporter_version | string | 导出 mod 版本号                           |
| factorio_version | string | Factorio 游戏版本                         |
| active_mods      | object | 当前启用的 mod 列表 `{mod_name: version}` |

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

> **一句话总结**：`recipe.category`（一对一）→ `recipe_categories` ← `entity.crafting_categories[]`（一对多），这是个 **多对多
> ** 关系。

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

**用途**：在 UI 中按分组+子分组组织显示物品和配方。`items.group` / `recipes.group` / `items.subgroup` / `recipes.subgroup`
都引用这里的名称。

---

### `items` — 物品（342 条）

| 字段                             | 类型        | 必填 | 说明                                                                                             |
| -------------------------------- | ----------- | ---- | ------------------------------------------------------------------------------------------------ |
| **name**                         | string      | ✅   | 物品内部 ID                                                                                      |
| **type**                         | string      | ✅   | 物品类型，共 18 种：item, tool, ammo, armor, module, capsule, blueprint, repair-tool...          |
| **stack_size**                   | int         | ✅   | 堆叠数量，1~100000                                                                               |
| **weight**                       | number      | ✅   | 重量（太空平台运载相关），0~10000000                                                             |
| **group**                        | string      | ✅   | 所属大分组：combat / intermediate-products / logistics / production / space / other              |
| **subgroup**                     | string      | ✅   | 所属子分组，46 种                                                                                |
| **order**                        | string      | ✅   | 排序键                                                                                           |
| **hidden**                       | bool        | ✅   | 是否隐藏（39 个隐藏）                                                                            |
| **default_import_location**      | string      | ✅   | 默认导入星球：nauvis / vulcanus / fulgora / gleba / aquilo                                       |
| **fuel_value**                   | int         | ✅   | 燃料热值（焦耳），0 表示不是燃料                                                                 |
| **fuel_acceleration_multiplier** | number      | ✅   | 燃料加速倍率                                                                                     |
| **fuel_top_speed_multiplier**    | number      | ✅   | 燃料极速倍率                                                                                     |
| **fuel_emissions_multiplier**    | int         | ✅   | 燃料排放倍率                                                                                     |
| **flags**                        | string[]    | ✅   | 物品标记，可能值：not-stackable, only-in-cursor, spawnable, hide-from-bonus-gui, spoil-result... |
| fuel_category                    | string      | ❌   | 燃料类别（仅 20 个有）：chemical / nuclear / food / nutrients / fusion                           |
| module_effects                   | object      | ❌   | 模块的具体效果（仅模块有）：speed / productivity / consumption / pollution / quality             |
| category                         | string      | ❌   | 模块类别（仅 12 个模块有）：speed / productivity / efficiency / quality                          |
| tier                             | int         | ❌   | 模块等级（仅 12 个模块有）：1~3                                                                  |
| place_result                     | string      | ❌   | 放置后变成的实体名（137 个有）                                                                   |
| rocket_launch_products           | `Product[]` | ❌   | 火箭发射产物（仅少数物品有）                                                                     |
| place_as_equipment_result        | string      | ❌   | 放置后变成的装备名（17 个有）                                                                    |
| spoil_result                     | string      | ❌   | 腐烂产物（10 个有）：spoilage / iron-ore / copper-ore                                            |
| burnt_result                     | string      | ❌   | 燃烧产物（仅 1 个：depleted-uranium-fuel-cell）                                                  |

**常见查询**：

- 找所有可作为燃料的物品 → `fuel_value > 0`
- 找所有模块 → `type == "module"`, 看 `category`、`tier` 和 `module_effects`
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
| allowed_module_categories     | string[]             | ❌   | 允许的模块类别；部分配方会显式限制模块类型   |
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
| additional_categories         | string[]             | ❌   | 配方额外所属的制作类别（Space Age 字段）     |
| unlock_results                | `{type,name}[]`      | ❌   | 配方附带解锁/产生的结果引用                  |

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

### `entities` — 生产实体 ⭐ 核心数据

| 字段                                             | 类型                 | 必填 | 说明                                                              |
| ------------------------------------------------ | -------------------- | ---- | ----------------------------------------------------------------- |
| **name**                                         | string               | ✅   | 实体内部 ID                                                       |
| **type**                                         | string               | ✅   | 实体类型                                                          |
| **group**                                        | string               | ✅   | 分组                                                              |
| **subgroup**                                     | string               | ✅   | 子分组                                                            |
| **order**                                        | string               | ✅   | 排序键                                                            |
| **hidden**                                       | bool                 | ✅   | 是否隐藏                                                          |
| **module_inventory_size**                        | int                  | ✅   | 模块槽数量，0~8                                                   |
| **items_to_place_this**                          | `{name,count}[]`     | ✅   | 放置该实体需要的物品                                              |
| crafting_categories                              | string[]             | ❌   | 可制作的配方类别                                                  |
| crafting_speed                                   | number               | ❌   | 制作速度倍率，如组装机 1 = 0.5                                    |
| allowed_effects                                  | string[]             | ❌   | 允许的模块效果：speed / productivity / consumption / pollution... |
| allowed_module_categories                        | string[]             | ❌   | 允许插入的模块类别                                                |
| effect_receiver                                  | object               | ❌   | 这台机器是否吃模块/信标/地表效果，以及其基础效果                  |
| energy_usage                                     | number               | ❌   | 基础能耗（瓦）                                                    |
| max_energy_usage                                 | number               | ❌   | 理论最大能耗                                                      |
| max_energy_production                            | number               | ❌   | 理论最大发电功率                                                  |
| max_power_output                                 | number               | ❌   | 发电机/热能发电机的最大输出功率                                   |
| effectivity                                      | number               | ❌   | 发电/燃料能量利用率                                               |
| energy_sources                                   | object               | ❌   | 统一汇总的能源系统信息，见下方说明                                |
| fluid_usage_per_tick                             | number               | ❌   | 发电机/聚变机每 tick 流体消耗量                                   |
| maximum_temperature                              | number               | ❌   | 发电机输入流体可接受的最高温度                                    |
| burns_fluid                                      | bool                 | ❌   | 流体发电是否按 fuel_value 燃烧                                    |
| scale_fluid_usage                                | bool                 | ❌   | 发电机是否随负载缩放流体消耗                                      |
| destroy_non_fuel_fluid                           | bool                 | ❌   | 是否销毁非燃料流体                                                |
| target_temperature                               | number               | ❌   | 锅炉/聚变反应堆目标温度                                           |
| boiler_mode                                      | string               | ❌   | 锅炉工作模式                                                      |
| fluidbox_prototypes                              | object[]             | ❌   | 实体的流体输入输出接口                                            |
| mining_speed                                     | number               | ❌   | 采矿速度                                                          |
| mining_drill_radius                              | number               | ❌   | 采矿半径                                                          |
| resource_categories                              | string[]             | ❌   | 可采哪些资源类别                                                  |
| lab_inputs                                       | string[]             | ❌   | 实验室接受哪些科技瓶                                              |
| researching_speed                                | number               | ❌   | 实验室研究速度倍率                                                |
| science_pack_drain_rate_percent                  | int                  | ❌   | 每个研究点消耗多少 % 的科技瓶耐久                                 |
| distribution_effectivity                         | number               | ❌   | beacon 模块效果传递倍率                                           |
| distribution_effectivity_bonus_per_quality_level | number               | ❌   | beacon 品质每级增加多少传递倍率                                   |
| beacon_profile                                   | number[]             | ❌   | beacon 多塔叠加时的采样曲线                                       |
| beacon_counter                                   | string               | ❌   | beacon 叠加计数方式：`total` / `same_type`                        |
| supply_area_distance                             | number               | ❌   | beacon 生效半径                                                   |
| neighbour_bonus                                  | number               | ❌   | 反应堆/聚变反应堆相邻加成                                         |
| next_upgrade                                     | string               | ❌   | 下一级升级实体                                                    |
| quality_affects_module_slots                     | bool                 | ❌   | 品质是否影响模块槽                                                |
| surface_conditions                               | `SurfaceCondition[]` | ❌   | 星球条件限制                                                      |

**`energy_sources` 子结构**：

- 这一整块在 DDD 中宜视为 `Entity` 的**能源能力组件**，而不是新的实体表。
- `types: string[]`：该实体具备哪些能量源，如 `burner` / `electric` / `fluid` / `heat` / `void`
- `burner`：`effectivity`、`fuel_categories[]`、`fuel_inventory_size`、`burnt_inventory_size`、`initial_fuel`、
  `emissions_per_joule`
- `electric`：`buffer_capacity`、`usage_priority`、`drain`、`input_flow_limit`、`output_flow_limit`、`emissions_per_joule`
- `fluid`：`effectivity`、`fluid_usage_per_tick`、`burns_fluid`、`scale_fluid_usage`、`maximum_temperature`、`fluid_box`
- `heat`：`max_temperature`、`specific_heat`、`max_transfer`、`min_working_temperature`、`heat_buffer`
- `void`：仅用于吞噬/忽略能量的场景，一般只含 `emissions_per_joule`

**`effect_receiver` 子结构**：

- `base_effect`：机器自带的基础效果字典
- `uses_module_effects`：是否吃模块效果
- `uses_beacon_effects`：是否吃 beacon 效果
- `uses_surface_effects`：是否吃地表/星球环境效果

**实体类型分布**：

| type               | 数量 | 实例                                                                                                     |
| ------------------ | ---- | -------------------------------------------------------------------------------------------------------- |
| assembling-machine | 12   | assembling-machine-1/2/3, chemical-plant, oil-refinery, cryogenic-plant, foundry, crusher, biochamber... |
| mining-drill       | 4    | burner-mining-drill, electric-mining-drill, big-mining-drill, pumpjack                                   |
| furnace            | 4    | stone-furnace, steel-furnace, electric-furnace, recycler                                                 |
| lab                | 2    | lab, biolab                                                                                              |
| boiler             | 2    | boiler, heat-exchanger                                                                                   |
| reactor            | 2    | nuclear-reactor, heating-tower                                                                           |
| generator          | 2    | steam-engine, steam-turbine                                                                              |
| 其他               | —    | accumulator, solar-panel, beacon, burner-generator, fusion-generator, fusion-reactor, rocket-silo...     |

**常见查询**：

- 找能制作某category配方的机器 → `crafting_categories` 包含该 category
- 找机器的制作速度 → `crafting_speed`
- 找可以放模块的机器 → `module_inventory_size > 0`
- 找某台机器能接受哪些燃料 → `energy_sources.burner.fuel_categories[]`，再去 `items/fluids` 找对应 `fuel_category`
- 算燃烧机器的燃料消耗速率 → `功率 / (燃料热值 × burner.effectivity)`
- 找发电机最大电功率 → `max_power_output` 或 `max_energy_production`
- 算流体发电机每秒流体消耗 → `fluid_usage_per_tick × 60`
- 算实验室每秒消耗科技瓶速率 → `researching_speed × science_pack_drain_rate_percent / 100`
- 找 beacon 对周围机器的加成倍率 → `distribution_effectivity` + `beacon_profile`

---

### `technologies` — 科技（275 条）

| 字段                          | 类型              | 必填 | 说明                                                                                                                          |
| ----------------------------- | ----------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| **name**                      | string            | ✅   | 科技内部 ID                                                                                                                   |
| **group** / **subgroup**      | string            | ✅   | 分组（当前全部为 "other"）                                                                                                    |
| **order**                     | string            | ✅   | 排序键                                                                                                                        |
| **enabled** / **hidden**      | bool              | ✅   | 状态（当前全部 enabled, 全部不 hidden）                                                                                       |
| **level**                     | int               | ✅   | 当前等级，1~7                                                                                                                 |
| **max_level**                 | int               | ✅   | 最大等级，1~4294967295（无限研究用 uint32 max）                                                                               |
| **upgrade**                   | bool              | ✅   | 是否为升级型科技（106 个是）                                                                                                  |
| **essential**                 | bool              | ✅   | 是否为关键科技（17 个是）                                                                                                     |
| **allows_productivity**       | bool              | ✅   | 是否允许产能加成（全部 true）                                                                                                 |
| **visible_when_disabled**     | bool              | ✅   | 禁用时是否可见（全部 false）                                                                                                  |
| **prerequisites**             | string[]          | ✅   | 前置科技名列表                                                                                                                |
| **successors**                | string[]          | ✅   | 后继科技名列表                                                                                                                |
| **effects**                   | `Effect[]`        | ✅   | 科技效果列表                                                                                                                  |
| **research_unit_count**       | int               | ✅   | 研究所需科技包数量，1~5000                                                                                                    |
| **research_unit_energy**      | int               | ✅   | 每个研究单元耗时（tick，60tick=1秒），0~7200                                                                                  |
| **research_unit_ingredients** | `{name,amount}[]` | ✅   | 需要的科技包种类和数量                                                                                                        |
| research_unit_count_formula   | string            | ❌   | 无限研究的数量公式（23 个有），如 `"1.5^L*1000"`                                                                              |
| research_trigger              | object            | ❌   | 触发型研究条件；当前导出至少保留 `type`，如 craft-item / build-entity / mine-entity / capture-spawner / create-space-platform |

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
- 计算研究成本 → `research_unit_count * research_unit_ingredients`，时间 =
  `research_unit_count * research_unit_energy / 60` 秒
- 算单个实验室每秒消耗多少科技瓶 → 结合 `entities(type == "lab")` 的 `researching_speed` 与
  `science_pack_drain_rate_percent`

---

### `qualities` — 品质等级（6 条）

| 字段                                   | 类型        | 说明                                                     |
| -------------------------------------- | ----------- | -------------------------------------------------------- |
| group / subgroup / order / hidden      | string/bool | 与其他原型一致的基础元信息；适合直接映射建模             |
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

| 字段                              | 类型        | 说明                                                                                                  |
| --------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| group / subgroup / order / hidden | string/bool | 与其他原型一致的基础元信息                                                                            |
| name                              | string      | nauvis, vulcanus, gleba, fulgora, aquilo, solar-system-edge, shattered-planet, space-location-unknown |
| position                          | `{x, y}`    | 星图坐标                                                                                              |
| solar_power_in_space              | int         | 太空太阳能功率，1~600                                                                                 |
| surface_properties                | object?     | 表面属性（仅 5 个有）：day-night-cycle, gravity, magnetic-field, pressure, solar-power                |

### `space_connections` — 星际航线（9 条）

| 字段   | 类型   | 说明                            |
| ------ | ------ | ------------------------------- |
| name   | string | 航线 ID，如 `"nauvis-vulcanus"` |
| from   | string | 起点星球                        |
| to     | string | 终点星球                        |
| length | int    | 航线长度，15000~4000000         |

---

### `equipment` — 装甲装备（18 条）

| 字段                              | 类型                    | 说明                                                                                                 |
| --------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| name                              | string                  | 装备内部 ID                                                                                          |
| type                              | string                  | 11 种类型：battery-equipment, energy-shield-equipment, solar-panel-equipment, generator-equipment... |
| group / subgroup / order / hidden | string/bool             | 与其他原型一致的基础元信息                                                                           |
| shape                             | `{width, height, type}` | 占用的网格大小与形状类型                                                                             |
| energy_production                 | number                  | 能量产出                                                                                             |
| energy_per_shield                 | int                     | 每点护盾能量消耗                                                                                     |
| energy_source                     | `{type}`                | 装备自身能量源类型；当前导出最少只保留 type                                                          |
| equipment_categories              | string[]                | 适用的装备类别（armor / atp-equipment-category）                                                     |
| take_result                       | string?                 | 拆下后得到的物品                                                                                     |

### `equipment_grids` — 装甲网格（6 条）

| 字段                              | 类型        | 说明                       |
| --------------------------------- | ----------- | -------------------------- |
| group / subgroup / order / hidden | string/bool | 与其他原型一致的基础元信息 |
| name                              | string      | 网格 ID                    |
| width / height                    | int         | 网格尺寸，2×4 到 10×12     |
| locked                            | bool        | 网格是否锁定               |
| equipment_categories              | string[]    | 兼容的装备类别             |

---

## 快速查询指南

| 查询目标                           | 查询路径                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------- |
| 物品的基本信息（堆叠、重量、分组） | `items`                                                                                 |
| 物品是否可作为燃料                 | `items` → `fuel_value > 0` + `fuel_category`                                            |
| 物品是否是模块                     | `items` → `type == "module"`, 查看 `category`、`tier`、`module_effects`                 |
| 物品对应的建筑实体                 | `items` → `place_result` → `entities`                                                   |
| 流体的温度范围                     | `fluids` → `default_temperature` / `max_temperature`                                    |
| 配方的原料和产物                   | `recipes` → `ingredients` / `products`                                                  |
| 配方的制作时间                     | `recipes` → `energy`（秒）                                                              |
| 配方需要什么机器做                 | `recipes` → `category` → 查找 `entities.crafting_categories` 包含该值的实体             |
| 哪些机器能做这个配方               | `entities` → 筛选 `crafting_categories` 包含 `recipe.category`                          |
| 某机器接受哪些燃料                 | `entities` → `energy_sources.burner.fuel_categories[]`                                  |
| 某机器的能量源类型                 | `entities` → `energy_sources.types[]`                                                   |
| 某机器的制作速度                   | `entities` → `crafting_speed`                                                           |
| 某机器的基础/最大功率              | `entities` → `energy_usage` / `max_energy_usage` / `max_power_output`                   |
| 流体发电机的耗液速率               | `entities` → `fluid_usage_per_tick`                                                     |
| 机器有几个模块槽                   | `entities` → `module_inventory_size`                                                    |
| 配方允许哪些模块效果               | `recipes` → `allowed_effects`                                                           |
| 模块本身提供什么效果               | `items` → `module_effects`                                                              |
| beacon 的传递倍率和生效半径        | `entities` → `distribution_effectivity` / `supply_area_distance`                        |
| 哪些机器能吃 beacon                | `entities` → `effect_receiver.uses_beacon_effects == true`                              |
| 配方是否初始可用                   | `recipes` → `enabled`                                                                   |
| 科技解锁了哪些配方                 | `technologies` → `effects` 中 `type == "unlock-recipe"`                                 |
| 哪个科技解锁了某配方               | 遍历 `technologies`，匹配 `effects`                                                     |
| 科技的前置和后继                   | `technologies` → `prerequisites` / `successors`                                         |
| 科技研究成本                       | `technologies` → `research_unit_count` × `research_unit_ingredients`                    |
| 研究所需时间                       | `technologies` → `research_unit_count` × `research_unit_energy` / 60 秒                 |
| 单个实验室每秒消耗科技瓶多少       | `entities(type == "lab")` → `researching_speed × science_pack_drain_rate_percent / 100` |
| 配方有星球限制吗                   | `recipes` → `surface_conditions`                                                        |
| 某星球有哪些专属配方               | 遍历 `recipes`，匹配 `surface_conditions.property`                                      |
| 品质升级概率                       | `qualities` → `next_probability`                                                        |
| 星球之间的距离                     | `space_connections` → `length`                                                          |
| 物品分类的层级结构                 | `item_groups` → `subgroups`                                                             |

---

## 已知缺失 ⚠️

以下数据在当前设计下仍然**未完全覆盖**，如需要需继续扩展 mod 或从其他来源补充：

| 缺失字段 / 缺口                     | 所属集合 | 说明                                                                                 |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------ |
| 品质化后的实例值曲线                | entities | 当前导出的是原型基准值；`get_crafting_speed(quality)` 这类不同品质下的全量曲线未展开 |
| `module_slots` 被品质影响的具体公式 | entities | `quality_affects_module_slots` 已知，但具体每级如何增加槽位仍需实例级验证            |
| 热网/电网连接拓扑                   | entities | 当前有能量源参数，但没有把热管/电网的连接图单独建模                                  |
| 图标路径                            | 所有集合 | 图标文件路径仍通过 icon atlas 独立处理                                               |
