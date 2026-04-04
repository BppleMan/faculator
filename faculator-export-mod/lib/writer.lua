--- 文件输出模块
--- 封装 Factorio 的文件写入 API，所有 JSON 输出统一经由此模块。

local Constants = require("lib.constants")
local log = require("lib.logger").create("文件输出")

local Writer = {}

--- 记录本轮导出清单。
--- Factorio runtime 只能可靠写文件，无法方便列目录/删文件，
--- 因此通过 manifest 告诉外部同步脚本哪些文件才是当前有效导出结果。
--- @param files string[] 当前有效文件名列表
--- @param context table|nil 附加上下文
function Writer.write_manifest(files, context)
  Writer.write_json(Constants.MANIFEST_FILENAME, {
    files = files,
    context = context or {},
  })
end

--- 将 Lua 表序列化为 JSON 并写入 script-output 目录
--- @see https://lua-api.factorio.com/latest/auxiliary/helpers.html#table_to_json
--- @see https://lua-api.factorio.com/latest/auxiliary/helpers.html#write_file
--- @param filename string 文件名（相对于 OUTPUT_DIR）
--- @param data table 要序列化的 Lua 表
function Writer.write_json(filename, data)
  local full_path = Constants.OUTPUT_DIR .. filename
  log.info("正在写入文件: script-output/" .. full_path)
  local json_str = helpers.table_to_json(data)
  helpers.write_file(full_path, json_str, false)
  log.info("文件写入完成: " .. filename .. " (" .. #json_str .. " 字节)")
end

--- 写入原型数据文件
--- @param data table 完整的原型数据表
function Writer.write_data(data)
  Writer.write_json(Constants.DATA_FILENAME, data)
end

--- 写入翻译数据文件
--- @param translations table 翻译映射表 { key = translated_string }
--- @param locale string|nil 语言代码，非 nil 则文件名带后缀
function Writer.write_translations(translations, locale)
  Writer.write_json(Constants.translations_filename(locale), translations)
end

return Writer
