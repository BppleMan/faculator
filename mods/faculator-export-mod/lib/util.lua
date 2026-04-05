--- 通用工具函数
--- 提供整个 mod 共用的辅助方法。
--- 注意：消息输出功能已迁移至 lib/logger.lua，此模块仅保留纯数据工具。

local Util = {}

--- 安全读取原型属性
--- 某些属性可能在特定原型类型上不存在（例如非 module 类型的物品没有 module_effects），
--- 直接访问会抛出异常。此函数通过 pcall 包裹访问，失败时返回 nil。
--- @param func function 一个无参函数，内部访问目标属性
--- @return any|nil 成功时返回属性值，失败时返回 nil
function Util.safe_get(func)
  local ok, val = pcall(func)
  if ok then return val end
  return nil
end

--- 将字典的 key 提取为排序后的列表
--- 适用于 Factorio API 中以字典形式返回的类别集合（如 crafting_categories）。
--- @param dict table|nil 输入字典
--- @return string[]|nil 排序后的 key 列表，输入为 nil 则返回 nil
function Util.keys_to_list(dict)
  if not dict then return nil end
  local result = {}
  for k, _ in pairs(dict) do
    result[#result + 1] = k
  end
  table.sort(result)
  return result
end

--- 检查某个原型字典是否可用
--- Space Age 的某些原型类别（如 space_location、space_connection）
--- 在未安装 DLC 时可能不存在，需要用 pcall 安全探测。
--- @param prototype_name string 原型字典名称（prototypes 表的字段名）
--- @return boolean 是否可用
function Util.is_prototype_available(prototype_name)
  local ok, _ = pcall(function() return prototypes[prototype_name] end)
  return ok
end

--- 获取当前任意一个在线玩家
--- 翻译 API 需要通过玩家对象发起请求。
--- @see https://lua-api.factorio.com/latest/classes/LuaPlayer.html#request_translation
--- @return LuaPlayer|nil 第一个在线玩家，无在线玩家时返回 nil
function Util.get_any_connected_player()
  for _, p in pairs(game.players) do
    if p.connected then
      return p
    end
  end
  return nil
end

--- 统计表中的元素数量
--- 适用于非数组的字典型表（#tbl 无法正确获取长度）。
--- @param tbl table 目标表
--- @return number 元素数量
function Util.count_table(tbl)
  local count = 0
  for _ in pairs(tbl) do count = count + 1 end
  return count
end

return Util
