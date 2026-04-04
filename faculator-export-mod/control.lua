--- Faculator 数据导出 Mod 入口
--- 导出所有游戏原型数据 + 中文翻译到 JSON 文件。
---
--- 输出目录: script-output/faculator/
---   - game-data.json        原型数据
---   - translations*.json    本地化翻译（语言后缀文件）
---   - export-manifest.json  当前有效导出文件清单
---
--- 触发方式:
---   1. 游戏内 GUI 面板（mod 按钮栏中的 Faculator 按钮）
---   2. 游戏/mod 配置变更时自动全量导出（on_configuration_changed）
---   3. 控制台命令手动全量导出: /faculator-export
---
--- 这是 Factorio 官方的运行时入口文件。
--- @see https://lua-api.factorio.com/latest/auxiliary/data-lifecycle.html

local log               = require("lib.logger").create("主控")
local Constants         = require("lib.constants")
local Util              = require("lib.util")
local ExportCoordinator = require("exporter.coordinator")
local TransCoordinator  = require("translation.coordinator")
local TransHandler      = require("translation.handler")
local Gui               = require("ui.gui")
local UiHandler         = require("ui.handler")

-------------------------------------------------------------------------------
-- 全量导出流程（命令行与自动触发使用）
-- 阶段一: 收集并写入全部原型数据（同步）
-- 阶段二: 发起翻译请求（异步，通过玩家对象）
-- 阶段三: 翻译完成后写入翻译文件
-------------------------------------------------------------------------------

--- 启动全量导出流程（不经过 GUI，直接导出全部数据）
--- @param player LuaPlayer|nil 发起导出的玩家（nil 则跳过翻译）
local function start_full_export(player)
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
  log.info("===== 开始全量导出流程 =====")
  if player then
    player.print(Constants.MSG_PREFIX .. "正在收集原型数据...")
  end

  ExportCoordinator.export()
  storage.export_has_data = true

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
-- GUI 初始化
-------------------------------------------------------------------------------

--- 为玩家创建 mod 按钮栏中的切换按钮
local function ensure_gui_button(player)
  if player and player.valid and player.connected then
    Gui.ensure_button(player)
  end
end

--- 为所有在线玩家创建切换按钮
local function ensure_all_gui_buttons()
  for _, player in pairs(game.players) do
    ensure_gui_button(player)
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
    -- 通知 GUI 更新状态标签
    UiHandler.on_translations_complete()
  end)
end)

--- GUI 按钮点击事件
--- 处理命名元素（faculator_ 前缀）和带 tags 的元素
--- @see https://lua-api.factorio.com/latest/events.html#on_gui_click
script.on_event(defines.events.on_gui_click, function(event)
  if not event.element or not event.element.valid then return end
  local elem = event.element
  local by_name = elem.name and elem.name:find("^faculator_")
  local by_tags = elem.tags and elem.tags.fac
  if not by_name and not by_tags then return end
  UiHandler.on_gui_click(event)
end)

--- GUI 复选框状态变化事件（右面板文本列表中的物品排除）
--- @see https://lua-api.factorio.com/latest/events.html#on_gui_checked_state_changed
script.on_event(defines.events.on_gui_checked_state_changed, function(event)
  if not event.element or not event.element.valid then return end
  local tags = event.element.tags
  if tags and tags.fac then
    UiHandler.on_gui_checked_state_changed(event)
  end
end)

--- GUI 关闭事件（玩家按 E 键关闭面板）
--- @see https://lua-api.factorio.com/latest/events.html#on_gui_closed
script.on_event(defines.events.on_gui_closed, function(event)
  UiHandler.on_gui_closed(event)
end)

--- 新玩家创建时添加切换按钮
--- @see https://lua-api.factorio.com/latest/events.html#on_player_created
script.on_event(defines.events.on_player_created, function(event)
  local player = game.get_player(event.player_index)
  ensure_gui_button(player)
end)

--- 首次加载时初始化 storage
--- @see https://lua-api.factorio.com/latest/classes/LuaBootstrap.html#on_init
script.on_init(function()
  log.info("Mod 首次加载，初始化 storage")
  TransCoordinator.init_storage()
  storage.fac_exclusions = {}
  storage.fac_tab_checks = {}
  storage.fac_active_tab = "items"
  storage.fac_active_group = nil
end)

--- 游戏/mod 配置变更时自动全量导出
--- 这是原型数据可能变化的唯一时机。
--- @see https://lua-api.factorio.com/latest/classes/LuaBootstrap.html#on_configuration_changed
script.on_configuration_changed(function(data)
  log.info("检测到游戏配置变更，准备自动导出")
  TransCoordinator.init_storage()

  -- 配置变更后原型可能已变，清除旧的排除项
  storage.fac_exclusions = {}
  storage.fac_tab_checks = storage.fac_tab_checks or {}
  storage.fac_active_tab = storage.fac_active_tab or "items"
  storage.fac_active_group = nil

  -- 确保所有玩家都有切换按钮（mod 首次安装到已有存档时需要）
  ensure_all_gui_buttons()

  local player = Util.get_any_connected_player()
  if player then
    player.print(Constants.MSG_PREFIX .. "检测到游戏配置变更，开始自动导出...")
    start_full_export(player)
  else
    log.warn("配置变更时无在线玩家，跳过自动导出")
  end
end)

--- 控制台手动触发全量导出命令
--- 用法: /faculator-export
--- @see https://lua-api.factorio.com/latest/classes/LuaCommandProcessor.html#add_command
commands.add_command(
  "faculator-export",
  "导出所有游戏原型数据和翻译到 JSON 文件（全量导出）",
  function(event)
    local player = game.get_player(event.player_index)
    log.info("玩家 " .. player.name .. " 手动触发全量导出")
    start_full_export(player)
  end
)

--- 控制台仅导出翻译命令
--- 用法: /faculator-translate
--- 仅发起翻译请求，不重新导出原型数据。
--- 输出文件名自动带上当前游戏语言后缀，如 translations-en.json。
commands.add_command(
  "faculator-translate",
  "仅导出翻译数据（文件名自动带语言后缀，如 translations-en.json）",
  function(event)
    local player = game.get_player(event.player_index)
    local locale = player.locale or "unknown"
    log.info("玩家 " .. player.name .. " 触发仅翻译导出，语言: " .. locale)
    player.print(Constants.MSG_PREFIX .. "检测到语言: " .. locale .. "，开始导出翻译...")

    if storage.exporting then
      player.print(Constants.MSG_PREFIX .. "导出正在进行中，请稍后...")
      return
    end

    TransCoordinator.start_translations_only(player)
  end
)
