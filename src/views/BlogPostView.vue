<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/date'
import type { BlogPost, Comment } from '@/types/blog'
import TwitterIcon from '@/components/icons/TwitterIcon.vue'
import FacebookIcon from '@/components/icons/FacebookIcon.vue'
import LinkedInIcon from '@/components/icons/LinkedInIcon.vue'

const isLoading = ref(true)
const post = ref<BlogPost | null>(null)
const comments = ref<Comment[]>([])
const newComment = ref('')
const newReply = ref('')
const activeReplyId = ref<number | null>(null)
const relatedPosts = ref<BlogPost[]>([])

const submitComment = () => {
  if (!newComment.value.trim()) return

  const comment: Comment = {
    id: Date.now(),
    author: {
      name: 'Current User',
      avatar: '/images/avatar.jpg'
    },
    content: newComment.value,
    date: new Date().toISOString(),
    likes: 0,
    replies: []
  }

  comments.value = [...(comments.value || []), comment]
  newComment.value = ''
}

const submitReply = (commentId: number) => {
  if (!newReply.value.trim()) return

  const reply: Comment = {
    id: Date.now(),
    author: {
      name: 'Current User',
      avatar: '/images/avatar.jpg'
    },
    content: newReply.value,
    date: new Date().toISOString(),
    likes: 0
  }

  const comment = comments.value?.find(c => c.id === commentId)
  if (comment) {
    comment.replies = [...(comment.replies || []), reply]
  }

  newReply.value = ''
  activeReplyId.value = null
}

const toggleReply = (commentId: number) => {
  activeReplyId.value = activeReplyId.value === commentId ? null : commentId
}

const likeComment = (commentId: number) => {
  const comment = comments.value?.find(c => c.id === commentId)
  if (comment) {
    comment.likes = (comment.likes || 0) + 1
  }
}

const shareArticle = (platform: string) => {
  const url = window.location.href
  const title = post.value?.title || ''

  switch (platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`)
      break
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)
      break
    case 'linkedin':
      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`)
      break
  }
}

