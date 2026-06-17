# Faculator MVP 解算模型

## 本文目的

本文用于固定 Faculator MVP 的解算口径。

它回答以下问题：

```text
解算器到底求什么
ProductionPlan 如何变成线性模型
多目标支持到什么程度
短缺、剩余、副产物如何表达
机器数量如何从结果派生
solver 后端如何与 planner 隔离
Web / PWA 中求解应如何运行
```

本文不替代完整数学推导。配平、唯一解、截流、LP/MILP 的原则已经固化在：

```text
knowledge-base/production-balancing-principles.md
```

红瓶品质矩阵的完整展开已经固化在：

```text
knowledge-base/red-bottle-quality-lp-reference.md
knowledge-base/red-bottle-quality-lp-reference.xlsx
```

## 核心未知数

Faculator MVP 的核心未知数是：

```text
过程执行次数/分钟
```

不是：

```text
机器数量
原料输入数量
某个 UI 节点的高度
某个蓝图模块数量
```

一个过程可以理解为配置后的配方执行单元。例如：

```text
采铜矿
冶铜板@1
冶铜板@2
造齿轮@3
造红瓶@5
回收红瓶@4
```

每个过程变量表示该过程在稳定状态下每分钟执行多少次。

例如：

```text
造红瓶@5 = 12 次/分钟
```

表示红瓶@5 对应的配置过程每分钟执行 12 次，不表示需要 12 台机器。

## 为什么不直接求机器数量

Factorio 的微观生产是离散机器、离散配方、离散事件。但产线量化工具通常关心稳定单位时间流率。

因此，解算分两层：

```text
第一层：工艺层
  求每个过程每分钟执行多少次

第二层：设备层
  根据过程执行率换算理论机器数和取整机器数
```

如果一开始把机器数作为整数变量，就会把许多原本可以用 LP 或线性方程处理的问题升级为 MILP。

MVP 明确不做 MILP。机器数作为后处理结果展示。

## 物料守恒

每个解算域都可以被转换为物料变化矩阵。

矩阵行表示物料：

```text
铜矿@1
铜矿@2
铜板@1
铁板@3
齿轮@5
红瓶@5
```

矩阵列表示过程：

```text
采铜矿
冶铜板@1
造齿轮@3
造红瓶@5
```

矩阵系数表示一次过程执行带来的净变化：

```text
消耗为负
产出为正
无关为 0
```

例如无品质白板红瓶：

```text
造红瓶：
-1 铜板@1
-1 齿轮@1
+1 红瓶@1
```

对应矩阵中 `造红瓶` 列在三行上分别是：

```text
铜板@1 = -1
齿轮@1 = -1
红瓶@1 = +1
```

## 目标

目标形式为：

```text
物料@品质 >= 数量/分钟
```

例如：

```text
红瓶@5 >= 60/min
齿轮@3 >= 100/min
```

MVP 支持有限多目标。

有限多目标的含义是：

```text
同一个独立解算域内，可以有多个显式目标
不同 ProductionBlock 默认不合并目标
同一个 Block 下多个第一级 ProductionLine 默认不合并目标
不同 ProductionPlan 不合并目标
```

因此，多目标不是全局优化入口，而是局部解算域内的多个目标约束。

## 解算域

解算域由 `ProductionLine` 的 level、下沉状态、边界契约和外部供入共同决定。

进入同一解算域的内容包括：

```text
当前 line 中未下沉的配方过程
当前 line 内部展开出的子过程
当前解算域内的显式目标
未被声明为外部供入的中间需求
未被拆成子级边界的局部过程
```

不进入当前解算域的内容包括：

```text
已下沉 line 的内部过程
其它 ProductionBlock 的过程
同一 Block 下其它第一级 ProductionLine 的过程
其它 ProductionPlan 的过程
被声明为外部供入的上游过程
```

下沉 line 在父级中只以边界契约形式出现。

## 边界契约如何进入矩阵

下沉 line 对父级暴露：

```text
边界输入 -> 边界输出
```

父级可以把它看成虚拟过程。

例如：

```text
铁板 120/min -> 齿轮 60/min
```

可以在父级中表现为一个虚拟列：

```text
-120 铁板
+60 齿轮
```

但这不是游戏真实配方，而是子级解算域的摘要。

如果边界是：

```text
无输入 -> 齿轮 60/min
```

父级只看到：

```text
+60 齿轮
```

这种虚拟过程必须在调试面板中标识为边界契约，不能伪装成真实配方。

## 外部供入如何进入矩阵

外部供入表示当前解算域不继续展开某个上游来源。

例如：

```text
外部供入 齿轮@3 120/min
```

在当前解算域里，它可以作为边界输入满足需求，但不产生内部配方过程。

它不意味着：

