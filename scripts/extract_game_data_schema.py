#!/usr/bin/env python3
"""Derive a game-data schema summary from game-data.json and prototype-api.json."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
GAME_DATA_PATH = ROOT / "assets/exported/game-data.json"
PROTOTYPE_API_PATH = ROOT / "assets/factorio-api/prototype-api.json"

TOP_LEVEL_PROTOTYPES = {
    "recipe_categories": "RecipeCategory",
    "fuel_categories": "FuelCategory",
    "resource_categories": "ResourceCategory",
    "module_categories": "ModuleCategory",
    "item_groups": "ItemGroup",
    "items": "ItemPrototype",
    "fluids": "FluidPrototype",
    "recipes": "RecipePrototype",
    "technologies": "TechnologyPrototype",
    "qualities": "QualityPrototype",
    "space_locations": "SpaceLocationPrototype",
    "space_connections": "SpaceConnectionPrototype",
    "equipment": "EquipmentPrototype",
    "equipment_grids": "EquipmentGridPrototype",
}

CONCEPT_TYPES = [
    "Color",
    "SurfaceCondition",
    "IngredientPrototype",
    "ProductPrototype",
    "EquipmentShape",
    "TechnologyTrigger",
]


def json_kind(value: Any) -> str:
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "bool"
    if isinstance(value, int) and not isinstance(value, bool):
        return "int"
    if isinstance(value, float):
        return "float"
    if isinstance(value, str):
        return "string"
    if isinstance(value, list):
        return "array"
    if isinstance(value, dict):
        return "object"
    return type(value).__name__


def load_json(path: Path) -> Any:
    return json.loads(path.read_text())


def load_prototype_index(api: dict[str, Any]) -> dict[str, dict[str, Any]]:
    index: dict[str, dict[str, Any]] = {}
    for bucket in ("prototypes", "types"):
        for item in api.get(bucket, []):
            index[item["name"]] = item
    return index


def stringify_type(value: Any) -> str:
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, sort_keys=True)


def inherited_properties(
    name: str,
    index: dict[str, dict[str, Any]],
) -> list[tuple[str, str, bool]]:
    result: list[tuple[str, str, bool]] = []
    seen: set[str] = set()

    def visit(current: str) -> None:
        item = index.get(current)
        if not item:
            return
        parent = item.get("parent")
        if parent:
            visit(parent)
        for prop in item.get("properties", []):
            prop_name = prop["name"]
            if prop_name in seen:
                continue
            seen.add(prop_name)
            result.append((prop_name, stringify_type(prop.get("type")), bool(prop.get("optional"))))

    visit(name)
    return result


def summarize_collection(name: str, values: list[Any]) -> str:
    lines = [f"## `{name}`", "", f"- count: `{len(values)}`"]

    if not values:
        lines.extend(["", "_empty collection_", ""])
        return "\n".join(lines)

    field_counts: Counter[str] = Counter()
    field_kinds: dict[str, set[str]] = defaultdict(set)
    nested_paths: dict[str, set[str]] = defaultdict(set)

    def walk(path: str, value: Any) -> None:
        nested_paths[path].add(json_kind(value))
        if isinstance(value, dict):
            for key, child in value.items():
                child_path = f"{path}.{key}" if path else key
                walk(child_path, child)
        elif isinstance(value, list):
            for child in value:
                child_path = f"{path}[]"
                walk(child_path, child)

    for value in values:
        if not isinstance(value, dict):
            continue
        for key, child in value.items():
            field_counts[key] += 1
            field_kinds[key].add(json_kind(child))
            walk(key, child)

    lines.extend(["", "| field | present | kinds |", "| --- | ---: | --- |"])
    for key in sorted(field_counts):
        lines.append(f"| `{key}` | `{field_counts[key]}/{len(values)}` | `{', '.join(sorted(field_kinds[key]))}` |")

    interesting_paths = []
    for path, kinds in sorted(nested_paths.items()):
        if "." not in path:
            continue
        if kinds == {"object"}:
            continue
        interesting_paths.append((path, kinds))

    if interesting_paths:
        lines.extend(["", "### Nested Paths", "", "| path | kinds |", "| --- | --- |"])
        for path, kinds in interesting_paths:
            lines.append(f"| `{path}` | `{', '.join(sorted(kinds))}` |")

    lines.append("")
    return "\n".join(lines)


def summarize_object(name: str, value: dict[str, Any]) -> str:
    lines = [f"## `{name}`", "", "| field | kinds |", "| --- | --- |"]
    for key in sorted(value):
        lines.append(f"| `{key}` | `{json_kind(value[key])}` |")
    lines.append("")
    return "\n".join(lines)


def summarize_prototype(name: str, index: dict[str, dict[str, Any]]) -> str:
    props = inherited_properties(name, index)
    lines = [f"## Prototype `{name}`", ""]
    if not props:
        lines.extend(["_no properties_", ""])
        return "\n".join(lines)
    lines.extend(["| property | type | optional |", "| --- | --- | ---: |"])
    for prop_name, prop_type, optional in props:
        lines.append(f"| `{prop_name}` | `{prop_type}` | `{optional}` |")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    game_data = load_json(GAME_DATA_PATH)
    prototype_api = load_json(PROTOTYPE_API_PATH)
    prototype_index = load_prototype_index(prototype_api)

    print("# Derived game-data schema")
    print()
    print("Facts used:")
    print(f"- `{GAME_DATA_PATH.relative_to(ROOT)}`")
    print(f"- `{PROTOTYPE_API_PATH.relative_to(ROOT)}`")
    print()

    print("# Snapshot Schema")
    print()
    print("Top-level keys:")
    for key in game_data:
        print(f"- `{key}`")
    print()

    for key, value in game_data.items():
        if isinstance(value, list):
            print(summarize_collection(key, value))
        elif isinstance(value, dict):
            print(summarize_object(key, value))
        else:
            print(f"## `{key}`\n\n- kind: `{json_kind(value)}`\n")

    print("# Prototype API")
    print()
    for collection, prototype_name in TOP_LEVEL_PROTOTYPES.items():
        print(f"### `{collection}` -> `{prototype_name}`")
        print()
        print(summarize_prototype(prototype_name, prototype_index))

    print("# Concept Types")
    print()
    for concept_name in CONCEPT_TYPES:
        print(summarize_prototype(concept_name, prototype_index))


if __name__ == "__main__":
    main()
