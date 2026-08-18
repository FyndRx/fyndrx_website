/**
 * Lazily loads the Google Identity Services and Facebook SDK scripts (only when a
 * Login/Register view actually mounts, not site-wide) and exposes minimal helpers
 * to obtain a provider token client-side for POSTing to /auth/google or /auth/facebook.
 */

const scriptCache = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const cached = scriptCache.get(src);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

const GOOGLE_SDK_ERROR = 'Could not load Google sign-in. Please check your connection or disable any ad blockers, then try again.';
const FACEBOOK_SDK_ERROR = 'Could not load Facebook sign-in. Please check your connection or disable any ad blockers, then try again.';

export function useSocialAuth() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;

  /**
   * Renders Google's official "Continue with Google" button into `el` and wires
   * `onToken`/`onError` as a persistent callback — Google's button can be clicked
   * (and can fail/retry) more than once, so this isn't a one-shot Promise.
   */
  async function renderGoogleButton(
    el: HTMLElement,
    onToken: (idToken: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!googleClientId) {
      throw new Error('Google sign-in is not configured for this environment.');
    }

    try {
      await loadScript('https://accounts.google.com/gsi/client');
    } catch {
      throw new Error(GOOGLE_SDK_ERROR);
    }

    const google = (window as any).google;
    if (!google?.accounts?.id) {
      throw new Error('Google sign-in failed to initialize.');
    }

    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: { credential?: string }) => {
        if (response?.credential) {
          onToken(response.credential);
        } else {
          onError(new Error('Google sign-in was cancelled.'));
        }
      },
    });

    google.accounts.id.renderButton(el, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      width: el.offsetWidth || undefined,
    });
  }

  /**
   * Triggers the Facebook login popup and resolves with an access token.
   * Called directly from a custom button's click handler, so a fresh Promise
   * per invocation is fine (unlike Google's persistently-rendered button).
   */
  async function signInWithFacebook(): Promise<string> {
    if (!facebookAppId) {
      throw new Error('Facebook sign-in is not configured for this environment.');
    }

    try {
      await loadScript('https://connect.facebook.net/en_US/sdk.js');
    } catch {
      throw new Error(FACEBOOK_SDK_ERROR);
    }

    const FB = (window as any).FB;
    if (!FB) {
      throw new Error('Facebook sign-in failed to initialize.');
    }

    FB.init({ appId: facebookAppId, xfbml: false, version: 'v21.0' });

    return new Promise<string>((resolve, reject) => {
      FB.login(
        (response: any) => {
          const accessToken = response?.authResponse?.accessToken;
          if (accessToken) {
            resolve(accessToken);
          } else {
            reject(new Error('Facebook sign-in was cancelled.'));
          }
        },
        { scope: 'email,public_profile' }
      );
    });
  }

  return { renderGoogleButton, signInWithFacebook };
}
