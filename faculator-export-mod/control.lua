--- Faculator 数据导出 Mod 入口
--- 导出所有游戏原型数据 + 中文翻译到 JSON 文件。
---
--- 输出目录: script-output/faculator/
---   - game-data.json     原型数据
---   - translations.json  本地化翻译
---
--- 触发方式:
---   1. 首次加载时自动执行（on_init）
---   2. 游戏/mod 配置变更时自动执行（on_configuration_changed）
---   3. 控制台命令手动触发: /faculator-export
---
--- 这是 Factorio 官方的运行时入口文件。
--- @see https://lua-api.factorio.com/latest/auxiliary/data-lifecycle.html

local log               = require("lib.logger").create("主控")
local Constants         = require("lib.constants")
local Util              = require("lib.util")
local ExportCoordinator = require("exporter.coordinator")
local TransCoordinator  = require("translation.coordinator")
local TransHandler      = require("translation.handler")

-------------------------------------------------------------------------------
-- 导出主流程
-- 阶段一: 收集并写入原型数据（同步）
-- 阶段二: 发起翻译请求（异步，通过玩家对象）
-- 阶段三: 翻译完成后写入翻译文件
-------------------------------------------------------------------------------

--- 启动完整的导出流程
--- @param player LuaPlayer|nil 发起导出的玩家（nil 则跳过翻译）
local function start_export(player)
  if storage.exporting then
    if player then
      player.print(Constants.MSG_PREFIX .. "导出正在进行中，请稍后...")
    end
    log.warn("导出已在进行中，忽略重复请求")
    return
  end

  TransCoordinator.init_storage()
  TransCoordinator.reset()
  storage.exporting = true

  -- 阶段一: 收集并写入原型数据
  log.info("===== 开始导出流程 =====")
  if player then
    player.print(Constants.MSG_PREFIX .. "正在收集原型数据...")
  end

  ExportCoordinator.export()

  if player then
    player.print(Constants.MSG_PREFIX .. "原型数据已写入 script-output/" .. Constants.OUTPUT_DIR .. Constants.DATA_FILENAME)
  end

  -- 阶段二: 发起异步翻译请求
  if player then
    TransCoordinator.start(player)
  else
    -- 无在线玩家（如专用服务器），跳过翻译
    log.warn("无在线玩家，跳过翻译阶段")
    storage.exporting = false
  end
end

-------------------------------------------------------------------------------
-- 事件注册
-------------------------------------------------------------------------------

--- 处理翻译结果回调
--- @see https://lua-api.factorio.com/latest/events.html#on_string_translated
script.on_event(defines.events.on_string_translated, function(event)
  TransHandler.on_translated(event, function()
    TransCoordinator.finalize()
  end)
end)

--- 首次加载时初始化 storage
--- @see https://lua-api.factorio.com/latest/classes/LuaBootstrap.html#on_init
script.on_init(function()
  log.info("Mod 首次加载，初始化 storage")
  TransCoordinator.init_storage()
end)

--- 游戏/mod 配置变更时自动导出
--- 这是原型数据可能变化的唯一时机。
--- @see https://lua-api.factorio.com/latest/classes/LuaBootstrap.html#on_configuration_changed
script.on_configuration_changed(function(data)
  log.info("检测到游戏配置变更，准备自动导出")
  TransCoordinator.init_storage()

  local player = Util.get_any_connected_player()
  if player then
    player.print(Constants.MSG_PREFIX .. "检测到游戏配置变更，开始自动导出...")
    start_export(player)
  else
    log.warn("配置变更时无在线玩家，跳过自动导出")
  end
end)

--- 控制台手动触发命令
--- 用法: /faculator-export
--- @see https://lua-api.factorio.com/latest/classes/LuaCommandProcessor.html#add_command
commands.add_command(
  "faculator-export",
  "导出所有游戏原型数据和翻译到 JSON 文件",
  function(event)
    local player = game.get_player(event.player_index)
    log.info("玩家 " .. player.name .. " 手动触发导出")
    start_export(player)
  end
)
