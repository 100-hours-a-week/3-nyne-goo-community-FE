document.addEventListener("DOMContentLoaded", () => {
  loadHeader();

  initEyeToggles();

  document.getElementById("verifyBtn").addEventListener("click", verifyCurrentPassword);
  document.getElementById("savePasswordBtn").addEventListener("click", changePassword);
});

// 헤더 불러오기 (뒤로가기 버튼 동작 포함)
const loadHeader = () => {
  fetch("/common/html/header.html")
    .then(response => {
      if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
      return response.text();
    })
    .then(data => {
      document.getElementById("header").innerHTML = data;

      // 프로필 사진을 메뉴로 변경
      const menu = document.getElementById("userProfile");
      const dropdown = document.getElementById("dropdownMenu");

      menu.src = "/assets/image/ic_menu_black_512.png";
      menu.classList.add("menu");
      menu.addEventListener("click", (e) => { clickMenu(e, dropdown) })

      // 메뉴 밖 클릭 시 닫기
      document.addEventListener("click", () => dropdown.classList.remove("show"));

      // 뒤로가기
      document.getElementById("backBtn").addEventListener("click", () => {
        history.back();
      });
    })
    .catch(error => console.error(error));
}

const clickMenu = (e, dropdown) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");

  document.getElementById("editInfo").addEventListener("click", () => window.location.replace("/my/edit-info"));
  document.getElementById("editPw").addEventListener("click", () => {
    window.location.replace("/my/edit-password")
  });
  document.getElementById("logout").addEventListener("click", async () => {
    const BASE_URL = window.CONFIG.BASE_URL;
    await fetch(`${BASE_URL}/auth`, {
      method: 'DELETE',
      credentials: 'include', // 쿠키를 서버에 보내야 서버가 삭제 가능
    });

    // 이후 클라이언트 쪽 데이터 정리
    sessionStorage.clear();
    localStorage.clear();

    // 로그인 화면으로 이동
    window.location.replace('/login');
  })
}

const initEyeToggles = () => {
  const pairs = [
    { input: "currentPassword", eye: "eyeCurrent" },
    { input: "newPassword", eye: "eyeNew" },
    { input: "confirmPassword", eye: "eyeConfirm" }
  ];

  pairs.forEach(({ input, eye }) => {
    const inputEl = document.getElementById(input);
    const eyeEl = document.getElementById(eye);
    if (!inputEl || !eyeEl) return;

    eyeEl.addEventListener("click", () => {
      const isHidden = inputEl.type === "password";
      inputEl.type = isHidden ? "text" : "password";
      console.log(isHidden);
      eyeEl.src = isHidden
        ? "/assets/image/ic_eye_opend_black_64.png"
        : "/assets/image/ic_eye_closed_black_64.png";
    });
  });
};

/* 현재 비밀번호 검증  */
const verifyCurrentPassword = async () => {
  const input = document.getElementById("currentPassword");
  const errorMsg = document.getElementById("currentError");
  const value = input.value.trim();

  clearFieldError(input, errorMsg);

  if (!value) {
    showFieldError(input, errorMsg, "비밀번호를 입력해주세요.");
    return;
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const BASE_URL = window.CONFIG.BASE_URL;

    const response = await fetch(`${BASE_URL}/users/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ password: value })
    });

    const verifyPasswordResponse = await response.json();

    if (response.status === 200) {
      // 성공 → 다음 단계로 이동
      document.getElementById("step1").style.display = "none";
      document.getElementById("step2").style.display = "block";
    } else if (response.statuss === 401) {
      alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
      window.sessionStorage.clear();
      window.localStorage.clear();
      window.location.replace("/login");
    } else {
      showFieldError(input, errorMsg, "비밀번호가 일치하지 않습니다.");
    }
  } catch (err) {
    console.error(err);
  }
}

/*  새 비밀번호 변경  */
const changePassword = async () => {
  const newInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("confirmPassword");
  const newError = document.getElementById("newError");
  const confirmError = document.getElementById("confirmError");

  const newPassword = newInput.value.trim();
  const confirmPassword = confirmInput.value.trim();

  clearFieldError(newInput, newError);
  clearFieldError(confirmInput, confirmError);

  if (newPassword.length < 8) {
    showFieldError(newInput, newError, "비밀번호는 8자 이상이어야 합니다.");
    return;
  }

  if (!confirmPassword) {
    showFieldError(confirmInput, confirmError, "비밀번호 확인을 입력해주세요.");
    return;
  }

  // 새 비밀번호 불일치
  if (newPassword !== confirmPassword) {
    showFieldError(newInput, newError, "새 비밀번호가 일치하지 않습니다.");
    showFieldError(confirmInput, confirmError, "새 비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const BASE_URL = window.CONFIG.BASE_URL;

    const response = await fetch(`${BASE_URL}/users/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ password: newPassword })
    });

    const data = await response.json();

    if (response.status === 200) {
      showToast("비밀번호가 성공적으로 변경되었습니다.");
      history.back();
    } else {
      showFieldError(confirmInput, confirmError, data.message || "비밀번호 변경 실패");
    }
  } catch (err) {
    console.error(err);
  }
}

const showToast = (message) => {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

const showFieldError = (input, msgEl, message) => {
  input.classList.add("input-error");
  msgEl.textContent = message;
  msgEl.classList.add("show");
  input.addEventListener("input", () => clearFieldError(input, msgEl), { once: true });
}

const clearFieldError = (input, msgEl) => {
  input.classList.remove("input-error");
  msgEl.textContent = "";
  msgEl.classList.remove("show");
}