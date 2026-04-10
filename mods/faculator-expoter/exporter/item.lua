--- 物品导出
--- 导出所有 LuaItemPrototype，包含燃料属性、模块属性、腐坏属性等。

local log  = require("lib.logger").create("物品导出")
local Util = require("lib.util")
local S    = require("lib.serializers")

local Item = {}

--- 导出所有物品原型
--- @see https://lua-api.factorio.com/latest/classes/LuaItemPrototype.html
--- @return table[] 按名称排序的物品数组
function Item.export()
  local safe = Util.safe_get
  local result = {}
  for name, proto in pairs(prototypes.item) do
    local item = {
      name      = name,
      type      = proto.type,
      group     = proto.group.name,
      subgroup  = proto.subgroup.name,
      order     = proto.order,
      hidden    = proto.hidden or false,
      stack_size = proto.stack_size,
      weight    = safe(function() return proto.weight end),

      --- 燃料属性
      --- @see https://lua-api.factorio.com/latest/classes/LuaItemPrototype.html#fuel_value
      fuel_value                     = safe(function() return proto.fuel_value end),
      fuel_category                  = safe(function() return proto.fuel_category end),
      fuel_acceleration_multiplier   = safe(function() return proto.fuel_acceleration_multiplier end),
      fuel_top_speed_multiplier      = safe(function() return proto.fuel_top_speed_multiplier end),
      fuel_emissions_multiplier      = safe(function() return proto.fuel_emissions_multiplier end),
      burnt_result = safe(function()
        local r = proto.burnt_result
        return r and r.name or nil
      end),

      --- 放置结果
      place_result = safe(function()
        local r = proto.place_result
        return r and r.name or nil
      end),
      plant_result = safe(function()
        local r = proto.plant_result
        return r and r.name or nil
      end),

      --- 火箭发射产物
      --- @see https://lua-api.factorio.com/latest/classes/LuaItemPrototype.html#rocket_launch_products
      rocket_launch_products = safe(function()
        local prods = proto.rocket_launch_products
        if not prods or #prods == 0 then return nil end
        local res = {}
        for _, p in ipairs(prods) do
          res[#res + 1] = S.product(p)
        end
        return res
      end),

      --- 模块属性
      --- @see https://lua-api.factorio.com/latest/classes/LuaItemPrototype.html#module_effects
      module_effects = safe(function()
        return S.module_effects(proto.module_effects)
      end),
      category = safe(function() return proto.category end),
      tier     = safe(function() return proto.tier end),

      --- 腐坏属性（Space Age）
      --- @see https://lua-api.factorio.com/latest/classes/LuaItemPrototype.html#spoil_result
      spoil_result = safe(function()
        local r = proto.spoil_result
        return r and r.name or nil
      end),

      --- 装备放置结果
      place_as_equipment_result = safe(function()
        local r = proto.place_as_equipment_result
        return r and r.name or nil
      end),

      --- 物品标志位
      --- @see https://lua-api.factorio.com/latest/concepts/ItemPrototypeFlags.html
      flags = safe(function()
        local f = proto.flags
        if not f then return nil end
        local res = {}
        for k, v in pairs(f) do
          if v then res[#res + 1] = k end
        end
        table.sort(res)
        return res
      end),

      --- 默认进口星球（Space Age）
      default_import_location = safe(function()
        local loc = proto.default_import_location
        return loc and loc.name or nil
      end),
      send_to_orbit_mode = safe(function() return proto.send_to_orbit_mode end),
    }
    result[#result + 1] = item
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出物品: " .. #result .. " 个")
  return result
end

return Item
