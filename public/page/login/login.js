import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";

document.addEventListener("DOMContentLoaded", () => {

     setTimeout(() => {
        document.getElementById("loginSection").scrollIntoView({
            behavior: "smooth"
        });
    }, 1500);

    // 로그인 버튼 클릭 시
    const form = document.querySelector(".login-form");
    form.addEventListener("submit", (e) => login(e));

    // 회원가입 글자 클릭 시
    const signupButton = document.getElementById("signupBtn");
    signupButton.addEventListener("click", signup)

    const toastMessage = sessionStorage.getItem("toastMessage");
    if (toastMessage) {
        showToast(toastMessage);
        sessionStorage.removeItem("toastMessage"); // 한 번만 뜨게
    }

    verifyToken();
});

const verifyToken = async()=>{
     try {
            // 인증 확인: 쿠키에 유효한 토큰 있는지 확인
            const res = await apiRequest("/users", { method: "GET" });
            if (!res) return; // 401/403이면 apiRequest가 이미 /login으로 이동시킴

            // 통과했다면 home 으로 이동
            window.location.replace("/home");
        } catch (err) {
            showToast("로그인이 필요합니다.");
        }
}


// 로그인 버튼 클릭 시 서버에 이메일, 비밀번호 보내고 토큰 가져옴
const login = async (e) => {
    e.preventDefault();     // 페이지 새로고침 막음

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const loginError = document.getElementById("loginError");

    // 에러 초기화
    emailError.style.display = "none";
    passwordError.style.display = "none";
    loginError.style.display = "none";

    emailInput.classList.remove("error");
    passwordInput.classList.remove("error");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const name = "asldifj";

    // 이메일 비었는지
    if (!email) {
        showError(emailInput, emailError, "이메일을 입력하세요.");
        return;
    }

    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(emailInput, emailError, "올바른 이메일 형식을 입력하세요.");
        return;
    }

    // 비밀번호 비었는지
    if (!password) {
        showError(passwordInput, passwordError, "비밀번호를 입력하세요.");
        return;
    }

    // 비밀번호 최소 길이 확인
    if (password.length < 6) {
        showError(passwordInput, passwordError, "비밀번호는 최소 6자 이상이어야 합니다.");;
        return;
    }

    try {
        // 로그인 요청
        const loginResponse = await apiRequest("/auth", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (loginResponse == null) throw new Error();
    
        window.location.replace("/home");

    } catch (error) {
        // 서버나 네트워크 오류 시 토스트로 표시
        let errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다."
        if (error.message.includes("Failed to fetch")) {
            errorMessage = "서버와 연결할 수 없습니다. 인터넷 상태를 확인해주세요."
        }

        showToast(errorMessage);

        // 401, 403은 apiRequest에서 이미 처리되므로 나머지 에러만 표시
        const loginError = document.getElementById("loginError");
        loginError.textContent = errorMessage
        loginError.style.display = "block";
    }
};

const showError = (input, error, message) => {
    error.textContent = message;
    error.style.display = "block";
    input.classList.add("error");
}

// 회원가입
const signup = async () => {
    //window.location.href="/signup";
    window.location.href = `${window.CONFIG.BASE_URL}/terms`;
}