```text
自动来自某个 Block 的外供输出
自动触发供需校验
自动创建跨 Block 连接
```

外部供入只是当前解算域的边界条件。

## 外供输出如何进入解算结果

外供输出是某个解算域声明或产生的可对外供给物料。

它可以来自：

```text
用户显式声明
link = off 后子级产出超过父级需求
某些副产物或剩余产物
```

MVP 中，外供输出只作为结果和规划信息展示，不自动供给其它 Block。

## 短缺

短缺表示某个物料的平衡产出不足以满足目标或下游需求。

短缺不是普通剩余的反面，而是当前解算域不可满足或未配置完整的信号。

UI 和调试面板必须明确显示：

```text
哪个物料短缺
短缺多少
短缺来自哪个目标或下游需求
是否由 link = off 的子级不足导致
是否由外部供入未配置导致
```

MVP 的可用解要求关键物料不短缺。

## 剩余

剩余表示某个物料在满足目标与下游需求后仍有超额。

剩余可能来自：

```text
联产品
原油副产物
品质模块导致的低星或异品质产物
link = off 后子级产出超过父级需求
目标下限约束导致的超额产出
```

剩余不是错误。

但是剩余必须展示，因为它会影响玩家对产线计划的理解。

MVP 中，剩余可以被标记为：

```text
保留
外供输出
待治理副产物
```

具体品质低星产物是否回收，暂留到品质策略开放问题中。

## 默认目标函数

MVP 默认目标函数为：

```text
在满足全部目标且关键物料不短缺的前提下，
最小化总过程执行次数。
```

更形式化地说：

```text
minimize sum(x_i)

subject to:
  目标物料 >= 指定速率
  关键中间物不短缺
  过程执行次数 x_i >= 0
  边界契约成立
  外部供入按边界条件处理
```

选择“最小化总过程执行次数”的原因：

```text
Faculator 不是蓝图优化器
Faculator 不靠配平本身省矿
省矿通常来自产能模块、机器配置和玩家策略
固定拓扑下很多解本来就是唯一解
在存在自由度时，总过程执行次数是较稳定、较可解释的默认收敛方式
```

MVP 不默认最小化源头输入，也不默认最小化整数机器数。

## 无解与近似

在游戏语义中，“无解”常常不是代数完全无解，而是解中出现负过程执行次数，或者目标需求不落在当前非负流量空间中。

MVP 至少需要区分：

```text
可行解
不可行解
存在短缺的未完成配置
存在剩余但仍可行的配置
```

当严格满足所有目标不可能时，是否寻找近似解可以作为后续功能。MVP 文档不强制实现近似求解，但调试面板需要能表达不可行原因。

## 机器换算

机器数量从过程执行次数派生。

单机执行率：

```text
单机执行率 = 机器速度 * 速度修正 * 60 / 配方耗时秒
```

理论机器数：

```text
理论机器数 = 过程执行次数/分钟 / 单机执行率
```

实际机器数：

```text
实际机器数 = ceil(理论机器数)
```

取整后容量：

```text
取整后容量 = 实际机器数 * 单机执行率
```

容量余量：

```text
容量余量 = 取整后容量 - 过程执行次数/分钟
```

MVP 中，机器取整不反向进入 solver。

也就是说：

```text
solver 求连续过程执行率
UI 展示理论机器数和 ceil 后机器数
ceil 后造成的容量余量作为展示结果
```

## LP 与 MILP 边界

MVP 不做 MILP。

不进入 MVP 的内容包括：

```text
整数机器数量作为 solver 变量
二进制变量决定某条路线是否启用
自动选择配方
自动选择机器类型
自动选择模块组合
自动开关回收线路
自动布局优化
```

这些功能可能需要 MILP 或更复杂的组合优化，放到未来阶段。

MVP 坚持连续 LP / 线性平衡，是为了保持：

```text
Web/PWA 可行
模型可解释
调试可视
核心边界稳定
```

## Solver-neutral LinearModel

Faculator planner 生成的数学模型必须是 solver-neutral。

也就是说，核心 planner 不应该返回 `good_lp` 的变量，也不应该暴露 HiGHS 或 microlp 的类型。

推荐抽象如下：

```text
LinearModel
  variables
  constraints
  objective
  metadata

LinearSolution
  status
  objective_value
  variable_values
  constraint_status
  diagnostics
```

变量至少需要表达：

```text
变量 id
变量名称
变量类型
下界
上界
来源 metadata
```

MVP 中变量类型可以全部是连续变量：

```text
Continuous
```

约束至少需要表达：

```text
线性表达式
关系符号
右侧值
约束名称
约束来源 metadata
```

关系符号至少包括：

```text
=
>=
<=
```

目标函数至少需要表达：

```text
minimize 或 maximize
线性表达式
```

metadata 很重要，因为调试面板需要把数学对象解释回产线语义。

