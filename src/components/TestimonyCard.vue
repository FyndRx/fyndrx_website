<script setup lang="ts">
import type { Testimony } from '@/models/Testimony';

interface Props {
  testimony: Testimony;
}

defineProps<Props>();

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};
</script>

<template>
  <div class="testimony-card">
    <div class="testimony-header">
      <div class="testimony-avatar">
        <img 
          v-if="testimony.avatar" 
          :src="testimony.avatar" 
          :alt="testimony.name"
          class="avatar-image"
        />
        <div v-else class="avatar-placeholder">
          {{ getInitials(testimony.name) }}
        </div>
      </div>
      <div class="testimony-info">
        <div class="testimony-name-wrapper">
          <h3 class="testimony-name">{{ testimony.name }}</h3>
          <svg 
            v-if="testimony.verified" 
            class="verified-badge" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path fill-rule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
          </svg>
        </div>
        <p class="testimony-role">{{ testimony.role }}</p>
        <p class="testimony-location">{{ testimony.location }}</p>
      </div>
    </div>

    <div class="testimony-rating">
      <span v-for="star in 5" :key="star" class="star">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          :class="['star-icon', { 'filled': star <= testimony.rating }]"
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
        </svg>
      </span>
    </div>

    <blockquote class="testimony-text">
      "{{ testimony.testimony }}"
    </blockquote>

    <div class="testimony-footer">
      <time class="testimony-date">{{ formatDate(testimony.date) }}</time>
      <span v-if="testimony.featured" class="featured-badge">Featured</span>
    </div>
  </div>
</template>

<style scoped>
.testimony-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.testimony-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.testimony-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.testimony-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 20px;
}

.testimony-info {
  flex: 1;
}

.testimony-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.testimony-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.verified-badge {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.testimony-role {
  font-size: 14px;
  color: #718096;
  margin: 0 0 2px 0;
}

.testimony-location {
  font-size: 13px;
  color: #a0aec0;
  margin: 0;
}

.testimony-rating {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
}

.star-icon {
  width: 20px;
  height: 20px;
  color: #e2e8f0;
  transition: color 0.2s;
}

.star-icon.filled {
  color: #fbbf24;
}

.testimony-text {
  font-size: 15px;
  line-height: 1.6;
  color: #4a5568;
  margin: 0 0 16px 0;
  font-style: italic;
  position: relative;
}

.testimony-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.testimony-date {
  font-size: 13px;
  color: #a0aec0;
}

.featured-badge {
  font-size: 12px;
  font-weight: 600;
  color: #8b5cf6;
  background: #ede9fe;
  padding: 4px 12px;
  border-radius: 12px;
}

@media (prefers-color-scheme: dark) {
  .testimony-card {
    background: #2d3748;
  }

  .testimony-name {
    color: #f7fafc;
  }

  .testimony-role {
    color: #cbd5e0;
  }

  .testimony-location {
    color: #a0aec0;
  }

  .testimony-text {
    color: #e2e8f0;
  }

  .testimony-footer {
    border-top-color: #4a5568;
  }
}
</style>

