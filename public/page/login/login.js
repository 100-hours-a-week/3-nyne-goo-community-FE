console.log("login js loaded");

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();

    // 로그인 한 상태라면 이 이전 페이지로 이동
    const token = sessionStorage.getItem("accessToken");
    if (token) {
        history.back();
    }

    // 로그인 버튼 클릭 시
    const form = document.querySelector(".login");
    form.addEventListener("submit", (e) => login(e));

    // 회원가입 글자 클릭 시
    const signupButton = document.getElementById("signupBtn");
    signupButton.addEventListener("click", signup)
});

// 헤더 파일 불러오기
loadHeader = () => {
    fetch("/common/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            // 뒤로가기  버튼, 프로필 사진 숨김
            const backButton = document.getElementById("backBtn")
            const profile = document.querySelector(".profile");

            backButton.classList.add("hide");
            profile.classList.add("hide");
        })
        .catch(error => console.error(error));
}


// 로그인 버튼 클릭 시 서버에 이메일, 비밀번호 보내고 토큰 가져옴
login = async (e) => {
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
        // BASE_URL/auth로 보냄
        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // response 값
        const loginResponse = await response.json();

        // statusCode = 200이면 제대로 받은 것이므로 토큰 저장 후 홈으로 이동
        // 아니라면 오류 메시지를 alert로 보여줌
        if (response.ok) {
            const accessToken = loginResponse.data.accessToken
            window.sessionStorage.setItem('accessToken', accessToken);

            // 사용자 정보 받아옴
            const userResponse = await fetch(`${BASE_URL}/users`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            const user = await userResponse.json();

            const userData = {
                profileImgUrl: user.data.profileImgUrl ?? "/assets/image/default_profile.png",
                nickname: user.data.nickname,
                email: user.data.email

            };

            // 사용자 정보 캐싱
            window.sessionStorage.setItem('userInfo', JSON.stringify(userData));

            // 로그인 후 다시 로그인으로 돌아오지 못하게
            window.location.replace("/home");
        } else {
            loginError.textContent = loginResponse.message;
            loginError.style.display = "block";
        }
    } catch (error) { console.error(error) };
};

showError = (input, error, message) => {
    error.textContent = message;
    error.style.display = "block";
    input.classList.add("error");
}

// 회원가입
signup = () => {
    console.log("click signup!");
    window.location.href = "/signup";
}