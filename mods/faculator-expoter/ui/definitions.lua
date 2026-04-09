--- 导出大类 & 浏览数据源定义
--- 大类 (TAB) 使用游戏自带的 item_group → subgroup 层级，
--- 与百科的分类方式完全一致。
---
--- 每个大类有:
---   key:           导出数据表中的字段名
---   label:         中文 Tab 标签
---   prototype:     prototypes[X] 中的索引名
---   sprite_prefix: SpritePath 前缀（如 "item" → "item/name"），nil 则文本列表
---   elem_type:     elem_tooltip 类型（用于原生提示），nil 则不显示
---   grouped:       是否按 item_group → subgroup 层级分组（布尔）
---   filtered:      是否需按白名单过滤（实体）
---   optional:      是否为 DLC 可选

local Util      = require("lib.util")
local Constants = require("lib.constants")

local Definitions = {}

--- 导出大类定义（Tab 顺序）
--- 支持 elem_tooltip 的类型（Factorio 2.0 验证）:
---   item, fluid, recipe, entity, technology, item-group, equipment, tile, signal
--- 不支持: quality, space-location, space-connection, equipment-grid, *-category
Definitions.TABS = {
  { key = "items",        label = "物品",   prototype = "item",
    sprite_prefix = "item",    elem_type = "item",       grouped = true },
  { key = "fluids",       label = "流体",   prototype = "fluid",
    sprite_prefix = "fluid",   elem_type = "fluid",      grouped = true },
  { key = "recipes",      label = "配方",   prototype = "recipe",
    sprite_prefix = "recipe",  elem_type = "recipe",     grouped = true },
  { key = "technologies", label = "科技",   prototype = "technology",
    sprite_prefix = "technology", elem_type = "technology", grouped = true },
  { key = "entities",     label = "实体",   prototype = "entity",
    sprite_prefix = "entity",  elem_type = "entity",     grouped = true, filtered = true },
  { key = "equipment",    label = "装备",   prototype = "equipment",
    sprite_prefix = "equipment", elem_type = "equipment", grouped = true },
  { key = "qualities",        label = "品质",     prototype = "quality",
    sprite_prefix = "quality" },
  { key = "space_locations",  label = "太空地点", prototype = "space_location",
    sprite_prefix = "space-location", optional = true },
  { key = "space_connections", label = "太空连接", prototype = "space_connection",
    optional = true },
  { key = "item_groups",      label = "物品分组", prototype = "item_group",
    sprite_prefix = "item-group", elem_type = "item-group" },
  { key = "equipment_grids",  label = "装备网格", prototype = "equipment_grid" },
  { key = "recipe_categories",   label = "配方类别", prototype = "recipe_category" },
  { key = "fuel_categories",     label = "燃料类别", prototype = "fuel_category" },
  { key = "resource_categories", label = "资源类别", prototype = "resource_category" },
  { key = "module_categories",   label = "模块类别", prototype = "module_category" },
}

--- 快速查找表: key → tab 定义
Definitions.TAB_MAP = {}
for _, tab in ipairs(Definitions.TABS) do
  Definitions.TAB_MAP[tab.key] = tab
end

-------------------------------------------------------------------------------
-- 数据读取
-------------------------------------------------------------------------------

--- 获取指定大类的所有 item_group（按游戏 order 排序）
--- 仅对 grouped=true 的大类有效。
--- @param tab table TABS 中的一项
--- @return table[] { name, order, subgroups = { {name, order}, ... } }
function Definitions.get_groups(tab)
  if not tab.grouped then return {} end

  -- 收集该大类所有原型的 group → subgroup 归属
  local group_set = {}   -- group_name → { sg_name → true }
  local proto_dict = prototypes[tab.prototype]
  if not proto_dict then return {} end

  for _, proto in pairs(proto_dict) do
    if tab.filtered and not Constants.EXPORTABLE_ENTITY_TYPES[proto.type] then
      goto continue
    end
    local g = proto.group.name
    local sg = proto.subgroup.name
    if not group_set[g] then group_set[g] = {} end
    group_set[g][sg] = true
    ::continue::
  end

  -- 构建分层结构
  local result = {}
  for g_name, sg_set in pairs(group_set) do
    local g_proto = prototypes.item_group[g_name]
    local subs = {}
    for sg_name in pairs(sg_set) do
      -- 从 item_group 的 subgroups 中找到对应的 order
      local sg_order = ""
      if g_proto and g_proto.subgroups then
        for _, real_sg in pairs(g_proto.subgroups) do
          if real_sg.name == sg_name then
            sg_order = real_sg.order or ""
            break
          end
        end
      end
      subs[#subs + 1] = { name = sg_name, order = sg_order }
    end
    table.sort(subs, function(a, b) return a.order < b.order end)
    result[#result + 1] = {
      name = g_name,
      order = g_proto and g_proto.order or "",
      subgroups = subs,
    }
  end
  table.sort(result, function(a, b) return a.order < b.order end)
  return result
end

--- 列出指定大类、指定 subgroup 下的所有原型（按 order → name 排序）
--- @param tab table TABS 中的一项
--- @param subgroup_name string|nil 子分组名；nil 则列出全部
--- @return table[] { name, order }
--- @return boolean 是否可用
function Definitions.list_prototypes(tab, subgroup_name)
  if tab.optional and not Util.is_prototype_available(tab.prototype) then
    return {}, false
  end

  local proto_dict = prototypes[tab.prototype]
  if not proto_dict then return {}, false end

  local result = {}
  for name, proto in pairs(proto_dict) do
    -- 过滤
    if tab.filtered and not Constants.EXPORTABLE_ENTITY_TYPES[proto.type] then
      goto skip
    end
    -- 子分组筛选
    if subgroup_name then
      local sg = Util.safe_get(function() return proto.subgroup.name end)
      if sg ~= subgroup_name then goto skip end
    end
    result[#result + 1] = { name = name, order = Util.safe_get(function() return proto.order end) or "" }
    ::skip::
  end
  table.sort(result, function(a, b)
    if a.order ~= b.order then return a.order < b.order end
    return a.name < b.name
  end)
  return result, true
end

--- 统计指定大类的原型总数
--- @param tab table TABS 中的一项
--- @return number, boolean
function Definitions.count_prototypes(tab)
  if tab.optional and not Util.is_prototype_available(tab.prototype) then
    return 0, false
  end
  local proto_dict = prototypes[tab.prototype]
  if not proto_dict then return 0, false end

  if tab.filtered then
    local n = 0
    for _, proto in pairs(proto_dict) do
      if Constants.EXPORTABLE_ENTITY_TYPES[proto.type] then n = n + 1 end
    end
    return n, true
  end
  return Util.count_table(proto_dict), true
end

return Definitions
