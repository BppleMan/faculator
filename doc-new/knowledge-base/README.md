# Faculator 知识库索引

## 目录定位

`knowledge-base/` 用于保存支撑主线开发文档的知识资产。

这里的文档通常具备以下特征：

```text
是重要推导或原则
能帮助理解 MVP 主线
但本身不是完整的开发指导闭环
不应该占据 doc-new 顶层
```

顶层 `doc-new/` 应优先保留主线开发指导文档，例如：

```text
mvp-overview.md
mvp-production-model.md
mvp-solving-model.md
mvp-ui-spec.md
mvp-acceptance-cases.md
```

知识库文档可以被主线文档引用，但不替代主线文档。

## 当前文档

### `production-balancing-principles.md`

产线配平、唯一解、无解、截流、精确目标/下限目标、LP/MILP 边界的原则说明。

它是 `mvp-solving-model.md` 的背景知识。主线解算文档已经吸收了其中的 MVP 化结论；完整推导和经验解释保留在这里。

### `red-bottle-quality-lp-reference.md`

红瓶品质线性规划基准说明文档。

它解释：

```text
红瓶基础配方链
白板红瓶 60/min
品质矩阵
红瓶@5 60/min 不回收
红瓶@5 60/min 带回收
完整矩阵如何展开
```

### `red-bottle-quality-lp-reference.xlsx`

红瓶品质线性规划基准 Excel。

它是计算资产，不是普通附件。更新时必须保持公式可审计，并与 `red-bottle-quality-lp-reference.md` 保持一致。

### `quality-strategy-open-questions.md`

品质策略尚未拍板的问题列表。

它记录：

```text
品质策略绑定层级
子 line 继承规则
低星产物默认治理方式
模块混插能力
最高品质阶段产能模块策略
回收闭环 UI 呈现
```

这些问题不阻塞当前 MVP 主线，但后续决策时必须回到这里。

## 维护规则

如果某个知识库结论已经变成 MVP 实现规则，应同步写入对应主线文档。

例如：

```text
解算规则 -> mvp-solving-model.md
生产模型规则 -> mvp-production-model.md
UI 展示规则 -> mvp-ui-spec.md
验收要求 -> mvp-acceptance-cases.md
```

知识库不能成为主线文档缺失信息的借口。主线文档应该能独立指导实现，知识库用于补充推导、背景和详细资产。
