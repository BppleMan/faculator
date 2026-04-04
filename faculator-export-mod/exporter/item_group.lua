--- 物品分组导出
--- 导出物品分组（ItemGroup）及其子分组（ItemSubgroup）。
--- 分组决定了物品在游戏内制造菜单中的 Tab 归类。

local log = require("lib.logger").create("物品分组导出")

local ItemGroup = {}

--- 导出所有物品分组及其子分组
--- @see https://lua-api.factorio.com/latest/classes/LuaGroup.html
--- prototypes.item_group 返回所有顶层分组，每个分组包含 subgroups 数组。
--- @return table[] 按 order 排序的分组数组
function ItemGroup.export()
  local result = {}
  for name, group in pairs(prototypes.item_group) do
    -- 收集子分组
    local subgroups = {}
    if group.subgroups then
      for _, sg in pairs(group.subgroups) do
        subgroups[#subgroups + 1] = {
          name  = sg.name,
          order = sg.order,
        }
      end
      table.sort(subgroups, function(a, b) return a.order < b.order end)
    end

    result[#result + 1] = {
      name      = name,
      type      = group.type,
      order     = group.order,
      subgroups = subgroups,
    }
  end
  table.sort(result, function(a, b) return a.order < b.order end)
  log.info("导出物品分组: " .. #result .. " 个分组")
  return result
end

return ItemGroup
