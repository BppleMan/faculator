#!/usr/bin/env python3
"""Check translation and player APIs in Factorio 2.0."""
import json

with open("assets/factorio-api/runtime-api.json") as f:
    api = json.load(f)

# Check LuaPlayer for translation methods
for cls in api["classes"]:
    if cls["name"] == "LuaPlayer":
        print("=== LuaPlayer translation-related methods ===")
        for m in cls.get("methods", []):
            if any(k in m["name"].lower() for k in ["translat", "locale", "request"]):
                params = ", ".join(p["name"] for p in m.get("parameters", []))
                desc = m.get("description", "")[:200]
                print(f"  {m['name']}({params})")
                print(f"    {desc}")
                print()
        break

# Check for on_string_translated event
print("=== Translation-related events ===")
for ev in api.get("events", []):
    if "translat" in ev["name"].lower() or "string" in ev["name"].lower():
        print(f"  {ev['name']}")
        desc = ev.get("description", "")[:200]
        print(f"    {desc}")
        for d in ev.get("data", []):
            print(f"    field: {d['name']} :: {d.get('type', '?')}")
        print()

# Check Factorio version info
print(f"API version: {api.get('application_version', '?')}")
print(f"API stage: {api.get('stage', '?')}")

# Check if 'storage' or 'global' is used
print("\n=== Global objects ===")
for g in api.get("global_objects", []):
    print(f"  {g['name']}: {g['type']}")

# Check 'storage' concept
for g in api.get("global_objects", []):
    if g["name"] in ("storage", "global"):
        print(f"\n  {g['name']} description: {g.get('description', 'N/A')[:300]}")
