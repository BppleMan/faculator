#!/usr/bin/env python3
"""Build the fixed-grid, seam-safe conveyor topology sheet."""

from pathlib import Path
import math

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = ROOT / "prototype" / "design-assets" / "transport"
ASSET_DIR = ROOT / "assets" / "prototype" / "transport"
CELL = 64
RUNTIME_CELL = 40
SHEET_COLUMNS = 4
CENTER = RUNTIME_CELL // 2
BAND_WIDTH = 22
BAND_START = CENTER - BAND_WIDTH // 2
BAND_END = BAND_START + BAND_WIDTH
CORNER_SOURCE_BOX = (952, 62, 1216, 312)
CORNER_RUNTIME_SCALE = 0.16
CORNER_FILLET_RADIUS = 10
PORT_LOCK_DEPTH = 4

NORTH = 1
EAST = 2
SOUTH = 4
WEST = 8


def rotate_mask(mask: int, quarter_turns: int) -> int:
    result = mask
    for _ in range(quarter_turns % 4):
        rotated = 0
        if result & NORTH:
            rotated |= WEST
        if result & WEST:
            rotated |= SOUTH
        if result & SOUTH:
            rotated |= EAST
        if result & EAST:
            rotated |= NORTH
        result = rotated
    return result


def trim_visible(image: Image.Image, threshold: int = 96) -> Image.Image:
    alpha = image.getchannel("A").point(lambda value: 255 if value >= threshold else 0)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("The selected source crop contains no visible artwork")
    return image.crop(bounds)


