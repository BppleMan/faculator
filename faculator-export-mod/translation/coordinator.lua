--- 翻译协调器
--- 管理异步翻译的完整生命周期：
---   1. 收集所有待翻译的 LocalisedString
---   2. 通过玩家发起 request_translation 请求
---   3. 翻译完成后写入文件
---
--- 翻译流程依赖 Factorio 的异步翻译 API：
--- @see https://lua-api.factorio.com/latest/classes/LuaPlayer.html#request_translation
--- @see https://lua-api.factorio.com/latest/events.html#on_string_translated

local log       = require("lib.logger").create("翻译协调")
local Constants = require("lib.constants")
local Writer    = require("lib.writer")
local Collector = require("translation.collector")

local Coordinator = {}

--- 初始化 storage 中的翻译状态
--- Factorio 2.0 使用 storage（而非旧版 global）存储运行时持久数据。
--- @see https://lua-api.factorio.com/latest/auxiliary/storage.html
function Coordinator.init_storage()
  storage.export_data   = storage.export_data or nil
  storage.pending       = storage.pending or {}       -- id -> key 映射
  storage.translations  = storage.translations or {}  -- key -> 翻译结果
  storage.total         = storage.total or 0
  storage.completed     = storage.completed or 0
  storage.exporting     = storage.exporting or false
end

--- 重置翻译状态（开始新一轮导出前调用）
function Coordinator.reset()
  storage.export_data  = nil
  storage.pending      = {}
  storage.translations = {}
  storage.total        = 0
  storage.completed    = 0
  storage.exporting    = false
  log.debug("翻译状态已重置")
end

--- 发起异步翻译请求
--- @param player LuaPlayer 用于发送翻译请求的玩家对象
function Coordinator.start(player)
  local ls_list = Collector.collect_all()
  if #ls_list == 0 then
    storage.exporting = false
    log.warn("未找到任何可翻译字符串")
    player.print(Constants.MSG_PREFIX .. "未找到任何可翻译字符串")
    return
  end

  log.info("向玩家 " .. player.name .. " 发起 " .. #ls_list .. " 条翻译请求...")
  player.print(Constants.MSG_PREFIX .. "正在请求翻译 " .. #ls_list .. " 条字符串...")
  storage.total = #ls_list

  local failed = 0
  for _, entry in ipairs(ls_list) do
    --- @see https://lua-api.factorio.com/latest/classes/LuaPlayer.html#request_translation
    local ok, id = pcall(function()
      return player.request_translation(entry.ls)
    end)
    if ok and id then
      storage.pending[id] = entry.key
    else
      failed = failed + 1
      storage.total = storage.total - 1
    end
  end

  if failed > 0 then
    log.warn("有 " .. failed .. " 条翻译请求失败")
  end

  if storage.total == 0 then
    storage.exporting = false
    log.error("所有翻译请求均失败，原始数据文件仍然可用")
    player.print(Constants.MSG_PREFIX .. "翻译请求全部失败，原始数据文件仍然可用")
  end
end

--- 翻译全部完成后的回调
--- 写入翻译文件并通知所有玩家。
function Coordinator.finalize()
  Writer.write_translations(storage.translations)

  local count = 0
  for _ in pairs(storage.translations) do count = count + 1 end

  local msg = string.format("翻译完成！共 %d 条翻译已写入", count)
  log.info(msg)

  -- 通知所有在线玩家
  for _, p in pairs(game.players) do
    if p.connected then
      p.print(Constants.MSG_PREFIX .. msg)
      p.print(Constants.MSG_PREFIX .. "文件路径: script-output/" .. Constants.OUTPUT_DIR .. Constants.TRANSLATIONS_FILENAME)
    end
  end

  storage.exporting = false
end

return Coordinator
