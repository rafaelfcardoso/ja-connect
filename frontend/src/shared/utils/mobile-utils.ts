/**
 * Mobile browser detection and utilities
 */

export interface MobileInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  needsAlternativeDownload: boolean;
}

/**
 * Detect mobile browser and platform information
 */
export function getMobileInfo(): MobileInfo {
  const userAgent = navigator.userAgent || '';
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  const isChrome = /Chrome/i.test(userAgent);
  
  // Mobile Safari and some mobile browsers need alternative download methods
  const needsAlternativeDownload = isMobile && (isIOS || isSafari);
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    needsAlternativeDownload
  };
}

/**
 * Check if device is mobile using screen width
 */
export function isMobileDevice(): boolean {
  return window.innerWidth < 768;
}

/**
 * Check if browser supports programmatic downloads
 */
export function supportsProgrammaticDownload(): boolean {
  const { needsAlternativeDownload } = getMobileInfo();
  return !needsAlternativeDownload;
}

/**
 * Get appropriate download method based on browser
 */
export function getDownloadMethod(): 'programmatic' | 'window-open' | 'fallback' {
  const { isMobile, isIOS, isSafari } = getMobileInfo();
  
  if (isMobile && (isIOS || isSafari)) {
    return 'window-open';
  }
  
  if (isMobile) {
    return 'window-open';
  }
  
  return 'programmatic';
}