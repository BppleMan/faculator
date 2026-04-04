--- 装备导出
--- 导出装备原型（Equipment）和装备网格原型（EquipmentGrid）。

local log  = require("lib.logger").create("装备导出")
local Util = require("lib.util")

local Equipment = {}

--- 导出所有装备原型
--- @see https://lua-api.factorio.com/latest/classes/LuaEquipmentPrototype.html
--- @return table[] 按名称排序的装备数组
function Equipment.export()
  local safe = Util.safe_get
  local result = {}

  for name, proto in pairs(prototypes.equipment) do
    result[#result + 1] = {
      name     = name,
      type     = proto.type,
      group    = proto.group.name,
      subgroup = proto.subgroup.name,
      order    = proto.order,
      hidden   = proto.hidden or false,

      --- 能量属性
      energy_production = safe(function() return proto.energy_production end),
      energy_per_shield = safe(function() return proto.energy_per_shield end),
      energy_source     = safe(function()
        local es = proto.energy_source
        return es and { type = es.type } or nil
      end),

      --- 装备形状（占据网格的尺寸）
      --- @see https://lua-api.factorio.com/latest/classes/LuaEquipmentPrototype.html#shape
      shape = safe(function()
        local s = proto.shape
        return s and { width = s.width, height = s.height, type = s.type } or nil
      end),

      --- 装备类别
      equipment_categories = safe(function()
        local cats = proto.equipment_categories
        if not cats then return nil end
        local res = {}
        for _, c in ipairs(cats) do
          res[#res + 1] = c.name or c
        end
        return res
      end),

      --- 拆卸时返回的物品
      take_result = safe(function()
        local r = proto.take_result
        return r and r.name or nil
      end),
    }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出装备: " .. #result .. " 个")
  return result
end

--- 导出所有装备网格原型
--- @see https://lua-api.factorio.com/latest/classes/LuaEquipmentGridPrototype.html
--- @return table[] 按名称排序的装备网格数组
function Equipment.export_grids()
  local safe = Util.safe_get
  local result = {}

  for name, proto in pairs(prototypes.equipment_grid) do
    result[#result + 1] = {
      name     = name,
      group    = proto.group.name,
      subgroup = proto.subgroup.name,
      order    = proto.order,
      hidden   = proto.hidden or false,

      --- 网格尺寸和锁定状态
      width  = proto.width,
      height = proto.height,
      locked = proto.locked,

      --- 可接受的装备类别
      equipment_categories = safe(function()
        local cats = proto.equipment_categories
        if not cats then return nil end
        local res = {}
        for _, c in ipairs(cats) do
          res[#res + 1] = c.name or c
        end
        return res
      end),
    }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出装备网格: " .. #result .. " 个")
  return result
end

return Equipment
