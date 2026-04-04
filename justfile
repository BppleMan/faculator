# Faculator 项目 Justfile
# 使用方法: just <命令>

# Factorio mods 目录（macOS 默认路径）
mods_dir := env("FACTORIO_MODS_DIR", "~/Library/Application Support/factorio/mods")

# mod 在 mods 目录中的文件夹名（Factorio 要求 {mod-name}_{version} 或 {mod-name} 格式）
# @see https://lua-api.factorio.com/latest/auxiliary/mod-structure.html
mod_name := "faculator-export"
mod_src  := "faculator-export-mod"

# ─── Mod 同步 ───────────────────────────────────────────────

# 一次性同步 mod 到 Factorio mods 目录
sync:
    @echo "🔄 同步 {{mod_src}} → {{mods_dir}}/{{mod_name}}/"
    rsync -av --delete \
        --exclude '.DS_Store' \
        --exclude '*.bak' \
        --exclude '.git' \
        "{{mod_src}}/" "{{mods_dir}}/{{mod_name}}/"
    @echo "✅ 同步完成"

# 以 watch 模式持续监听文件变化并自动同步
# 每秒检查一次文件变化，检测到变化后执行 rsync
watch:
    #!/usr/bin/env bash
    set -euo pipefail
    SRC="{{mod_src}}"
    DST="{{mods_dir}}/{{mod_name}}"
    echo "👀 开始监听 $SRC/ 的文件变化..."
    echo "   目标: $DST/"
    echo "   按 Ctrl+C 停止"
    echo ""
    # 首次同步
    rsync -av --delete \
        --exclude '.DS_Store' \
        --exclude '*.bak' \
        --exclude '.git' \
        "$SRC/" "$DST/"
    echo ""
    echo "✅ 首次同步完成，进入监听模式..."
    echo ""
    # 记录上次同步时间戳
    LAST_HASH=""
    while true; do
        # 计算所有 mod 文件的哈希摘要（检测内容变化）
        CURRENT_HASH=$(find "$SRC" -type f \
            ! -name '.DS_Store' \
            ! -name '*.bak' \
            -exec md5 -q {} + 2>/dev/null | md5 -q 2>/dev/null || echo "changed")
        if [[ "$CURRENT_HASH" != "$LAST_HASH" && -n "$LAST_HASH" ]]; then
            echo "$(date '+%H:%M:%S') 🔄 检测到文件变化，同步中..."
            rsync -av --delete \
                --exclude '.DS_Store' \
                --exclude '*.bak' \
                --exclude '.git' \
                "$SRC/" "$DST/"
            echo "$(date '+%H:%M:%S') ✅ 同步完成"
            echo ""
        fi
        LAST_HASH="$CURRENT_HASH"
        sleep 1
    done

# 创建符号链接（替代 rsync，直接链接源目录）
link:
    @echo "🔗 创建符号链接: {{mods_dir}}/{{mod_name}} → {{mod_src}}/"
    ln -sfn "$(pwd)/{{mod_src}}" "{{mods_dir}}/{{mod_name}}"
    @echo "✅ 链接完成（修改源文件即时生效，无需同步）"

# 移除 mods 目录中的 mod（链接或文件夹）
unlink:
    @echo "🗑️  移除 {{mods_dir}}/{{mod_name}}"
    rm -rf "{{mods_dir}}/{{mod_name}}"
    @echo "✅ 已移除"

# ─── 导出数据查看 ─────────────────────────────────────────────

# Factorio script-output 目录
output_dir := env("FACTORIO_OUTPUT_DIR", "~/Library/Application Support/factorio/script-output/faculator")

# 查看导出的数据文件
show-data:
    @echo "📂 导出数据目录: {{output_dir}}"
    @ls -lh "{{output_dir}}/" 2>/dev/null || echo "⚠️  尚无导出数据"

# 将导出数据复制到项目的 assets 目录
import-data:
    @echo "📥 从 script-output 导入数据到 assets/"
    mkdir -p assets/exported
    cp "{{output_dir}}/game-data.json" assets/exported/ 2>/dev/null && echo "  ✅ game-data.json" || echo "  ⚠️  game-data.json 不存在"
    cp "{{output_dir}}/translations.json" assets/exported/ 2>/dev/null && echo "  ✅ translations.json" || echo "  ⚠️  translations.json 不存在"
    @echo "📥 导入完成"

# ─── Rust 项目 ────────────────────────────────────────────────

# 构建所有 Rust crate
build:
    cargo build

# 运行测试
test:
    cargo test

# 查看项目结构
tree:
    @echo "=== Mod 目录结构 ==="
    find {{mod_src}} -type f | sort | sed 's|^|  |'
    @echo ""
    @echo "=== Rust 工作区 ==="
    cargo metadata --no-deps --format-version=1 2>/dev/null \
        | python3 -c "import sys,json; [print(f'  {p[\"name\"]}') for p in json.load(sys.stdin)['packages']]" \
        2>/dev/null || echo "  (cargo metadata 不可用)"
