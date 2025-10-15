console.log("login js loaded");

document.addEventListener("DOMContentLoaded", () => {
    fetch("/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;
        })
        .catch(error => console.error(error));

    const form = document.querySelector(".login");
    form.addEventListener("submit", (e) => login(e));

    const signupButton = document.getElementById("signup");
    signupButton.addEventListener("click", signup)

    console.log("signupButton: ", signupButton);

    if (signupButton) {
        signupButton.addEventListener("click", signup);
    } else {
        console.error("❌ signupButton not found in DOM");
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
            alert('로그인 성공');
        } else {
            alert(loginResponse.message);
        }
    } catch (error) { console.error(error) };
};

signup = () => {
    console.log("click signup!");
    window.location.href = "/signup";
}