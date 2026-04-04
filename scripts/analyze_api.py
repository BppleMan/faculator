#!/usr/bin/env python3
"""Analyze Factorio runtime-api.json to extract key class info for mod development."""
import json
import sys

API_PATH = "assets/factorio-api/runtime-api.json"

def load_api():
    with open(API_PATH) as f:
        return json.load(f)

def list_classes(api):
    for cls in api.get("classes", []):
        print(cls["name"])

def show_class(api, name):
    for cls in api.get("classes", []):
        if cls["name"] == name:
            print(f"=== {name} ===")
            if cls.get("description"):
                print(f"  {cls['description'][:200]}")
            print()
            for m in cls.get("methods", []):
                params = ", ".join(p["name"] for p in m.get("parameters", []))
                print(f"  method: {m['name']}({params})")
            print()
            for a in cls.get("attributes", []):
                rw = a.get("read_type", {})
                if isinstance(rw, str):
                    type_str = rw
                elif isinstance(rw, dict):
                    type_str = rw.get("complex_type", rw.get("value", "?"))
                    if isinstance(type_str, dict):
                        type_str = str(type_str)
                else:
                    type_str = str(rw)
                print(f"  attr: {a['name']} :: {type_str}")
            return
    print(f"Class '{name}' not found")

def show_globals(api):
    print("=== Global Objects ===")
    for g in api.get("global_objects", []):
        print(f"  {g['name']}: {g['type']}")
    print()
    print("=== Global Functions ===")
    for g in api.get("global_functions", []):
        print(f"  {g['name']}")

def find_write_methods(api):
    """Find methods related to file writing / serialization."""
    keywords = ["write", "file", "log", "json", "serial", "table_to", "encode"]
    for cls in api.get("classes", []):
        for m in cls.get("methods", []):
            if any(k in m["name"].lower() for k in keywords):
                params = ", ".join(p["name"] for p in m.get("parameters", []))
                desc = m.get("description", "")[:120]
                print(f"  {cls['name']}.{m['name']}({params})")
                if desc:
                    print(f"    {desc}")

def show_key_prototypes(api):
    """Show attributes for all key prototype classes."""
    targets = [
        "LuaRecipePrototype", "LuaItemPrototype", "LuaEntityPrototype",
        "LuaFluidPrototype", "LuaTechnologyPrototype", "LuaGroup",
        "LuaRecipeCategoryPrototype", "LuaModuleCategoryPrototype",
        "LuaQualityPrototype", "LuaSpaceLocationPrototype",
        "LuaSpaceConnectionPrototype", "LuaFuelCategoryPrototype",
        "LuaResourceCategoryPrototype", "LuaEquipmentPrototype",
        "LuaEquipmentGridPrototype",
    ]
    for cls_name in targets:
        for cls in api.get("classes", []):
            if cls["name"] == cls_name:
                attrs = [a["name"] for a in cls.get("attributes", [])]
                print(f"=== {cls_name} ({len(attrs)} attrs) ===")
                print(", ".join(attrs))
                print()
                break

def show_helpers(api):
    """Show LuaHelpers and LuaBootstrap details."""
    for name in ["LuaHelpers", "LuaBootstrap"]:
        for cls in api.get("classes", []):
            if cls["name"] == name:
                show_class(api, name)
                print()
                break

if __name__ == "__main__":
    api = load_api()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"

    if cmd == "classes":
        list_classes(api)
    elif cmd == "class" and len(sys.argv) > 2:
        show_class(api, sys.argv[2])
    elif cmd == "globals":
        show_globals(api)
    elif cmd == "write":
        find_write_methods(api)
    elif cmd == "prototypes":
        show_key_prototypes(api)
    elif cmd == "helpers":
        show_helpers(api)
    else:
        print("Usage: python3 scripts/analyze_api.py <command>")
        print("  classes      - list all classes")
        print("  class <Name> - show class details")
        print("  globals      - show global objects/functions")
        print("  write        - find file writing / serialization methods")
        print("  prototypes   - show key prototype class attrs")
        print("  helpers      - show LuaHelpers and LuaBootstrap")
