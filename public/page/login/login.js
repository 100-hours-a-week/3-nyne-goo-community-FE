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

    const form = document.querySelector(".login");
    form.addEventListener("submit", (e) => login(e));

    const signupButton = document.getElementById("signupBtn");
    signupButton.addEventListener("click", signup)

    console.log("signupButton: ", signupButton);

    if (signupButton) {
        signupButton.addEventListener("click", signup);
    } else {
        console.error("signupButton not found in DOM");
    }
});


login = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
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

        const loginResponse = await response.json();

        console.log(loginResponse);
        if (response.ok) {
            localStorage.setItem('accessToken', loginResponse.data.accessToken);
            window.location.href = "/home"
        } else {
            alert(loginResponse.message);
        }
    } catch (error) { console.error(error) };
};

signup = () => {
    console.log("click signup!");
    window.location.href = "/signup";
}