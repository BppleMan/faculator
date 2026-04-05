--- 翻译回调处理器
--- 处理 on_string_translated 事件，跟踪翻译进度，
--- 在全部翻译完成后触发回调。

local log       = require("lib.logger").create("翻译处理")
local Constants = require("lib.constants")

local Handler = {}

--- 处理单条翻译结果
--- 由 control.lua 在 on_string_translated 事件中调用。
--- @see https://lua-api.factorio.com/latest/events.html#on_string_translated
--- @param event EventData  事件数据（含 id, translated, result）
--- @param on_complete function 所有翻译完成后的回调函数
function Handler.on_translated(event, on_complete)
  if not storage.exporting then return end

  local key = storage.pending[event.id]
  if not key then return end

  -- 存储翻译结果
  if event.translated and event.result then
    storage.translations[key] = event.result
  end

  storage.pending[event.id] = nil
  storage.completed = storage.completed + 1

  -- 定期汇报翻译进度
  local interval = Constants.TRANSLATION_PROGRESS_INTERVAL
  if storage.completed % interval == 0 then
    local msg = string.format("翻译进度: %d/%d", storage.completed, storage.total)
    log.info(msg)
    -- 向所有在线玩家广播进度
    for _, p in pairs(game.players) do
      if p.connected then
        p.print(Constants.MSG_PREFIX .. msg)
      end
    end
  end

  -- 检查是否全部完成
  if storage.completed >= storage.total then
    log.info("所有翻译请求已完成")
    if on_complete then
      on_complete()
    end
  end
end

return Handler
