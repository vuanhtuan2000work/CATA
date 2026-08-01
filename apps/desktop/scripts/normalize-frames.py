"""Make near-black backgrounds transparent, trim, and normalize subject scale."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

FRAMES_DIR = Path(__file__).resolve().parents[1] / "assets" / "frames"
BLACK_THRESHOLD = 28
UPRIGHT_HEIGHT = 512
LANDSCAPE_MAX_SIDE = 512  # walk/run/sleep gọn, file nhẹ hơn
LANDSCAPE_ASPECT = 1.25
LOCOMOTION_HEIGHT = 300  # walk/run chuẩn


def remove_black_bg(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            if r <= BLACK_THRESHOLD and g <= BLACK_THRESHOLD and b <= BLACK_THRESHOLD:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def trim(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(im.width, right + pad)
    bottom = min(im.height, bottom + pad)
    return im.crop((left, top, right, bottom))


def normalize(im: Image.Image, name: str = "") -> Image.Image:
    aspect = im.width / max(1, im.height)
    stem = Path(name).stem if name else ""
    if stem.startswith(("walk", "run")):
        if im.height == LOCOMOTION_HEIGHT:
            return im
        scale = LOCOMOTION_HEIGHT / im.height
        return im.resize(
            (max(1, round(im.width * scale)), LOCOMOTION_HEIGHT),
            Image.Resampling.LANCZOS,
        )
    if aspect >= LANDSCAPE_ASPECT:
        longest = max(im.width, im.height)
        if longest <= LANDSCAPE_MAX_SIDE:
            return im
        scale = LANDSCAPE_MAX_SIDE / longest
        return im.resize(
            (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
            Image.Resampling.LANCZOS,
        )
    # upright idle/talk/alert/drag/jump: fixed content height
    if im.height == UPRIGHT_HEIGHT:
        return im
    scale = UPRIGHT_HEIGHT / im.height
    return im.resize(
        (max(1, round(im.width * scale)), UPRIGHT_HEIGHT),
        Image.Resampling.LANCZOS,
    )


def process(path: Path) -> None:
    src = Image.open(path)
    out = remove_black_bg(src)
    out = trim(out)
    out = normalize(out, path.name)
    out.save(path, "PNG", optimize=True)
    print(f"{path.name}: {src.size[0]}x{src.size[1]} -> {out.size[0]}x{out.size[1]}")


def main() -> int:
    names = sys.argv[1:] or sorted(p.name for p in FRAMES_DIR.glob("*.png"))
    for name in names:
        path = FRAMES_DIR / name
        if not path.exists():
            print(f"skip missing {name}")
            continue
        process(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
