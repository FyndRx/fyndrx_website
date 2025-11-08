import { ref } from 'vue';

let isScriptLoaded = false;
let isScriptLoading = false;
const scriptLoadCallbacks: (() => void)[] = [];

export const useGoogleMaps = () => {
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (isScriptLoaded) {
        isLoaded.value = true;
        resolve();
        return;
      }

      if (!GOOGLE_MAPS_API_KEY) {
        const err = 'Google Maps API key is not configured';
        error.value = err;
        reject(new Error(err));
        return;
      }

      if (isScriptLoading) {
        scriptLoadCallbacks.push(() => {
          isLoaded.value = true;
          resolve();
        });
        return;
      }

      isScriptLoading = true;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        isScriptLoaded = true;
        isScriptLoading = false;
        isLoaded.value = true;
        
        scriptLoadCallbacks.forEach(callback => callback());
        scriptLoadCallbacks.length = 0;
        
        resolve();
      };

      script.onerror = () => {
        isScriptLoading = false;
        const err = 'Failed to load Google Maps script';
        error.value = err;
        reject(new Error(err));
      };

      document.head.appendChild(script);
    });
  };

  return {
    loadGoogleMapsScript,
    isLoaded,
    error
  };
};

