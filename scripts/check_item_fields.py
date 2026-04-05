#!/usr/bin/env python3
import json, pathlib

data = json.loads(pathlib.Path("assets/exported/game-data.json").read_text())

def is_frac(v):
    return isinstance(v, float) and v != int(v)

items = data["items"]
print("=== Item ===")
for f in ["weight", "fuel_acceleration_multiplier", "fuel_top_speed_multiplier", "fuel_emissions_multiplier"]:
    vals = [item[f] for item in items if f in item]
    print(f"  {f}: frac={any(is_frac(v) for v in vals)}  samples={sorted(set(vals))[:6]}")

print("\n=== ItemProduct ===")
prods = []
for item in items:
    prods += item.get("rocket_launch_products") or []
for r in data["recipes"]:
    prods += list(r.get("ingredients", {}).values()) if isinstance(r.get("ingredients"), dict) else r.get("ingredients", [])
    prods += list(r.get("products", {}).values()) if isinstance(r.get("products"), dict) else r.get("products", [])
for f in ["amount", "amount_min", "amount_max", "probability", "temperature",
          "catalyst_amount", "percent_spoiled", "ignored_by_stats", "ignored_by_productivity"]:
    vals = [p[f] for p in prods if f in p and p[f] is not None]
    print(f"  {f}: frac={any(is_frac(v) for v in vals)}  samples={sorted(set(vals))[:6]}")

