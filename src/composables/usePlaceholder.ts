import { useDarkMode } from '@/composables/useDarkMode';

export function usePlaceholder() {
  const { isDark } = useDarkMode();

  /**
   * Returns the URL of the appropriate placeholder image based on the current theme (light or dark)
   * and the requested aspect ratio.
   * 
   * @param aspectRatio 'square' or 'landscape' (defaults to 'landscape')
   */
  const getPlaceholder = (aspectRatio: 'square' | 'landscape' = 'landscape'): string => {
    if (isDark.value) {
      if (aspectRatio === 'square') {
        return new URL('../assets/placeholder_dark/square.png', import.meta.url).href;
      }
      return new URL('../assets/placeholder_dark/landscape.png', import.meta.url).href;
    } else {
      if (aspectRatio === 'square') {
        return new URL('../assets/placeholder/square.png', import.meta.url).href;
      }
      return new URL('../assets/placeholder/landscape.png', import.meta.url).href;
    }
  };

  return {
    getPlaceholder,
  };
}
