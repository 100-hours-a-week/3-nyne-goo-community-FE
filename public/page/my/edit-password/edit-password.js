import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";

document.addEventListener("DOMContentLoaded", () => {
  loadHeader();

  initEyeToggles();

  document.getElementById("verifyBtn").addEventListener("click", verifyCurrentPassword);
  document.getElementById("savePasswordBtn").addEventListener("click", changePassword);

  const currenetInput = document.getElementById("currentPassword");
  currenetInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      verifyCurrentPassword();
    }
  });

  const newInput = document.getElementById("newPassword");
  const confirmInput = document.getElementById("confirmPassword");
  [newInput, confirmInput].forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        changePassword();
      }
    });
  });
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
    .catch(error => {
      console.error(error);
      showToast("페이지에 문제가 발생했습니다.");
    });
}

const clickMenu = (e, dropdown) => {
  e.stopPropagation();
  dropdown.classList.toggle("show");

  document.getElementById("editInfo").addEventListener("click", () => window.location.href = "/my/edit-info");
  document.getElementById("editPw").addEventListener("click", () => {
    window.location.replace("/my/edit-password")
  });
  document.getElementById("logout").addEventListener("click", async () => {
    try {
      // 로그아웃 API 호출 (DELETE /auth)
      await apiRequest("/auth", {
        method: "DELETE",
      });

      // 클라이언트 저장소 초기화
      window.sessionStorage.clear();
      window.localStorage.clear();

      // 로그인 화면으로 이동 (뒤로가기 방지)
      window.location.replace("/login");

      showToast("로그아웃되었습니다.");

    } catch (error) {
      showToast("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
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
    // 비밀번호 확인 요청
    const data = await apiRequest("/users/password", {
      method: "POST",
      body: JSON.stringify({ password: value }),
    });

    // 성공 → 다음 단계로 이동
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";

  } catch (error) {
    // 401, 403은 apiRequest가 자동 리다이렉트하므로 여기서 처리 안 해도 됨
    console.error("비밀번호 확인 오류:", error);

    // 실패 → 에러 메시지 표시
    showFieldError(input, errorMsg, "비밀번호가 일치하지 않습니다.");
    showToast("비밀번호 확인에 실패했습니다.");
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
    const message = "새 비밀번호가 일치하지 않습니다."
    showFieldError(newInput, newError, message);
    showFieldError(confirmInput, confirmError, message);
    showToast(message);
    return;
  }

  try {
    // 비밀번호 변경 API 호출
    const data = await apiRequest("/users/password", {
      method: "PATCH",
      body: JSON.stringify({ password: newPassword }),
    });

    // 성공 시
    sessionStorage.setItem("toastMessage", "비밀번호가 성공적으로 변경되었습니다.");
    history.back();

  } catch (error) {
    // 401 / 403은 apiRequest가 자동으로 로그인 리다이렉트 처리함
    console.error("비밀번호 변경 실패:", error);
    showFieldError(confirmInput, confirmError, "비밀번호 변경 실패");
    showToast("비밀번호 변경 중 오류가 발생했습니다.");
  }
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