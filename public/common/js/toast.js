export function showToast(message, duration = 1800) {
  const toast = document.getElementById("toast");
  if (!toast) return; // 혹시 페이지에 없을 경우 방어

  toast.textContent = message;
  toast.classList.add("show");

  // 일정 시간 뒤 자동 사라짐
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}
