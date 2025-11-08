import { ref, watch } from 'vue';

const isDark = ref(false);
let initialized = false;

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
    updateDarkMode();
  };

  const updateDarkMode = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const initDarkMode = () => {
    if (initialized) return;
    
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode !== null) {
      isDark.value = savedMode === 'true';
    } else {
      isDark.value = prefersDark;
    }
    
    updateDarkMode();
    initialized = true;
  };

  watch(isDark, updateDarkMode);

  return {
    isDark,
    toggleDarkMode,
    initDarkMode
  };
}

