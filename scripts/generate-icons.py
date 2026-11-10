"""Generate the FinTrack app icon set for Electron and Android.

Design: indigo gradient tile with three ascending white bars (a "tracking" motif).
Rendered at 4x and downsampled for smooth edges.
"""
from PIL import Image, ImageDraw

INDIGO_TOP = (99, 102, 241)     # indigo-500
INDIGO_BOTTOM = (67, 56, 202)   # indigo-700
SS = 4                          # supersample factor


def rounded_rect_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def circle_mask(size):
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    return mask


def gradient(size):
    img = Image.new("RGB", (1, size))
    for y in range(size):
        t = y / max(size - 1, 1)
        img.putpixel((0, y), tuple(round(INDIGO_TOP[i] + (INDIGO_BOTTOM[i] - INDIGO_TOP[i]) * t) for i in range(3)))
    return img.resize((size, size), Image.BILINEAR)


def draw_bars(draw, box, color):
    """Three bottom-aligned rounded bars of increasing height inside `box`."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    bar_w = w * 0.20
    gap = w * 0.10
    total = bar_w * 3 + gap * 2
    start = x0 + (w - total) / 2
    heights = (0.46, 0.70, 0.94)
    for i, frac in enumerate(heights):
        bx = start + i * (bar_w + gap)
        by = y1 - h * frac
        draw.rounded_rectangle([bx, by, bx + bar_w, y1], radius=bar_w / 2, fill=color)


def make(size, *, bg, rounded, glyph_scale):
    """Render one icon.

    rounded: True  -> rounded-square tile
             False -> circular tile
             None  -> full-bleed square (for maskable / iOS icons)
    """
    canvas = size * SS
    img = Image.new("RGBA", (canvas, canvas), (0, 0, 0, 0))

    if bg == "gradient":
        base = gradient(canvas).convert("RGBA")
        if rounded is None:
            img.paste(base, (0, 0))
        else:
            mask = rounded_rect_mask(canvas, int(canvas * 0.22)) if rounded else circle_mask(canvas)
            img.paste(base, (0, 0), mask)
    elif bg == "solid":
        base = Image.new("RGBA", (canvas, canvas), INDIGO_BOTTOM + (255,))
        if rounded is None:
            img.paste(base, (0, 0))
        else:
            mask = rounded_rect_mask(canvas, int(canvas * 0.22)) if rounded else circle_mask(canvas)
            img.paste(base, (0, 0), mask)

    glyph = glyph_scale * canvas
    cx = cy = canvas / 2
    box = (cx - glyph / 2, cy - glyph / 2, cx + glyph / 2, cy + glyph / 2)
    draw_bars(ImageDraw.Draw(img), box, (255, 255, 255, 255))

    return img.resize((size, size), Image.LANCZOS)


# Run from the repo root: python3 scripts/generate-icons.py

# Electron / generic desktop icon.
make(1024, bg="gradient", rounded=True, glyph_scale=0.56).save("build/icon.png")

# Android launcher icons (legacy, rounded square and circular variants).
LEGACY = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
FOREGROUND = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}

for density, size in LEGACY.items():
    base = f"android/app/src/main/res/mipmap-{density}"
    make(size, bg="gradient", rounded=True, glyph_scale=0.60).save(f"{base}/ic_launcher.png")
    make(size, bg="gradient", rounded=False, glyph_scale=0.60).save(f"{base}/ic_launcher_round.png")

for density, size in FOREGROUND.items():
    base = f"android/app/src/main/res/mipmap-{density}"
    # Adaptive foreground sits on the solid background colour; keep the glyph in the
    # safe zone (~66% of the tile) so no launcher mask clips it.
    make(size, bg=None, rounded=False, glyph_scale=0.42).save(f"{base}/ic_launcher_foreground.png")

print("icons written")


# Android splash screens: solid indigo with the centred bars glyph, matching the
# launcher icon so the launch screen and app feel like one product.
SPLASHES = {
    "drawable/splash.png": (480, 320),
    "drawable-land-mdpi/splash.png": (480, 320),
    "drawable-land-hdpi/splash.png": (800, 480),
    "drawable-land-xhdpi/splash.png": (1280, 720),
    "drawable-land-xxhdpi/splash.png": (1600, 960),
    "drawable-land-xxxhdpi/splash.png": (1920, 1280),
    "drawable-port-mdpi/splash.png": (320, 480),
    "drawable-port-hdpi/splash.png": (480, 800),
    "drawable-port-xhdpi/splash.png": (720, 1280),
    "drawable-port-xxhdpi/splash.png": (960, 1600),
    "drawable-port-xxxhdpi/splash.png": (1280, 1920),
}

for rel, (w, h) in SPLASHES.items():
    img = Image.new("RGBA", (w, h), INDIGO_BOTTOM + (255,))
    glyph = min(w, h) * 0.28
    cx, cy = w / 2, h / 2
    draw_bars(ImageDraw.Draw(img), (cx - glyph / 2, cy - glyph / 2, cx + glyph / 2, cy + glyph / 2), (255, 255, 255, 255))
    img.save(f"android/app/src/main/res/{rel}")

print("splashes written")


# PWA icons. Regular icons are rounded tiles on a transparent background; maskable
# icons are full-bleed with the glyph inside the safe zone so Android can crop freely.
make(192, bg="gradient", rounded=True, glyph_scale=0.58).save("public/icon-192.png")
make(512, bg="gradient", rounded=True, glyph_scale=0.58).save("public/icon-512.png")
make(192, bg="gradient", rounded=None, glyph_scale=0.46).save("public/icon-maskable-192.png")
make(512, bg="gradient", rounded=None, glyph_scale=0.46).save("public/icon-maskable-512.png")

# iOS ignores transparency on the home-screen icon, so give it a full-bleed tile.
make(180, bg="gradient", rounded=None, glyph_scale=0.58).save("public/apple-touch-icon.png")

# Small favicon: keep the corners slightly rounded.
favicon = make(48, bg="gradient", rounded=True, glyph_scale=0.62)
favicon.save("public/favicon-48.png")

print("pwa icons written")