## SolverBackend

solver backend 只负责：

```text
接收 LinearModel
调用具体 solver
返回 LinearSolution
```

它不负责：

```text
解释 Factorio 配方
展开 ProductionLine
处理下沉/上升
决定 block 是否共享
决定目标函数业务含义
把结果换算成机器数
```

这些都属于 planner 或 result interpreter。

推荐接口语义：

```text
SolverBackend.solve(LinearModel) -> LinearSolution
```

具体后端可以是：

```text
good_lp adapter
HiGHS adapter
microlp adapter
highs-js adapter
测试用 mock adapter
```

## 配平原则的 MVP 化结论

`knowledge-base/production-balancing-principles.md` 中保留了完整的配平经验推导。MVP 实现不需要在主线文档里重复所有推导，但必须吸收以下结论。

第一，Faculator 所谓“配平”，不是让 solver 自由替玩家设计产线，而是在用户已经显式组织的解算域内求稳定流量。

```text
用户决定解算域边界
用户决定配方展开范围
用户决定外部供入
用户决定下沉与边界契约
solver 只在这个已定义空间内求过程执行率
```

第二，玩家常说的“唯一配平”，本质上来自固定拓扑后的物料守恒方程组。

当以下条件已经固定时：

```text
配方路线
副产物去向
边界输入
边界输出
目标速率
是否允许剩余
是否允许替代路线
```

问题往往不再是开放优化，而是一个确定的非负流量求解问题。

第三，无解不只表示代数方程无解，也包括游戏语义下不可执行的解。

例如：

```text
某个过程执行次数为负数
某个关键物料存在短缺
目标需求不在当前解算域可达的非负流量空间中
```

这些情况都必须被解释为当前配置不可满足，而不是让 UI 隐藏或自动猜测修复。

第四，剩余和短缺必须分开。

```text
短缺 = 当前解算域没有满足关键需求
剩余 = 满足目标后仍有额外产出
```

剩余不一定是错误。它可能来自副产物、截流、品质分流、link 关闭后的超产，或目标下限约束导致的超额。

第五，截流不是特殊机制，而是把某个中间物提升为外部目标或边界输出。

因此截流应被表达为：

```text
目标
边界输出
外供输出
```

而不是隐式从某条中间物流里偷走一部分。

第六，MVP 默认目标函数“最小化总过程执行次数”只是为了在存在自由度时收敛到稳定可解释解。

它不表示 Faculator 要替玩家做蓝图优化，也不表示它要靠配平本身省矿。

完整解释和原油示例见：

```text
knowledge-base/production-balancing-principles.md
```

## PlanningResult

solver 返回的变量值还不是用户最终看到的结果。

Faculator 需要把 `LinearSolution` 解释为 `PlanningResult`。

`PlanningResult` 至少需要包含：

```text
每个过程的执行次数/分钟
每个物料的需求、产出、剩余、短缺
每个目标的满足状态
每个边界契约的输入输出
每个外部供入的使用量
每个外供输出的数量
每个过程的理论机器数
每个过程的向上取整机器数
求解状态
诊断信息
```

UI 渲染应优先依赖 `PlanningResult`，而不是直接读取 solver 的变量数组。

## Web / PWA 求解运行位置

MVP 第一形态是 Web App / PWA，因此求解不能阻塞 UI 主线程。

Web 端推荐结构：

```text
main thread:
  UI state
  plan editor
  visualization

worker:
  load faculator wasm core
  load game data pack
  build planning model
  build LinearModel
  call solver backend
  return PlanningResult
```

如果后续接 highs-js，也应放在 worker 中：

```text
worker:
  faculator wasm 生成 LinearModel
  highs-js adapter 转换并求解
  返回 LinearSolution
```

关键原则：

```text
业务规则统一
planner 统一
LinearModel 统一
solver 后端可替换
UI 不感知具体 solver
```

## 与品质模型的关系

`物料@品质` 是 Faculator 的重要建模方向。

在矩阵中，不同品质的同一物品是不同物料行：

```text
铁板@1
铁板@2
铁板@3
铁板@4
铁板@5
```

品质模块会把一个过程列变成多品质产出分布。

回收机可以作为额外过程列进入同一套线性模型。

这些机制已经由红瓶基准文档和 Excel 固化。

但 MVP 暂不决定品质策略如何绑定到 `ProductionLine` 或具体过程。相关开放问题记录在：

```text
knowledge-base/quality-strategy-open-questions.md
```

## 实现验收标准

解算模型实现后，至少应能通过：

```text
白板红瓶@1 60/min
红瓶@5 60/min，不回收
红瓶@5 60/min，带回收
原油处理/裂解副产物配平
```

这些案例分别验证：

```text
普通配方链
品质矩阵
回收过程列
天然副产物和线性配平
```
