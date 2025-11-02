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
    })

    // 공통 에러 처리
    if (response.status === 401 || response.status === 403) {
      try{
        const reissueResponse = await tokenReissue()
        if(reissueResponse.status===201) return apiRequest(endpoint, options);

        if (!(window.location.pathname.includes("/login") || window.location.pathname.includes("/signup"))) {
          window.location.href="/login";
          throw new Error("인증되지 않은 사용쟈");
        }
        else throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
      }catch(e){ return null; }
    }

    // JSON 파싱
    const data = await response.json();

    if (!(response.status === 200 || response.status === 201)) {
      const error = new Error("API 요청 실패");
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// 토큰 재발급
export async function tokenReissue() {
  const BASE_URL = window.CONFIG.BASE_URL;
  const url = `${BASE_URL}/auth/refresh`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      }
    }).catch(()=>null);

    // 401 에러 -> 토큰 유효하지 않거나 잘못된 토큰
    if (response.status === 401) {
      const error = new Error("인증되지 않은 사용자")
      error.status = response.status
      return error;
    }

    // JSON 파싱
    const data = await response.json();

    if (!(response.status === 201)) {
      const error = new Error("API 요청 실패");
      error.status = response.status;
      throw error;
    }

    return {status: response.status, data};
  } catch (e) {
    console.error(e);
  }
}