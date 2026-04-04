# Factorio 量化工具 Figma Design 原型规格

## 目标

这份文档用于把 `faculator` 落成一套可以直接在 Figma Design 中搭建的桌面端原型。

原型目标不是做“游戏海报”，而是做一套偏工程控制台风格的生产规划工具，覆盖这 4 个核心能力：

1. 目标产量反推整条生产链
2. 品质系统与回收闭环量化
3. 瓶颈、功耗、资源缺口的即时反馈
4. 多方案对比与参数沙盒

设计基线参考：

- 仓库中的 [`deep-research-report.md`](/Users/bppleman/RustroverProjects/faculator/deep-research-report.md)
- 当前项目的数据结构与实体建模，如 [`faculator-app/src/main.rs`](/Users/bppleman/RustroverProjects/faculator/faculator-app/src/main.rs)

## 产品定位

一句话定位：

`faculator` 是一个面向 Factorio 2.0 / Space Age 时代的产线量化与品质规划工作台。

用户不是来“看图”，而是来做三件事：

1. 输入目标物品和目标吞吐
2. 查看整条链路的机器、模块、原料与品质分布
3. 在不同方案之间快速比较成本与收益

## 视觉方向

### 风格关键词

- Industrial control room
- blueprint overlay
- telemetry dashboard
- constrained sci-fi
- high-density but readable

### 颜色

建议使用以下设计令牌：

- `bg/base`: `#0E1418`
- `bg/elevated`: `#162028`
- `bg/panel`: `#1D2A33`
- `bg/grid`: `#243742`
- `text/primary`: `#F1F5F2`
- `text/secondary`: `#AAB8B6`
- `text/muted`: `#6E8483`
- `accent/flow`: `#7ED7C1`
- `accent/warn`: `#F5A65B`
- `accent/alert`: `#EF6B62`
- `accent/info`: `#7CB8F6`
- `quality/normal`: `#8C9AA5`
- `quality/uncommon`: `#67C587`
- `quality/rare`: `#53A6FF`
- `quality/epic`: `#B278FF`
- `quality/legendary`: `#F3C75F`

### 字体

- 标题：`Space Grotesk`
- 正文：`IBM Plex Sans`
- 数值与公式：`JetBrains Mono`

说明：

避免默认 `Inter` 风格，页面需要更像“工业规划软件”，不是通用 SaaS 后台。

## 设计原则

1. 主界面必须围绕“图 + 表 + 参数”三栏组织。
2. 品质不是附属功能，必须作为一级信息维度出现。
3. 所有关键结论都要可追溯，用户点任意一个数字都能看到来源。
4. 图形不追求花哨，重点是支持比较、定位瓶颈、发现边际收益。

## Figma 文件结构

建议在 Figma Design 中建立以下页面：

1. `Cover`
2. `Foundations`
3. `Components`
4. `Prototype / Desktop`

建议全部以桌面端为主，移动端先不做。

## Foundations 页面

### Color Styles

建立以下色板组：

- `bg/*`
- `text/*`
- `accent/*`
- `quality/*`
- `state/success`
- `state/warning`
- `state/error`

### Text Styles

- `Display / 40 / Semibold`
- `Heading / 28 / Semibold`
- `Section / 20 / Medium`
- `Body / 14 / Regular`
- `Label / 12 / Medium`
- `Mono / 12 / Medium`
- `Mono / 16 / Semibold`

### Effects

- `Panel Shadow / Soft`
- `Glow / Flow`
- `Glow / Warning`

### Spacing Tokens

- `4`
- `8`
- `12`
- `16`
- `20`
- `24`
- `32`
- `40`

### Radius Tokens

- `6`
- `10`
- `14`
- `20`

## Components 页面

至少准备这些组件，后续所有原型页复用：

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

### 关键组件说明

#### `Node / Production`

用于中央生产图节点，结构如下：

- 顶部：物品图标 + 名称 + 品质标签
- 中部：`items/min`、`machine count`
- 底部：机器类型、模块、功耗
- 右上角：状态点，区分 `ok / warning / blocked`

#### `Quality Ladder`

横向或纵向显示 5 个品质层级：

- Normal
- Uncommon
- Rare
- Epic
- Legendary

每个层级显示：

- 占比
- 当前产量
- 回收去向

#### `Panel / Inspector`

右侧检查器抽屉，分成 4 个 tab：

1. `Recipe`
2. `Machine`
3. `Quality`
4. `Economics`

## Prototype / Desktop 页面

原型采用 `1440 x 1024` 作为主尺寸，每个画板之间保留 `160` 间距。

建议搭 6 个主画板。

### Frame 01: `Planner / Graph View`

尺寸：`1440 x 1024`

用途：

这是整个产品最核心的一页，用户在这里设目标并查看完整生产链。

布局：

- 顶部固定工具栏，高 `72`
- 左侧配方侧栏，宽 `280`
- 中央图形画布，自适应
- 右侧检查器，宽 `360`
- 底部汇总条，高 `88`

顶部工具栏内容：

- 存档/方案切换
- 游戏版本
- mod pack 切换
- 目标产物输入框
- 目标吞吐输入框
- “自动展开到原矿”开关
- “考虑品质”开关

左侧侧栏内容：

- 搜索框
- 分类筛选
- 配方列表
- 收藏物品
- 最近查看

中央图形画布内容：

- 生产节点
- 原料节点
- 连接边
- 流量标记
- 缺口警告

