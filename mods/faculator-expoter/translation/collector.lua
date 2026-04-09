--- 翻译收集器
--- 从各类原型中收集所有需要翻译的 LocalisedString。
--- 每个条目由 key（"类型:名称"）和 ls（LocalisedString）组成。

local log  = require("lib.logger").create("翻译收集")
local Util = require("lib.util")

local Collector = {}

--- 从单个原型字典中收集本地化名称和描述
--- @param prototype_dict table prototypes 下的某个原型字典
--- @param type_prefix string 类型前缀（如 "item"、"fluid"）
--- @param collect_desc boolean 是否同时收集 localised_description
--- @return table[] 条目数组 { key = "类型:名称", ls = LocalisedString }
local function collect_from(prototype_dict, type_prefix, collect_desc)
  local entries = {}
  for name, proto in pairs(prototype_dict) do
    entries[#entries + 1] = {
      key = type_prefix .. ":" .. name,
      ls  = proto.localised_name,
    }
    if collect_desc then
      entries[#entries + 1] = {
        key = type_prefix .. "_desc:" .. name,
        ls  = proto.localised_description,
      }
    end
  end
  return entries
end

--- 收集所有需要翻译的 LocalisedString
--- @see https://lua-api.factorio.com/latest/concepts/LocalisedString.html
--- @see https://lua-api.factorio.com/latest/classes/LuaPlayer.html#request_translation
--- @return table[] 条目数组 { key, ls }
function Collector.collect_all()
  local strings = {}

  --- 辅助函数：将子数组追加到主数组
  local function append(entries)
    for _, e in ipairs(entries) do
      strings[#strings + 1] = e
    end
  end

  -- 物品（名称 + 描述）
  append(collect_from(prototypes.item, "item", true))
  -- 流体
  append(collect_from(prototypes.fluid, "fluid", true))
  -- 配方
  append(collect_from(prototypes.recipe, "recipe", true))
  -- 实体（全部实体，不仅是生产类）
  append(collect_from(prototypes.entity, "entity", true))
  -- 科技
  append(collect_from(prototypes.technology, "technology", true))

  -- 物品分组（仅名称）
  append(collect_from(prototypes.item_group, "item_group", false))
  -- 物品子分组（仅名称）
  append(collect_from(prototypes.item_subgroup, "item_subgroup", false))
  -- 品质（仅名称）
  append(collect_from(prototypes.quality, "quality", false))

  -- 太空地点（仅名称，需检查 DLC 可用性）
  if Util.is_prototype_available("space_location") then
    append(collect_from(prototypes.space_location, "space_location", false))
  end

  -- 装备（仅名称）
  append(collect_from(prototypes.equipment, "equipment", false))

  log.info("收集到 " .. #strings .. " 条待翻译字符串")
  return strings
end

return Collector
