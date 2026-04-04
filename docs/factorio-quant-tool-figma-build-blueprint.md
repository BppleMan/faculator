# Faculator Figma 原型搭建蓝图

适用文件：

- Figma `fileKey`: `bxdg1Xn8h8siDOFW4m4IwO`

参考来源：

- [`docs/factorio-quant-tool-figma-prototype.md`](/Users/bppleman/RustroverProjects/faculator/docs/factorio-quant-tool-figma-prototype.md)
- [`deep-research-report.md`](/Users/bppleman/RustroverProjects/faculator/deep-research-report.md)
- [`faculator-app/src/main.rs`](/Users/bppleman/RustroverProjects/faculator/faculator-app/src/main.rs)

## 目标

这份文档不是重新描述“要做什么”，而是把已有规格细化成一份可直接在 Figma 中搭建的桌面端原型蓝图。

核心目标仍然是 4 件事：

1. 目标产量反推整条生产链
2. 品质系统与回收闭环量化
3. 瓶颈、功耗、资源缺口的即时反馈
4. 多方案对比与参数沙盒

## 设计结论

本产品更像“工业规划工作台”，不是通用数据后台，也不是游戏官网式视觉稿。

因此原型应遵循这 4 个设计判断：

1. 主画面以“图 + 表 + 参数”组成，而不是单一 dashboard。
2. 品质必须是一级信息维度，不能只藏在详情里。
3. 每个关键数字都应有来源归属，界面要能表现“这个结论是怎么算出来的”。
4. 原型首屏要先证明“能做复杂规划”，再证明“界面精致”。

## 本轮修订原则

基于本轮原型调整，新增 4 条更具体的落地原则：

1. 原型统一使用中文，避免更像概念拼贴而不是产品指导界面。
2. 原型必须体现完整交互动线，至少能覆盖“新建 -> 生成 -> 检查 -> 修正 -> 对比 -> 导出”的闭环。
3. 主工作台不再把产线表达为标准 DAG，而是表达为“长时间稳定运行后的理想化蓝图片段”。
4. 蓝图概念不是装饰，而是产品核心心智模型：用户是在布局、构思、修正一条可持续运行的产线。

## 文件结构

建议在该 Figma 文件中建立 4 个页面：

1. `Cover`
2. `Foundations`
3. `Components`
4. `Prototype / Desktop`

推荐从 `Foundations -> Components -> Prototype / Desktop` 的顺序搭建。

## Foundations

### Color Tokens

建立以下颜色变量或样式：

| Token               | Value     | 用途               |
| ------------------- | --------- | ------------------ |
| `bg/base`           | `#0E1418` | 整体背景           |
| `bg/elevated`       | `#162028` | 二层面板           |
| `bg/panel`          | `#1D2A33` | 卡片、面板主体     |
| `bg/grid`           | `#243742` | 网格线、边界线     |
| `text/primary`      | `#F1F5F2` | 主文本             |
| `text/secondary`    | `#AAB8B6` | 次级文本           |
| `text/muted`        | `#6E8483` | 辅助说明           |
| `accent/flow`       | `#7ED7C1` | 正常流量、关键强调 |
| `accent/warn`       | `#F5A65B` | 风险、瓶颈         |
| `accent/alert`      | `#EF6B62` | 缺口、阻塞         |
| `accent/info`       | `#7CB8F6` | 信息态、链接态     |
| `quality/normal`    | `#8C9AA5` | 普通品质           |
| `quality/uncommon`  | `#67C587` | 优秀品质           |
| `quality/rare`      | `#53A6FF` | 稀有品质           |
| `quality/epic`      | `#B278FF` | 史诗品质           |
| `quality/legendary` | `#F3C75F` | 传奇品质           |

额外建议补 3 个状态色：

- `state/success`: `#56C288`
- `state/warning`: `#F5A65B`
- `state/error`: `#E56D67`

### Text Styles

推荐建立以下文本样式：

