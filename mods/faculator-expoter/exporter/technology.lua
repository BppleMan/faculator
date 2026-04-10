--- 科技导出
--- 导出所有 LuaTechnologyPrototype，包含前置科技、解锁效果、研究材料等。

local log  = require("lib.logger").create("科技导出")
local Util = require("lib.util")

local Technology = {}

--- 导出所有科技原型
--- @see https://lua-api.factorio.com/latest/classes/LuaTechnologyPrototype.html
--- @return table[] 按名称排序的科技数组
function Technology.export()
  local safe = Util.safe_get
  local result = {}

  for name, proto in pairs(prototypes.technology) do
    -- 科技效果（解锁配方、修改器等）
    local effects = {}
    if proto.effects then
      for _, eff in ipairs(proto.effects) do
        local effect = { type = eff.type }
        if eff.type == "unlock-recipe" then
          effect.recipe = eff.recipe
        elseif eff.type == "unlock-space-location" then
          effect.space_location = safe(function() return eff.space_location end)
        else
          effect.modifier = safe(function() return eff.modifier end)
        end
        effect.quality = safe(function() return eff.quality end)
        effect.change = safe(function() return eff.change end)
        effects[#effects + 1] = effect
      end
    end

    -- 前置科技
    --- @see https://lua-api.factorio.com/latest/classes/LuaTechnologyPrototype.html#prerequisites
    local prerequisites = {}
    if proto.prerequisites then
      for _, prereq in pairs(proto.prerequisites) do
        prerequisites[#prerequisites + 1] = prereq.name
      end
      table.sort(prerequisites)
    end

    -- 研究材料
    --- @see https://lua-api.factorio.com/latest/classes/LuaTechnologyPrototype.html#research_unit_ingredients
    local ingredients = {}
    if proto.research_unit_ingredients then
      for _, ing in ipairs(proto.research_unit_ingredients) do
        ingredients[#ingredients + 1] = {
          type   = ing.type,
          name   = ing.name,
          amount = ing.amount,
        }
      end
    end

    -- 研究触发器（部分科技由事件触发而非消耗科学包）
    local research_trigger = safe(function()
      local rt = proto.research_trigger
      if not rt then return nil end
      return {
        type   = rt.type,
        entity = safe(function()
          local entity = rt.entity
          return entity and entity.name or entity
        end),
        item = safe(function()
          local item = rt.item
          return item and item.name or item
        end),
        fluid = safe(function()
          local fluid = rt.fluid
          return fluid and fluid.name or fluid
        end),
        count  = safe(function() return rt.count end),
        amount = safe(function() return rt.amount end),
      }
    end)

    result[#result + 1] = {
      name     = name,
      group    = proto.group.name,
      subgroup = proto.subgroup.name,
      order    = proto.order,
      hidden   = proto.hidden or false,

      essential              = safe(function() return proto.essential end),
      enabled                = proto.enabled,
      visible_when_disabled  = proto.visible_when_disabled,
      upgrade                = proto.upgrade,
      level                  = proto.level,
      max_level              = proto.max_level,

      --- 研究消耗
      research_unit_count         = safe(function() return proto.research_unit_count end),
      research_unit_count_formula = safe(function() return proto.research_unit_count_formula end),
      research_unit_energy        = proto.research_unit_energy,
      research_unit_ingredients   = ingredients,
      research_trigger            = research_trigger,

      prerequisites = prerequisites,
      effects       = effects,

      --- 是否允许产能研究
      allows_productivity = safe(function() return proto.allows_productivity end),

      --- 后续科技
      successors = safe(function()
        local succ = proto.successors
        if not succ then return nil end
        local res = {}
        for _, s in pairs(succ) do
          res[#res + 1] = s.name
        end
        table.sort(res)
        return res
      end),
    }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出科技: " .. #result .. " 个")
  return result
end

return Technology
