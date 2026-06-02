<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDate } from '@/utils/date';
import { blogService } from '@/services/blogService';
import { useAuthStore } from '@/store/auth';
import type { BlogPost, Comment } from '@/types/blog';
import LazyImage from '@/components/LazyImage.vue';
import ErrorState from '@/components/ErrorState.vue';
import TwitterIcon from '@/components/icons/TwitterIcon.vue';
import FacebookIcon from '@/components/icons/FacebookIcon.vue';
import LinkedInIcon from '@/components/icons/LinkedInIcon.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const post = ref<BlogPost | null>(null);
const relatedPosts = ref<BlogPost[]>([]);
const comments = ref<Comment[]>([]);
const error = ref<string | null>(null);

// Like state
const postLiked = ref(false);
const isLiking = ref(false);

// Comment form state
const newComment = ref('');
const isSubmittingComment = ref(false);
const commentError = ref('');
const linkCopied = ref(false);

// Reply state (per-comment box)
const newReply = ref('');
const activeReplyId = ref<string | null>(null);
const isSubmittingReply = ref(false);
const replyError = ref('');

const currentUrl = computed(() => window.location.href);
const isAuthenticated = computed(() => authStore.isAuthenticated);

// ─── Post Like ────────────────────────────────────────────────────────────────

const togglePostLike = async () => {
  if (!post.value) return;

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  if (isLiking.value) return;
  isLiking.value = true;

  // Optimistic update
  const wasLiked = postLiked.value;
  postLiked.value = !wasLiked;
  post.value.likes = (post.value.likes ?? 0) + (wasLiked ? -1 : 1);

  try {
    const { liked, likes } = await blogService.likePost(post.value.id);
    // Sync with server truth
    postLiked.value = liked;
    post.value.likes = likes;
  } catch {
    // Revert on failure
    postLiked.value = wasLiked;
    post.value.likes = (post.value.likes ?? 0) + (wasLiked ? 1 : -1);
  } finally {
    isLiking.value = false;
  }
};

// ─── Comments ─────────────────────────────────────────────────────────────────

const submitComment = async () => {
  if (!newComment.value.trim() || !post.value) return;
  commentError.value = '';

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  isSubmittingComment.value = true;
  try {
    const created = await blogService.commentOnPost(post.value.id, newComment.value.trim());
    comments.value = [created, ...(comments.value ?? [])];
    if (post.value) post.value = { ...post.value, comments: comments.value };
    newComment.value = '';
  } catch (err: any) {
    commentError.value = err?.response?.data?.message ?? 'Failed to post comment. Please try again.';
  } finally {
    isSubmittingComment.value = false;
  }
};

// ─── Replies ──────────────────────────────────────────────────────────────────

const toggleReply = (commentId: string) => {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null;
    newReply.value = '';
    replyError.value = '';
  } else {
    activeReplyId.value = commentId;
    newReply.value = '';
    replyError.value = '';
  }
};

const submitReply = async (parentCommentId: string) => {
  if (!newReply.value.trim() || !post.value) return;
  replyError.value = '';

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  isSubmittingReply.value = true;
  try {
    const created = await blogService.commentOnPost(post.value.id, newReply.value.trim(), parentCommentId);
    const parent = comments.value?.find(c => c.id === parentCommentId);
    if (parent) {
      parent.replies = [...(parent.replies ?? []), created];
    }
    newReply.value = '';
    activeReplyId.value = null;
  } catch (err: any) {
    replyError.value = err?.response?.data?.message ?? 'Failed to post reply. Please try again.';
  } finally {
    isSubmittingReply.value = false;
  }
};

// ─── Comment likes ────────────────────────────────────────────────────────────

// Map of commentId → liked boolean (persisted state from API)
const commentLikeState = ref<Map<string, boolean>>(new Map());
const commentLikeLoading = ref<Set<string>>(new Set());

const findComment = (commentId: string, parentId?: string) => {
  if (parentId == null) return comments.value?.find(c => c.id === commentId) ?? null;
  const parent = comments.value?.find(c => c.id === parentId);
  return parent?.replies?.find(r => r.id === commentId) ?? null;
};

