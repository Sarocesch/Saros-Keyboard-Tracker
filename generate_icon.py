"""Generate keyboard app icon for Saros Keyboard Tracker."""
from PIL import Image, ImageDraw


def draw_keyboard_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = max(1, size // 16)
    radius = max(1, size // 10)

    # Background rounded rect
    draw.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=radius,
        fill=(15, 10, 30, 255),
    )

    # Border glow (purple)
    border_w = max(1, size // 48)
    draw.rounded_rectangle(
        [pad, pad, size - pad - 1, size - pad - 1],
        radius=radius,
        outline=(139, 92, 246, 200),
        width=border_w,
    )

    # Skip drawing keys for very small icons — they won't be visible
    if size < 24:
        return img

    inner = size * 0.15
    kx1 = inner
    ky1 = inner
    kx2 = size - inner
    ky2 = size - inner
    kw = kx2 - kx1
    kh = ky2 - ky1

    gap = max(1, size // 32)
    key_r = max(1, size // 22)

    rows = [10, 9, 8]
    row_h = (kh - gap * (len(rows) - 1)) / len(rows)

    colors = [
        (167, 139, 250, 220),
        (139, 92, 246, 240),
        (167, 139, 250, 200),
    ]

    for row_i, num_keys in enumerate(rows):
        y0 = ky1 + row_i * (row_h + gap)
        y1 = y0 + row_h

        if row_i == len(rows) - 1 and size >= 48:
            # Spacebar row: left keys + wide spacebar + right keys
            left_count = 3
            right_count = 4
            small_count = left_count + right_count
            space_w = kw * 0.38
            small_total = kw - space_w - gap * num_keys
            small_w = max(1.0, small_total / small_count)

            x = kx1
            for ki in range(left_count):
                x1 = x + small_w
                if x1 > x:
                    draw.rounded_rectangle([x, y0, x1, y1], radius=key_r, fill=colors[row_i])
                x = x1 + gap

            # Spacebar
            sx1 = x + space_w
            if sx1 > x:
                draw.rounded_rectangle([x, y0, sx1, y1], radius=key_r, fill=(167, 139, 250, 255))
            x = sx1 + gap

            for ki in range(right_count):
                x1 = x + small_w
                if x1 > x:
                    draw.rounded_rectangle([x, y0, x1, y1], radius=key_r, fill=colors[row_i])
                x = x1 + gap
        else:
            key_w = max(1.0, (kw - gap * (num_keys - 1)) / num_keys)
            for ki in range(num_keys):
                x0 = kx1 + ki * (key_w + gap)
                x1 = x0 + key_w
                if x1 > x0:
                    draw.rounded_rectangle([x0, y0, x1, y1], radius=key_r, fill=colors[row_i])

    return img


def save_all_icons():
    import os

    icons_dir = "src-tauri/icons"

    sizes = {
        "icon.png": 512,
        "128x128.png": 128,
        "128x128@2x.png": 256,
        "32x32.png": 32,
        "Square30x30Logo.png": 30,
        "Square44x44Logo.png": 44,
        "Square71x71Logo.png": 71,
        "Square89x89Logo.png": 89,
        "Square107x107Logo.png": 107,
        "Square142x142Logo.png": 142,
        "Square150x150Logo.png": 150,
        "Square284x284Logo.png": 284,
        "Square310x310Logo.png": 310,
        "StoreLogo.png": 50,
    }

    for filename, size in sizes.items():
        img = draw_keyboard_icon(size)
        path = os.path.join(icons_dir, filename)
        img.save(path, "PNG")
        print(f"Saved {path} ({size}x{size})")

    # ICO with multiple sizes
    ico_sizes = [16, 24, 32, 48, 64, 128, 256]
    ico_images = [draw_keyboard_icon(s) for s in ico_sizes]
    ico_path = os.path.join(icons_dir, "icon.ico")
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ico_sizes],
        append_images=ico_images[1:],
    )
    print(f"Saved {ico_path}")

    # icns (macOS fallback)
    draw_keyboard_icon(512).save(os.path.join(icons_dir, "icon.icns"), "PNG")
    print("Saved icon.icns")


if __name__ == "__main__":
    save_all_icons()
    print("Done!")
