export async function apiRequest(endpoint, options = {}) {
  const url = "/api/" + endpoint;
  const isFormData = options?.body instanceof FormData;

  console.log("api request");

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        ...(options?.headers ?? {}),
        ...(!isFormData ? { "Content-Type": "application/json;charset=utf-8" } : {}), // FormData면 생략
      },
    })

    console.log("response status: ", response.status);

    // 공통 에러 처리
    if (response.status === 401) {
      try {
        const reissueResponse = await tokenReissue()
        if (reissueResponse.status === 201) return apiRequest(endpoint, options);

        if (!(window.location.pathname.includes("/login") || window.location.pathname.includes("/signup"))) {
          window.location.href = "/login";
          throw new Error("인증되지 않은 사용쟈");
        }
        else throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
      } catch (e) { return null; }
    }

    if (response.status === 403) {
      history.back();
      throw new Error("허용되지 않은 사용자");
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

export async function upload(file) {
  const url = window.CONFIG.UPLOAD_URL + "/upload/profile-image";
  const formData = new FormData();
  formData.append("profileImage", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    // JSON 파싱
    const data = await response.json();

    if (!(response.status === 201)) {
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

export async function uploadPost(files){
  const url = window.CONFIG.UPLOAD_URL + "/upload/post-image";
  const formData = new FormData();

  // files: File[], File, FileList 중 하나 처리
  let fileArray;

  if (Array.isArray(files)) {
    fileArray = files;
  } else if (files instanceof FileList) {
    fileArray = Array.from(files);
  } else if (files instanceof File) {
    fileArray = [files];
  } else {
    console.error("uploadPost(): 예상치 못한 타입", files);
    throw new Error("uploadPost(files): need File or File[] or FileList");
  }

  // 실제 파일만 append
  fileArray
    .filter((file) => file) // null/undefined 방지
    .forEach((file) => {
      formData.append("postImage", file);
    });

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    // JSON 파싱
    const data = await response.json();

    if (!(response.status === 201)) {
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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 토큰 재발급
export async function tokenReissue() {
  const BASE_URL = window.CONFIG.BASE_URL;
  const url = `${BASE_URL}/api/auth/refresh`;

  try {
    const response = await fetch(url, {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      }
    }).catch(() => null);

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

    return { status: response.status, data };
  } catch (e) {
    console.error(e);
  }
}