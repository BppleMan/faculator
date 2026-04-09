--- 配方导出
--- 导出所有 LuaRecipePrototype，包含原料、产物、模块限制、表面条件等。

local log  = require("lib.logger").create("配方导出")
local Util = require("lib.util")
local S    = require("lib.serializers")

local Recipe = {}

--- 导出所有配方原型
--- @see https://lua-api.factorio.com/latest/classes/LuaRecipePrototype.html
--- @return table[] 按名称排序的配方数组
function Recipe.export()
  local safe = Util.safe_get
  local keys = Util.keys_to_list
  local result = {}

  for name, proto in pairs(prototypes.recipe) do
    -- 序列化原料
    local ingredients = {}
    if proto.ingredients then
      for _, ing in ipairs(proto.ingredients) do
        ingredients[#ingredients + 1] = S.ingredient(ing)
      end
    end
    -- 序列化产物
    local products = {}
    if proto.products then
      for _, prod in ipairs(proto.products) do
        products[#products + 1] = S.product(prod)
      end
    end

    local recipe = {
      name     = name,
      group    = proto.group.name,
      subgroup = proto.subgroup.name,
      order    = proto.order,
      hidden   = proto.hidden or false,
      category = proto.category,

      --- 制造时间（秒）
      --- @see https://lua-api.factorio.com/latest/classes/LuaRecipePrototype.html#energy
      energy      = proto.energy,
      ingredients = ingredients,
      products    = products,

      --- 主产物
      main_product = safe(function()
        local mp = proto.main_product
        return mp and { type = mp.type, name = mp.name } or nil
      end),

      enabled                   = proto.enabled,
      allow_decomposition       = proto.allow_decomposition,
      allow_as_intermediate     = proto.allow_as_intermediate,
      allow_intermediates       = proto.allow_intermediates,
      always_show_made_in       = proto.always_show_made_in,
      always_show_products      = proto.always_show_products,
      show_amount_in_title      = proto.show_amount_in_title,
      emissions_multiplier      = proto.emissions_multiplier,

      --- 允许的效果与模块类别
      --- @see https://lua-api.factorio.com/latest/classes/LuaRecipePrototype.html#allowed_effects
      allowed_effects           = safe(function() return keys(proto.allowed_effects) end),
      allowed_module_categories = safe(function() return keys(proto.allowed_module_categories) end),
      maximum_productivity      = safe(function() return proto.maximum_productivity end),
      hide_from_player_crafting = safe(function() return proto.hide_from_player_crafting end),

      --- 表面条件（Space Age）
      --- @see https://lua-api.factorio.com/latest/concepts/SurfaceCondition.html
      surface_conditions = safe(function()
        return S.surface_conditions(proto.surface_conditions)
      end),

      --- 额外制造类别（Space Age）
      additional_categories = safe(function()
        local cats = proto.additional_categories
        if not cats or #cats == 0 then return nil end
        return cats
      end),

      --- 解锁结果（Space Age，如星球发现）
      unlock_results = safe(function()
        local results = proto.unlock_results
        if not results or #results == 0 then return nil end
        local res = {}
        for _, r in ipairs(results) do
          res[#res + 1] = { type = r.type, name = r.name }
        end
        return res
      end),
    }
    result[#result + 1] = recipe
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出配方: " .. #result .. " 个")
  return result
end

return Recipe
