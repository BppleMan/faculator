# Faculator 新文档索引

## 目录定位

`doc-new` 用于承载 Faculator MVP 前后的新一轮需求、建模和验收资产。

旧 `docs/` 目录中有大量早期脑暴和推导内容，仍然有参考价值；但实现 MVP 时，优先以 `doc-new/` 中的文档为准。

本目录的目标不是做零散笔记，而是形成一组闭环文档：

```text
总纲
生产计划模型
解算模型
UI 规格
验收用例
开放问题
计算基准资产
```

## 推荐阅读顺序

### 1. MVP 总纲

先读：

```text
mvp-overview.md
```

它回答：

```text
Faculator MVP 是什么
第一使用形态是什么
成功标准是什么
哪些能力不进 MVP
为什么核心是 ProductionPlan，而不是 UI 或 solver
```

### 2. 生产计划模型

再读：

```text
mvp-production-model.md
```

它是本轮最重要的领域模型文档，定义：

```text
ProductionPlan
ProductionBlock
ProductionLine
Level
BoundaryContract
link
外部供入
外供输出
```

实现时，如果 UI、planner、solver 对这些概念理解不一致，应以这份文档为准。

### 3. 解算模型

然后读：

```text
mvp-solving-model.md
production-balancing-principles.md
```

`mvp-solving-model.md` 固定 MVP 解算口径：

```text
过程执行次数/分钟
物料守恒
有限多目标
默认目标函数
机器换算
solver-neutral LinearModel
Web Worker 求解
```

`production-balancing-principles.md` 固化更底层的配平经验：

```text
唯一解
无解
截流
精确目标与下限目标
LP 与 MILP
```

### 4. UI 规格

再读：

```text
mvp-ui-spec.md
```

它说明 UI 如何从模型反推：

```text
Tab / Plan
Block 列表
root line 列表
Line 树
下沉 / 上升
link on/off
外部供入 / 外供输出
目标 / 缺口 / 剩余
过程执行率
机器换算
调试面板
矩阵调试视图
```

关键原则：

```text
UI 是 ProductionPlan 的可视化渲染
UI 不应该隐藏解算边界
展示得对优先于画得漂亮
```

### 5. 验收用例

最后读：

```text
mvp-acceptance-cases.md
red-bottle-quality-lp-reference.md
red-bottle-quality-lp-reference.xlsx
```

`mvp-acceptance-cases.md` 固定 MVP 最小验收集：

```text
白板红瓶@1 60/min
红瓶@5 60/min，不回收
红瓶@5 60/min，带回收
原油处理/裂解副产物配平
```

红瓶文档和 Excel 是计算基准资产，用于核对矩阵展开、品质概率、回收过程和机器换算。

### 6. 开放问题

品质策略相关问题看：

```text
mvp-open-questions.md
```

当前品质策略不阻塞 MVP 主文档落地，但后续必须继续决策。

## 当前文档列表

```text
README.md
mvp-overview.md
mvp-production-model.md
mvp-solving-model.md
mvp-ui-spec.md
mvp-acceptance-cases.md
mvp-open-questions.md
production-balancing-principles.md
red-bottle-quality-lp-reference.md
red-bottle-quality-lp-reference.xlsx
```

## 实现优先级建议

如果后续开始实现，建议按以下顺序：

```text
1. ProductionPlan / ProductionBlock / ProductionLine 基础模型
2. level 下沉 / 上升 / BoundaryContract
3. link on/off
4. 线性模型生成
5. solver-neutral LinearModel / LinearSolution
6. PlanningResult 解释层
7. UI 普通视图
8. 调试面板
9. 验收用例跑通
10. 品质策略补充
```

这个顺序的重点是先稳定模型边界，再做复杂品质策略。

## 文档维护原则

更新本文档目录时应遵守：

```text
新的共识要落到 doc-new，不只停留在对话中
开放问题要进入 mvp-open-questions.md
计算基准要能被验收用例引用
不要把旧脑暴文档当作 MVP 实现唯一依据
如果新文档与旧 docs/ 冲突，优先以 doc-new 为准
```

如果后续品质策略定稿，应同步更新：

```text
mvp-production-model.md
mvp-solving-model.md
mvp-ui-spec.md
mvp-acceptance-cases.md
mvp-open-questions.md
```
