import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home/HomeView.vue';
import OTPVerificationView from '@/views/Auth/OTPVerificationView.vue';
import { useAuthStore } from '@/store/auth';
import BlogView from '@/views/BlogView.vue';
import BlogPostView from '@/views/BlogPostView.vue';
import PharmaciesView from '@/views/PharmaciesView.vue';
import PharmacyView from '@/views/PharmacyView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Home | FyndRX',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About/AboutView.vue'),
      meta: {
        title: 'About Us | FyndRX',
      },
    },
    {
      path: '/services',
      name: 'services',
      component: () => import('../views/Services/ServicesView.vue'),
      meta: {
        title: 'Our Services | FyndRX',
      },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/Contact/ContactView.vue'),
      meta: {
        title: 'Contact Us | FyndRX',
      },
    },
    {
      path: '/upload-prescription',
      name: 'upload-prescription',
      component: () => import('../views/PrescriptionUpload.vue'),
      meta: {
        title: 'Upload Prescription | FyndRX',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Auth/LoginView.vue'),
      meta: {
        title: 'Login | FyndRX',
        requiresGuest: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Auth/RegisterView.vue'),
      meta: {
        title: 'Register | FyndRX',
        requiresGuest: true,
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/Auth/ForgotPasswordView.vue'),
      meta: {
        title: 'Forgot Password | FyndRX',
        requiresGuest: true,
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/Auth/ResetPasswordView.vue'),
      meta: {
        title: 'Reset Password | FyndRX',
        requiresGuest: true,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard/DashboardView.vue'),
      meta: {
        title: 'Dashboard | FyndRX',
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        title: 'Profile | FyndRX',
        requiresAuth: true,
      },
    },
    {
      path: '/profile/edit',
      name: 'edit-profile',
      component: () => import('../views/EditProfileView.vue'),
      meta: {
        title: 'Edit Profile | FyndRX',
        requiresAuth: true,
      },
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: OTPVerificationView,
      meta: {
        requiresAuth: false,
        layout: 'auth',
      },
    },
    {
      path: '/blog',
      name: 'blog',
      component: BlogView,
      meta: {
        title: 'Blog | FyndRX',
        description:
          'Discover insights, updates, and stories from our team at FyndRX. Stay informed about healthcare trends, tips, and company news.',
      },
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: BlogPostView,
      meta: {
        title: 'Blog Post | FyndRX',
        description:
          'Read our latest blog post on FyndRX. Get insights about healthcare, wellness, and medical innovations.',
      },
    },
    {
      path: '/pharmacies',
      name: 'pharmacies',
      component: PharmaciesView,
      meta: {
        title: 'Pharmacies | FyndRX',
        description: 'Find trusted pharmacies near you with our comprehensive directory.',
      },
    },
    {
      path: '/pharmacy/:id',
      name: 'pharmacy',
      component: PharmacyView,
      meta: {
        title: 'Pharmacy Details | FyndRX',
        description:
          'View detailed information about this pharmacy, including services, reviews, and contact information.',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound/NotFoundView.vue'),
      meta: {
        title: '404 Not Found | FyndRX',
      },
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Update page title
  document.title = (to.meta.title as string) || 'FyndRX';

  const authStore = useAuthStore();
  const isAuthenticated = await authStore.checkAuth();

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
    return;
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'home' });
    return;
  }

  next();
});

export default router;
