// Color utility functions for dynamic theming

// 76. Extract dominant color from image
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('#6366f1');
        return;
      }
      
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      
      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let i = 0; i < imageData.length; i += 16) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    
    img.onerror = () => resolve('#6366f1');
    img.src = imageUrl;
  });
}

// 77. Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

// 78. Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// 79. Get contrasting text color
export function getContrastColor(backgroundColor: string): 'white' | 'black' {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'white';
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

// 80. Lighten color
export function lightenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const lighten = (c: number) => Math.min(255, Math.round(c + (255 - c) * (percent / 100)));
  return rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
}

// 81. Darken color
export function darkenColor(color: string, percent: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const darken = (c: number) => Math.max(0, Math.round(c * (1 - percent / 100)));
  return rgbToHex(darken(rgb.r), darken(rgb.g), darken(rgb.b));
}

// 82. Generate gradient from colors
export function generateGradient(colors: string[], direction = 'to bottom'): string {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

// 83. Convert color to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// 84. Create color palette from base color
export function createPalette(baseColor: string): string[] {
  return [
    darkenColor(baseColor, 40),
    darkenColor(baseColor, 20),
    baseColor,
    lightenColor(baseColor, 20),
    lightenColor(baseColor, 40),
  ];
}

// 85. Generate accessible color pair
export function getAccessibleColors(backgroundColor: string): { text: string; accent: string } {
  const textColor = getContrastColor(backgroundColor);
  const accent = textColor === 'white' ? lightenColor(backgroundColor, 30) : darkenColor(backgroundColor, 30);
  return { text: textColor, accent };
}
