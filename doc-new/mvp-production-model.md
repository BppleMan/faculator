# Faculator MVP 生产计划模型

## 本文目的

本文用于固定 Faculator MVP 的核心领域模型：

```text
ProductionPlan
ProductionBlock
ProductionLine
Level
BoundaryContract
link
```

这套模型是 Faculator 的中心。UI 是对它的可视化渲染，解算器是对它生成的线性问题求解。Faculator 不能把核心语义藏在 UI 组件里，也不能把用户的产线组织方式直接压扁成 solver 输入。

本文只讨论模型语义，不讨论 Rust 结构体字段细节。

## 顶层原则

Faculator 的生产计划模型服务于一个核心目标：

```text
让用户显式控制量化上下文。
```

所谓量化上下文，是指当前解算域中到底包含哪些配方过程、哪些物料守恒关系、哪些边界输入、哪些边界输出，以及哪些内容被拆出去单独解算。

因此，模型必须避免以下行为：

```text
因为视觉上在同一个 Block 里，就自动合并解算
因为物料名称相同，就自动跨 Block 共享
因为某个 line 被折叠，就把它误认为仍在父级矩阵中
因为外供输出和外部供入匹配，就自动绑定供需
因为算法遍历方便，就把 VirtualRoot 当成持久化领域对象
```

Faculator 宁可让边界显式，也不要为了“看起来智能”而隐藏解算语义。

## ProductionPlan

`ProductionPlan` 是 Faculator 的顶层生产规划对象。

它对应 UI 上的一个 Tab，也就是一份独立的生产规划文档。

```text
ProductionPlan
= 一个 UI Tab
= 一份独立生产规划文档
= 一组 ProductionBlock 的容器
```

一个应用实例可以同时打开多个 `ProductionPlan`：

```text
ProductionPlan A
ProductionPlan B
ProductionPlan C
```

MVP 中，不同 `ProductionPlan` 之间默认完全隔离。

它们不共享：

```text
目标
物料
外部供入
外供输出
解算结果
调试矩阵
```

如果未来需要跨计划共享或引用，那必须成为一个显式功能，不能作为 MVP 的隐式行为。

## ProductionBlock

`ProductionBlock` 是 `ProductionPlan` 下的生产组织单元。

它对应 UI 左侧边栏里的一个 item，但它不是单纯视觉分组。

```text
ProductionBlock
= 左侧边栏 item
= 一组 ProductionLine 树的容器
= 一个生产组织单元
```

一个 `ProductionPlan` 可以包含多个 `ProductionBlock`：

```text
ProductionPlan：科研基地
  ProductionBlock：基础科研
  ProductionBlock：军工科研
  ProductionBlock：模块生产
```

MVP 中，`ProductionBlock` 之间默认完全隔离。

隔离的含义是：

```text
Block A 的外供输出不会自动成为 Block B 的外部供入
Block B 的外部供入不会自动查找 Block A 是否有同名输出
Block A 和 Block B 不会因为同属一个 ProductionPlan 就被合并进一个全局矩阵
ProductionPlan 不做隐式全局供需配平
```

这种隔离不是功能缺失，而是设计原则。因为玩家已有库存、其它蓝图、其它计划、未纳入当前规划的产线，都可能成为外部供入的真实来源。Faculator 不应该猜测来源。

## ProductionLine

`ProductionLine` 是 Faculator 生产计划模型中最重要的单元。

它不是 UI 上的一行，也不是简单的配方节点。它代表一个可以被展开、折叠、下沉、上升的生产单元。

一条 `ProductionLine` 通常围绕一个目标物展开配方链。

目标使用以下形式表达：

```text
物料@品质 >= 数量/分钟
```

例如：

```text
红瓶@5 >= 60/min
```

当用户指定这个目标时，系统查询配方库，找到可以生产该物料的配方，并展开输入需求。

例如红瓶链路可以展开为：

```text
红瓶@5 60/min
  铜板
    铜矿
  齿轮
    铁板
      铁矿
```

这棵树不是为了画漂亮图形，而是为了明确当前解算上下文中有哪些配方过程。

## 多个第一级 ProductionLine

一个 `ProductionBlock` 下可以有多个第一级 `ProductionLine`：

```text
ProductionBlock：基础科研
  ProductionLine(level=0)：红瓶@5 >= 60/min
  ProductionLine(level=0)：绿瓶@3 >= 45/min
```

