--- 太空导出
--- 导出太空地点（SpaceLocation）和太空连接（SpaceConnection）。
--- 仅在安装 Space Age DLC 时可用。

local log  = require("lib.logger").create("太空导出")
local Util = require("lib.util")

local Space = {}

--- 导出所有太空地点
--- @see https://lua-api.factorio.com/latest/classes/LuaSpaceLocationPrototype.html
--- @return table[] 按名称排序的太空地点数组
function Space.export_locations()
  if not Util.is_prototype_available("space_location") then
    log.info("space_location 原型不可用（未安装 Space Age），跳过")
    return {}
  end

  local safe = Util.safe_get
  local result = {}

  for name, proto in pairs(prototypes.space_location) do
    result[#result + 1] = {
      name     = name,
      group    = proto.group.name,
      subgroup = proto.subgroup.name,
      order    = proto.order,
      hidden   = proto.hidden or false,

      --- 太空中的太阳能输出
      solar_power_in_space = safe(function() return proto.solar_power_in_space end),

      --- 星图坐标
      position = safe(function()
        local p = proto.position
        return p and { x = p.x, y = p.y } or nil
      end),

      --- 表面属性（重力、磁场、气压等）
      --- @see https://lua-api.factorio.com/latest/classes/LuaSpaceLocationPrototype.html#surface_properties
      surface_properties = safe(function()
        local sp = proto.surface_properties
        if not sp then return nil end
        local res = {}
        for k, v in pairs(sp) do
          res[k] = v
        end
        return res
      end),
    }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出太空地点: " .. #result .. " 个")
  return result
end

--- 导出所有太空连接
--- @see https://lua-api.factorio.com/latest/classes/LuaSpaceConnectionPrototype.html
--- @return table[] 按名称排序的太空连接数组
function Space.export_connections()
  if not Util.is_prototype_available("space_connection") then
    log.info("space_connection 原型不可用（未安装 Space Age），跳过")
    return {}
  end

  local safe = Util.safe_get
  local result = {}

  for name, proto in pairs(prototypes.space_connection) do
    result[#result + 1] = {
      name   = name,
      from   = safe(function() return proto.from.name end),
      to     = safe(function() return proto.to.name end),
      length = safe(function() return proto.length end),
    }
  end
  table.sort(result, function(a, b) return a.name < b.name end)
  log.info("导出太空连接: " .. #result .. " 个")
  return result
end

return Space
