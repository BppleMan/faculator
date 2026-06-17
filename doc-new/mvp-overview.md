# Faculator MVP 总纲

## 本文目的

本文用于固定 Faculator MVP 的产品定位、成功标准、范围边界和文档地图。

Faculator 的 MVP 不是“先做一个好看的 Factorio 计算器页面”，也不是“先把某个 LP solver 接起来”。MVP 的真正目标是先落下一套可以持续演进的产线计划模型：

```text
用户显式组织生产规划
系统根据规划生成解算域
解算器求出稳定流量
UI 把计划、边界、流量、剩余和机器换算正确展示出来
```

因此，MVP 的重点不是视觉自由度，也不是自动优化蓝图，而是：

```text
算得对
展示得对
边界说得清
用户知道当前解算域到底包含什么
```

## 产品定位

Faculator 是一个面向 Factorio / Space Age 的工厂产线量化规划工具。

它的核心价值不是替玩家决定蓝图怎么摆，也不是替玩家穷举所有路线，而是帮助玩家把已经选择或正在设计的产线计划量化成稳定的单位时间流量：

```text
目标产出是多少
哪些配方过程参与当前解算
每个过程每分钟执行多少次
上游是否短缺
副产物或低星产物是否剩余
理论需要多少机器
取整后机器产能是否覆盖过程执行率
```

Faculator 应该尊重玩家对产线边界的控制。用户可以把某段产线留在父级上下文中统一配平，也可以把它下沉为局部解算域，再通过边界契约与父级连接。

一句话定位：

```text
Faculator 是一个让用户显式控制量化上下文的品质感知产线规划工具。
```

## 第一使用形态

MVP 第一使用形态定为：

```text
Web App / PWA
```

这意味着 MVP 文档和实现需要默认考虑：

```text
浏览器内运行
可离线使用的方向
求解不能阻塞 UI 主线程
核心规则需要可复用
solver 后端需要可替换
```

Desktop / Tauri 可以作为未来扩展方向。未来桌面端可以复用同一套 Web UI，并使用 native Rust core 与更强 solver 后端。但 MVP 文档不把桌面端作为第一交付目标。

## 核心架构原则

Faculator 的核心不是某个 solver，而是从游戏数据到产线计划结果的中间模型。

推荐的长期方向是：

```text
Factorio data
  -> Faculator domain model
  -> ProductionPlan
  -> planning graph
  -> solver-neutral LinearModel
  -> SolverBackend
  -> PlanningResult
  -> UI render model
```

这个方向带来的约束是：

```text
domain / planner 不依赖 good_lp
domain / planner 不依赖 HiGHS
domain / planner 不依赖 microlp
domain / planner 不依赖 Web UI
domain / planner 不依赖 Tauri
```

具体 solver 只是后端适配器。不同运行环境可以使用不同 solver：

```text
Web / PWA:
  Rust wasm core
  Web Worker
  wasm-friendly solver
  后续可接 highs-js

Desktop:
  Rust native core
  good_lp + HiGHS 或 direct HiGHS
```

MVP 要沉淀的是自己的 planning model 和 solver-neutral model，而不是把某个第三方求解器的类型当成 Faculator 的核心抽象。

## MVP 成功标准

MVP 成功不是指功能很多，而是指最小闭环足够正确、可解释、可验证。

MVP 需要满足：

```text
用户可以创建一个 ProductionPlan
用户可以在计划中创建 ProductionBlock
用户可以在 Block 中创建一个或多个第一级 ProductionLine
用户可以为 ProductionLine 指定一个或多个目标
目标使用 物料@品质 >= 数量/分钟 表示
系统可以展开配方链
系统可以生成独立解算域
系统可以求出不短缺的稳定流量
系统可以展示过程执行率
系统可以展示物料流入、流出、剩余、短缺
系统可以展示理论机器数和向上取整机器数
系统可以通过调试面板展示变量、约束、矩阵、目标函数、求解状态
```

