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
      window.location.replace("/login");
      return null;
    }

    // JSON 파싱
    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error: ${data.message || response.statusText}`);
      throw new Error(data.message || "API 요청 실패");
    }

    return data;
  } catch (error) {
    console.error("API 호출 에러:", error);
    throw error;
  }
}