| Style                     | Font           | Size | Weight | 用途                 |
| ------------------------- | -------------- | ---: | -----: | -------------------- |
| `Display / 40 / Semibold` | Space Grotesk  |   40 |    600 | 封面或大标题         |
| `Heading / 28 / Semibold` | Space Grotesk  |   28 |    600 | 页面主标题           |
| `Section / 20 / Medium`   | IBM Plex Sans  |   20 |    500 | 面板标题             |
| `Body / 14 / Regular`     | IBM Plex Sans  |   14 |    400 | 主体文案             |
| `Label / 12 / Medium`     | IBM Plex Sans  |   12 |    500 | 标签、筛选           |
| `Mono / 12 / Medium`      | JetBrains Mono |   12 |    500 | 参数、单位、数值明细 |
| `Mono / 16 / Semibold`    | JetBrains Mono |   16 |    600 | 核心 KPI             |

### Spacing 和 Radius

建立以下间距令牌：

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

建立以下圆角令牌：

- `6`
- `10`
- `14`
- `20`

### Effects

建立 3 个效果样式：

1. `Panel Shadow / Soft`
2. `Glow / Flow`
3. `Glow / Warning`

建议不要做太重的毛玻璃，重点是“微发光 + 工业面板”。

## Components

建议先做下面 20 个组件，并在 `Components` 页面排成组件目录。

1. `App Shell / Desktop`
2. `Top Bar / Filter + Project Switcher`
3. `Sidebar / Recipe Library`
4. `Card / Metric`
5. `Card / Warning`
6. `Node / Production`
7. `Node / Resource`
8. `Node / Bottleneck`
9. `Chip / Quality`
10. `Chip / Module`
11. `Table Row / Recipe`
12. `Table Row / Deficit`
13. `Panel / Inspector`
14. `Tabs / Segmented`
15. `Button / Primary`
16. `Button / Secondary`
17. `Chart / Mini Bar`
18. `Chart / Delta`
19. `Quality Ladder`
20. `Scenario Compare Card`

### 组件细化建议

#### `App Shell / Desktop`

属性建议：

- `leftSidebar`: `visible / hidden`
- `rightInspector`: `visible / hidden`
- `bottomSummary`: `visible / hidden`

作用：

- 固定顶栏 72
- 左栏 280
- 右栏 360
- 底栏 88
- 中央内容区自适应

#### `Node / Production`

建议包含：

- 物品图标
- 物品名称
- 品质标签
- `items/min`
- `machine count`
- 机器类型
- 模块摘要
- 功耗
- 状态点

建议变体：

- `state=ok`
- `state=warning`
- `state=blocked`

#### `Node / Resource`

用于矿、液体、基础原料节点。

建议额外显示：

- `required/min`
- `supplied/min`
- 差额

#### `Card / Metric`

建议属性：

- `label`
- `value`
- `delta`
- `tone=neutral/info/positive/warn`

#### `Panel / Inspector`

建议右侧检查器统一壳层，内部配 `Tabs / Segmented`。

Tab 固定为：

1. `Recipe`
2. `Machine`
3. `Quality`
4. `Economics`

#### `Quality Ladder`

建议每层展示：

- 品质名称
- 占比
- 当前产量
- 回收去向

建议提供两种布局：

- `orientation=horizontal`
- `orientation=vertical`

## Prototype / Desktop

所有主画板统一：

- 画板尺寸：`1440 x 1024`
- 画板间距：`160`
- 背景：`bg/base`
- 加一层极淡网格纹理

下面 6 个画板足以覆盖首版原型。

### Frame 01: `Planner / Graph View`

用途：

这是产品的核心工作台，用户在这里输入目标并观察整条生产链。

布局：

- 顶部工具栏：高 `72`
- 左侧边栏：宽 `280`
- 中央画布：自适应
- 右侧检查器：宽 `360`
- 底部汇总条：高 `88`

顶部工具栏建议字段：

- `Plan: Legendary Blue Circuit`
- `Game: 2.0 / Space Age`
- `Mod Pack: Vanilla + Quality`
- `Target Item: Processing Unit`
- `Target Throughput: 120 / min`
- `Expand to Raw Ore: On`
- `Quality Simulation: On`

左栏建议内容：

- 搜索框：`Search recipes or items`
- 分类：`Intermediates / Production / Fluids / Space`
- 收藏区：`Blue Circuit`, `LDS`, `Rocket Fuel`
- 最近查看：`Recycler`, `EM Plant`, `Assembler 3`
- 配方列表项显示：名称、分类、基础时间

