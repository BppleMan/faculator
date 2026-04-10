# Faculator 项目 Justfile
# 使用方法: just <命令>
# Factorio mods 目录（macOS 默认路径）

mods_dir := env("FACTORIO_MODS_DIR", env("HOME") / "Library/Application Support/factorio/mods")

# mod 在 mods 目录中的文件夹名（Factorio 要求 {mod-name}_{version} 或 {mod-name} 格式）
# @see https://lua-api.factorio.com/latest/auxiliary/mod-structure.html

mod_name := "faculator-export"
mod_src := "mods/faculator-expoter"

# ─── Mod 同步 ───────────────────────────────────────────────

# 一次性同步 mod 到 Factorio mods 目录
sync-mod:
    cargo run -p faculator-devkit -- sync mod --mod-src "{{ mod_src }}" --mods-dir "{{ mods_dir }}" --mod-name "{{ mod_name }}"

# 以 watch 模式持续监听文件变化并自动同步

# 每秒检查一次文件变化，检测到变化后执行 devkit sync mod --watch
watch:
    cargo run -p faculator-devkit -- sync mod --mod-src "{{ mod_src }}" --mods-dir "{{ mods_dir }}" --mod-name "{{ mod_name }}" --watch

# ─── 导出数据查看 ─────────────────────────────────────────────
# Factorio script-output 目录

output_dir := env("FACTORIO_OUTPUT_DIR", env("HOME") / "Library/Application Support/factorio/script-output/faculator")

# 导入后的资产目录

assets_exported_dir := "assets/exported"

# 查看导出的数据文件
show-data:
    @echo "📂 导出数据目录: {{ output_dir }}"
    @ls -lh "{{ output_dir }}/" 2>/dev/null || echo "⚠️  尚无导出数据"
    @echo ""
    @echo "📂 当前已导入资产目录: {{ assets_exported_dir }}"
    @ls -lh "{{ assets_exported_dir }}/" 2>/dev/null || echo "⚠️  尚未导入到 assets/exported"

# 将导出数据同步到项目的 assets 目录
sync-data:
    cargo run -p faculator-devkit -- sync data --script-output "{{ output_dir }}" --output "{{ assets_exported_dir }}"

# ─── 图标导出 ──────────────────────────────────────────────────
# Factorio 可执行文件路径（macOS Steam 默认路径）

factorio_bin := env("FACTORIO_BIN", env("HOME") / "Library/Application Support/Steam/steamapps/common/Factorio/factorio.app/Contents/MacOS/factorio")

# 导出 sprite 并同步整理到 assets/icons
dump-icons:
    cargo run -p faculator-devkit -- dump --factorio-bin "{{ factorio_bin }}"

# organize 已并入 dump，保留旧任务名做兼容
organize-icons:
    @echo "⚠️  organize 已并入 dump，改为执行 dump-icons"
    just dump-icons

# 从已整理的 assets/icons 生成 atlas 与 manifest 到 assets/
atlas-icons:
    cargo run -p faculator-devkit -- atlas

# 一键导出图标（dump 内已包含 organize）
export-icons: dump-icons

# 一键导出 atlas（dump + atlas）
export-icon-atlas: dump-icons atlas-icons

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
    find {{ mod_src }} -type f | sort | sed 's|^|  |'
    @echo ""
    @echo "=== Rust 工作区 ==="
    cargo metadata --no-deps --format-version=1 2>/dev/null \
        | python3 -c "import sys,json; [print(f'  {p[\"name\"]}') for p in json.load(sys.stdin)['packages']]" \
        2>/dev/null || echo "  (cargo metadata 不可用)"
