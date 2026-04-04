--- 数据序列化器
--- 将 Factorio 原型中的复杂子结构转换为可 JSON 序列化的 Lua 表。
--- 这些序列化器在多个导出模块中被复用。

local Util = require("lib.util")

local Serializers = {}

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
    result[#result + 1] = {
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
  return result
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