其中“一个或多个目标”是有限多目标支持，不等价于全局多目标优化。MVP 中，多目标只在同一个独立解算域内共同求解。不同 Block、不同第一级 root line 默认不合并。

## MVP 的核心用户流程

一个典型 MVP 流程如下：

```text
1. 用户创建一个 ProductionPlan
2. 用户创建一个 ProductionBlock
3. 用户添加一个第一级 ProductionLine
4. 用户指定目标，例如 红瓶@5 >= 60/min
5. 系统根据默认配方展开配方链
6. 如果某个物品有多个配方，系统先选择默认候选，用户之后可以手动调整
7. 用户可以把某段 line 下沉为局部解算域
8. 下沉 line 默认 link = on，速率跟随父级需求
9. 用户也可以关闭 link，自由指定子级速率
10. 系统为每个独立解算域生成线性模型
11. solver 求出过程执行次数
12. UI 展示产线计划、边界契约、过程执行率、物料流、剩余/短缺、机器换算
13. 调试面板可查看解算细节
```

这个流程中，用户看见的是生产计划模型；solver 只是背后的计算手段。

## MVP 非目标

以下内容不进入 MVP：

```text
蓝图生成
布局优化
传送带吞吐规划
机械臂吞吐规划
供电规划
物流网络模拟
列车调度
库存时间模拟
随机抽样模拟
多人协作
云端同步
账号系统
跨 ProductionPlan 共享
ProductionBlock 之间隐式全局配平
同一个 Block 下多个 root line 的默认共同解算
自动选择最优配方路线
自动选择机器类型
自动选择模块组合
MILP 整数机器优化
自动蓝图级最少机器方案
```

这些能力不一定永远不做，但它们不属于 MVP 的最小闭环。

## 品质支持的状态

Faculator 的长期目标包含品质感知建模。`物料@品质` 是重要建模方向，例如：

```text
铁板@1
铁板@2
铁板@3
铁板@4
铁板@5
```

已有红瓶基准文档和 Excel 已经固定了品质矩阵、回收过程、完整矩阵展开和一组可行解。

但是，品质策略如何作为用户可配置能力进入 `ProductionLine`，本轮不强行拍板。MVP 文档会保留待补章节，并且不会让品质策略的细节阻塞已经稳定的产线计划模型。

也就是说：

```text
物料@品质 是建模方向
品质矩阵已有基准资产
品质策略 UI / line 绑定方式待补
```

## 文档地图

本轮 MVP 文档分为以下几份：

```text
README.md
  doc-new 文档索引和推荐阅读顺序

mvp-overview.md
  MVP 总纲，固定产品定位、成功标准和范围边界

mvp-production-model.md
  ProductionPlan / ProductionBlock / ProductionLine / Level / BoundaryContract / link 规格

mvp-solving-model.md
  过程执行率、物料守恒、目标函数、机器换算、solver-neutral IR 规格

mvp-ui-spec.md
  UI 如何正确渲染 ProductionPlan，以及调试面板需要承载什么

mvp-acceptance-cases.md
  MVP 最小验收用例

mvp-open-questions.md
  暂不阻塞 MVP 的开放问题

production-balancing-principles.md
  已固化的配平、唯一解、截流、LP/MILP 原则

red-bottle-quality-lp-reference.md
red-bottle-quality-lp-reference.xlsx
  红瓶品质线性规划基准资产
```

## 实现判断标准

后续实现时，可以用下面的问题判断是否偏离 MVP：

```text
这个设计是否让用户更清楚地控制量化上下文？
这个设计是否让 ProductionPlan 的语义更稳定？
这个设计是否隐藏了 block / line / level 的解算边界？
这个设计是否把 solver 细节泄漏到了 planner 或 domain？
这个设计是否把机器整数优化过早塞进核心解算？
这个设计是否隐式合并了用户没有显式连接的产线？
这个设计是否能被红瓶和原油验收用例验证？
```

如果某个功能不能帮助 MVP 达成“稳定计划模型 + 正确解算 + 正确展示”，就应该推迟。