中央画布建议节点内容：

- `Processing Unit / Rare`
- `Electronic Circuit / Rare`
- `Advanced Circuit / Epic`
- `Copper Cable / Rare`
- `Sulfuric Acid / Normal`
- `Iron Plate / Normal`
- `Copper Plate / Normal`

边连接建议显示：

- `64.0 / min`
- `240 / min`
- `deficit 18 / min`

右侧检查器默认展示 `Processing Unit / Rare`：

- 配方时间：`10s`
- 当前净产出：`120 / min`
- 机器数：`48 Assembler 3`
- 模块：`2x Productivity 3 + 2x Quality 3`
- 功耗：`22.4 MW`
- 品质分布：`Rare 61% / Epic 28% / Legendary 3.4%`
- 回收收益：`Legendary uplift +0.8 / min`

底部汇总条建议指标：

- `Machines 284`
- `Power 112 MW`
- `Ore 4.8k / min`
- `Fluids 1.2k / min`
- `Unresolved Inputs 3`

这个画板应成为原型首页。

### Frame 02: `Planner / Quality Loop Lab`

用途：

专门说明品质闭环、回收机、再造路径和传奇产出期望。

布局：

- 左侧参数区：宽 `320`
- 中央流向图区：自适应
- 右侧结果区：宽 `360`

左侧参数区建议字段：

- `Item: Iron Gear Wheel`
- `Base Quality: Normal`
- `Recycler: Legendary Quality 3 x4`
- `Crafter: Legendary Quality 3 x4`
- `Productivity: 0% / 20% / 40%`
- `Unlocked Tiers: all`

中央图建议结构：

- 五段品质阶梯
- 每级显示流入、流出、留级、毕业
- 回收路径用虚线
- 传奇路径用金色高亮
- 高级详情入口：`Open Matrix View`

右侧结果区建议指标：

- `Expected Legendary Output`
- `Recycle Loss`
- `Fluid Loss Risk`
- `Break-even Power`
- `Best Module Mix`

建议用 1 张 `Quality Ladder` + 2 张 `Card / Metric` + 1 张 `Card / Warning` 组合完成。

### Frame 03: `Planner / Bottleneck Dashboard`

用途：

快速找出当前方案卡在哪里。

布局：

- 顶部 KPI 区：高 `180`
- 中部左右双栏
- 底部风险流

顶部 KPI：

- `120 items/min`
- `284 machines`
- `112 MW`
- `4.8k ore/min`
- `1.2k fluid/min`
- `Bottleneck Score 72`

左栏建议区块：

- `Top Deficits`
- `Slowest Steps`
- `Belt Saturation`

右栏建议区块：

- `Power Breakdown`
- `Stage Contribution`
- `Heat / Pollution Alerts`

底部风险流建议列表：

- `Copper plate deficit worsens rare output by 14%`
- `Sulfuric acid line clips at 92% utilization`
- `Recycler loop is power-negative below 18 MW spare`

### Frame 04: `Planner / Recipe Inspector`

用途：

面向单一配方的完整上下文页。

布局：

- 左：配方卡片
- 中：输入输出表
- 右：机器与模块详情

建议选一个具体配方作为示例：

- `Processing Unit`

左侧配方卡显示：

- 基础时间
- 所属分类
- 允许模块
- 支持品质
- 可回收性

中间表格显示：

- 输入项
- 输出项
- 各品质变体
- 单机净产能
- 每分钟消耗

右侧详情显示：

- 推荐机器
- 模块组合
- Beacon 假设
- 功耗
- 对传奇产出的边际贡献

### Frame 05: `Planner / Scenario Compare`

用途：

对比不同工厂策略，强调“帮助权衡”而不是“只给唯一答案”。

布局：

- 左侧方案列表
- 中央双列主对比
- 右侧差异摘要

建议预设 5 个方案：

1. `Compact`
2. `Balanced`
3. `Low Power`
4. `Legendary Rush`
5. `Megabase`

对比指标建议：

- `Total Machines`
- `Footprint`
- `Power Budget`
- `Ore Demand`
- `Legendary Yield`
- `Recycle Cost`

右侧摘要建议给出 3 行结论：