const likeComment = async (commentId: string, parentId?: string) => {
  if (commentLikeLoading.value.has(commentId)) return;

  if (!isAuthenticated.value) {
    router.push({ name: 'login', query: { redirect: route.fullPath } });
    return;
  }

  commentLikeLoading.value.add(commentId);

  const target = findComment(commentId, parentId);
  const wasLiked = commentLikeState.value.get(commentId) ?? false;

  // Optimistic update
  commentLikeState.value.set(commentId, !wasLiked);
  if (target) target.likes = (target.likes ?? 0) + (wasLiked ? -1 : 1);

  try {
    const { liked, likes } = await blogService.likeComment(commentId);
    commentLikeState.value.set(commentId, liked);
    if (target) target.likes = likes;
  } catch {
    // Revert on failure
    commentLikeState.value.set(commentId, wasLiked);
    if (target) target.likes = (target.likes ?? 0) + (wasLiked ? 1 : -1);
  } finally {
    commentLikeLoading.value.delete(commentId);
  }
};

// ─── Share ────────────────────────────────────────────────────────────────────

const shareArticle = (platform: string) => {
  const url = currentUrl.value;
  const title = post.value?.title ?? '';

  switch (platform) {
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
      break;
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      break;
    case 'linkedin':
      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
      break;
    case 'copy':
      navigator.clipboard.writeText(url).then(() => {
        linkCopied.value = true;
        setTimeout(() => { linkCopied.value = false; }, 2000);
      });
      break;
  }
};

// ─── Related post navigation ──────────────────────────────────────────────────

