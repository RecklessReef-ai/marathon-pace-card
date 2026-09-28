"""Render the app icons from the same shapes as public/icons/icon.svg. Run once: python3 scripts/make-icons.py"""
from PIL import Image, ImageDraw
import os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "icons")
SKY, INK, STAR, WHITE = (0x41, 0xB6, 0xE6, 255), (0x0F, 0x23, 0x40, 255), (0xE4, 0x00, 0x2B, 255), (255, 255, 255, 255)
# Star from icon.svg, on a 512 canvas.
STAR_PTS = [(256, 88), (306, 190), (420, 173), (357, 268), (420, 363), (306, 346), (256, 448), (206, 346), (92, 363), (155, 268), (92, 173), (206, 190)]

def draw(size, maskable=False, opaque=False):
    S = 8  # supersample for smooth edges
    W = 512 * S
    img = Image.new("RGBA", (W, W), SKY if (maskable or opaque) else (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    scale = 0.8 if maskable else 1.0          # maskable: keep art inside the inner 80%
    def pt(x, y): return (256 * S + (x - 256) * S * scale, 256 * S + (y - 256) * S * scale)
    if not maskable:
        r = 240 * S * scale
        d.ellipse([pt(256 - 240, 256 - 240), pt(256 + 240, 256 + 240)], fill=SKY, outline=INK, width=int(24 * S * scale))
    star = [pt(*p) for p in STAR_PTS]
    d.polygon(star, fill=STAR, outline=WHITE, width=int(16 * S * scale))
    d.line(star + [star[0]], fill=WHITE, width=int(16 * S * scale), joint="curve")
    return img.resize((size, size), Image.LANCZOS)

os.makedirs(OUT, exist_ok=True)
draw(192).save(os.path.join(OUT, "icon-192.png"))
draw(512).save(os.path.join(OUT, "icon-512.png"))
draw(512, maskable=True).save(os.path.join(OUT, "maskable-512.png"))
draw(180, opaque=True).convert("RGB").save(os.path.join(OUT, "apple-touch-icon.png"))
print("icons written to", os.path.abspath(OUT))