- `Balanced saves 18 MW against Legendary Rush`
- `Legendary Rush improves legendary yield by 42%`
- `Compact increases unresolved inputs by 2`

### Frame 06: `Planner / New Plan Flow`

用途：

空白态入口和原型点击起点。

布局：

- 左：模板卡
- 中：创建流程
- 右：最近方案

左侧模板建议：

- `Science Pack Plan`
- `Mall Build`
- `Rocket Part`
- `Legendary Item Farm`
- `Train-fed Smelting`

中间创建流程建议分 4 步：

1. 选择目标物品
2. 输入吞吐目标
3. 选择品质策略
4. 生成初始方案

右侧最近方案建议：

- `Purple Science 90/min`
- `LDS Rare Build`
- `Blue Circuit Legendary`

## 原型点击流

首版只需要串起这条主路径：

1. `新建方案`
2. 进入 `蓝图工作台 / 稳态视图`
3. 点击蓝图模块进入 `节点详情 / 计算来源`
4. 进入 `瓶颈修正 / 风险总览`
5. 跳转到 `方案对比 / 版本分支`
6. 进入 `导出落地 / 实施摘要`
7. 需要时返回 `新建方案` 开启新一轮方案

这个流程体现的不是单次求解，而是完整的产品闭环。

## 视觉细节建议

### 背景

- 使用深蓝灰底色
- 叠一层轻网格
- 中央图区域可加非常弱的 blueprint 斜线或点阵

### 线与状态

- 正常流量用 `accent/flow`
- 风险流量用 `accent/warn`
- 缺口和中断用 `accent/alert`
- 回收路径建议使用虚线

### 字体层级

- 页面标题用 `Space Grotesk`
- 面板和描述用 `IBM Plex Sans`
- 数值、公式、吞吐用 `JetBrains Mono`

### 面板节奏

- 卡片内间距优先 `16 / 20 / 24`
- 数据密集区保持严格对齐
- 不要用大量插图，信息密度优先

## 内容语气

推荐文案：

- `Target Throughput`
- `Unresolved Inputs`
- `Quality Yield`
- `Recycle Loss`
- `Machine Footprint`
- `Power Budget`
- `Scenario Delta`

避免：

- 夸张营销语
- 装饰性图标堆叠
- 过度游戏化按钮命名

## 首版落地顺序

如果只做最小可用原型，建议按下面顺序完成：

1. `Foundations`
2. `Components`
3. `Planner / Graph View`
4. `Planner / Quality Loop Lab`
5. `Planner / Scenario Compare`

补充页可以后续再做：

- `Planner / Bottleneck Dashboard`
- `Planner / Recipe Inspector`
- `Planner / New Plan Flow`

## 当前状态（已执行）

已通过 Figma MCP `use_figma` 工具重建 `bxdg1Xn8h8siDOFW4m4IwO` 中的原型骨架：

- ✅ `Cover` 页：新增 `封面 · 产品闭环总览`，说明蓝图式产品心智与 6 步主流程
- ✅ `Prototype / Desktop` 页：已生成 6 个中文主画板
- ✅ `Frame 00 · 新建方案`：模板入口 + 4 步建模向导 + 生成首版蓝图入口
- ✅ `Frame 01 · 蓝图工作台 / 稳态视图`：以蓝图片段、总线、回流支路表达稳态产线，不再是简单树状图
- ✅ `Frame 02 · 节点详情 / 计算来源`：解释关键结论如何从配方、机器、模块、品质推导出来
- ✅ `Frame 03 · 瓶颈修正 / 风险总览`：风险列表、修正建议、应用后预估
- ✅ `Frame 04 · 方案对比 / 版本分支`：多方案权衡与推荐结论
- ✅ `Frame 05 · 导出落地 / 实施摘要`：蓝图字符串、清单、施工顺序等实施包表达
- ✅ 已为主流程按钮补上 Figma Prototype 跳转，起点为 `Frame 00 · 新建方案`

待后续补充：

- `Foundations` 页的正式变量、文本样式和效果样式体系
- `Components` 页组件库（20 个基础组件）
- Frame 之间更细的支线路径，例如“从蓝图直接进入方案分支”或“从瓶颈页回到指定模块”
- 更高保真的 Figma Prototype 过渡与局部 overlay
