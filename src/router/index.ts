import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  },
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
      path: '/medications',
      name: 'medications',
      component: () => import('@/views/MedicationsView.vue'),
      meta: {
        title: 'Browse Medications | FyndRX',
        description: 'Browse and search for medications. Compare prices across pharmacies.'
      }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: {
        title: 'My Favorites | FyndRX',
        description: 'View your favorite medications and pharmacies'
      }
    },
    {
      path: '/medication/:id',
      name: 'MedicationDetail',
      component: () => import('@/views/MedicationDetail.vue'),
      meta: {
        title: 'Medication Details | FyndRX'
      }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: {
        title: 'Shopping Cart | FyndRX',
        description: 'View and manage your shopping cart'
      }
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      meta: {
        title: 'Checkout | FyndRX',
        description: 'Complete your order',
        requiresAuth: false
      }
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
      meta: {
        title: 'Order History | FyndRX',
        description: 'View and track your orders',
        requiresAuth: true
      }
    },
    {
      path: '/orders/:id',
      name: 'order-detail',
      component: () => import('@/views/OrderDetailView.vue'),
      meta: {
        title: 'Order Details | FyndRX',
        description: 'View order details and track status',
        requiresAuth: true
      }
    },
    {
      path: '/prescriptions',
      name: 'prescriptions',
      component: () => import('@/views/PrescriptionsView.vue'),
      meta: {
        title: 'My Prescriptions | FyndRX',
        description: 'View and manage your prescriptions',
        requiresAuth: true
      }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('@/views/TransactionsView.vue'),
      meta: {
        title: 'Transactions | FyndRX',
        description: 'View your payment history',
        requiresAuth: true
      }
    },
    {
      path: '/receipt/:id',
      name: 'receipt',
      component: () => import('@/views/ReceiptView.vue'),
      meta: {
        title: 'Receipt | FyndRX',
        description: 'View payment receipt',
        requiresAuth: true
      }
    },
    {
      path: '/payment/callback',
      name: 'payment-callback',
      component: () => import('@/views/PaymentCallbackView.vue'),
      meta: {
        title: 'Payment Processing | FyndRX',
        description: 'Processing your payment'
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
      path: '/faq',
      name: 'faq',
      component: () => import('@/views/FAQView.vue'),
      meta: {
        title: 'FAQ | FyndRX',
        description: 'Frequently asked questions about FyndRx ePharmacy platform. Find answers about orders, prescriptions, payments, and more.'
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