右侧检查器内容：

- 选中节点摘要
- 输入输出明细
- 机器数量
- 模块配置
- 品质分布
- 回收收益

底部汇总条内容：

- 总机器数
- 总耗电
- 总矿物消耗
- 总流体需求
- 未满足项计数

### Frame 02: `Planner / Quality Loop Lab`

尺寸：`1440 x 1024`

用途：

专门解释品质矩阵、回收闭环和最终传奇产出，呼应研究文档中的核心价值。

布局：

- 左：参数控制区，宽 `320`
- 中：品质流向图
- 右：结果面板，宽 `360`

参数区内容：

- 输入物品选择
- 输入品质分布
- 回收机配置
- 再造机配置
- 模块选择
- 生产力与品质概率显示

中间图内容：

- 五段品质阶梯
- 各层流转箭头
- `A`、`g`、`(I-A)^-1` 等高阶数学只保留为“高级详情”入口
- 默认展示“直觉化结果”，不要一上来就公式铺满

结果面板内容：

- 最终传奇产出期望
- 各品质留级/毕业比例
- 每轮损耗
- 流体损失提醒
- 最佳模块组合建议

### Frame 03: `Planner / Bottleneck Dashboard`

尺寸：`1440 x 1024`

用途：

让用户快速看出当前方案卡在哪里。

布局：

- 上方 KPI 区，高 `180`
- 中部左右双栏
- 底部风险列表

KPI：

- items/min
- machine count
- MW
- ore/min
- fluid/min
- bottleneck score

左栏：

- 资源缺口排名
- 最慢工序列表
- 饱和带宽列表

右栏：

- 功耗拆分
- 生产段贡献图
- 污染或热区提示

底部：

- 风险事件流
- 方案备注

### Frame 04: `Planner / Recipe Inspector`

尺寸：`1440 x 1024`

用途：

做“点开一个配方就能看清全部上下文”的页。

布局：

- 左边配方卡片
- 中间输入输出表
- 右边机器和模块详情

重点内容：

- 基础制作时间
- 允许模块
- 配方品质变体
- 输入输出按品质拆分
- 对应机器 tier 差异
- 每台机器净产能

### Frame 05: `Planner / Scenario Compare`

尺寸：`1440 x 1024`

用途：

对比不同工厂方案，强调“不是给唯一最优解，而是帮助权衡”。

布局：

- 左侧方案列表
- 中央双列对比
- 右侧差异摘要

方案维度建议：

- 紧凑型
- 均衡型
- 省电型
- 冲传奇型
- Megabase 型

对比指标：

- 总机器数
- 占地
- 总功耗
- 原矿需求
- 传奇产出效率
- 回收闭环成本

### Frame 06: `Planner / New Plan Flow`

尺寸：`1440 x 1024`

用途：

作为可点击原型的起始页，帮助用户从空白状态开始。

布局：

- 左侧模板卡
- 中间引导步骤
- 右侧最近方案

模板卡建议：

- `Science Pack Plan`
- `Mall Build`
- `Rocket Part`
- `Legendary Item Farm`
- `Train-fed Smelting`

## 原型点击流

建议在 Figma Prototype 里至少串起这条路径：

1. `New Plan Flow`
2. 进入 `Graph View`
3. 点击某个生产节点
4. 打开右侧 `Inspector`
5. 从 `Inspector` 切到 `Quality`
6. 跳转到 `Quality Loop Lab`
7. 返回 `Scenario Compare`

这样即使还没有完整交互，也能演示产品主价值。

## 版式建议

### 顶层布局

- 背景不使用纯黑，使用深蓝灰底加轻微网格纹理
- 所有面板尽量使用 auto layout
- 卡片内部用 `16 / 20 / 24` 为主间距
- 数据密集区优先用对齐网格，不要靠手摆

### 图形层

- 中央生产图建议采用轻微发光的路径线
- 不同品质的边可以带颜色偏移，但不要过饱和
- 缺口边使用虚线或断续流光

### 信息层级

- 一级：目标产量、缺口、传奇产出
- 二级：机器、模块、功耗、资源
- 三级：公式、假设、矩阵、展开明细

## 内容文案建议

界面文案尽量像工程工具，而不是营销页面。

推荐文案语气：

- `Target Throughput`
- `Unresolved Inputs`
- `Quality Yield`
- `Recycle Loss`
- `Machine Footprint`
- `Power Budget`
- `Scenario Delta`

避免：

- 过度游戏化按钮
- 夸张 slogan
- 装饰性无意义图标

## 首版原型优先级

如果只做一版最小可用设计稿，优先顺序如下：

1. `Graph View`
2. `Quality Loop Lab`
3. `Scenario Compare`
4. `Bottleneck Dashboard`

这四页已经足够表达产品差异化。

## 交付建议

如果后续要正式落 Figma Design，建议按下面顺序搭：

1. 先建 `Foundations`
2. 再建 `Components`
3. 先完成 `Graph View`
4. 再从 `Graph View` 拆出复用组件
5. 最后补齐其余 5 个画板和 prototype 连线

## 当前限制

当前这次会话里，我没有拿到可直接写入 Figma Design 画布的 MCP 能力，所以暂时无法替你自动生成 `.fig` 中的真实画板。

但这份规格已经是按 “直接开 Figma 就能搭” 的方式写的，后面无论是你手工搭，还是我在拿到 Design 写权限后继续搭，都可以直接沿用。
