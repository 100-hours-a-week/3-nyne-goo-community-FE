// 우선순위
// 1. window.CONFIG.BASE_URL
// 2. 현재 페이지 origin
const IMAGE_BASE_URL = (window.CONFIG?.IMAGE_BASE_URL) || window.location.origin;

export function toAbsUrl(path){
  if (!path) return null;
  return `${IMAGE_BASE_URL}${path}`;
}