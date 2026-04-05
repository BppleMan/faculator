--- 数据序列化器
--- 将 Factorio 原型中的复杂子结构转换为可 JSON 序列化的 Lua 表。
--- 这些序列化器在多个导出模块中被复用。

local Util = require("lib.util")

local Serializers = {}

--- 复制字符串 -> 数字字典，适配 JSON 序列化。
--- @param dict table|nil
--- @return table|nil
local function copy_number_dict(dict)
  if not dict or not next(dict) then return nil end
  local result = {}
  for key, value in pairs(dict) do
    result[key] = value
  end
  return result
end

--- 序列化配方原料（Ingredient）
--- @see https://lua-api.factorio.com/latest/concepts/Ingredient.html
--- @param ing Ingredient 原料数据
--- @return table 可序列化的原料表
function Serializers.ingredient(ing)
  return {
    type   = ing.type,   -- "item" 或 "fluid"
    name   = ing.name,
    amount = ing.amount,
    -- 流体专用字段
    minimum_temperature = ing.minimum_temperature,
    maximum_temperature = ing.maximum_temperature,
    -- 催化剂
    catalyst_amount = ing.catalyst_amount,
  }
end

--- 序列化配方产物（Product）
--- @see https://lua-api.factorio.com/latest/concepts/Product.html
--- @param prod Product 产物数据
--- @return table 可序列化的产物表
function Serializers.product(prod)
  return {
    type        = prod.type,   -- "item" 或 "fluid"
    name        = prod.name,
    amount      = prod.amount,
    amount_min  = prod.amount_min,
    amount_max  = prod.amount_max,
    probability = prod.probability,
    -- 流体专用
    temperature = prod.temperature,
    -- 催化剂
    catalyst_amount = prod.catalyst_amount,
    -- Space Age：新鲜度相关
    percent_spoiled          = prod.percent_spoiled,
    ignored_by_stats         = prod.ignored_by_stats,
    ignored_by_productivity  = prod.ignored_by_productivity,
  }
end

--- 序列化单条效果修改器（ModuleEffect 的子字段）
--- @see https://lua-api.factorio.com/latest/concepts/ModuleEffectValue.html
--- @param effect ModuleEffectValue|nil
--- @return table|nil
function Serializers.modifier(effect)
  if not effect then return nil end
  return { bonus = effect.bonus }
end

--- 序列化模块效果（ModuleEffects）
--- @see https://lua-api.factorio.com/latest/concepts/ModuleEffects.html
--- @param effects ModuleEffects|nil
--- @return table|nil
function Serializers.module_effects(effects)
  if not effects then return nil end
  return {
    consumption  = Serializers.modifier(effects.consumption),
    speed        = Serializers.modifier(effects.speed),
    productivity = Serializers.modifier(effects.productivity),
    pollution    = Serializers.modifier(effects.pollution),
    quality      = Serializers.modifier(effects.quality),
  }
end

--- 序列化效果接收器（模块/信标/地表效果的接收规则）。
--- @see https://lua-api.factorio.com/latest/concepts/EffectReceiver.html
--- @param receiver EffectReceiver|nil
--- @return table|nil
function Serializers.effect_receiver(receiver)
  if not receiver then return nil end
  return {
    base_effect         = Serializers.module_effects(receiver.base_effect),
    uses_module_effects = receiver.uses_module_effects,
    uses_beacon_effects = receiver.uses_beacon_effects,
    uses_surface_effects = receiver.uses_surface_effects,
  }
end

--- 序列化表面条件数组（SurfaceCondition[]）
--- Space Age 中的配方和实体可能有放置/制造的星球条件限制。
--- @see https://lua-api.factorio.com/latest/concepts/SurfaceCondition.html
--- @param conditions SurfaceCondition[]|nil
--- @return table[]|nil
function Serializers.surface_conditions(conditions)
  if not conditions or #conditions == 0 then return nil end
  local result = {}
  for _, c in ipairs(conditions) do
    result[#result + 1] = {
      property = c.property,
      min      = c.min,
      max      = c.max,
    }
  end
  return result
end

