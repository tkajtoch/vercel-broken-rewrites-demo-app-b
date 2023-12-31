'use client';

import { useEffect } from 'react';

/**
 * This is a hacky `fetch()` patch that fixes Vercel's broken rewrites feature
 * when a request contains the `Next-Router-Prefetch` header
 * that they claim is not a bug, and they may improve it in the future.
 * See case #00165836
 */

const NEXT_ROUTER_PREFETCH = 'Next-Router-Prefetch';
const NEXT_RSC = 'RSC';

function removeHeaderFromHeaders(headers: Headers | Record<string, string>) {
  if (typeof headers.delete === 'function') {
    headers.delete(NEXT_ROUTER_PREFETCH);
    headers.delete(NEXT_RSC);
  } else {
    delete (headers as Record<string, string>)[NEXT_ROUTER_PREFETCH];
    delete (headers as Record<string, string>)[NEXT_RSC];
  }
}

function patchFetch(originalFetch: typeof window.fetch): typeof window.fetch {
  return (input, init) => {
    if (typeof input === 'object' && (input as Request).headers) {
      removeHeaderFromHeaders((input as Request).headers);
    }

    if (typeof init?.headers === 'object') {
      if (Array.isArray(init.headers)) {
        init.headers = init.headers.filter(
          ([key]) => key.toLowerCase() !== NEXT_ROUTER_PREFETCH.toLowerCase() &&
          key.toLowerCase() !== NEXT_RSC.toLowerCase(),
        );
      } else {
        removeHeaderFromHeaders(init.headers);
      }
    }

    // any is used below because undici-types module breaks the type definition
    return originalFetch(input as any, init);
  }
}

// I hate so much about the things that you choose to be, Next.js
export const PatchFetchAsClientComponentBecauseOtherwiseItWillNotBeIncludedInServerComponentRoutesAndAddingAScriptTagInsteadIsMehAndWillNotPolyfill = () => {
  useEffect(() => {
    window.fetch = patchFetch(window.fetch);
  }, []);

  return null;
}