onMounted(async () => {
  // Simulate API call
  setTimeout(() => {
    post.value = {
      id: 1,
      title: 'The Future of Healthcare Technology',
      slug: 'future-of-healthcare-technology',
      excerpt: 'Exploring how AI and machine learning are transforming patient care and medical research.',
      content: '<p>Your article content here...</p>',
      coverImage: 'https://media.istockphoto.com/id/2160715528/photo/female-asian-neuroscinetist-using-interactive-touch-screen-table-with-mri-scans-on-display-in.jpg?s=2048x2048&w=is&k=20&c=YS4UegfImjsNWTDnLpXy4Gjk8zjlshgjt2SqIKEDmeg=',
      category: 'Technology',
      date: '2024-03-15',
      author: {
        name: 'Dr. Sarah Johnson',
        avatar: '../src/assets/team/latifa.jpg',
        bio: 'Healthcare Technology Specialist'
      },
      tags: ['AI', 'Healthcare', 'Technology', 'Innovation'],
      readTime: 8,
      likes: 42,
      comments: []
    }

    comments.value = [
      {
        id: 1,
        author: {
          name: 'Jane Smith',
          avatar: '../src/assets/team/latifa.jpg'
        },
        content: 'Great article! I especially liked the section about AI in healthcare.',
        date: '2024-03-21',
        likes: 5,
        replies: [
          {
            id: 2,
            author: {
              name: 'John Doe',
              avatar: '../src/assets/team/aby.jpg'
            },
            content: 'Thank you for your feedback!',
            date: '2024-03-21',
            likes: 2
          }
        ]
      }
    ]

    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-10">
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-pulse space-y-8">
        <!-- Article Header Skeleton -->
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        
        <!-- Featured Image Skeleton -->
        <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-96"></div>
        
        <!-- Content Skeleton -->
        <div class="space-y-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
        
        <!-- Comments Section Skeleton -->
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div class="space-y-4">
            <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <template v-else-if="post">
      <article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Article Header -->
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">{{ post.title }}</h1>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <img :src="post.author.avatar" :alt="post.author.name" class="h-12 w-12 rounded-full" />
              <div class="ml-4">
                <p class="text-lg font-medium text-gray-900 dark:text-white">{{ post.author.name }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(post.date) }} · {{ post.readTime }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button
                @click="shareArticle('twitter')"
                class="text-gray-500 hover:text-blue-400 transition-colors"
              >
                <TwitterIcon class="h-6 w-6" />
              </button>
              <button
                @click="shareArticle('facebook')"
                class="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <FacebookIcon class="h-6 w-6" />
              </button>
              <button
                @click="shareArticle('linkedin')"
                class="text-gray-500 hover:text-blue-700 transition-colors"
              >
                <LinkedInIcon class="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <!-- Featured Image -->
        <img :src="post.coverImage" :alt="post.title" class="w-full h-96 object-cover rounded-lg mb-8" />

        <!-- Article Content -->
        <div class="prose dark:prose-invert max-w-none mb-12" v-html="post.content"></div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2 mb-12">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Comments Section -->
        <section class="border-t border-gray-200 dark:border-gray-700 pt-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Comments</h2>
          
          <!-- Comment Form -->
          <div class="mb-8">
            <textarea
              v-model="newComment"
              placeholder="Write a comment..."
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              rows="3"
            ></textarea>
            <button
              @click="submitComment"
              class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post Comment
            </button>
          </div>

          <!-- Comments List -->
          <div class="space-y-6">
            <div v-for="comment in comments" :key="comment.id" class="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div class="flex items-start justify-between">
                <div class="flex items-center">
                  <img :src="comment.author.avatar" :alt="comment.author.name" class="h-10 w-10 rounded-full" />
                  <div class="ml-3">
                    <p class="font-medium text-gray-900 dark:text-white">{{ comment.author.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatDate(comment.date) }}</p>
                  </div>
                </div>
                <button
                  @click="likeComment(comment.id)"
                  class="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                >
                  <svg class="h-5 w-5" :class="{ 'text-red-500': (comment.likes ?? 0) > 0 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span v-if="comment.likes">{{ comment.likes }}</span>
                </button>
              </div>
              <p class="mt-2 text-gray-600 dark:text-gray-300">{{ comment.content }}</p>
              
              <!-- Reply Button -->
              <button
                @click="toggleReply(comment.id)"
                class="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Reply
              </button>

              <!-- Reply Form -->
              <div v-if="activeReplyId === comment.id" class="mt-4">
                <textarea
                  v-model="newReply"
                  placeholder="Write a reply..."
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  rows="2"
                ></textarea>
                <div class="mt-2 flex gap-2">
                  <button
                    @click="submitReply(comment.id)"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Reply
                  </button>
                  <button
                    @click="activeReplyId = null"
                    class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies?.length" class="mt-4 space-y-4 pl-8 border-l-2 border-gray-200 dark:border-gray-700">
                <div v-for="reply in comment.replies" :key="reply.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-center">
                      <img :src="reply.author.avatar" :alt="reply.author.name" class="h-8 w-8 rounded-full" />
                      <div class="ml-3">
                        <p class="font-medium text-gray-900 dark:text-white">{{ reply.author.name }}</p>
                        <p class="text-sm text-gray-500">{{ formatDate(reply.date) }}</p>
                      </div>
                    </div>
                    <button
                      @click="likeComment(reply.id)"
                      class="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                    >
                      <svg class="h-5 w-5" :class="{ 'text-red-500': (reply.likes ?? 0) > 0 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span v-if="reply.likes">{{ reply.likes }}</span>
                    </button>
                  </div>
                  <p class="mt-2 text-gray-600 dark:text-gray-300">{{ reply.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </template>

    <!-- Related Posts -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <article
          v-for="relatedPost in relatedPosts"
          :key="relatedPost.id"
          class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <img :src="relatedPost.coverImage" :alt="relatedPost.title" class="w-full h-48 object-cover" />
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ relatedPost.title }}</h3>
            <p class="text-gray-600 mb-4">{{ relatedPost.excerpt }}</p>
            <router-link
              :to="{ name: 'blog-post', params: { slug: relatedPost.slug }}"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read more →
            </router-link>
          </div>
        </article>
      </div>
    </div>
  </div>
</template> 