# Faculator UI Component TODO

这是 Faculator Angular 项目的组件化视觉清单。第一轮只覆盖首页当前可见的工作台，不把所有未来功能提前抽象成组件库。

## 使用方式

1. 先单独调整 `homepage-components.md` 中列出的基础组件。
2. 基础组件稳定后，再用它们组装 Block、目标栏、结果栏等领域组件。
3. 每个组件都要按语义确认自己的状态，而不是只通过颜色区分。

## 标注规则

- 一张标注图只标一种组件。
- 同一个组件在首页出现多次时，全部放在同一张图里。
- 组件的视觉变体和业务语义写在图下方，不把不同组件混在同一张图上。
- 所有标注都基于同一张首页截图：[`homepage.png`](./homepage.png)。

## 组件图索引

| 组件 | 标注图 | 当前用途 |
|---|---|---|
| `FacPanel` | [`fac-panel.png`](./fac-panel.png) | 外壳、侧栏、工作区、目标栏、结果栏 |
| `FacButton` | [`fac-button.png`](./fac-button.png) | primary、neutral、warning、disabled |
| `FacSegmented` | [`fac-segmented.png`](./fac-segmented.png) | 语言切换、观察视图切换 |
| `FacTabs` | [`fac-tabs.png`](./fac-tabs.png) | 顶部计划标签、底部结果标签 |
| `FacInput` | [`fac-input.png`](./fac-input.png) | 目标产出速率输入 |
| `FacCard` | [`fac-card.png`](./fac-card.png) | Block 卡片、目标卡片、生产节点卡片 |
| `FacStatus` | [`fac-status.png`](./fac-status.png) | 状态点、计数、统计单元格 |
| `FacIcon` | [`fac-icon.png`](./fac-icon.png) | 游戏图标、关闭/删除图标 |

## 第一轮范围

- 先把上面 8 个基础组件调成稳定的视觉组件。
- 每个组件单独定义尺寸、纹理、边框、阴影、字体和状态。
- 再用这些组件组装 `FacBlockCard`、`FacGoalRail`、`FacResultDrawer` 等领域组件。

暂不在这一轮拆解 BOM 计算、四种观察图的内部节点和百科弹层；它们属于下一层领域复合组件。
