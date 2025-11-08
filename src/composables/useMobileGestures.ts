import { ref, onMounted, onBeforeUnmount } from 'vue';

interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

export function useMobileGestures(options: SwipeOptions = {}) {
  const {
    threshold = 50,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;

  const touchStartX = ref(0);
  const touchStartY = ref(0);
  const touchEndX = ref(0);
  const touchEndY = ref(0);
  const isSwiping = ref(false);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.value = e.changedTouches[0].screenX;
    touchStartY.value = e.changedTouches[0].screenY;
    isSwiping.value = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping.value) return;
    touchEndX.value = e.changedTouches[0].screenX;
    touchEndY.value = e.changedTouches[0].screenY;
  };

  const handleTouchEnd = () => {
    if (!isSwiping.value) return;
    
    const deltaX = touchEndX.value - touchStartX.value;
    const deltaY = touchEndY.value - touchStartY.value;
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY && absDeltaX > threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (absDeltaY > absDeltaX && absDeltaY > threshold) {
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    isSwiping.value = false;
    touchStartX.value = 0;
    touchStartY.value = 0;
    touchEndX.value = 0;
    touchEndY.value = 0;
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    isSwiping
  };
}

export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const isPulling = ref(false);
  const pullDistance = ref(0);
  const isRefreshing = ref(false);
  const startY = ref(0);
  const threshold = 80;

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.value = e.touches[0].clientY;
      isPulling.value = true;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.value || isRefreshing.value) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.value;

    if (diff > 0 && window.scrollY === 0) {
      pullDistance.value = Math.min(diff, threshold * 1.5);
      if (diff > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.value || isRefreshing.value) return;

    if (pullDistance.value >= threshold) {
      isRefreshing.value = true;
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          isRefreshing.value = false;
          pullDistance.value = 0;
        }, 500);
      }
    } else {
      pullDistance.value = 0;
    }

    isPulling.value = false;
  };

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    threshold
  };
}

export function useLongPress(callback: () => void, duration = 500) {
  let timeout: NodeJS.Timeout | null = null;

  const handleTouchStart = () => {
    timeout = setTimeout(() => {
      callback();
    }, duration);
  };

  const handleTouchEnd = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return {
    handleTouchStart,
    handleTouchEnd
  };
}

