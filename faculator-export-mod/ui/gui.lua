--- GUI 构建与管理（百科风格三级布局）
---
--- 顶部: 大类 Tab 按钮行 (物品/流体/配方/科技/实体/装备/…)
--- 左侧: 当前大类的 item_group 列表（图标按钮，类似百科 Tab 列）
--- 右侧: 当前 group 下多个 subgroup 的原型图标网格
---
--- 图标按钮使用 elem_tooltip 显示游戏原生详细提示。
--- 被排除的按钮显示 "未选中" 外观（降低透明度），选中态为默认外观。
--- @see https://lua-api.factorio.com/latest/classes/LuaGuiElement.html

local mod_gui     = require("mod-gui")
local Definitions = require("ui.definitions")
local log         = require("lib.logger").create("界面")

local PREFIX     = "faculator_"
local FRAME_NAME = PREFIX .. "main_frame"
local TOGGLE_BTN = PREFIX .. "toggle_btn"
local GRID_COLS  = 10

local Gui = {}

Gui.PREFIX     = PREFIX
Gui.FRAME_NAME = FRAME_NAME
Gui.TOGGLE_BTN = TOGGLE_BTN

-------------------------------------------------------------------------------
-- 基础接口
-------------------------------------------------------------------------------

function Gui.get_frame(player) return player.gui.screen[FRAME_NAME] end
function Gui.is_open(player) return Gui.get_frame(player) ~= nil end

function Gui.ensure_button(player)
  local flow = mod_gui.get_button_flow(player)
  if not flow[TOGGLE_BTN] then
    flow.add{
      type = "button", name = TOGGLE_BTN,
      caption = "Faculator", tooltip = "打开/关闭 Faculator 数据导出面板",
      style = mod_gui.button_style,
    }
  end
end

function Gui.toggle(player)
  if Gui.is_open(player) then Gui.close(player) else Gui.open(player) end
end

function Gui.close(player)
  local f = Gui.get_frame(player)
  if f then f.destroy() end
end

-------------------------------------------------------------------------------
-- 打开面板
-------------------------------------------------------------------------------

function Gui.open(player)
  Gui.close(player)

  -- 初始化 storage 状态
  storage.fac_exclusions = storage.fac_exclusions or {}
  storage.fac_tab_checks = storage.fac_tab_checks or {}
  -- 默认全部勾选
  for _, tab in ipairs(Definitions.TABS) do
    if storage.fac_tab_checks[tab.key] == nil then
      storage.fac_tab_checks[tab.key] = true
    end
  end
  storage.fac_active_tab   = storage.fac_active_tab or "items"
  storage.fac_active_group = storage.fac_active_group or nil

  local frame = player.gui.screen.add{
    type = "frame", name = FRAME_NAME, direction = "vertical",
  }
  frame.auto_center = true

  -- 标题栏
  Gui._build_titlebar(frame)

  -- 大类 Tab 行
  Gui._build_tab_row(frame)

  -- 主体 (左: group列 + 右: 原型网格)
  local body = frame.add{
    type = "flow", name = PREFIX .. "body", direction = "horizontal",
  }
  body.style.horizontal_spacing = 0
  body.style.height = 500

  Gui._build_group_panel(body)
  body.add{ type = "line", direction = "vertical" }
  Gui._build_content_panel(body)

  -- 底栏
  Gui._build_bottom_bar(frame)

  player.opened = frame

  -- 渲染活跃 Tab 的内容
  Gui.refresh_groups(player)
end

-------------------------------------------------------------------------------
-- 大类刷新
-------------------------------------------------------------------------------

--- 切换到指定大类 Tab
function Gui.select_tab(player, tab_key)
  storage.fac_active_tab = tab_key
  storage.fac_active_group = nil
  Gui._highlight_tabs(player)
  Gui.refresh_groups(player)
end

