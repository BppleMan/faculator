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

--- 收集所有游戏原型数据
--- 调用每个子导出模块并组装成最终数据表供写入。
--- @return table 完整的游戏数据表
function Coordinator.collect_all_data()
  log.info("开始收集游戏原型数据...")

  local data = {
    --- 元数据
    _meta = {
      export_mod_version = Constants.MOD_VERSION,
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
    },

    --- 各类别字典
    recipe_categories   = Categories.export_recipe_categories(),
    fuel_categories     = Categories.export_fuel_categories(),
    resource_categories = Categories.export_resource_categories(),
    module_categories   = Categories.export_module_categories(),

    --- 分组
    item_groups = ItemGroup.export(),

    --- 核心原型
    items    = Item.export(),
    fluids   = Fluid.export(),
    recipes  = Recipe.export(),
    entities = Entity.export(),

    --- 科技树
    technologies = Technology.export(),

    --- 品质（Space Age）
    qualities = Quality.export(),

    --- 太空（Space Age）
    space_locations   = Space.export_locations(),
    space_connections = Space.export_connections(),

    --- 装备
    equipment       = Equipment.export(),
    equipment_grids = Equipment.export_grids(),
  }

  log.info("原型数据收集完成")
  return data
end

--- 执行完整的数据导出流程（收集 + 写入文件）
--- @return table 导出的数据表（方便后续翻译阶段使用）
function Coordinator.export()
  local data = Coordinator.collect_all_data()
  Writer.write_data(data)
  log.info("数据导出完成，文件已写入")
  return data
end

return Coordinator