MVP 中，这些第一级 `ProductionLine` 默认独立解算。

也就是说：

```text
它们同属一个 Block，不代表进入同一个矩阵
它们同属一个 Block，不代表共享中间物
它们同属一个 Block，不代表目标函数合并
```

如果未来需要“共同解算”，必须由用户显式启用。这属于 milestone 2，不属于 MVP。

MVP 选择独立解算的原因是：

```text
Block 是组织容器，不是隐式解算域
共同解算会引入共享、截流、副产物归属和目标函数优先级问题
独立解算更符合用户显式控制上下文的原则
```

## Level 的含义

`level` 不是视觉缩进。

`level` 表达某段产线是否仍属于父级解算上下文。

当一段产线留在当前 level 时，它的内部配方过程参与当前解算域。solver 会在同一个矩阵里看到这些过程的输入、输出、副产物、品质分流、回收过程和物料守恒关系。

当一段产线被下沉到下一级 level 时，它从父级解算域中被抽离。父级不再直接关心它内部如何生产，而是只看到它暴露出来的边界契约。

因此：

```text
视觉缩进 = 展示结构
level = 解算边界
```

这两个概念可能在 UI 上同时表现为层级，但语义不同。

## 下沉

下沉是一个量化建模动作，不是单纯 UI 收纳。

定义：

```text
下沉 = 把当前解算域中的一段内部配方网络拆出去，
       形成一个新的局部解算域，
       并向父级暴露一个边界契约。
```

下沉后，父级不再直接包含子级内部配方过程。父级只把这条下沉 line 当成一个虚拟配方。

例如父级原本包含：

```text
红瓶@5 60/min
  铜板
    铜矿
  齿轮
    铁板
      铁矿
```

如果用户把齿轮下沉，父级可能变成：

```text
level=0:
红瓶@5 60/min
  铜板
  齿轮供给
```

子级变成：

```text
level=1:
齿轮 60/min
  铁板
    铁矿
```

从父级视角看，齿轮内部的铁板、铁矿、齿轮制造过程已经不在父级矩阵中。

## 上升

上升是下沉的反向操作。

定义：

```text
上升 = 取消局部解算边界，
       把子级内部配方网络重新并入父级解算域。
```

上升后，父级重新看到子级内部过程。原本通过边界契约连接的虚拟配方消失，内部配方列重新参与父级矩阵。

上升不是简单改变 UI 层级，而是改变解算域组成。

## BoundaryContract

`BoundaryContract` 是下沉 line 对父级暴露的边界契约。

它的基本形式是：

```text
边界输入 -> 边界输出
```

边界输出表示子级对父级承诺提供的物料和速率。

边界输入表示子级自己没有继续展开、仍然需要由父级或外部提供的物料和速率。

### 无输入边界

如果子级 line 完全展开到采矿或其它源头工序，它对父级可以表现为：

```text
无输入 -> 齿轮 60/min
```

这表示父级可以把它当作一个独立供给源。

父级不需要为这条齿轮 line 准备铁板，因为铁板和铁矿已经在子级内部解决。

### 有输入边界

如果子级 line 只展开到铁板之前，它对父级表现为：

```text
铁板 120/min -> 齿轮 60/min
```

这表示父级仍然需要看到 `铁板 120/min` 这个边界输入，但不需要看到齿轮内部如何从铁板生产齿轮。

从父级矩阵看，这个下沉 line 类似一个虚拟配方列：

```text
-120 铁板
+60 齿轮
```

但这个虚拟配方不是游戏真实配方，而是子级解算域对父级暴露的摘要。

## link

下沉 line 需要一个 `link` 语义，用于控制子级目标速率是否跟随父级需求。

MVP 规则：

```text
下沉后默认 link = on
link = on 时，子级目标速率跟随父级对该物料的需求
link = off 时，子级目标速率由用户自由指定
```

### link = on

假设父级红瓶线需要：

```text
齿轮 60/min
```

用户将齿轮下沉后，如果 `link = on`，子级目标自动为：

```text
齿轮 >= 60/min
```

如果父级红瓶目标从 60/min 改成 120/min，父级对齿轮的需求变化，子级目标也自动变化。

这适合默认使用场景，因为下沉只是为了拆出局部解算域，不是为了改变供给速率。

### link = off 且产出超出父级需求

如果父级需要：

```text
齿轮 60/min
```

但用户关闭 link，并把子级目标改成：

```text
齿轮 >= 100/min
```