--- 刷新左侧 group 列
function Gui.refresh_groups(player)
  local frame = Gui.get_frame(player)
  if not frame then return end

  local tab_key = storage.fac_active_tab or "items"
  local tab = Definitions.TAB_MAP[tab_key]
  if not tab then return end

  local scroll = Gui._find(frame, PREFIX .. "group_scroll")
  if not scroll then return end
  scroll.clear()

  if tab.grouped then
    local groups = Definitions.get_groups(tab)
    local first_group = nil
    for _, g in ipairs(groups) do
      if not first_group then first_group = g.name end
      local sprite = "item-group/" .. g.name
      local btn = scroll.add{
        type   = "sprite-button",
        sprite = sprite,
        style  = "slot_button",
        tags   = { fac = "select_group", group = g.name },
        tooltip = g.name,
      }
      btn.style.size = { 64, 64 }
    end
    -- 选择第一个 group 或保持之前的
    local active_g = storage.fac_active_group
    -- 检查 active_g 是否还在当前列表中
    local valid = false
    for _, g in ipairs(groups) do
      if g.name == active_g then valid = true; break end
    end
    if not valid then
      storage.fac_active_group = first_group
    end
  else
    -- 非分组大类：无 group 列
    storage.fac_active_group = nil
  end

  Gui._highlight_groups(player)
  Gui.refresh_content(player)
end

--- 选择 group（点击左侧图标）
function Gui.select_group(player, group_name)
  storage.fac_active_group = group_name
  Gui._highlight_groups(player)
  Gui.refresh_content(player)
end

-------------------------------------------------------------------------------
-- 右侧内容刷新
-------------------------------------------------------------------------------

--- 刷新右侧原型网格
function Gui.refresh_content(player)
  local frame = Gui.get_frame(player)
  if not frame then return end

  local tab_key = storage.fac_active_tab or "items"
  local tab = Definitions.TAB_MAP[tab_key]
  if not tab then return end

  local scroll = Gui._find(frame, PREFIX .. "content_scroll")
  if not scroll then return end
  scroll.clear()

  local exclusions = storage.fac_exclusions or {}
  local tab_excl = exclusions[tab_key] or {}

  if tab.grouped and storage.fac_active_group then
    -- 分组模式：按子分组显示
    local groups = Definitions.get_groups(tab)
    local target_group
    for _, g in ipairs(groups) do
      if g.name == storage.fac_active_group then target_group = g; break end
    end
    if not target_group then return end

    for _, sg in ipairs(target_group.subgroups) do
      local items, available = Definitions.list_prototypes(tab, sg.name)
      if #items > 0 then
        Gui._build_proto_grid(scroll, tab, items, tab_excl, sg.name)
      end
    end
  else
    -- 非分组模式：直接列出全部
    local items, available = Definitions.list_prototypes(tab, nil)
    if not available then
      scroll.add{ type = "label", caption = "该类别不可用（未安装相关 DLC）" }
        .style.font_color = { r = 0.5, g = 0.5, b = 0.5 }
      Gui._update_status_counts(player)
      return
    end
    if #items == 0 then
      scroll.add{ type = "label", caption = "该类别为空" }
      Gui._update_status_counts(player)
      return
    end
    if tab.sprite_prefix then
      Gui._build_proto_grid(scroll, tab, items, tab_excl, nil)
    else
      for _, item in ipairs(items) do
        local is_excl = tab_excl[item.name] or false
        scroll.add{
          type = "checkbox", caption = "  " .. item.name,
          state = not is_excl,
          tags = { fac = "toggle_item", tab = tab_key, item = item.name },
        }
      end
    end
  end

  Gui._update_status_counts(player)
end

--- 构建原型图标网格（一个 subgroup 或所有）
function Gui._build_proto_grid(parent, tab, items, tab_excl, subgroup_name)
  local grid = parent.add{
    type = "table", column_count = GRID_COLS,
  }
  grid.style.horizontal_spacing = 2
  grid.style.vertical_spacing   = 2

  for _, item in ipairs(items) do
    local is_excluded = tab_excl[item.name] or false
    local sprite = tab.sprite_prefix .. "/" .. item.name
    local btn = grid.add{
      type   = "sprite-button",
      sprite = sprite,
      style  = "slot_button",
      toggled = is_excluded,
      tags   = { fac = "toggle_item", tab = tab.key, item = item.name },
    }
    -- toggled=true 表示 "排除"（按钮看起来按下/凹陷）
    -- toggled=false 表示 "选中"（正常外观）
    if tab.elem_type then
      btn.elem_tooltip = { type = tab.elem_type, name = item.name }
    end
  end

  -- subgroup 之间的分割线
  if subgroup_name then
    parent.add{ type = "line" }.style.top_margin = 2
  end