--- 序列化颜色值（Color）
--- @see https://lua-api.factorio.com/latest/concepts/Color.html
--- @param color Color|nil
--- @return table|nil
function Serializers.color(color)
  if not color then return nil end
  return { r = color.r, g = color.g, b = color.b, a = color.a }
end

--- 序列化流体盒原型数组（FluidboxPrototype[]）
--- @see https://lua-api.factorio.com/latest/classes/LuaFluidBoxPrototype.html
--- @param boxes LuaFluidBoxPrototype[]|nil
--- @return table[]|nil
function Serializers.fluidbox_prototypes(boxes)
  if not boxes or #boxes == 0 then return nil end
  local safe = Util.safe_get
  local result = {}
  for _, fb in ipairs(boxes) do
    result[#result + 1] = Serializers.fluidbox_prototype(fb)
  end
  return result
end

--- 序列化单个流体盒原型。
--- @see https://lua-api.factorio.com/latest/classes/LuaFluidBoxPrototype.html
--- @param fb LuaFluidBoxPrototype|nil
--- @return table|nil
function Serializers.fluidbox_prototype(fb)
  if not fb then return nil end
  local safe = Util.safe_get
  return {
    production_type     = fb.production_type,
    filter              = safe(function()
      local f = fb.filter
      return f and f.name or nil
    end),
    minimum_temperature = fb.minimum_temperature,
    maximum_temperature = fb.maximum_temperature,
    base_area           = fb.base_area,
    base_level          = fb.base_level,
    volume              = safe(function() return fb.volume end),
  }
end

--- 序列化热缓冲原型。
--- @see https://lua-api.factorio.com/latest/classes/LuaHeatBufferPrototype.html
--- @param buffer LuaHeatBufferPrototype|nil
--- @return table|nil
function Serializers.heat_buffer_prototype(buffer)
  if not buffer then return nil end
  return {
    max_temperature         = buffer.max_temperature,
    default_temperature     = buffer.default_temperature,
    specific_heat           = buffer.specific_heat,
    max_transfer            = buffer.max_transfer,
    min_temperature_gradient = buffer.min_temperature_gradient,
    min_working_temperature = buffer.min_working_temperature,
    minimum_glow_temperature = buffer.minimum_glow_temperature,
  }
end

--- 序列化燃烧能量源。
--- @see https://lua-api.factorio.com/latest/classes/LuaBurnerPrototype.html
--- @param burner LuaBurnerPrototype|nil
--- @return table|nil
function Serializers.burner_prototype(burner)
  if not burner then return nil end
  local safe = Util.safe_get
  return {
    effectivity          = burner.effectivity,
    fuel_inventory_size  = burner.fuel_inventory_size,
    burnt_inventory_size = burner.burnt_inventory_size,
    fuel_categories      = Util.keys_to_list(burner.fuel_categories),
    initial_fuel         = safe(function()
      local fuel = burner.initial_fuel
      return fuel and fuel.name or nil
    end),
    initial_fuel_percent = burner.initial_fuel_percent,
    emissions_per_joule  = copy_number_dict(burner.emissions_per_joule),
    render_no_network_icon = burner.render_no_network_icon,
    render_no_power_icon   = burner.render_no_power_icon,
  }
end

--- 序列化电力能量源。
--- @see https://lua-api.factorio.com/latest/classes/LuaElectricEnergySourcePrototype.html
--- @param source LuaElectricEnergySourcePrototype|nil
--- @return table|nil
function Serializers.electric_energy_source(source)
  if not source then return nil end
  local safe = Util.safe_get
  return {
    buffer_capacity      = source.buffer_capacity,
    usage_priority       = source.usage_priority,
    drain                = source.drain,
    input_flow_limit     = safe(function() return source.get_input_flow_limit() end),
    output_flow_limit    = safe(function() return source.get_output_flow_limit() end),
    emissions_per_joule  = copy_number_dict(source.emissions_per_joule),
    render_no_network_icon = source.render_no_network_icon,
    render_no_power_icon   = source.render_no_power_icon,
  }
end

--- 序列化流体能量源。
--- @see https://lua-api.factorio.com/latest/classes/LuaFluidEnergySourcePrototype.html
--- @param source LuaFluidEnergySourcePrototype|nil
--- @return table|nil
function Serializers.fluid_energy_source(source)
  if not source then return nil end
  return {
    effectivity            = source.effectivity,
    burns_fluid            = source.burns_fluid,
    scale_fluid_usage      = source.scale_fluid_usage,
    destroy_non_fuel_fluid = source.destroy_non_fuel_fluid,
    fluid_usage_per_tick   = source.fluid_usage_per_tick,
    maximum_temperature    = source.maximum_temperature,
    fluid_box              = Serializers.fluidbox_prototype(source.fluid_box),
    emissions_per_joule    = copy_number_dict(source.emissions_per_joule),
    render_no_network_icon = source.render_no_network_icon,
    render_no_power_icon   = source.render_no_power_icon,
  }
end

--- 序列化热能量源。
--- @see https://lua-api.factorio.com/latest/classes/LuaHeatEnergySourcePrototype.html
--- @param source LuaHeatEnergySourcePrototype|nil
--- @return table|nil
function Serializers.heat_energy_source(source)
  if not source then return nil end
  return {
    max_temperature          = source.max_temperature,
    default_temperature      = source.default_temperature,
    specific_heat            = source.specific_heat,
    max_transfer             = source.max_transfer,
    min_temperature_gradient = source.min_temperature_gradient,
    min_working_temperature  = source.min_working_temperature,
    minimum_glow_temperature = source.minimum_glow_temperature,
    heat_buffer              = Serializers.heat_buffer_prototype(source.heat_buffer_prototype),
    emissions_per_joule      = copy_number_dict(source.emissions_per_joule),
    render_no_network_icon   = source.render_no_network_icon,
    render_no_power_icon     = source.render_no_power_icon,
  }
end

--- 序列化虚空能量源。
--- @see https://lua-api.factorio.com/latest/classes/LuaVoidEnergySourcePrototype.html
--- @param source LuaVoidEnergySourcePrototype|nil
--- @return table|nil
function Serializers.void_energy_source(source)
  if not source then return nil end
  return {
    emissions_per_joule    = copy_number_dict(source.emissions_per_joule),
    render_no_network_icon = source.render_no_network_icon,
    render_no_power_icon   = source.render_no_power_icon,
  }
end

--- 汇总实体全部能量源信息。
--- 某些实体会同时拥有多种能量源（例如聚变反应堆）。
--- @param proto LuaEntityPrototype
--- @return table|nil
function Serializers.entity_energy_sources(proto)
  local safe = Util.safe_get
  local burner = safe(function() return Serializers.burner_prototype(proto.burner_prototype) end)
  local electric = safe(function() return Serializers.electric_energy_source(proto.electric_energy_source_prototype) end)
  local fluid = safe(function() return Serializers.fluid_energy_source(proto.fluid_energy_source_prototype) end)
  local heat = safe(function() return Serializers.heat_energy_source(proto.heat_energy_source_prototype) end)
  local void = safe(function() return Serializers.void_energy_source(proto.void_energy_source_prototype) end)
  local heat_buffer = safe(function() return Serializers.heat_buffer_prototype(proto.heat_buffer_prototype) end)

  if not burner and not electric and not fluid and not heat and not void and not heat_buffer then
    return nil
  end

  local types = {}
  if burner then types[#types + 1] = "burner" end
  if electric then types[#types + 1] = "electric" end
  if fluid then types[#types + 1] = "fluid" end
  if heat then types[#types + 1] = "heat" end
  if void then types[#types + 1] = "void" end

  return {
    types       = types,
    burner      = burner,
    electric    = electric,
    fluid       = fluid,
    heat        = heat,
    void        = void,
    heat_buffer = heat_buffer,
  }
end

--- 序列化放置所需物品列表（ItemStackDefinition[]）
--- @see https://lua-api.factorio.com/latest/concepts/ItemStackDefinition.html
--- @param items ItemStackDefinition[]|nil
--- @return table[]|nil
function Serializers.items_to_place(items)
  if not items or #items == 0 then return nil end
  local result = {}
  for _, it in ipairs(items) do
    result[#result + 1] = { name = it.name, count = it.count }
  end
  return result
end

return Serializers
