# Faculator Core 建模上下文

## 目的

这份文档用于承接 `faculator-data` 基本稳定之后，向 `faculator-core` 过渡时的建模讨论结论，方便后续切换会话继续推进。

## 当前共识

### 1. `faculator-data` 的定位

- `faculator-data` 负责如实承接 `game-data.json`
- 这一层是 DTO / source document，不追求 DDD
- 允许保留 JSON 形状、导出器技巧和原始字段语义

### 2. `faculator-core` 的目标

- `faculator-core` 面向整个 app 的领域模型
- 它不应该继续停留在“更强类型的 DTO”
- 也不应该滑向“世界树 / 大对象导航图”
- 正确方向是：明确边界、身份、值对象、能力和关系

### 3. DDD 不等于嵌套对象树

- 不应因为某字段逻辑上指向另一个对象，就把目标对象直接内嵌进去
- 例如 `Item.place_as_equipment_result` 不应直接变成 `Equipment`
- 更合理的方向是“引用另一个领域对象”，而不是“拥有另一个领域对象”

### 4. clone 不是核心风险，身份才是

- 领域里“是不是同一个对象”不该靠内存地址判断
- 应该靠稳定身份判断
- 所以后续即使存在 clone，只要身份模型清晰，也不会天然引发语义矛盾

## 目前对 `core` 的判断

### 1. 还没有写成世界树

- 目前 `core::material::Item` 没有直接内嵌 `Entity` / `Equipment`
- 这一点方向是对的

### 2. 但也还没有真正进入稳定的领域边界

- 现在很多跨对象关系仍是 `String`
- 这使得 `core` 更像“强类型 DTO”而不是成熟领域模型

### 3. `capability` 是有价值的，但还不够

- `ItemCapability` 这类拆分能避免 DTO 式大平铺
- 但它目前更多是在“重新装袋字段”
- 还没有充分表达领域约束

## 关于 typed id

### 结论

- DTO 层继续使用 `String` 很合理
- `core` 层中，凡是“引用另一个领域对象”的地方，后续更适合升级成 typed id

### typed id 的意思

- 不是引入数据库自增 id
- 也不是否定 `name`
- 而是把 `name` 包装成有领域语义的身份类型

例如：

```rust
pub struct ItemId(String);
pub struct EquipmentId(String);
pub struct SpaceLocationId(String);
```

也就是说：

- `name` 仍然可以是唯一索引
- 只是不要在 `core` 里把所有引用都继续裸写成 `String`

## 关于 Repository / Catalog

### 结论

- 不建议现在就把 repository 放进 `core`
- 当前阶段更适合把抽象放在 `app`
- `core` 先只放领域对象、值对象、身份和规则

### 分层建议

- `faculator-data`: DTO / 反序列化 / 导入
- `faculator-core`: 领域模型 / 值对象 / typed id / 规则
- `faculator-app`: use case / catalog trait / repository trait / 编排
- `data` 或 `infra` 实现具体来源

### 当前更适合的抽象

相比传统 CRUD repository，Faculator 现在更像需要一个只读 `Catalog`：

- 加载整份 game-data
- 建立索引
- 提供解析和查询
- 服务后续推理、求解、展示

## 已完成的命名/结构整理

### DTO 层

- 清理了 `r#type` / `r#from` / `r#to`
- 清理了若干不规范命名与 `serde(rename)` 使用
- 将可统一的连字符字段提升为 `rename_all`
- 删除了冗余 `Ord` / `PartialOrd`

### core / 术语层

- `goods` 已整体改名为 `material`
- 去掉了若干误导性的 `Set` 后缀
- 删除了无用的 type alias，如 `pub type Effect = ...`
- 避免复数 struct 命名

## 后续优先级建议

### 第一优先级

先明确 `core` 中哪些关系应该是“引用另一个对象”。

建议优先梳理：

- `Item -> Entity`
- `Item -> Equipment`
- `Item -> SpaceLocation`
- `Item -> Material`

### 第二优先级

引入最小集 typed id，而不是一口气全改。

建议最先考虑：

- `ItemId`
- `EntityId`
- `EquipmentId`
- `SpaceLocationId`
- `MaterialId`

### 第三优先级

决定 `app` 层的 `Catalog` 轮廓，而不是先设计通用 CRUD repository。

## 仍待决策的问题

### 1. `core` 是“严格 DDD 聚合模型”还是“偏领域化的只读世界目录”

- 当前更像后者
- 如果要走前者，需要更明确聚合根和行为边界

### 2. 某些聚合型命名是否还要继续收紧

例如：

- `EnergySource` 现在是聚合型能源定义，而非某一种具体能源源
- 如果后续觉得语义仍不够清晰，可考虑改成 `EntityEnergySource`

## 一句话方向

下一步不要把 `core` 写成“对象世界树”，也不要把它写成“数据库访问壳”；更合适的方向是：

**领域对象 + 明确身份 + 引用关系 + app 层 catalog。**