end

-------------------------------------------------------------------------------
-- 物品排除操作
-------------------------------------------------------------------------------

--- 切换单项排除
function Gui.toggle_item(player, tab_key, item_name)
  storage.fac_exclusions = storage.fac_exclusions or {}
  storage.fac_exclusions[tab_key] = storage.fac_exclusions[tab_key] or {}
  local excl = storage.fac_exclusions[tab_key]

  if excl[item_name] then
    excl[item_name] = nil
  else
    excl[item_name] = true
  end
  Gui._cleanup_excl(tab_key)
end

--- 从 checkbox 同步排除
function Gui.sync_item_checkbox(player, tab_key, item_name, checked)
  storage.fac_exclusions = storage.fac_exclusions or {}
  storage.fac_exclusions[tab_key] = storage.fac_exclusions[tab_key] or {}
  if checked then
    storage.fac_exclusions[tab_key][item_name] = nil
  else
    storage.fac_exclusions[tab_key][item_name] = true
  end
  Gui._cleanup_excl(tab_key)
end

--- 当前 Tab 全选/全不选/反选
function Gui.batch_select(player, mode)
  local tab_key = storage.fac_active_tab
  if not tab_key then return end
  local tab = Definitions.TAB_MAP[tab_key]
  if not tab then return end

  storage.fac_exclusions = storage.fac_exclusions or {}

  if mode == "all" then
    storage.fac_exclusions[tab_key] = nil
  elseif mode == "none" then
    local items = Definitions.list_prototypes(tab, nil)
    local excl = {}
    for _, item in ipairs(items) do excl[item.name] = true end
    storage.fac_exclusions[tab_key] = excl
  elseif mode == "invert" then
    local items = Definitions.list_prototypes(tab, nil)
    local old = storage.fac_exclusions[tab_key] or {}
    local new_excl = {}
    for _, item in ipairs(items) do
      if not old[item.name] then new_excl[item.name] = true end
    end
    local any = false
    for _ in pairs(new_excl) do any = true; break end
    storage.fac_exclusions[tab_key] = any and new_excl or nil
  end

  Gui.refresh_content(player)
end

--- 清理空排除表
function Gui._cleanup_excl(tab_key)
  if not storage.fac_exclusions[tab_key] then return end
  local any = false
  for _ in pairs(storage.fac_exclusions[tab_key]) do any = true; break end
  if not any then storage.fac_exclusions[tab_key] = nil end
end

-------------------------------------------------------------------------------
-- 控件状态读写
-------------------------------------------------------------------------------

--- 读取所有 Tab 的导出勾选状态
function Gui.read_selection(player)
  local frame = Gui.get_frame(player)
  if not frame then return nil end
  -- 从 storage 读取（tab_checks 在 toggle 和展示时同步）
  local sel = {}
  for _, tab in ipairs(Definitions.TABS) do
    sel[tab.key] = storage.fac_tab_checks[tab.key] or false
  end
  local tcb = Gui._find(frame, PREFIX .. "check_translations")
  sel.translations = tcb and tcb.state or false
  return sel
end

--- 切换 Tab 导出勾选
function Gui.toggle_tab_check(player, tab_key)
  storage.fac_tab_checks = storage.fac_tab_checks or {}
  storage.fac_tab_checks[tab_key] = not storage.fac_tab_checks[tab_key]
end

--- 批量设置所有 Tab 导出勾选
function Gui.set_all_tab_checks(player, state)
  storage.fac_tab_checks = storage.fac_tab_checks or {}
  for _, tab in ipairs(Definitions.TABS) do
    storage.fac_tab_checks[tab.key] = state
  end
  Gui._highlight_tabs(player)
end

