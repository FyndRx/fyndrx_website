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
        title: 'FYNDRX | SAFEST AND MOST CONVENIENT ONLINE PHARMACY IN GHANA',
        description: 'Order your prescription medicine the most convenient way and have them delivered to your doorstep. Get online prescriptions through our free online consultation service and buy medicines at anytime and from anywhere you are in need. Search for medicines, upload prescriptions and find pharmacies near you. With multiple price options and flexible payments, there are no limits for you.',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About/AboutView.vue'),
      meta: {
        title: 'About FyndRx | Safest and Most Convenient Online Pharmacy in Ghana',
        description: 'Learn about FyndRx, Ghana\'s safest and most convenient online pharmacy. Order prescriptions, consult pharmacists, and get medicine delivered to your doorstep. Discover our mission to make healthcare accessible to all.',
      },
    },
    {
      path: '/services',
      name: 'services',
      component: () => import('../views/Services/ServicesView.vue'),
      meta: {
        title: 'Our Services | FyndRx',
        description: 'Explore FyndRx services: online medicine ordering, prescription uploads, pharmacist consultations, pharmacy finder, telehealth, and secure health records.',
      },
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/Contact/ContactView.vue'),
      meta: {
        title: 'Contact Us | FyndRx',
        description: 'Get in touch with FyndRx. Visit our offices in Tema and Tamale, send us an email, or call us. We are here to help with your healthcare needs.',
      },
    },
    {
      path: '/upload-prescription',
      name: 'upload-prescription',
      component: () => import('../views/PrescriptionUpload.vue'),
      meta: {
        title: 'Upload Prescription | FyndRx',
        description: 'Upload your prescription securely and let FyndRx help you find the best prices across partner pharmacies.',
      },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Auth/LoginView.vue'),
      meta: {
        title: 'Login | FyndRx',
        description: 'Sign in to your FyndRx account to manage orders, prescriptions, and consultations.',
        requiresGuest: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Auth/RegisterView.vue'),
      meta: {
        title: 'Create Account | FyndRx',
        description: 'Create your free FyndRx account to order medicines online, upload prescriptions, and access affordable healthcare.',
        requiresGuest: true,
      },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/Auth/ForgotPasswordView.vue'),
      meta: {
        title: 'Forgot Password | FyndRx',
        description: 'Reset your FyndRx password. Enter your email to receive a password reset link.',
        requiresGuest: true,
      },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/Auth/ResetPasswordView.vue'),
      meta: {
        title: 'Reset Password | FyndRx',
        description: 'Set a new password for your FyndRx account.',
        requiresGuest: true,
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard/DashboardView.vue'),
      meta: {
        title: 'Dashboard | FyndRx',
        description: 'Your FyndRx dashboard. View orders, prescriptions, consultations, and manage your healthcare.',
        requiresAuth: true,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        title: 'My Profile | FyndRx',
        description: 'View and manage your FyndRx profile information.',
        requiresAuth: true,
      },
    },
    {
      path: '/profile/edit',
      name: 'edit-profile',
      component: () => import('../views/EditProfileView.vue'),
      meta: {
        title: 'Edit Profile | FyndRx',
        description: 'Update your FyndRx profile, personal details, and preferences.',
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
        description: 'Browse and search for medications. Compare prices across pharmacies.',
        requiresAuth: false
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
        title: 'Medication Details | FyndRX',
        requiresAuth: false
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
      path: '/telehealth',
      name: 'telehealth',
      component: () => import('../views/ConsultationLayout/ConsultationLanding.vue'),
      meta: {
        title: 'Telehealth Services | FyndRX',
        description: 'Quality healthcare from home. Connect with licensed doctors for online consultations and prescriptions.',
        requiresAuth: false
      }
    },
    {
      path: '/consultations/public',
      component: () => import('@/views/ConsultationLayout/PublicConsultationLayout.vue'),
      children: [
        {
          path: 'search',
          name: 'public-consultation-search',
          component: () => import('@/views/Public/PublicConsultationSearch.vue'),
          meta: {
            title: 'Track Consultation | FyndRX',
            requiresAuth: false
          }
        },
        {
          path: 'new',
          name: 'public-create-consultation',
          component: () => import('@/views/Public/PublicCreateConsultationView.vue'),
          meta: {
            title: 'New Consultation | FyndRX',
            requiresAuth: false
          }
        }
      ]
    },
    {
      path: '/consultations',
      name: 'consultations',
      component: () => import('@/views/ConsultationsView.vue'),
      meta: {
        title: 'Consultations | FyndRX',
        description: 'Manage your medical consultations',
        requiresAuth: true
      }
    },
    {
      path: '/consultations/new',
      name: 'create-consultation',
      component: () => import('@/views/CreateConsultationView.vue'),
      meta: {
        title: 'New Consultation | FyndRX',
        requiresAuth: true
      }
    },
    {
      path: '/consultations/:id',
      name: 'consultation-detail',
      component: () => import('@/views/ConsultationDetailView.vue'),
      meta: {
        title: 'Consultation Details | FyndRX',
        requiresAuth: true
      }
    },
    {
      path: '/consultations/:id/print',
      name: 'consultation-print',
      component: () => import('@/views/ConsultationPrintView.vue'),
      meta: {
        title: 'Print Consultation | FyndRX',
        requiresAuth: true
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
      path: '/email-templates',
      name: 'email-templates',
      component: () => import('../views/EmailTemplatesView.vue'),
      meta: {
        title: 'Email Templates | FyndRx',
        description: 'FyndRx email templates for system communications.',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFound/NotFoundView.vue'),
      meta: {
        title: 'Page Not Found | FyndRx',
        description: 'The page you are looking for could not be found. Return to FyndRx home page.',
      },
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, _, next) => {
  // Update page title
  document.title = (to.meta.title as string) || 'FyndRx';

  // Update meta description
  const description = to.meta.description as string;
  if (description) {
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description;
  }

  const authStore = useAuthStore();

  // Initialize auth if needed (check token existence)
  // We don't await checkAuth() here to avoid blocking every navigation on an API call
  // Instead we rely on the store's state which should be hydrated from localStorage
  const isAuthenticated = authStore.isAuthenticated;

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

  // If authenticated but user details are missing (e.g. page reload), fetch them in background
  // or block if critical. For now we let it happen in background or App.vue
  if (isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUserDetails();
    } catch (error) {
      // If fetching user details fails (e.g. token expired), let the interceptor handle it
      // or redirect to login
      console.error('Failed to fetch user details during navigation:', error);
      // Optional: authStore.logout(); next({ name: 'login' }); 
      // But we generally prefer the global error handler to do this.
    }
  }

  next();
});

export default router;
