--- 常量定义
--- 集中管理 mod 级别的配置常量，避免魔法字符串散落各处。

local Constants = {}

--- mod 版本号，与 info.json 保持一致
Constants.MOD_VERSION = "0.1.0"

--- 输出文件目录（相对于 Factorio 的 script-output/ 目录）
--- @see https://lua-api.factorio.com/latest/auxiliary/helpers.html#write_file
Constants.OUTPUT_DIR = "faculator/"

--- 原型数据输出文件名
Constants.DATA_FILENAME = "game-data.json"

--- 导出清单文件名
--- 用于告诉外部同步脚本“本轮导出哪些文件是当前有效结果”。
Constants.MANIFEST_FILENAME = "export-manifest.json"

--- 翻译数据输出文件名（不带语言后缀的默认名，向后兼容）
Constants.TRANSLATIONS_FILENAME = "translations.json"

--- 生成带语言后缀的翻译文件名
--- @param locale string|nil 语言代码（如 "en", "zh-CN"），nil 则不带后缀
--- @return string
function Constants.translations_filename(locale)
  if locale and locale ~= "" then
    return "translations-" .. locale .. ".json"
  end
  return Constants.TRANSLATIONS_FILENAME
end

--- 翻译进度汇报间隔（每翻译多少条打印一次进度）
Constants.TRANSLATION_PROGRESS_INTERVAL = 500

--- 聊天消息前缀
Constants.MSG_PREFIX = "[Faculator] "

--- 需要导出的实体类型白名单
--- 只导出与生产计算相关的实体，不导出纯装饰/视觉实体
Constants.EXPORTABLE_ENTITY_TYPES = {
  ["assembling-machine"] = true,  -- 组装机
  ["furnace"]            = true,  -- 熔炉
  ["rocket-silo"]        = true,  -- 火箭发射井
  ["mining-drill"]       = true,  -- 采矿机
  ["offshore-pump"]      = true,  -- 近海泵
  ["boiler"]             = true,  -- 锅炉
  ["burner-generator"]   = true,  -- 热能发电机
  ["generator"]          = true,  -- 发电机
  ["fusion-generator"]   = true,  -- 聚变发电机
  ["reactor"]            = true,  -- 核反应堆
  ["fusion-reactor"]     = true,  -- 聚变反应堆
  ["solar-panel"]        = true,  -- 太阳能电池板
  ["accumulator"]        = true,  -- 蓄电器
  ["beacon"]             = true,  -- 插件效果分享塔
  ["lab"]                = true,  -- 实验室
  ["agricultural-tower"] = true,  -- 农业塔 (Space Age)
  ["cargo-landing-pad"]  = true,  -- 货运着陆台 (Space Age)
  ["space-platform-hub"] = true,  -- 太空平台枢纽 (Space Age)
}

return Constants
