import zlib
import struct
import math
import os

def write_png(filename, width, height, pixels):
    """
    Writes RGBA pixels to a standard PNG file using pure Python (zlib + struct).
    pixels: list of (r, g, b, a) tuples of length width * height.
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        row_offset = y * width
        for x in range(width):
            r, g, b, a = pixels[row_offset + x]
            raw_data.extend((r, g, b, a))

    def make_chunk(chunk_type, data):
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        return struct.pack('>I', len(data)) + chunk_type + data + struct.pack('>I', crc)

    png_header = b'\x89PNG\r\n\x1a\n'
    ihdr = make_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) # 8-bit RGBA
    idat = make_chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = make_chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png_header + ihdr + idat + iend)

def generate_reconcile_icon(size, is_maskable=False):
    pixels = []
    w, h = size, size
    bg_r, bg_g, bg_b = 0x3D, 0x54, 0x38  # Forest Olive #3D5438
    white_r, white_g, white_b = 0xFA, 0xF8, 0xF5  # Warm Cream #FAF8F5
    corner_radius = size * 0.22 if not is_maskable else 0

    for y in range(h):
        for x in range(w):
            # Maskable icons fill the entire square; standard icons have rounded corners
            in_shape = True
            if not is_maskable:
                # Check 4 corners for rounded rect
                dx = max(0, max(corner_radius - x, x - (w - 1 - corner_radius)))
                dy = max(0, max(corner_radius - y, y - (h - 1 - corner_radius)))
                if dx * dx + dy * dy > corner_radius * corner_radius:
                    in_shape = False

            if not in_shape:
                pixels.append((0, 0, 0, 0))
                continue

            # Normalized coordinate in [0, 1]
            nx = x / w
            ny = y / h

            # Draw 'R' mark:
            # 1. Vertical stem: nx in [0.28, 0.40], ny in [0.24, 0.76]
            is_stem = (0.28 <= nx <= 0.40) and (0.24 <= ny <= 0.76)

            # 2. Top loop outer: center (0.42, 0.39), radius around 0.18
            # Loop extends from nx 0.38 to 0.70, ny 0.24 to 0.54
            cx, cy = 0.42, 0.39
            dist_loop = math.sqrt((nx - cx)**2 + (ny - cy)**2)
            is_loop_outer = (dist_loop <= 0.17) and (nx >= cx) and (0.24 <= ny <= 0.54)
            is_loop_inner = (dist_loop < 0.08) and (nx >= cx)
            is_loop_top = (0.38 <= nx <= 0.46) and (0.24 <= ny <= 0.32)
            is_loop_bottom = (0.38 <= nx <= 0.46) and (0.46 <= ny <= 0.54)
            is_loop = (is_loop_outer and not is_loop_inner) or is_loop_top or is_loop_bottom

            # 3. Diagonal leg: from (0.40, 0.48) to (0.70, 0.76)
            # Line equation roughly: ny = 0.93 * nx + 0.11
            leg_center_y = 0.95 * nx + 0.10
            is_leg = (0.40 <= nx <= 0.70) and (abs(ny - leg_center_y) <= 0.065) and (0.48 <= ny <= 0.76)

            if is_stem or is_loop or is_leg:
                pixels.append((white_r, white_g, white_b, 255))
            else:
                pixels.append((bg_r, bg_g, bg_b, 255))

    return pixels

def main():
    target_dir = os.path.join(os.path.dirname(__file__), 'public')
    os.makedirs(target_dir, exist_ok=True)

    icons = [
        ('icon-192.png', 192, False),
        ('icon-192-maskable.png', 192, True),
        ('icon-512.png', 512, False),
        ('icon-512-maskable.png', 512, True),
        ('apple-touch-icon.png', 180, False),
    ]

    for fname, size, maskable in icons:
        out_path = os.path.join(target_dir, fname)
        print(f"Generating {fname} ({size}x{size})...")
        pix = generate_reconcile_icon(size, maskable)
        write_png(out_path, size, size, pix)
        print(f"Saved {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == '__main__':
    main()
