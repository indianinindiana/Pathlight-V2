#!/usr/bin/env python3
"""
Generate favicon from PathLight logo
Requires: pip install Pillow
"""

from PIL import Image
import os

def generate_favicon(input_path, output_dir):
    """
    Generate favicon.ico with multiple sizes from the PathLight logo
    Standard favicon sizes: 16x16, 32x32, 48x48
    """
    try:
        # Open the source image
        img = Image.open(input_path)
        
        # Convert to RGBA if not already
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Generate favicon with multiple sizes
        favicon_sizes = [(16, 16), (32, 32), (48, 48)]
        favicon_images = []
        
        for size in favicon_sizes:
            resized = img.resize(size, Image.Resampling.LANCZOS)
            favicon_images.append(resized)
        
        # Save as favicon.ico
        favicon_path = os.path.join(output_dir, 'favicon.ico')
        favicon_images[0].save(
            favicon_path,
            format='ICO',
            sizes=favicon_sizes,
            append_images=favicon_images[1:]
        )
        
        print(f"✅ Generated favicon.ico at {favicon_path}")
        
        # Also generate PNG versions for modern browsers
        for size in [16, 32, 192, 512]:
            png_img = img.resize((size, size), Image.Resampling.LANCZOS)
            png_path = os.path.join(output_dir, f'favicon-{size}x{size}.png')
            png_img.save(png_path, 'PNG')
            print(f"✅ Generated favicon-{size}x{size}.png")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating favicon: {e}")
        return False

if __name__ == '__main__':
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    public_dir = os.path.join(script_dir, 'public')
    logo_path = os.path.join(public_dir, 'pathlight-logo.png')
    
    # Check if logo exists
    if not os.path.exists(logo_path):
        print(f"❌ Logo not found at {logo_path}")
        print("Please ensure pathlight-logo.png exists in the public directory")
        exit(1)
    
    # Generate favicon
    print("🎨 Generating favicon from PathLight logo...")
    success = generate_favicon(logo_path, public_dir)
    
    if success:
        print("\n✨ Favicon generation complete!")
        print("\nGenerated files:")
        print("  - favicon.ico (16x16, 32x32, 48x48)")
        print("  - favicon-16x16.png")
        print("  - favicon-32x32.png")
        print("  - favicon-192x192.png (for Android)")
        print("  - favicon-512x512.png (for PWA)")
    else:
        print("\n❌ Favicon generation failed")
        exit(1)