const viewPost = (slug: string) => {
  router.push({ name: 'blog-post', params: { slug } });
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ─── Load ─────────────────────────────────────────────────────────────────────

const loadPost = async () => {
  isLoading.value = true;
  error.value = null;
  postLiked.value = false;
  commentLikeState.value = new Map();
  commentLikeLoading.value = new Set();

  try {
    const slug = route.params.slug as string;
    const fetchedPost = await blogService.getPost(slug);

    if (!fetchedPost) {
      error.value = 'Blog post not found';
      return;
    }

    post.value = fetchedPost;
    postLiked.value = fetchedPost.liked ?? false;

    // Use embedded comments from the post response; fall back to dedicated endpoint
    const loadedComments = fetchedPost.comments?.length
      ? fetchedPost.comments
      : await blogService.getComments(fetchedPost.id);

    comments.value = loadedComments;

    // Seed comment like state from server so hearts are filled on refresh
    loadedComments.forEach(c => {
      if (c.liked) commentLikeState.value.set(c.id, true);
      c.replies?.forEach(r => { if (r.liked) commentLikeState.value.set(r.id, true); });
    });

    relatedPosts.value = await blogService.getRelatedPosts(fetchedPost.id, 3);
  } catch (err) {
    console.error('Error loading post:', err);
    error.value = 'Failed to load blog post';
  } finally {
    isLoading.value = false;
  }
};

// Reload when navigating between posts (e.g. related post clicks)
watch(() => route.params.slug, (slug) => { if (slug) loadPost(); });

onMounted(() => { loadPost(); });
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
    <!-- Loading State -->
    <div v-if="isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="animate-pulse space-y-8">
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div class="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96"></div>
        <div class="space-y-4">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <ErrorState
      v-else-if="error"
      type="notfound"
      :message="error"
      :show-retry="false"
      :show-go-home="true"
    />

    <!-- Content -->
    <template v-else-if="post">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Back Button -->
        <button
          @click="router.push({ name: 'blog' })"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#246BFD] transition-colors mb-8"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Blog
        </button>

        <article class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <!-- Article Header -->
          <header class="p-8 md:p-12">
            <div class="mb-6">
              <span class="inline-block px-4 py-2 rounded-full bg-[#246BFD]/10 text-[#246BFD] dark:bg-[#246BFD]/20 text-sm font-semibold mb-4">
                {{ post.category }}
              </span>
            </div>
            
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              {{ post.title }}
            </h1>
            
            <div class="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
              <div class="flex items-center gap-3">
                <LazyImage
                  :src="post.author.avatar"
                  :alt="post.author.name"
                  aspectRatio="square"
                  className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">{{ post.author.name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ post.author.bio }}</p>
                </div>
              </div>
              
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>{{ formatDate(post.date, 'MMM dd, yyyy • h:mm a') }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{{ post.readTime }} min read</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <span>{{ post.views }} views</span>
                </div>
              </div>
            </div>
          </header>

          <!-- Featured Image -->
          <div class="px-8 md:px-12">
            <LazyImage
              :src="post.coverImage"
              :alt="post.title"
              aspectRatio="landscape"
              className="w-full h-96 object-cover rounded-xl"
            />
          </div>

          <!-- Article Content -->
          <div class="p-8 md:p-12">
            <div class="prose prose-lg dark:prose-invert max-w-none mb-12" v-html="post.content"></div>

            <!-- Tags -->
            <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 mr-2">Tags:</span>
              <button
                v-for="tag in post.tags"
                :key="tag"
                @click="router.push({ name: 'blog', query: { tag } })"
                class="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-[#246BFD] hover:text-white transition-colors"
              >
                #{{ tag }}
              </button>
            </div>

            <!-- Social Share & Like -->
            <div class="flex items-center justify-between py-6 border-y border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-4">
                <button
                  @click="togglePostLike"
                  :disabled="isLiking"
                  :title="isAuthenticated ? (postLiked ? 'Unlike' : 'Like') : 'Sign in to like'"
                  :class="[
                    'flex items-center gap-2 px-4 py-2 rounded-full transition-all',
                    postLiked
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                    isLiking ? 'opacity-60 cursor-wait' : 'cursor-pointer'
                  ]"
                >
                  <svg class="w-5 h-5 transition-transform" :class="{ 'scale-125': postLiked }" :fill="postLiked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span class="font-medium">{{ post.likes ?? 0 }}</span>
                </button>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Share:</span>
                <button @click="shareArticle('twitter')" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all" title="Share on Twitter">
                  <TwitterIcon class="w-5 h-5" />
                </button>
                <button @click="shareArticle('facebook')" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all" title="Share on Facebook">
                  <FacebookIcon class="w-5 h-5" />
                </button>
                <button @click="shareArticle('linkedin')" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-all" title="Share on LinkedIn">
                  <LinkedInIcon class="w-5 h-5" />
                </button>
                <button @click="shareArticle('copy')" class="p-2 rounded-full bg-gray-100 dark:bg-gray-700 transition-all" :class="linkCopied ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'" :title="linkCopied ? 'Copied!' : 'Copy link'">
                  <svg v-if="!linkCopied" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- Comments Section -->
        <section class="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            Comments ({{ comments.length }})
          </h2>

          <!-- Comment Form / Auth gate -->
          <div class="mb-8">
            <template v-if="isAuthenticated">
              <textarea
                v-model="newComment"
                placeholder="Share your thoughts..."
                :disabled="isSubmittingComment"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#246BFD] focus:border-transparent dark:bg-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all disabled:opacity-60"
                rows="4"
              ></textarea>
              <p v-if="commentError" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ commentError }}</p>
              <button
                @click="submitComment"
                :disabled="!newComment.trim() || isSubmittingComment"
                class="mt-3 px-6 py-3 bg-[#246BFD] text-white rounded-xl hover:bg-[#5089FF] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg v-if="isSubmittingComment" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ isSubmittingComment ? 'Posting…' : 'Post Comment' }}
              </button>
            </template>

            <!-- Not signed in -->
            <div v-else class="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
              <svg class="w-8 h-8 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-800 dark:text-gray-200">Sign in to join the conversation</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">You need an account to post comments.</p>
              </div>
              <button
                @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
                class="ml-auto shrink-0 px-4 py-2 bg-[#246BFD] text-white text-sm font-semibold rounded-lg hover:bg-[#5089FF] transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>

          <!-- Comments List -->
          <div class="space-y-6">
            <div v-for="comment in comments" :key="comment.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                  <LazyImage
                    :src="comment.author.avatar"
                    :alt="comment.author.name"
                    aspectRatio="square"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ comment.author.name }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.date) }}</p>
                  </div>
                </div>
                <button
                  @click="likeComment(comment.id)"
                  :disabled="commentLikeLoading.has(comment.id)"
                  class="flex items-center gap-1 transition-colors"
                  :class="commentLikeState.get(comment.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
                  :title="commentLikeState.get(comment.id) ? 'Unlike' : 'Like'"
                >
                  <svg class="w-5 h-5" :fill="commentLikeState.get(comment.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  <span v-if="(comment.likes ?? 0) > 0" class="text-sm font-medium">{{ comment.likes }}</span>
                </button>
              </div>

              <p class="text-gray-700 dark:text-gray-300 mb-4">{{ comment.content }}</p>

              <button
                @click="toggleReply(comment.id)"
                class="text-sm font-medium transition-colors"
                :class="activeReplyId === comment.id ? 'text-gray-500 dark:text-gray-400' : 'text-[#246BFD] hover:text-[#5089FF]'"
              >
                {{ activeReplyId === comment.id ? 'Cancel' : 'Reply' }}
              </button>

              <!-- Reply Form -->
              <div v-if="activeReplyId === comment.id" class="mt-4 pl-6 border-l-2 border-[#246BFD]">
                <template v-if="isAuthenticated">
                  <textarea
                    v-model="newReply"
                    placeholder="Write a reply…"
                    :disabled="isSubmittingReply"
                    class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#246BFD] focus:border-transparent dark:bg-gray-900 dark:text-white disabled:opacity-60"
                    rows="3"
                  ></textarea>
                  <p v-if="replyError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ replyError }}</p>
                  <div class="mt-2 flex gap-2">
                    <button
                      @click="submitReply(comment.id)"
                      :disabled="!newReply.trim() || isSubmittingReply"
                      class="px-4 py-2 bg-[#246BFD] text-white rounded-lg hover:bg-[#5089FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                    >
                      <svg v-if="isSubmittingReply" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      {{ isSubmittingReply ? 'Posting…' : 'Post Reply' }}
                    </button>
                    <button
                      @click="toggleReply(comment.id)"
                      class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </template>
                <div v-else class="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                  <span class="text-sm text-gray-600 dark:text-gray-300">
                    <button @click="router.push({ name: 'login', query: { redirect: route.fullPath } })" class="text-[#246BFD] font-semibold hover:underline">Sign in</button>
                    to reply to this comment.
                  </span>
                </div>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies?.length" class="mt-6 space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                <div v-for="reply in comment.replies" :key="reply.id" class="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <LazyImage
                        :src="reply.author.avatar"
                        :alt="reply.author.name"
                        aspectRatio="square"
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ reply.author.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(reply.date) }}</p>
                      </div>
                    </div>
                    <button
                      @click="likeComment(reply.id, comment.id)"
                      :disabled="commentLikeLoading.has(reply.id)"
                      class="flex items-center gap-1 transition-colors"
                      :class="commentLikeState.get(reply.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'"
                      :title="commentLikeState.get(reply.id) ? 'Unlike' : 'Like'"
                    >
                      <svg class="w-4 h-4" :fill="commentLikeState.get(reply.id) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      <span v-if="(reply.likes ?? 0) > 0" class="text-xs font-medium">{{ reply.likes }}</span>
                    </button>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300 text-sm">{{ reply.content }}</p>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="comments.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              <p class="text-gray-600 dark:text-gray-400 mb-2">No comments yet</p>
              <p class="text-sm text-gray-500 dark:text-gray-500">Be the first to share your thoughts!</p>
            </div>
          </div>
        </section>

        <!-- Related Posts -->
        <section v-if="relatedPosts.length > 0" class="mt-12">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article
              v-for="relatedPost in relatedPosts"
              :key="relatedPost.id"
              @click="viewPost(relatedPost.slug)"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            >
              <div class="relative h-40 overflow-hidden">
                <LazyImage
                  :src="relatedPost.coverImage"
                  :alt="relatedPost.title"
                  aspectRatio="landscape"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div class="p-4">
                <span class="inline-block px-2 py-1 rounded-full bg-[#246BFD]/10 text-[#246BFD] text-xs font-semibold mb-2">
                  {{ relatedPost.category }}
                </span>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#246BFD] transition-colors">
                  {{ relatedPost.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {{ relatedPost.excerpt }}
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.prose {
  max-width: none;
}

.prose :deep(h2) {
  @apply text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4;
}

.prose :deep(h3) {
  @apply text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3;
}

.prose :deep(p) {
  @apply text-gray-700 dark:text-gray-300 leading-relaxed mb-4;
}

.prose :deep(ul), .prose :deep(ol) {
  @apply ml-6 mb-4 space-y-2;
}

.prose :deep(li) {
  @apply text-gray-700 dark:text-gray-300;
}

.prose :deep(strong) {
  @apply font-semibold text-gray-900 dark:text-white;
}

.prose :deep(a) {
  @apply text-[#246BFD] hover:text-[#5089FF] underline;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
