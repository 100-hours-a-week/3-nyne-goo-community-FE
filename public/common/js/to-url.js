// 우선순위
// 1. window.CONFIG.BASE_URL
// 2. 현재 페이지 origin
const BASE_URL = (window.CONFIG?.BASE_URL) || window.location.origin;

export function toAbsUrl(path){
  if (!path) return null;
  console.log(`${BASE_URL} ...${path}`)
  console.log(`${BASE_URL}${path}`)
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}