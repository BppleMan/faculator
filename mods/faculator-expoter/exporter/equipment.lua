--- 装备导出
--- 导出装备原型（Equipment）和装备网格原型（EquipmentGrid）。

local log  = require("lib.logger").create("装备导出")
local Util = require("lib.util")
local S    = require("lib.serializers")

local Equipment = {}

--- 序列化装备形状。
--- runtime 侧可直接读到 width / height / points；`type` 可由 points 是否存在稳定推导。
--- @param shape table|nil
--- @return table|nil
local function serialize_shape(shape)
  if not shape then return nil end

  local result = {
    width  = shape.width,
    height = shape.height,
  }

  local points = Util.safe_get(function() return shape.points end)
  if points then
    local serialized_points = {}
    for _, point in ipairs(points) do
      local x = point[1] or point.x
      local y = point[2] or point.y
      if x ~= nil and y ~= nil then
        serialized_points[#serialized_points + 1] = { x, y }
      end
    end

    if #serialized_points > 0 then
      result.points = serialized_points
      result.type = "manual"
    end
  end

  if not result.type then
    result.type = "full"
  end

  return result
end

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
        return S.electric_energy_source(proto.energy_source)
      end) or safe(function()
        return S.electric_energy_source(proto.electric_energy_source_prototype)
      end),

      --- 装备形状（占据网格的尺寸）
      --- @see https://lua-api.factorio.com/latest/classes/LuaEquipmentPrototype.html#shape
      shape = safe(function()
        return serialize_shape(proto.shape)
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
