--- 导出协调器
--- 统一调度所有子导出模块，组装最终的游戏数据表。
--- 这是 exporter/ 目录的唯一对外入口。

local log        = require("lib.logger").create("导出协调器")
local Util       = require("lib.util")
local Constants  = require("lib.constants")
local Writer     = require("lib.writer")

-- 子导出模块
local Categories = require("exporter.categories")
local ItemGroup  = require("exporter.item_group")
local Item       = require("exporter.item")
local Fluid      = require("exporter.fluid")
local Recipe     = require("exporter.recipe")
local Entity     = require("exporter.entity")
local Technology = require("exporter.technology")
local Quality    = require("exporter.quality")
local Space      = require("exporter.space")
local Equipment  = require("exporter.equipment")

local Coordinator = {}

--- 类别键 → 导出函数 的映射表
--- 与 ui/definitions.lua 中的 CATEGORIES.key 一一对应。
local EXPORTERS = {
  recipe_categories   = function() return Categories.export_recipe_categories() end,
  fuel_categories     = function() return Categories.export_fuel_categories() end,
  resource_categories = function() return Categories.export_resource_categories() end,
  module_categories   = function() return Categories.export_module_categories() end,
  item_groups         = function() return ItemGroup.export() end,
  items               = function() return Item.export() end,
  fluids              = function() return Fluid.export() end,
  recipes             = function() return Recipe.export() end,
  entities            = function() return Entity.export() end,
  technologies        = function() return Technology.export() end,
  qualities           = function() return Quality.export() end,
  space_locations     = function() return Space.export_locations() end,
  space_connections   = function() return Space.export_connections() end,
  equipment           = function() return Equipment.export() end,
  equipment_grids     = function() return Equipment.export_grids() end,
}

--- 按名称过滤导出数据，移除被排除的项目
--- @param items table[] 导出数据数组（每项需含 name 字段）
--- @param excluded_names table 以名称为键的排除集合
--- @return table[] 过滤后的数组
local function filter_by_name(items, excluded_names)
  local result = {}
  for _, item in ipairs(items) do
    if not excluded_names[item.name] then
      result[#result + 1] = item
    end
  end
  return result
end

--- 构建导出数据表的游戏上下文字段（始终包含）
--- @return table game 表
local function build_game_info()
  return {
    exporter_version = Constants.MOD_VERSION,
    factorio_version   = Util.safe_get(function()
      return script.active_mods["base"]
    end),
    active_mods = Util.safe_get(function()
      local mods = {}
      for k, v in pairs(script.active_mods) do
        mods[k] = v
      end
      return mods
    end),
  }
end

--- 收集所有游戏原型数据（全量导出）
--- 调用每个子导出模块并组装成最终数据表供写入。
--- @return table 完整的游戏数据表
function Coordinator.collect_all_data()
  log.info("开始收集全部游戏原型数据...")

  local data = { game = build_game_info() }
  local count = 0
  for key, fn in pairs(EXPORTERS) do
    data[key] = fn()
    count = count + 1
  end

  log.info(string.format("原型数据收集完成，共 %d 个类别", count))
  return data
end

--- 按选择收集游戏原型数据（选择性导出，支持单项排除）
--- 仅导出 selection 中值为 true 的类别，并过滤掉 exclusions 中列出的项目。
--- @param selection table 以 category.key 为键的布尔值表
--- @param exclusions table|nil 以 category.key 为键的排除集合（值为 { [name] = true }）
--- @return table 包含选中类别数据的表
function Coordinator.collect_selected_data(selection, exclusions)
  log.info("开始按选择收集游戏原型数据...")
  exclusions = exclusions or {}

  local data = { game = build_game_info() }
  local count = 0
  for key, fn in pairs(EXPORTERS) do
    if selection[key] then
      local items = fn()
      if exclusions[key] and next(exclusions[key]) then
        items = filter_by_name(items, exclusions[key])
      end
      data[key] = items
      count = count + 1
    end
  end

  log.info(string.format("按选择收集完成，共导出 %d 个类别", count))
  return data
end

--- 执行完整的数据导出流程（全量收集 + 写入文件）
--- @return table 导出的数据表（方便后续翻译阶段使用）
function Coordinator.export()
  local data = Coordinator.collect_all_data()
  Writer.write_data(data)
  log.info("数据导出完成，文件已写入")
  return data
end

--- 执行选择性数据导出流程（按选择收集 + 写入文件）
--- @param selection table 以 category.key 为键的布尔值表
--- @param exclusions table|nil 以 category.key 为键的排除集合
--- @return table 导出的数据表
function Coordinator.export_selected(selection, exclusions)
  local data = Coordinator.collect_selected_data(selection, exclusions)
  Writer.write_data(data)
  log.info("选择性数据导出完成，文件已写入")
  return data
end

return Coordinator
