# Faculator Exporter

将 Factorio 游戏原型数据导出为 JSON 文件，供 Faculator 计算器导入使用。

## 安装

推荐使用项目根目录的 `justfile` 进行同步：

```bash
# 一次性同步到 Factorio mods 目录
just sync

# 开启 watch 模式自动同步
just watch

# 或创建软链接
just link
```

手动安装也可以将 `faculator-expoter` 文件夹复制（或软链接）到 Factorio 的 mods 目录。

> **注意**: Factorio mod 文件夹名必须是 `<mod-name>_<version>` 格式。
> 参见 https://lua-api.factorio.com/latest/auxiliary/mod-structure.html

## 使用

### 自动导出

Mod 在以下情况自动触发导出：

1. **`on_configuration_changed`** — 安装/更新 mod 或游戏版本变更时自动导出。这是最常用的触发方式，因为游戏原型数据只在这种情况下变化。

### 手动导出

在游戏内按 `~` 打开控制台，输入：

```
/faculator-export
```

### 输出文件

导出文件位于 Factorio 的 `script-output/faculator/` 目录：

- **`game-data.json`** — 所有原型数据（物品、配方、机器、科技、品质、太空等）
- **`translations-<locale>.json`** — 当前语言的名称和描述翻译，如 `translations-en.json`、`translations-zh-CN.json`

`script-output` 目录位置：

- macOS: `~/Library/Application Support/factorio/script-output/`
- Linux: `~/.factorio/script-output/`
- Windows: `%APPDATA%\Factorio\script-output\`

## 项目结构

```
faculator-expoter/
├── info.json                  # [官方] mod 元数据（必需）
├── control.lua                # [官方] 运行时入口，注册事件和命令
├── README.md
├── lib/                       # 基础库
│   ├── constants.lua          #   常量定义
│   ├── logger.lua             #   日志模块（中文标签）
│   ├── util.lua               #   通用工具函数
│   ├── serializers.lua        #   数据序列化器
│   └── writer.lua             #   文件输出抽象
├── exporter/                  # 原型数据导出模块
│   ├── coordinator.lua        #   导出协调器（唯一对外入口）
│   ├── categories.lua         #   类别导出（配方/燃料/资源/模块）
│   ├── item_group.lua         #   物品分组导出
│   ├── item.lua               #   物品导出
│   ├── fluid.lua              #   流体导出
│   ├── recipe.lua             #   配方导出
│   ├── entity.lua             #   实体导出
│   ├── technology.lua         #   科技导出
│   ├── quality.lua            #   品质导出（Space Age）
│   ├── space.lua              #   太空地点/连接导出（Space Age）
│   └── equipment.lua          #   装备/网格导出
└── translation/               # 异步翻译模块
    ├── coordinator.lua        #   翻译协调器（生命周期管理）
    ├── collector.lua          #   LocalisedString 收集器
    └── handler.lua            #   on_string_translated 回调处理
```

**约定说明**：

- `info.json`、`control.lua` 是 Factorio 官方规定的文件
- `lib/`、`exporter/`、`translation/` 是自定义模块目录
- 所有注释使用中文，API 调用处附带文档链接

## 导出内容

| 类别                | 说明                                             |
| ------------------- | ------------------------------------------------ |
| item_groups         | 物品分组及子分组                                 |
| recipe_categories   | 配方类别                                         |
| fuel_categories     | 燃料类别                                         |
| resource_categories | 资源类别                                         |
| module_categories   | 插件类别                                         |
| items               | 所有物品（含燃料值、堆叠大小、模块效果、变质等） |
| fluids              | 所有流体（温度、热容量等）                       |
| recipes             | 所有配方（原料、产物、耗时、允许的效果等）       |
| entities            | 机器实体（组装机、化工厂、熔炉、火箭发射井等）   |
| technologies        | 科技树（前置、解锁、研究消耗等）                 |
| qualities           | 品质等级（Space Age）                            |
| space_locations     | 太空位置（Space Age）                            |
| space_connections   | 太空路线（Space Age）                            |
| equipment           | 装备模块                                         |
| equipment_grids     | 装备栏                                           |

## 翻译流程

导出分两个阶段：

1. **同步阶段** — 立即收集所有原型数据并写入 `game-data.json`
2. **异步阶段** — 通过 `request_translation` API 请求游戏当前语言的翻译文本，完成后写入 `translations-<locale>.json`

翻译是异步的，大约需要几秒到几十秒（取决于字符串数量）。进度会在聊天窗口和日志文件中显示。

## 日志

Mod 使用统一的日志模块，输出到：

- **日志文件** — `factorio-current.log`（通过 Factorio 内置 `log()` 函数）
- **游戏内聊天** — 关键进度信息通过 `player.print()` 显示

日志格式：`[Faculator] [级别][模块] 消息内容`