那么超出的 40/min 不能消失。

它应被解释为：

```text
额外输出
副产物
可外供剩余
```

UI 必须展示这个剩余。solver 和 render model 也必须保留这个差异。

### link = off 且产出不足父级需求

如果父级需要：

```text
齿轮 60/min
```

但用户关闭 link，并把子级目标改成：

```text
齿轮 >= 40/min
```

则仍有 20/min 缺口。

这个缺口回到父级，由父级处理：

```text
父级可以继续展开齿轮上游用于补缺
父级可以显示齿轮短缺
父级可以要求用户配置其它外部供入
```

MVP 中，最直接的表达是：

```text
子级边界输出 40/min
父级需求 60/min
父级缺口 20/min
```

父级是否自动继续展开补缺，可以作为实现策略，但 UI 必须让用户看见缺口来源。

## 外供输出

外供输出表示某个 Block 或 Line 声明自己有一部分物料可对外供给。

例如：

```text
Block A:
外供输出 齿轮@3 100/min
```

MVP 中，外供输出只是声明，不会自动绑定到其它 Block。

它可以用于：

```text
让用户知道当前 block 有额外产物
作为人工规划参考
未来显式连接功能的候选端点
```

它不能用于：

```text
自动满足其它 Block 的外部供入
自动触发 ProductionPlan 全局供需校验
自动把两个 Block 的矩阵合并
```

## 外部供入

外部供入表示某个 Block 或 Line 声明某种物料由当前解算域外部提供，因此不在当前上下文继续展开。

例如：

```text
Block B:
外部供入 齿轮@3 120/min
```

这并不表示它一定来自同一计划里的某个外供输出。

真实来源可能是：

```text
另一个 Block
另一个 ProductionPlan
玩家已有库存
游戏中已有蓝图
尚未纳入 Faculator 的产线
```

MVP 中，Faculator 不猜测来源，只把外部供入作为当前解算域的边界输入。

## VirtualRoot

模型中不引入持久化的不可见 root line。

`ProductionBlock` 本身就是多个第一级 `ProductionLine` 的容器。

如果算法为了遍历方便，需要统一入口，可以临时构造：

```text
VirtualRoot
```

但它必须满足：

```text
不持久化
不展示
不参与解算语义
不拥有生产目标
不作为用户可编辑对象
```

VirtualRoot 是算法工具，不是领域模型。

## 红瓶下沉示例

初始全部在同一解算域：

```text
ProductionBlock：红瓶生产
  ProductionLine(level=0)：红瓶@5 >= 60/min
    铜板
      铜矿
    齿轮
      铁板
        铁矿
```

当前解算域包含：

```text
红瓶制作
齿轮制作
铜板冶炼
铁板冶炼
铜矿采集
铁矿采集
```

用户将齿轮下沉后：

```text
ProductionBlock：红瓶生产
  ProductionLine(level=0)：红瓶@5 >= 60/min
    铜板
      铜矿
    齿轮供给

  ProductionLine(level=1)：齿轮 >= 60/min
    铁板
      铁矿
```

父级解算域不再包含：

```text
齿轮制作
铁板冶炼
铁矿采集
```

父级只看到齿轮子级暴露的边界契约。

如果子级完全展开到铁矿，边界契约是：

```text
无输入 -> 齿轮 60/min
```

如果子级只展开到铁板，边界契约是：

```text
铁板 120/min -> 齿轮 60/min
```

这两种情况在 UI 上都可能表现为“齿轮 line 被下沉”，但在解算上完全不同。

## MVP 与 milestone 2 边界

MVP 支持：

```text
ProductionPlan
ProductionBlock
ProductionLine
多个第一级 ProductionLine 默认独立解算
line 展开
line 下沉
line 上升
边界契约
link on/off
外部供入
外供输出
短缺和剩余展示
```

MVP 不支持：

```text
同一 Block 下多个第一级 ProductionLine 默认共同解算
跨 Block 自动供需匹配
跨 ProductionPlan 共享
隐式全局供需校验
自动合并相同物料节点
自动选择最优路线
```

milestone 2 可以考虑：

```text
用户显式选择多个 root line 共同解算
用户显式连接外供输出与外部供入
同一 ProductionPlan 内的供需检查视图
跨 Block 共享关系图
更强的目标函数优先级配置
```

这些扩展必须建立在显式连接和显式解算域选择上，不能破坏 MVP 的隔离默认。
