import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home/HomeView.vue'),
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
      component: () => import('../views/Auth/OTPVerificationView.vue'),
      meta: {
        requiresAuth: false,
        layout: 'auth',
      },
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/BlogView.vue'),
      meta: {
        title: 'Blog | FyndRX',
        description:
          'Discover insights, updates, and stories from our team at FyndRX. Stay informed about healthcare trends, tips, and company news.',
      },
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: () => import('../views/BlogPostView.vue'),
      meta: {
        title: 'Blog Post | FyndRX',
        description:
          'Read our latest blog post on FyndRX. Get insights about healthcare, wellness, and medical innovations.',
      },
    },
    {
      path: '/pharmacies',
      name: 'pharmacies',
      component: () => import('../views/PharmaciesView.vue'),
      meta: {
        title: 'Pharmacies | FyndRX',
        description: 'Find trusted pharmacies near you with our comprehensive directory.',
      },
    },
    {
      path: '/pharmacy/:id',
      name: 'pharmacy',
      component: () => import('../views/PharmacyView.vue'),
      meta: {
        title: 'Pharmacy Details | FyndRX',
        description:
          'View detailed information about this pharmacy, including services, reviews, and contact information.',
      },
    },
    {
      path: '/medication/:id',
      name: 'MedicationDetail',
      component: () => import('@/views/MedicationDetail.vue'),
      meta: {
        title: 'Medication Details'
      }
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/Support/HelpCenter.vue'),
      meta: {
        title: 'Help Center | FyndRX',
        description: 'Get help and support for your FyndRX experience. Find answers to frequently asked questions and contact our support team.'
      }
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: () => import('@/views/Support/Feedback.vue'),
      meta: {
        title: 'Feedback | FyndRX',
        description: 'Share your feedback with us. Help us improve FyndRX by sharing your thoughts and suggestions.'
      }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/Legal/TermsOfService.vue'),
      meta: {
        title: 'Terms of Service',
        description: 'Terms and conditions for using FyndRx services'
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('@/views/Legal/PrivacyPolicy.vue'),
      meta: {
        title: 'Privacy Policy',
        description: 'Privacy policy and data protection information'
      }
    },
    {
      path: '/letterhead',
      name: 'letterhead',
      component: () => import('@/views/Legal/Letterhead.vue'),
      meta: {
        title: 'Official Letterhead | FyndRX',
        description: 'Download our official letterhead for business correspondence'
      }
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
router.beforeEach(async (to, _, next) => {
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
