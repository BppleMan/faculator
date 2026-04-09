--- 流体导出
--- 导出所有 LuaFluidPrototype，包含温度范围、颜色等属性。

local log  = require("lib.logger").create("流体导出")
local Util = require("lib.util")
local S    = require("lib.serializers")

local Fluid = {}

--- 导出所有流体原型
--- @see https://lua-api.factorio.com/latest/classes/LuaFluidPrototype.html
--- @return table[] 按名称排序的流体数组
function Fluid.export()
  local safe = Util.safe_get
  local result = {}
  for name, proto in pairs(prototypes.fluid) do
    result[#result + 1] = {
      name      = name,
      group     = proto.group.name,
      subgroup  = proto.subgroup.name,
      order     = proto.order,
      hidden    = proto.hidden or false,

      --- 温度属性
      --- @see https://lua-api.factorio.com/latest/classes/LuaFluidPrototype.html#default_temperature
      default_temperature = proto.default_temperature,
      max_temperature     = proto.max_temperature,
      heat_capacity       = proto.heat_capacity,

      --- 燃料值（可燃流体）
      fuel_value           = safe(function() return proto.fuel_value end),
      emissions_multiplier = safe(function() return proto.emissions_multiplier end),
      gas_temperature      = safe(function() return proto.gas_temperature end),

      --- 颜色
      --- @see https://lua-api.factorio.com/latest/concepts/Color.html
      base_color = safe(function() return S.color(proto.base_color) end),
      flow_color = safe(function() return S.color(proto.flow_color) end),
    }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出流体: " .. #result .. " 个")
  return result
end

return Fluid