def crop_art(source: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    return trim_visible(source.crop(box))


def contain(image: Image.Image, width: int, height: int) -> Image.Image:
    ratio = min(width / image.width, height / image.height)
    size = (max(1, round(image.width * ratio)), max(1, round(image.height * ratio)))
    return image.resize(size, Image.Resampling.LANCZOS)


def centered_tile(image: Image.Image, *, fill: bool = False, padding: int = 0) -> Image.Image:
    if fill:
        artwork = image.resize((CELL, CELL), Image.Resampling.LANCZOS)
    else:
        artwork = contain(image, CELL - padding * 2, CELL - padding * 2)
    tile = Image.new("RGBA", (CELL, CELL))
    tile.alpha_composite(artwork, ((CELL - artwork.width) // 2, (CELL - artwork.height) // 2))
    return tile


def rotate_tile(tile: Image.Image, quarter_turns: int) -> Image.Image:
    return tile.rotate(quarter_turns * 90, resample=Image.Resampling.BICUBIC, expand=False)


def coupling_end(single: Image.Image, horizontal: Image.Image) -> Image.Image:
    tile = Image.new("RGBA", (CELL, CELL))
    tile.alpha_composite(horizontal.crop((CELL // 2, 0, CELL, CELL)), (CELL // 2, 0))
    coupling = single.resize((34, 34), Image.Resampling.LANCZOS)
    tile.alpha_composite(coupling, (15, 15))
    return tile


def rotated_variants(base_tile: Image.Image, base_mask: int, masks: tuple[int, ...]) -> dict[int, Image.Image]:
    variants: dict[int, Image.Image] = {}
    for turns in range(4):
        mask = rotate_mask(base_mask, turns)
        if mask in masks:
            variants[mask] = rotate_tile(base_tile, turns)
    return variants


def build_sheet(
    source_name: str,
    destination_name: str,
    boxes: dict[str, tuple[int, int, int, int]],
    corner_mask: int,
    junction_mask: int,
    end_mask: int,
    single_ends: bool = False,
) -> None:
    source = Image.open(SOURCE_DIR / source_name).convert("RGBA")

    single = centered_tile(crop_art(source, boxes["single"]), padding=5)
    horizontal = centered_tile(crop_art(source, boxes["horizontal"]))
    vertical = rotate_tile(horizontal, 1)
    corner = centered_tile(crop_art(source, boxes["corner"]), fill=True)
    junction = centered_tile(crop_art(source, boxes["junction"]), fill=True)
    cross = centered_tile(crop_art(source, boxes["cross"]), fill=True)
    end = coupling_end(single, horizontal) if single_ends else centered_tile(crop_art(source, boxes["end"]))

    tiles: dict[int, Image.Image] = {
        0: single,
        NORTH | SOUTH: vertical,
        EAST | WEST: horizontal,
        NORTH | EAST | SOUTH | WEST: cross,
    }
    tiles.update(rotated_variants(corner, corner_mask, (3, 6, 9, 12)))
    tiles.update(rotated_variants(junction, junction_mask, (7, 11, 13, 14)))
    tiles.update(rotated_variants(end, end_mask, (1, 2, 4, 8)))

    sheet = Image.new("RGBA", (CELL * SHEET_COLUMNS, CELL * SHEET_COLUMNS))
    for mask in range(16):
        tile = tiles.get(mask, single)
        x = (mask % SHEET_COLUMNS) * CELL
        y = (mask // SHEET_COLUMNS) * CELL
        sheet.alpha_composite(tile, (x, y))
    sheet.save(ASSET_DIR / destination_name, optimize=True)


def centered_runtime_components(source_tiles: dict[int, Image.Image]) -> dict[str, Image.Image]:
    """Build every arm from one straight belt, centered on the tile's fixed axes."""
    straight = source_tiles[EAST | WEST].resize(
        (RUNTIME_CELL, RUNTIME_CELL),
        Image.Resampling.LANCZOS,
    )
    horizontal_source = Image.new("RGBA", (RUNTIME_CELL, RUNTIME_CELL))
    horizontal_source.alpha_composite(
        straight.crop((0, BAND_START, RUNTIME_CELL, BAND_END)),
        (0, BAND_START),
    )

    west = horizontal_source.crop((0, 0, CENTER, RUNTIME_CELL))
    east = west.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    horizontal = Image.new("RGBA", (RUNTIME_CELL, RUNTIME_CELL))
    horizontal.alpha_composite(west, (0, 0))
    horizontal.alpha_composite(east, (CENTER, 0))

    vertical_source = horizontal.transpose(Image.Transpose.ROTATE_90)
    north = vertical_source.crop((0, 0, RUNTIME_CELL, CENTER))
    south = north.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    vertical = Image.new("RGBA", (RUNTIME_CELL, RUNTIME_CELL))
    vertical.alpha_composite(north, (0, 0))
    vertical.alpha_composite(south, (0, CENTER))

    hub_source = trim_visible(source_tiles[0])
    hub = hub_source.resize((BAND_WIDTH, BAND_WIDTH), Image.Resampling.LANCZOS)
    return {
        "west": west,
        "east": east,
        "north": north,
        "south": south,
        "horizontal": horizontal,
        "vertical": vertical,
        "hub": hub,
    }


def source_edge_center(image: Image.Image, direction: int, depth: int = 8) -> float:
    """Measure the alpha-weighted center of one open port in the source artwork."""
    alpha = image.getchannel("A")
    samples: list[tuple[int, int]] = []
    if direction == SOUTH:
        for y in range(max(0, image.height - depth), image.height):
            for x in range(image.width):
                weight = alpha.getpixel((x, y))
                if weight >= 96:
                    samples.append((x, weight))
    elif direction == EAST:
        for x in range(max(0, image.width - depth), image.width):
            for y in range(image.height):
                weight = alpha.getpixel((x, y))
                if weight >= 96:
                    samples.append((y, weight))
    else:
        raise ValueError("corner source only exposes south and east ports")

    if not samples:
        raise ValueError(f"missing source port for direction {direction}")
    total_weight = sum(weight for _, weight in samples)
    return sum(position * weight for position, weight in samples) / total_weight


def build_south_east_elbow() -> Image.Image:
    """Fit the authored industrial elbow to the centered S/E runtime ports."""
    atlas = Image.open(SOURCE_DIR / "conveyor-atlas.png").convert("RGBA")
    source = trim_visible(atlas.crop(CORNER_SOURCE_BOX))
    south_center = source_edge_center(source, SOUTH)
    east_center = source_edge_center(source, EAST)
    size = (
        round(source.width * CORNER_RUNTIME_SCALE),
        round(source.height * CORNER_RUNTIME_SCALE),
    )
    artwork = source.resize(size, Image.Resampling.LANCZOS)
    destination = (
        round(CENTER - south_center * CORNER_RUNTIME_SCALE),
        round(CENTER - east_center * CORNER_RUNTIME_SCALE),
    )
    tile = Image.new("RGBA", (RUNTIME_CELL, RUNTIME_CELL))
    tile.alpha_composite(artwork, destination)
    return tile


def rounded_corner_tiles() -> dict[int, Image.Image]:
    """Create all four exact rotations from one centered, authored 90-degree elbow."""
    tile = build_south_east_elbow().transpose(Image.Transpose.ROTATE_90)
    mask = NORTH | EAST
    corners: dict[int, Image.Image] = {}
    for _ in range(4):
        corners[mask] = tile
        tile = tile.transpose(Image.Transpose.ROTATE_90)
        mask = rotate_mask(mask, 1)
    return corners


def lock_centered_ports(
    tile: Image.Image,
    mask: int,
    components: dict[str, Image.Image],
) -> Image.Image:
    """Overwrite every edge approach with the canonical tangent strip for that axis."""
    result = tile.copy()
    strips = {
        WEST: (components["horizontal"], (0, 0, PORT_LOCK_DEPTH, RUNTIME_CELL)),
        EAST: (
            components["horizontal"],
            (RUNTIME_CELL - PORT_LOCK_DEPTH, 0, RUNTIME_CELL, RUNTIME_CELL),
        ),
        NORTH: (components["vertical"], (0, 0, RUNTIME_CELL, PORT_LOCK_DEPTH)),
        SOUTH: (
            components["vertical"],
            (0, RUNTIME_CELL - PORT_LOCK_DEPTH, RUNTIME_CELL, RUNTIME_CELL),
        ),
    }
    for direction, (source, box) in strips.items():
        if mask & direction:
            result.paste(source.crop(box), box)
        else:
            result.paste(Image.new("RGBA", (box[2] - box[0], box[3] - box[1])), box)
    return result


def build_centerline_tiles(source_tiles: dict[int, Image.Image]) -> dict[int, Image.Image]:
    """Compose all 16 masks from fixed-axis arms and centered industrial elbows."""
    components = centered_runtime_components(source_tiles)
    corners = rounded_corner_tiles()
    tiles: dict[int, Image.Image] = {}

    for mask in range(16):
        if mask in corners:
            tiles[mask] = corners[mask]
            continue
        tile = Image.new("RGBA", (RUNTIME_CELL, RUNTIME_CELL))
        if mask & WEST:
            tile.alpha_composite(components["west"], (0, 0))
        if mask & EAST:
            tile.alpha_composite(components["east"], (CENTER, 0))
        if mask & NORTH:
            tile.alpha_composite(components["north"], (0, 0))
        if mask & SOUTH:
            tile.alpha_composite(components["south"], (0, CENTER))

        if mask not in (NORTH | SOUTH, EAST | WEST):
            tile.alpha_composite(components["hub"], (BAND_START, BAND_START))
        tiles[mask] = tile

    return {
        mask: lock_centered_ports(tile, mask, components)
        for mask, tile in tiles.items()
    }


def edge_bytes(tile: Image.Image, direction: int) -> bytes:
    if direction == WEST:
        return tile.crop((0, 0, 1, RUNTIME_CELL)).tobytes()
    if direction == EAST:
        return tile.crop((RUNTIME_CELL - 1, 0, RUNTIME_CELL, RUNTIME_CELL)).tobytes()
    if direction == NORTH:
        return tile.crop((0, 0, RUNTIME_CELL, 1)).tobytes()
    return tile.crop((0, RUNTIME_CELL - 1, RUNTIME_CELL, RUNTIME_CELL)).tobytes()


def validate_edge_contract(tiles: dict[int, Image.Image]) -> None:
    horizontal = edge_bytes(tiles[EAST | WEST], WEST)
    vertical = edge_bytes(tiles[NORTH | SOUTH], NORTH)
    transparent = bytes(RUNTIME_CELL * 4)

    for mask, tile in tiles.items():
        for direction in (WEST, EAST):
            expected = horizontal if mask & direction else transparent
            if edge_bytes(tile, direction) != expected:
                raise ValueError(f"horizontal port mismatch for mask {mask} direction {direction}")
        for direction in (NORTH, SOUTH):
            expected = vertical if mask & direction else transparent
            if edge_bytes(tile, direction) != expected:
                raise ValueError(f"vertical port mismatch for mask {mask} direction {direction}")


def north_east_corner_allowed_mask() -> Image.Image:
    """Allow the authored elbow body while reserving the two closed edge strips."""
    allowed = Image.new("L", (RUNTIME_CELL, RUNTIME_CELL))
    allowed.paste(
        255,
        (PORT_LOCK_DEPTH, 0, RUNTIME_CELL, RUNTIME_CELL - PORT_LOCK_DEPTH),
    )
    return allowed


def centerline_allowed_mask(mask: int) -> Image.Image:
    """Return the exact constant-width corridor allowed by the topology skeleton."""
    corner_masks = (NORTH | EAST, WEST | NORTH, SOUTH | WEST, EAST | SOUTH)
    if mask in corner_masks:
        allowed = north_east_corner_allowed_mask()
        current_mask = NORTH | EAST
        while current_mask != mask:
            allowed = allowed.transpose(Image.Transpose.ROTATE_90)
            current_mask = rotate_mask(current_mask, 1)
        return allowed

    allowed = Image.new("L", (RUNTIME_CELL, RUNTIME_CELL))
    allowed.paste(255, (BAND_START, BAND_START, BAND_END, BAND_END))
    if mask & WEST:
        allowed.paste(255, (0, BAND_START, CENTER, BAND_END))
    if mask & EAST:
        allowed.paste(255, (CENTER, BAND_START, RUNTIME_CELL, BAND_END))
    if mask & NORTH:
        allowed.paste(255, (BAND_START, 0, BAND_END, CENTER))
    if mask & SOUTH:
        allowed.paste(255, (BAND_START, CENTER, BAND_END, RUNTIME_CELL))
    return allowed


def validate_centerline_contract(tiles: dict[int, Image.Image]) -> None:
    """Reject shifted ports, broken paths, and artwork leaking through closed edges."""
    center_pixels = (CENTER - 1, CENTER)
    for mask, tile in tiles.items():
        alpha = tile.getchannel("A")
        allowed = centerline_allowed_mask(mask)
        for y in range(RUNTIME_CELL):
            for x in range(RUNTIME_CELL):
                if alpha.getpixel((x, y)) and not allowed.getpixel((x, y)):
                    raise ValueError(f"off-axis artwork for mask {mask} at {x},{y}")

        corner_masks = (NORTH | EAST, WEST | NORTH, SOUTH | WEST, EAST | SOUTH)
        if mask in corner_masks:
            normalized = tile
            current_mask = mask
            while current_mask != NORTH | EAST:
                normalized = normalized.transpose(Image.Transpose.ROTATE_270)
                current_mask = rotate_mask(current_mask, 3)
            normalized_alpha = normalized.getchannel("A")

            def has_alpha_near(x: float, y: float) -> bool:
                point_x = round(x)
                point_y = round(y)
                return any(
                    normalized_alpha.getpixel((sample_x, sample_y))
                    for sample_y in range(max(0, point_y - 1), min(RUNTIME_CELL, point_y + 2))
                    for sample_x in range(max(0, point_x - 1), min(RUNTIME_CELL, point_x + 2))
                )

            tangent_y = CENTER - CORNER_FILLET_RADIUS
            tangent_x = CENTER + CORNER_FILLET_RADIUS
            path_points = [(CENTER, y) for y in range(tangent_y + 1)]
            path_points.extend(
                (
                    tangent_x + CORNER_FILLET_RADIUS * math.cos(angle),
                    tangent_y + CORNER_FILLET_RADIUS * math.sin(angle),
                )
                for angle in (
                    math.pi - step * (math.pi / 2) / (CORNER_FILLET_RADIUS * 3)
                    for step in range(CORNER_FILLET_RADIUS * 3 + 1)
                )
            )
            path_points.extend((x, CENTER) for x in range(tangent_x, RUNTIME_CELL))
            if not all(has_alpha_near(x, y) for x, y in path_points):
                raise ValueError(f"broken curved centerline for mask {mask}")
            continue

        lines = {
            WEST: ((x, cy) for x in range(0, CENTER) for cy in center_pixels),
            EAST: ((x, cy) for x in range(CENTER, RUNTIME_CELL) for cy in center_pixels),
            NORTH: ((cx, y) for y in range(0, CENTER) for cx in center_pixels),
            SOUTH: ((cx, y) for y in range(CENTER, RUNTIME_CELL) for cx in center_pixels),
        }
        for direction, points in lines.items():
            if not mask & direction:
                continue
            grouped = list(points)
            for index in range(0, len(grouped), len(center_pixels)):
                if not any(alpha.getpixel(point) for point in grouped[index:index + len(center_pixels)]):
                    raise ValueError(f"broken centerline for mask {mask} direction {direction}")


def build_seamless_runtime_sheet(source_name: str, destination_name: str) -> dict[int, Image.Image]:
    source = Image.open(ASSET_DIR / source_name).convert("RGBA")
    source_tiles = {
        mask: source.crop((
            (mask % SHEET_COLUMNS) * CELL,
            (mask // SHEET_COLUMNS) * CELL,
            (mask % SHEET_COLUMNS + 1) * CELL,
            (mask // SHEET_COLUMNS + 1) * CELL,
        ))
        for mask in range(16)
    }

    tiles = build_centerline_tiles(source_tiles)
    validate_edge_contract(tiles)
    validate_centerline_contract(tiles)

    sheet = Image.new("RGBA", (RUNTIME_CELL * SHEET_COLUMNS, RUNTIME_CELL * SHEET_COLUMNS))
    for mask, tile in tiles.items():
        sheet.alpha_composite(tile, (
            (mask % SHEET_COLUMNS) * RUNTIME_CELL,
            (mask // SHEET_COLUMNS) * RUNTIME_CELL,
        ))
    sheet.save(ASSET_DIR / destination_name, optimize=True)
    return tiles


def build_validation_preview(tiles: dict[int, Image.Image]) -> None:
    gap = 6
    preview_size = RUNTIME_CELL * 3 + gap * 4
    preview = Image.new("RGBA", (preview_size, preview_size), (245, 247, 248, 255))
    examples = [
        NORTH | EAST | SOUTH | WEST,
        NORTH | SOUTH,
        EAST | WEST,
        NORTH | SOUTH | WEST,
        NORTH | EAST,
        EAST | SOUTH | WEST,
        SOUTH | WEST,
        EAST | SOUTH,
        NORTH | EAST | WEST,
    ]
    for index, mask in enumerate(examples):
        column = index % 3
        row = index // 3
        x = gap + column * (RUNTIME_CELL + gap)
        y = gap + row * (RUNTIME_CELL + gap)
        cell = Image.new("RGBA", (RUNTIME_CELL, RUNTIME_CELL), (82, 181, 229, 255))
        draw = ImageDraw.Draw(cell)
        draw.line((CENTER, 0, CENTER, RUNTIME_CELL - 1), fill=(10, 21, 29, 255), width=1)
        draw.line((0, CENTER, RUNTIME_CELL - 1, CENTER), fill=(10, 21, 29, 255), width=1)
        cell.alpha_composite(tiles[mask])
        preview.alpha_composite(cell, (x, y))
    preview.resize((preview.width * 3, preview.height * 3), Image.Resampling.NEAREST).save(
        SOURCE_DIR / "conveyor-seam-validation.png",
        optimize=True,
    )


def main() -> None:
    build_sheet(
        "conveyor-atlas.png",
        "conveyor-tiles.png",
        {
            "single": (48, 60, 286, 292),
            "horizontal": (324, 104, 614, 278),
            "corner": (952, 62, 1216, 312),
            "junction": (930, 348, 1218, 610),
            "cross": (924, 922, 1228, 1228),
            "end": (930, 680, 1218, 900),
        },
        corner_mask=SOUTH | EAST,
        junction_mask=NORTH | EAST | WEST,
        end_mask=WEST,
    )
    tiles = build_seamless_runtime_sheet("conveyor-tiles.png", "conveyor-tiles-seamless.png")
    build_validation_preview(tiles)


if __name__ == "__main__":
    main()
