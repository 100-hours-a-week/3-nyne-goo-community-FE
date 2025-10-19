console.log("login js loaded");

document.addEventListener("DOMContentLoaded", () => {
    // 헤더 파일 불러오기
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

    // 로그인 버튼 클릭 시
    const form = document.querySelector(".login");
    form.addEventListener("submit", (e) => login(e));

    // 회원가입 글자 클릭 시
    const signupButton = document.getElementById("signupBtn");
    signupButton.addEventListener("click", signup)
});

// 로그인 버튼 클릭 시 서버에 이메일, 비밀번호 보내고 토큰 가져옴
login = async (e) => {
    e.preventDefault();     // 페이지 새로고침 막음
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

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
            // TODO: localStorage에 보관하면 보안에 매우 위험. 추후 수정
            const accessToken = loginResponse.data.accessToken
            localStorage.setItem('accessToken', accessToken);

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

            // ✅ 사용자 정보 캐싱
            window.localStorage.setItem("userInfo", JSON.stringify(userData));

            window.location.href = "/home"
        } else {
            alert(loginResponse.message);
        }
    } catch (error) { console.error(error) };
};

// 회원가입
signup = () => {
    console.log("click signup!");
    window.location.href = "/signup";
}