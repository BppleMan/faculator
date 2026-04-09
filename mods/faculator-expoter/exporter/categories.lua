--- 各类别原型导出
--- 导出简单的类别字典（recipe_category、fuel_category 等）。
--- 这些类别在 Factorio 中以仅含 name 的字典形式存在，结构相同，集中处理。

local log = require("lib.logger").create("类别导出")

local Categories = {}

--- 导出指定类别字典中的所有条目
--- @param category_dict table prototypes.xxx_category 字典
--- @param category_name string 类别名称（用于日志）
--- @return table[] 排序后的 {name=...} 数组
local function export_simple_category(category_dict, category_name)
  local result = {}
  for name, _ in pairs(category_dict) do
    result[#result + 1] = { name = name }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.debug("导出 " .. category_name .. ": " .. #result .. " 条")
  return result
end

--- 导出配方类别
--- @see https://lua-api.factorio.com/latest/prototypes/RecipeCategory.html
--- @return table[]
function Categories.export_recipe_categories()
  return export_simple_category(prototypes.recipe_category, "配方类别")
end

--- 导出燃料类别
--- @see https://lua-api.factorio.com/latest/prototypes/FuelCategory.html
--- @return table[]
function Categories.export_fuel_categories()
  return export_simple_category(prototypes.fuel_category, "燃料类别")
end

--- 导出资源类别
--- @see https://lua-api.factorio.com/latest/prototypes/ResourceCategory.html
--- @return table[]
function Categories.export_resource_categories()
  return export_simple_category(prototypes.resource_category, "资源类别")
end

--- 导出插件模块类别
--- @see https://lua-api.factorio.com/latest/prototypes/ModuleCategory.html
--- @return table[]
function Categories.export_module_categories()
  return export_simple_category(prototypes.module_category, "插件模块类别")
end

return Categories
