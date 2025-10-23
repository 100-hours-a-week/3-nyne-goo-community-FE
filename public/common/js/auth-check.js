document.addEventListener("DOMContentLoaded", () => {
  const token = window.sessionStorage.getItem("accessToken");

  // 로그인, 회원가입 페이지는 예외
  const isAuthPage = window.location.pathname.includes("login") || window.location.pathname.includes("signup");

  console.log("token: ", token, ", isAuthPage: ", isAuthPage);

  // 토큰 없고, 로그인/회원가입 페이지가 아니면 로그인 페이지로 교체
  if (!token && !isAuthPage) {
    window.location.replace("/login");
  }

  window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});
});