--- 更新状态标签
function Gui.set_status(player, text)
  local frame = Gui.get_frame(player)
  if not frame then return end
  local lbl = Gui._find(frame, PREFIX .. "status_label")
  if lbl then lbl.caption = text end
end

-------------------------------------------------------------------------------
-- 内部构建方法
-------------------------------------------------------------------------------

function Gui._build_titlebar(frame)
  local bar = frame.add{ type = "flow", direction = "horizontal" }
  bar.add{ type = "label", caption = "Faculator 数据导出", style = "frame_title" }
  local drag = bar.add{ type = "empty-widget", style = "draggable_space_header" }
  drag.style.horizontally_stretchable = true
  drag.style.height = 24
  drag.drag_target = frame
  bar.add{
    type = "sprite-button", name = PREFIX .. "close_btn",
    sprite = "utility/close", style = "close_button", tooltip = "关闭",
  }
end

function Gui._build_tab_row(frame)
  local row = frame.add{
    type = "flow", name = PREFIX .. "tab_row", direction = "horizontal",
  }
  row.style.horizontal_spacing = 4
  row.style.top_margin = 4

  for _, tab in ipairs(Definitions.TABS) do
    local count, available = Definitions.count_prototypes(tab)
    local caption = tab.label .. " (" .. count .. ")"
    if not available then caption = tab.label .. " (-)" end

    local btn = row.add{
      type    = "button",
      caption = caption,
      tags    = { fac = "select_tab", tab = tab.key },
      enabled = available ~= false,
      tooltip = available ~= false
        and string.format("[%s] 导出键: %s", storage.fac_tab_checks[tab.key] and "✓" or "✗", tab.key)
        or  "未安装相关 DLC",
    }
    btn.style.minimal_width = 0
    btn.style.horizontal_align = "center"
    btn.style.padding = { 2, 6, 2, 6 }
  end

  Gui._highlight_tabs_in_row(row)
end

function Gui._build_group_panel(parent)
  local outer = parent.add{
    type = "frame", style = "inside_deep_frame", direction = "vertical",
  }
  outer.style.width = 80
  outer.style.vertically_stretchable = true

  local scroll = outer.add{
    type = "scroll-pane", name = PREFIX .. "group_scroll",
    style = "naked_scroll_pane", direction = "vertical",
  }
  scroll.style.vertically_stretchable = true
  scroll.style.padding = 4
end

function Gui._build_content_panel(parent)
  local outer = parent.add{
    type = "frame", name = PREFIX .. "content_frame",
    style = "inside_shallow_frame", direction = "vertical",
  }
  outer.style.horizontally_stretchable = true
  outer.style.vertically_stretchable = true
  outer.style.minimal_width = 440

  -- 操作栏
  local bar = outer.add{ type = "flow", direction = "horizontal" }
  bar.style.vertical_align = "center"
  bar.style.horizontal_spacing = 8
  bar.style.padding = { 6, 8, 4, 8 }

  bar.add{
    type = "checkbox", name = PREFIX .. "tab_export_check",
    caption = "  导出此类别", state = true,
    tags = { fac = "toggle_tab_export" },
    tooltip = "取消勾选后该大类将不会被导出",
  }

  bar.add{
    type = "label", name = PREFIX .. "content_count", caption = "",
  }

  local filler = bar.add{ type = "empty-widget" }
  filler.style.horizontally_stretchable = true

  bar.add{ type = "button", caption = "反选",   tags = { fac = "batch_invert" } }
  bar.add{ type = "button", caption = "全选",   tags = { fac = "batch_all" } }
  bar.add{ type = "button", caption = "全不选", tags = { fac = "batch_none" } }

  outer.add{ type = "line" }

  -- 滚动内容区
  local scroll = outer.add{
    type = "scroll-pane", name = PREFIX .. "content_scroll",
    style = "naked_scroll_pane",
  }
  scroll.style.horizontally_stretchable = true
  scroll.style.vertically_stretchable = true
  scroll.style.padding = 4
end

