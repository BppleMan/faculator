--- 日志模块
--- 提供统一的日志输出接口，同时支持：
---   1. Factorio 日志文件输出（log()，写入 factorio-current.log）
---   2. 游戏内聊天消息输出（player.print()）
---
--- Factorio 的 log() 函数在所有阶段可用，输出到日志文件。
--- @see https://lua-api.factorio.com/latest/auxiliary/libraries.html#new-functions
--- @see https://lua-api.factorio.com/latest/classes/LuaPlayer.html#print

local Constants = require("lib.constants")

local Logger = {}

--- 日志级别定义
Logger.LEVEL = {
  DEBUG = 1,
  INFO  = 2,
  WARN  = 3,
  ERROR = 4,
}

--- 日志级别标签（中文）
local LEVEL_LABELS = {
  [1] = "调试",
  [2] = "信息",
  [3] = "警告",
  [4] = "错误",
}

--- 当前最低输出级别（低于此级别的日志会被忽略）
local current_level = Logger.LEVEL.DEBUG

--- 设置最低日志级别
--- @param level number Logger.LEVEL 中的值
function Logger.set_level(level)
  current_level = level
end

--- 格式化日志消息
--- @param level number 日志级别
--- @param module_name string 模块名称
--- @param msg string 消息内容
--- @return string 格式化后的完整消息
local function format_msg(level, module_name, msg)
  local label = LEVEL_LABELS[level] or "未知"
  return string.format("%s[%s][%s] %s", Constants.MSG_PREFIX, label, module_name, msg)
end

--- 写入日志文件（通过 Factorio 内置 log() 函数）
--- log() 输出到 factorio-current.log，所有阶段均可调用。
--- @param level number 日志级别
--- @param module_name string 模块名称
--- @param msg string 消息内容
local function write_log(level, module_name, msg)
  if level < current_level then return end
  log(format_msg(level, module_name, msg))
end

--- 同时写入日志文件并发送游戏内聊天消息
--- @param level number 日志级别
--- @param module_name string 模块名称
--- @param msg string 消息内容
--- @param player LuaPlayer|nil 目标玩家，为 nil 时仅写日志文件
local function write_log_and_chat(level, module_name, msg, player)
  if level < current_level then return end
  local formatted = format_msg(level, module_name, msg)
  log(formatted)
  if player then
    player.print(formatted)
  end
end

--- 向所有在线玩家广播消息并写入日志
--- @param level number 日志级别
--- @param module_name string 模块名称
--- @param msg string 消息内容
local function write_log_and_broadcast(level, module_name, msg)
  if level < current_level then return end
  local formatted = format_msg(level, module_name, msg)
  log(formatted)
  -- game 对象仅在运行时阶段可用
  if game then
    for _, p in pairs(game.players) do
      p.print(formatted)
    end
  end
end

-------------------------------------------------------------------------------
--- 创建带有模块名前缀的子日志器
--- 每个功能模块创建自己的 logger 实例，日志中会自动标注来源模块。
---
--- 用法：
---   local log = require("lib.logger").create("翻译系统")
---   log.info("开始收集翻译字符串...")
---   log.info_to(player, "已请求 1234 条翻译")
---   log.warn_all("翻译请求失败")
-------------------------------------------------------------------------------

--- @class ModuleLogger
--- @field debug fun(msg: string) 调试级别，仅写日志文件
--- @field info fun(msg: string) 信息级别，仅写日志文件
--- @field warn fun(msg: string) 警告级别，仅写日志文件
--- @field error fun(msg: string) 错误级别，仅写日志文件
--- @field debug_to fun(player: LuaPlayer|nil, msg: string) 调试级别，写日志+聊天
--- @field info_to fun(player: LuaPlayer|nil, msg: string) 信息级别，写日志+聊天
--- @field warn_to fun(player: LuaPlayer|nil, msg: string) 警告级别，写日志+聊天
--- @field error_to fun(player: LuaPlayer|nil, msg: string) 错误级别，写日志+聊天
--- @field info_all fun(msg: string) 信息级别，写日志+广播给所有玩家
--- @field warn_all fun(msg: string) 警告级别，写日志+广播给所有玩家
--- @field error_all fun(msg: string) 错误级别，写日志+广播给所有玩家

--- 创建带模块名的子日志器
--- @param module_name string 模块名称（中文），如 "导出协调器"、"物品导出"
--- @return ModuleLogger
function Logger.create(module_name)
  local L = {}

  -- 纯日志文件输出
  function L.debug(msg) write_log(Logger.LEVEL.DEBUG, module_name, msg) end
  function L.info(msg)  write_log(Logger.LEVEL.INFO,  module_name, msg) end
  function L.warn(msg)  write_log(Logger.LEVEL.WARN,  module_name, msg) end
  function L.error(msg) write_log(Logger.LEVEL.ERROR, module_name, msg) end

  -- 日志文件 + 指定玩家聊天
  function L.debug_to(player, msg) write_log_and_chat(Logger.LEVEL.DEBUG, module_name, msg, player) end
  function L.info_to(player, msg)  write_log_and_chat(Logger.LEVEL.INFO,  module_name, msg, player) end
  function L.warn_to(player, msg)  write_log_and_chat(Logger.LEVEL.WARN,  module_name, msg, player) end
  function L.error_to(player, msg) write_log_and_chat(Logger.LEVEL.ERROR, module_name, msg, player) end

  -- 日志文件 + 广播给所有在线玩家
  function L.info_all(msg)  write_log_and_broadcast(Logger.LEVEL.INFO,  module_name, msg) end
  function L.warn_all(msg)  write_log_and_broadcast(Logger.LEVEL.WARN,  module_name, msg) end
  function L.error_all(msg) write_log_and_broadcast(Logger.LEVEL.ERROR, module_name, msg) end

  return L
end

return Logger
