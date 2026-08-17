export function isCloudHosting(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.location.origin.endsWith('.apps.yarah.dev');
}

export function isInIframe(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.parent !== window;
}
