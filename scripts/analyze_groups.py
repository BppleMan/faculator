#!/usr/bin/env python3
"""分析导出的 game-data.json，提取分组结构和 mod 归属信息。"""

import json
import sys
from collections import defaultdict

DATA_FILE = "assets/exported/game-data.json"

with open(DATA_FILE, "r") as f:
    data = json.load(f)

# 1. 物品分组结构
print("=" * 60)
print("物品分组 (item_groups) 及子分组")
print("=" * 60)
groups = sorted(data.get("item_groups", []), key=lambda g: g.get("order", ""))
for g in groups:
    subs = sorted(g.get("subgroups", []), key=lambda s: s.get("order", ""))
    sub_names = [s["name"] for s in subs]
    print(f"  {g['name']:<30} order={g['order']:<15} subgroups({len(subs)}): {', '.join(sub_names)}")

# 2. 统计每个 group 下的物品数量
print("\n" + "=" * 60)
print("每个 group 下的物品数量")
print("=" * 60)
item_by_group = defaultdict(int)
item_by_subgroup = defaultdict(int)
for item in data.get("items", []):
    item_by_group[item.get("group", "?")] += 1
    item_by_subgroup[item.get("subgroup", "?")] += 1
for g in sorted(item_by_group.keys()):
    print(f"  {g:<30} {item_by_group[g]} 个物品")

# 3. 配方按 group 分类
print("\n" + "=" * 60)
print("每个 group 下的配方数量")
print("=" * 60)
recipe_by_group = defaultdict(int)
for r in data.get("recipes", []):
    recipe_by_group[r.get("group", "?")] += 1
for g in sorted(recipe_by_group.keys()):
    print(f"  {g:<30} {recipe_by_group[g]} 个配方")

# 4. 科技按 group 分类
print("\n" + "=" * 60)
print("每个 group 下的科技数量")
print("=" * 60)
tech_by_group = defaultdict(int)
for t in data.get("technologies", []):
    tech_by_group[t.get("group", "?")] += 1
for g in sorted(tech_by_group.keys()):
    print(f"  {g:<30} {tech_by_group[g]} 个科技")

# 5. 流体按 group 分类
print("\n" + "=" * 60)
print("每个 group 下的流体数量")
print("=" * 60)
fluid_by_group = defaultdict(int)
for f_ in data.get("fluids", []):
    fluid_by_group[f_.get("group", "?")] += 1
for g in sorted(fluid_by_group.keys()):
    print(f"  {g:<30} {fluid_by_group[g]} 个流体")

# 6. 已安装的 mods
print("\n" + "=" * 60)
print("已安装 Mods")
print("=" * 60)
mods = data.get("_meta", {}).get("active_mods", {})
for name, ver in sorted(mods.items()):
    print(f"  {name:<30} v{ver}")

# 7. 检查实体/配方的 subgroup 分布
print("\n" + "=" * 60)
print("实体按 group 分类")
print("=" * 60)
entity_by_group = defaultdict(int)
for e in data.get("entities", []):
    entity_by_group[e.get("group", "?")] += 1
for g in sorted(entity_by_group.keys()):
    print(f"  {g:<30} {entity_by_group[g]} 个实体")

# 8. 物品按 subgroup 详细分布（前20）
print("\n" + "=" * 60)
print("物品按 subgroup 分布 (前20)")
print("=" * 60)
for sg, cnt in sorted(item_by_subgroup.items(), key=lambda x: -x[1])[:20]:
    print(f"  {sg:<40} {cnt}")

# 9. 各大类原型总数
print("\n" + "=" * 60)
print("各类原型总数")
print("=" * 60)
for key in sorted(data.keys()):
    if key == "_meta":
        continue
    val = data[key]
    if isinstance(val, list):
        print(f"  {key:<30} {len(val)}")
