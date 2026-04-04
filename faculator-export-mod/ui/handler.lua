--- GUI 事件处理器（百科风格）
--- 分发来自导出面板的所有用户交互事件。
--- 使用 tags.fac 字段路由操作。

local Gui               = require("ui.gui")
local Definitions        = require("ui.definitions")
local Constants          = require("lib.constants")
local log                = require("lib.logger").create("界面事件")
local ExportCoordinator  = require("exporter.coordinator")
local TransCoordinator   = require("translation.coordinator")
local Writer             = require("lib.writer")

local Handler = {}

--- 处理点击事件
function Handler.on_gui_click(event)
  local elem   = event.element
  local player = game.get_player(event.player_index)
  if not player then return end

  local name = elem.name or ""
  local tags = elem.tags

  -- 命名按钮
  if name == Gui.TOGGLE_BTN then
    Gui.toggle(player)
  elseif name == Gui.PREFIX .. "close_btn" then
    Gui.close(player)
  elseif name == Gui.PREFIX .. "select_all_tabs_btn" then
    Gui.set_all_tab_checks(player, true)
  elseif name == Gui.PREFIX .. "select_none_tabs_btn" then
    Gui.set_all_tab_checks(player, false)
  elseif name == Gui.PREFIX .. "export_btn" then
    Handler._start_export(player)
  elseif name == Gui.PREFIX .. "translate_only_btn" then
    Handler._start_translate_only(player)

  -- tags 路由
  elseif tags and tags.fac then
    local action = tags.fac

    if action == "select_tab" then
      Gui.select_tab(player, tags.tab)

    elseif action == "select_group" then
      Gui.select_group(player, tags.group)

    elseif action == "toggle_item" and elem.type == "sprite-button" then
      Gui.toggle_item(player, tags.tab, tags.item)
      -- 更新按钮 toggled 状态: toggled=true 表示排除
      local excl = storage.fac_exclusions and storage.fac_exclusions[tags.tab]
      elem.toggled = excl and excl[tags.item] or false
      Gui._update_status_counts(player)

    elseif action == "batch_all" then
      Gui.batch_select(player, "all")
    elseif action == "batch_none" then
      Gui.batch_select(player, "none")
    elseif action == "batch_invert" then
      Gui.batch_select(player, "invert")
    end
  end
end

--- 处理复选框状态变化
function Handler.on_gui_checked_state_changed(event)
  local elem = event.element
  if not elem or not elem.valid then return end
  local tags = elem.tags
  if not tags or not tags.fac then return end

  local player = game.get_player(event.player_index)
  if not player then return end

  if tags.fac == "toggle_item" then
    Gui.sync_item_checkbox(player, tags.tab, tags.item, elem.state)
    Gui._update_status_counts(player)

  elseif tags.fac == "toggle_tab_export" then
    local tab_key = storage.fac_active_tab
    if tab_key then
      Gui.toggle_tab_check(player, tab_key)
      Gui._highlight_tabs(player)
    end
  end
end

--- 面板关闭（按 E 键）
function Handler.on_gui_closed(event)
  if event.element
    and event.element.valid
    and event.element.name == Gui.FRAME_NAME
  then
    event.element.destroy()
  end
end

--- 翻译完成回调
function Handler.on_translations_complete()
  if storage.gui_player_index then
    local player = game.get_player(storage.gui_player_index)
    if player and player.connected then
      Gui.set_status(player, "导出完成！数据 + 翻译已写入")
    end
    storage.gui_player_index = nil
  end
end

-------------------------------------------------------------------------------
-- 导出流程
-------------------------------------------------------------------------------

function Handler._start_export(player)
  if storage.exporting then
    Gui.set_status(player, "导出正在进行中，请稍后...")
    return
  end

  local selection = Gui.read_selection(player)
  if not selection then return end

  -- 检查至少选了一个
  local any = false
  for _, tab in ipairs(Definitions.TABS) do
    if selection[tab.key] then any = true; break end
  end
  if not any then
    Gui.set_status(player, "请至少选择一个导出类别")
    return
  end

  TransCoordinator.init_storage()
  TransCoordinator.reset()
  storage.exporting = true

  log.info("玩家 " .. player.name .. " 通过 GUI 发起导出")
  Gui.set_status(player, "正在收集数据...")

  local exclusions = storage.fac_exclusions or {}
  local data = ExportCoordinator.collect_selected_data(selection, exclusions)
  Writer.write_data(data)

  local total = 0
  for k, v in pairs(data) do
    if k ~= "_meta" and type(v) == "table" then total = total + #v end
  end

  local msg = string.format("数据已导出（%d 条记录）", total)
  player.print(Constants.MSG_PREFIX .. msg
    .. "，文件: script-output/" .. Constants.OUTPUT_DIR .. Constants.DATA_FILENAME)

  if selection.translations then
    Gui.set_status(player, msg .. "，正在翻译...")
    storage.gui_player_index = player.index
    TransCoordinator.start(player)
  else
    storage.exporting = false
    Gui.set_status(player, msg)
  end
end

function Handler._start_translate_only(player)
  if storage.exporting then
    Gui.set_status(player, "导出正在进行中，请稍后...")
    return
  end

  local locale = player.locale or "unknown"
  log.info("玩家 " .. player.name .. " 通过 GUI 发起仅翻译导出，语言: " .. locale)
  Gui.set_status(player, "语言: " .. locale .. "，正在翻译...")
  storage.gui_player_index = player.index
  TransCoordinator.start_translations_only(player)
end

return Handler
