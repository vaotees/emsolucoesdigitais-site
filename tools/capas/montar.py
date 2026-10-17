"""Monta as capas dos cases (1600×1000) com a mesma direção de arte: fundo na cor do cliente,
o site num navegador e a versão de celular num aparelho, no mesmo ângulo e com a mesma sombra.

Uso: python3 tools/capas/montar.py tools/capas/capas.json [pasta-das-capturas]
Cada item do JSON: slug, desktop, mobile, url, dark, base, glow, saida (e opcional crop: [x0, y0, x1, y1] no desktop).
Caminhos de desktop/mobile relativos à pasta das capturas (padrão: a do JSON); começando com "public/", relativos ao projeto.
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1600, 1000
DESK_W, BAR = 1120, 40
PHONE_W, BEZEL = 300, 12
FONT = '/System/Library/Fonts/Helvetica.ttc'


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rounded_mask(size, radius):
    m = Image.new('L', size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return m


def shadow(canvas, box, radius, blur=36, offset=24, alpha=120):
    x0, y0, x1, y1 = box
    layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle((x0, y0 + offset, x1, y1 + offset), radius=radius, fill=(0, 0, 0, alpha))
    canvas.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def background(dark, base, glow):
    d, b, g = hex_rgb(dark), hex_rgb(base), hex_rgb(glow)
    # Gradiente diagonal (escuro no canto de cima à esquerda)
    grad = Image.new('RGB', (W, H))
    px = grad.load()
    for y in range(H):
        for x in range(0, W, 4):
            t = min(1, max(0, (x / W) * 0.55 + (y / H) * 0.45))
            c = tuple(int(d[i] + (b[i] - d[i]) * t) for i in range(3))
            for k in range(4):
                if x + k < W:
                    px[x + k, y] = c
    img = grad.convert('RGBA')
    # Brilho suave da cor de apoio no alto, à direita
    glow_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow_layer).ellipse((W - 900, -500, W + 300, 600), fill=g + (110,))
    img.alpha_composite(glow_layer.filter(ImageFilter.GaussianBlur(160)))
    # Grade fina, como no site da EM
    grid = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, 64):
        gd.line((x, 0, x, H), fill=(255, 255, 255, 10))
    for y in range(0, H, 64):
        gd.line((0, y, W, y), fill=(255, 255, 255, 10))
    img.alpha_composite(grid)
    return img


def browser(shot, url):
    shot = shot.convert('RGB')
    h = round(shot.height * DESK_W / shot.width)
    shot = shot.resize((DESK_W, h), Image.LANCZOS)
    frame = Image.new('RGBA', (DESK_W, h + BAR), (243, 244, 246, 255))
    d = ImageDraw.Draw(frame)
    for i, c in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
        cx = 22 + i * 20
        d.ellipse((cx - 6, BAR / 2 - 6, cx + 6, BAR / 2 + 6), fill=c)
    font = ImageFont.truetype(FONT, 15)
    tw = d.textlength(url, font=font)
    pill_w = max(320, tw + 48)
    px0 = (DESK_W - pill_w) / 2
    d.rounded_rectangle((px0, 8, px0 + pill_w, BAR - 8), radius=12, fill=(255, 255, 255))
    d.text(((DESK_W - tw) / 2, BAR / 2), url, fill=(100, 116, 139), font=font, anchor='lm')
    frame.paste(shot, (0, BAR))
    frame.putalpha(rounded_mask(frame.size, 14))
    return frame


def phone(shot):
    shot = shot.convert('RGB')
    sw = PHONE_W - BEZEL * 2
    sh = round(shot.height * sw / shot.width)
    screen = shot.resize((sw, sh), Image.LANCZOS)
    screen.putalpha(rounded_mask(screen.size, 34))
    body = Image.new('RGBA', (PHONE_W, sh + BEZEL * 2), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle((0, 0, PHONE_W - 1, sh + BEZEL * 2 - 1), radius=46, fill=(12, 12, 16, 255))
    body.alpha_composite(screen, (BEZEL, BEZEL))
    # Ilha dinâmica
    ImageDraw.Draw(body).rounded_rectangle((PHONE_W / 2 - 44, BEZEL + 10, PHONE_W / 2 + 44, BEZEL + 34), radius=12, fill=(12, 12, 16, 255))
    return body


def build(item, base_dir, root):
    def load(p):
        full = os.path.join(root, p) if p.startswith('public/') else os.path.join(base_dir, p)
        return Image.open(full)

    img = background(item['dark'], item['base'], item['glow'])
    desk_shot = load(item['desktop'])
    if item.get('crop'):
        desk_shot = desk_shot.crop(tuple(item['crop']))
    desk = browser(desk_shot, item['url'])
    mob = phone(load(item['mobile']))
    dx, dy = 150, 150
    px, py = dx + DESK_W - 120, H - mob.height - 56
    shadow(img, (dx, dy, dx + desk.width, dy + desk.height), 14)
    img.alpha_composite(desk, (dx, dy))
    shadow(img, (px, py, px + mob.width, py + mob.height), 46, blur=30, offset=20, alpha=150)
    img.alpha_composite(mob, (px, py))
    out = os.path.join(root, item['saida'])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    img.convert('RGB').save(out, 'WEBP', quality=86, method=6)
    print(out, os.path.getsize(out) // 1024, 'KB')


if __name__ == '__main__':
    spec = sys.argv[1]
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    shots = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(spec))
    for it in json.load(open(spec)):
        build(it, shots, root)
