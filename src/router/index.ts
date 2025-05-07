import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/Home/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        title: "Home | FyndRX",
      },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/About/AboutView.vue"),
      meta: {
        title: "About Us | FyndRX",
      },
    },
    {
      path: "/services",
      name: "services",
      component: () => import("../views/Services/ServicesView.vue"),
      meta: {
        title: "Our Services | FyndRX",
      },
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("../views/Contact/ContactView.vue"),
      meta: {
        title: "Contact Us | FyndRX",
      },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Auth/LoginView.vue"),
      meta: {
        title: "Login | FyndRX",
        requiresGuest: true,
      },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/Auth/RegisterView.vue"),
      meta: {
        title: "Register | FyndRX",
        requiresGuest: true,
      },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/Dashboard/DashboardView.vue"),
      meta: {
        title: "Dashboard | FyndRX",
        requiresAuth: true,
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFound/NotFoundView.vue"),
      meta: {
        title: "404 Not Found | FyndRX",
      },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  // Update page title
  document.title = (to.meta.title as string) || "FyndRX";

  // Check if route requires authentication
  if (to.meta.requiresAuth && !localStorage.getItem("token")) {
    next({ name: "login" });
    return;
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && localStorage.getItem("token")) {
    next({ name: "dashboard" });
    return;
  }

  next();
});

export default router;
