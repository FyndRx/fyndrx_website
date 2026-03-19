import { onMounted, onUnmounted } from 'vue';

interface SeoMetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

const META_ATTRIBUTE = 'data-seo-meta';

const defaultDescription = 'Order your prescription medicine the most convenient way and have them delivered to your doorstep. Get online prescriptions through our free online consultation service and buy medicines at anytime and from anywhere you are in need.';

function setMetaTag(name: string, content: string, isProperty = false) {
  const attribute = isProperty ? 'property' : 'name';
  let element = document.querySelector(
    `meta[${attribute}="${name}"][${META_ATTRIBUTE}]`
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    element.setAttribute(META_ATTRIBUTE, 'true');
    document.head.appendChild(element);
  }

  element.content = content;
}

function setCanonicalLink(href: string) {
  let link = document.querySelector(
    `link[rel="canonical"][${META_ATTRIBUTE}]`
  ) as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    link.setAttribute(META_ATTRIBUTE, 'true');
    document.head.appendChild(link);
  }

  link.href = href;
}

function cleanupSeoMeta() {
  const elements = document.querySelectorAll(`[${META_ATTRIBUTE}]`);
  elements.forEach((el) => el.remove());
}

export function useSeoMeta(options: SeoMetaOptions) {
  const applyMeta = () => {
    if (options.title) {
      document.title = options.title;
    }

    if (options.description) {
      setMetaTag('description', options.description);
    }

    if (options.keywords) {
      setMetaTag('keywords', options.keywords);
    }

    // Open Graph
    if (options.ogTitle || options.title) {
      setMetaTag('og:title', options.ogTitle || options.title!, true);
    }
    if (options.ogDescription || options.description || defaultDescription) {
      setMetaTag('og:description', options.ogDescription || options.description || defaultDescription, true);
    }
    if (options.ogImage) {
      setMetaTag('og:image', options.ogImage, true);
    }
    if (options.ogType) {
      setMetaTag('og:type', options.ogType, true);
    }
    if (options.ogUrl) {
      setMetaTag('og:url', options.ogUrl, true);
    }
    setMetaTag('og:site_name', 'FyndRx', true);

    // Twitter Card
    setMetaTag('twitter:card', options.twitterCard || 'summary_large_image');
    if (options.twitterTitle || options.title) {
      setMetaTag('twitter:title', options.twitterTitle || options.title!);
    }
    if (options.twitterDescription || options.description) {
      setMetaTag('twitter:description', options.twitterDescription || options.description!);
    }
    if (options.twitterImage || options.ogImage) {
      setMetaTag('twitter:image', options.twitterImage || options.ogImage!);
    }

    // Canonical URL
    if (options.canonical) {
      setCanonicalLink(options.canonical);
    }
  };

  onMounted(applyMeta);

  onUnmounted(cleanupSeoMeta);
}