function Gui._build_bottom_bar(frame)
  local bar = frame.add{ type = "flow", direction = "vertical" }
  bar.style.top_margin = 4

  local row = bar.add{ type = "flow", direction = "horizontal" }
  row.style.vertical_align = "center"
  row.style.horizontal_spacing = 8

  row.add{
    type = "checkbox", name = PREFIX .. "check_translations",
    caption = "  包含翻译数据", state = true,
    tooltip = "同时导出所有原型的本地化翻译（异步，需要数秒）",
  }

  local f = row.add{ type = "empty-widget" }
  f.style.horizontally_stretchable = true

  row.add{
    type = "button", name = PREFIX .. "select_all_tabs_btn",
    caption = "全选类别", tooltip = "勾选所有大类的导出",
  }
  row.add{
    type = "button", name = PREFIX .. "select_none_tabs_btn",
    caption = "全不选类别", tooltip = "取消所有大类的导出",
  }
  row.add{
    type = "button", name = PREFIX .. "export_btn",
    caption = "  导出选中数据  ", style = "confirm_button",
    tooltip = "导出勾选的数据类别到 JSON 文件",
  }
  row.add{
    type = "button", name = PREFIX .. "translate_only_btn",
    caption = "仅导出翻译",
    tooltip = "仅导出当前语言的翻译数据（不导出原型数据）\n文件名自动带语言后缀，如 translations-en.json",
  }

  local sf = bar.add{ type = "flow", direction = "horizontal" }
  sf.style.top_margin = 4
  sf.add{ type = "label", caption = "状态: " }
  sf.add{ type = "label", name = PREFIX .. "status_label", caption = "就绪" }
end

-------------------------------------------------------------------------------
-- 高亮与状态更新
-------------------------------------------------------------------------------

function Gui._highlight_tabs(player)
  local frame = Gui.get_frame(player)
  if not frame then return end
  local row = Gui._find(frame, PREFIX .. "tab_row")
  if row then Gui._highlight_tabs_in_row(row) end
end

function Gui._highlight_tabs_in_row(row)
  local active = storage.fac_active_tab or "items"
  for _, child in pairs(row.children) do
    local tags = child.tags
    if tags and tags.fac == "select_tab" then
      local is_active = (tags.tab == active)
      local is_checked = storage.fac_tab_checks[tags.tab]
      -- 活跃 Tab 高亮
      child.style = "button"
      child.style.minimal_width = 0
      child.style.padding = { 2, 6, 2, 6 }
      if is_active then
        child.style.font_color = { r = 1, g = 0.9, b = 0.3 }  -- 金色高亮
      elseif not is_checked then
        child.style.font_color = { r = 0.5, g = 0.5, b = 0.5 }  -- 灰色未勾选
      end
    end
  end

  -- 同步导出勾选框
  local frame = row.parent
  local cb = Gui._find(frame, PREFIX .. "tab_export_check")
  if cb then
    cb.state = storage.fac_tab_checks[active] or false
  end
end

function Gui._highlight_groups(player)
  local frame = Gui.get_frame(player)
  if not frame then return end

  local scroll = Gui._find(frame, PREFIX .. "group_scroll")
  if not scroll then return end

  local active_g = storage.fac_active_group
  for _, child in pairs(scroll.children) do
    if child.tags and child.tags.fac == "select_group" then
      child.toggled = (child.tags.group == active_g)
    end
  end
end

function Gui._update_status_counts(player)
  local frame = Gui.get_frame(player)
  if not frame then return end

  local tab_key = storage.fac_active_tab or "items"
  local tab = Definitions.TAB_MAP[tab_key]
  if not tab then return end

  local total, _ = Definitions.count_prototypes(tab)
  local excl = storage.fac_exclusions and storage.fac_exclusions[tab_key] or {}
  local excl_n = 0
  for _ in pairs(excl) do excl_n = excl_n + 1 end

  local lbl = Gui._find(frame, PREFIX .. "content_count")
  if lbl then
    lbl.caption = string.format("%d / %d 已选", total - excl_n, total)
  end
end

-------------------------------------------------------------------------------
-- 工具
-------------------------------------------------------------------------------

function Gui._find(parent, name)
  for _, child in pairs(parent.children) do
    if child.name == name then return child end
    local found = Gui._find(child, name)
    if found then return found end
  end
  return nil
end

return Gui
