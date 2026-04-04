--- 实体导出
--- 导出与生产计算相关的实体原型（组装机、熔炉、采矿机、实验室等）。
--- 过滤条件由 Constants.EXPORTABLE_ENTITY_TYPES 定义。

local log       = require("lib.logger").create("实体导出")
local Util      = require("lib.util")
local S         = require("lib.serializers")
local Constants = require("lib.constants")

local Entity = {}

--- 导出所有生产相关实体
--- @see https://lua-api.factorio.com/latest/classes/LuaEntityPrototype.html
--- @return table[] 按名称排序的实体数组
function Entity.export()
  local safe  = Util.safe_get
  local keys  = Util.keys_to_list
  local types = Constants.EXPORTABLE_ENTITY_TYPES
  local result = {}

  for name, proto in pairs(prototypes.entity) do
    if types[proto.type] then
      local entity = {
        name     = name,
        type     = proto.type,
        group    = proto.group.name,
        subgroup = proto.subgroup.name,
        order    = proto.order,
        hidden   = proto.hidden or false,

        --- 制造属性
        --- @see https://lua-api.factorio.com/latest/classes/LuaEntityPrototype.html#crafting_categories
        crafting_categories = safe(function() return keys(proto.crafting_categories) end),
        crafting_speed      = safe(function() return proto.get_crafting_speed() end) or safe(function() return proto.crafting_speed end),

        --- 模块插槽
        --- @see https://lua-api.factorio.com/latest/classes/LuaEntityPrototype.html#module_inventory_size
        module_inventory_size     = safe(function() return proto.module_inventory_size end),
        allowed_effects           = safe(function() return keys(proto.allowed_effects) end),
        allowed_module_categories = safe(function() return keys(proto.allowed_module_categories) end),
        effect_receiver           = safe(function() return S.effect_receiver(proto.effect_receiver) end),

        --- 能耗
        energy_usage     = safe(function() return proto.energy_usage end),
        max_energy_usage = safe(function() return proto.get_max_energy_usage() end) or safe(function() return proto.max_energy_usage end),
        max_energy_production = safe(function() return proto.get_max_energy_production() end),
        max_power_output      = safe(function() return proto.get_max_power_output() end) or safe(function() return proto.max_power_output end),
        effectivity           = safe(function() return proto.effectivity end),
        energy_sources        = safe(function() return S.entity_energy_sources(proto) end),
        fluid_usage_per_tick  = safe(function() return proto.get_fluid_usage_per_tick() end) or safe(function() return proto.fluid_usage_per_tick end),
        maximum_temperature   = safe(function() return proto.maximum_temperature end),
        burns_fluid           = safe(function() return proto.burns_fluid end),
        scale_fluid_usage     = safe(function() return proto.scale_fluid_usage end),
        destroy_non_fuel_fluid = safe(function() return proto.destroy_non_fuel_fluid end),
        target_temperature    = safe(function() return proto.target_temperature end),
        boiler_mode           = safe(function() return proto.boiler_mode end),
        neighbour_bonus       = safe(function() return proto.neighbour_bonus end),
        solar_panel_performance_at_day   = safe(function() return proto.solar_panel_performance_at_day end),
        solar_panel_performance_at_night = safe(function() return proto.solar_panel_performance_at_night end),

        --- 采矿机属性
        --- @see https://lua-api.factorio.com/latest/classes/LuaEntityPrototype.html#mining_speed
        mining_speed        = safe(function() return proto.mining_speed end),
        mining_drill_radius = safe(function() return proto.mining_drill_radius end),
        resource_categories = safe(function() return keys(proto.resource_categories) end),

        --- 实验室属性
        lab_inputs                     = safe(function() return proto.lab_inputs end),
        researching_speed             = safe(function() return proto.get_researching_speed() end),
        science_pack_drain_rate_percent = safe(function() return proto.science_pack_drain_rate_percent end),

        --- 插件效果分享塔属性
        --- @see https://lua-api.factorio.com/latest/classes/LuaEntityPrototype.html#distribution_effectivity
        distribution_effectivity = safe(function() return proto.distribution_effectivity end),
        distribution_effectivity_bonus_per_quality_level = safe(function()
          return proto.distribution_effectivity_bonus_per_quality_level
        end),
        beacon_profile       = safe(function() return proto.profile end),
        beacon_counter       = safe(function() return proto.beacon_counter end),
        supply_area_distance = safe(function() return proto.get_supply_area_distance() end) or safe(function()
          return proto.supply_area_distance
        end),

        --- 流体接口
        --- @see https://lua-api.factorio.com/latest/classes/LuaFluidBoxPrototype.html
        fluidbox_prototypes = safe(function()
          return S.fluidbox_prototypes(proto.fluidbox_prototypes)
        end),

        --- 升级路径
        next_upgrade = safe(function()
          local nu = proto.next_upgrade
          return nu and nu.name or nil
        end),

        --- 品质是否影响模块槽位
        quality_affects_module_slots = safe(function() return proto.quality_affects_module_slots end),

        --- 表面条件（Space Age）
        surface_conditions = safe(function()
          return S.surface_conditions(proto.surface_conditions)
        end),

        --- 放置所需物品
        --- @see https://lua-api.factorio.com/latest/classes/LuaEntityPrototype.html#items_to_place_this
        items_to_place_this = safe(function()
          return S.items_to_place(proto.items_to_place_this)
        end),
      }
      result[#result + 1] = entity
    end
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出实体: " .. #result .. " 个（共筛选 " .. Util.count_table(Constants.EXPORTABLE_ENTITY_TYPES) .. " 种类型）")
  return result
end

return Entity
