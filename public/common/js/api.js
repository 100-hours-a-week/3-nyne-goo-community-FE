export async function apiRequest(endpoint, options = {}) {
  const BASE_URL = window.CONFIG.BASE_URL;
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        ...options.headers,
      },
      ...options,
    });

    // 공통 에러 처리
    if (response.status === 401 || response.status === 403) {
      // 로그인 페이지에서는 redirect 하지 않음
      if (!(window.location.pathname.includes("/login")||window.location.pathname.includes("/signup"))) {
        window.location.replace("/login");
      } else {
        throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
      }
      return null;
    }

    // JSON 파싱
    const data = await response.json();

    if (!(response.status === 200 || response.status === 201)) {
      const error = new Error("API 요청 실패");
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}