// Validation utility functions

// 56. Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 57. Validate username
export function isValidUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (username.length > 30) return { valid: false, error: 'Username must be less than 30 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  return { valid: true };
}

// 58. Validate audio file
export function isValidAudioFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/ogg', 'audio/aac'];
  const validExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac'];
  
  const hasValidType = validTypes.includes(file.type) || file.type.startsWith('audio/');
  const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  
  if (!hasValidType && !hasValidExtension) {
    return { valid: false, error: 'Invalid audio file format' };
  }
  
  if (file.size > 100 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 100MB' };
  }
  
  return { valid: true };
}

// 59. Validate image file
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image format. Use JPEG, PNG, GIF, or WebP' };
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }
  
  return { valid: true };
}

// 60. Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// 61. Validate playlist name
export function isValidPlaylistName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) return { valid: false, error: 'Playlist name is required' };
  if (name.length > 100) return { valid: false, error: 'Playlist name must be less than 100 characters' };
  return { valid: true };
}

// 62. Check for profanity (basic)
const profanityList = ['spam', 'scam']; // Simplified list
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

// 63. Validate URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 64. Validate year
export function isValidYear(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
}

// 65. Rate input (stars 1-5)
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}
