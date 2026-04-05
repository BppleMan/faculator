--- 品质导出
--- 导出所有 LuaQualityPrototype（Space Age）。
--- 品质系统影响模块效果、信标消耗等。

local log  = require("lib.logger").create("品质导出")
local Util = require("lib.util")
local S    = require("lib.serializers")

local Quality = {}

--- 导出所有品质原型
--- @see https://lua-api.factorio.com/latest/classes/LuaQualityPrototype.html
--- @return table[] 按等级排序的品质数组
function Quality.export()
  local safe = Util.safe_get
  local result = {}

  for name, proto in pairs(prototypes.quality) do
    result[#result + 1] = {
      name     = name,
      group    = proto.group.name,
      subgroup = proto.subgroup.name,
      order    = proto.order,
      hidden   = proto.hidden or false,
      level    = proto.level,

      --- 品质颜色
      color = safe(function() return S.color(proto.color) end),

      --- 下一品质等级
      --- @see https://lua-api.factorio.com/latest/classes/LuaQualityPrototype.html#next
      next             = safe(function()
        local n = proto.next
        return n and n.name or nil
      end),
      next_probability = safe(function() return proto.next_probability end),

      --- 各种乘数
      beacon_power_usage_multiplier            = safe(function() return proto.beacon_power_usage_multiplier end),
      mining_drill_resource_drain_multiplier    = safe(function() return proto.mining_drill_resource_drain_multiplier end),
      science_pack_drain_multiplier             = safe(function() return proto.science_pack_drain_multiplier end),
    }
  end
  table.sort(result, function(a, b) return (a.level or 0) < (b.level or 0) end)
  log.info("导出品质: " .. #result .. " 个")
  return result
end

return Quality
