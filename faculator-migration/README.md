# faculator-migration

这个 crate 只负责数据库 schema。

## 职责边界

它负责：

- 建表
- 改表
- 加约束
- 加索引
- 管理 schema 版本

它不负责：

- 解析 `game-data.json`
- 业务转换
- seed / import 逻辑
- 运行时查询逻辑

当前项目里，真正的数据库构建入口在 `faculator-data` 的 `build_db` 二进制中；`faculator-migration` 只提供可复用的 schema 初始化能力。

## 当前已落地的表

- `game`
- `item`
- `fluid`
- `recipe`
- `entity`

其中：

- 核心原型表使用 `name` 作为自然主键
- 复杂嵌套结构暂存为 JSON 列
- `game` 表用于记录数据库产物级别的元数据

## 常用命令

### 生成新迁移

```sh
cargo run -p faculator-migration -- generate MIGRATION_NAME
```

### 应用所有待执行迁移

```sh
cargo run -p faculator-migration
```

```sh
cargo run -p faculator-migration -- up
```

### 应用前 N 条待执行迁移

```sh
cargo run -p faculator-migration -- up -n 10
```

### 回滚最近一条迁移

```sh
cargo run -p faculator-migration -- down
```

### 回滚最近 N 条迁移

```sh
cargo run -p faculator-migration -- down -n 10
```

### 删除所有表并重新应用全部迁移

```sh
cargo run -p faculator-migration -- fresh
```

### 回滚并重新应用全部迁移

```sh
cargo run -p faculator-migration -- refresh
```

### 回滚全部迁移

```sh
cargo run -p faculator-migration -- reset
```

### 查看迁移状态

```sh
cargo run -p faculator-migration -- status
```

## 与 build_db 的关系

如果你的目标是构建一份最终可运行的 sqlite 数据库，不应该只跑 migration，还应该走 `faculator-data` 的构建入口：

```sh
cargo run -p faculator-data --bin build_db -- <game-data.json> <output.sqlite> [--fresh]
```

当前这个入口已经能：

- 读取输入 JSON
- 打开 sqlite
- 执行 migration

但还没有实现真正的数据导入逻辑。
