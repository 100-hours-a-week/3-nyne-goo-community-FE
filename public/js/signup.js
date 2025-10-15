console.log("signup js loaded");

const validationState = {
    password: false,
    passwordConfirm: false,
    checkEmail: false,
    checkNickname: false,
};


// css까지 끝난 후 js 실행하기 위해 window.addEventListener("load") 사용
document.addEventListener("DOMContentLoaded", () => {
    fetch("/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            // 프로필 사진 숨김, 뒤로가기 버튼 보임
            requestAnimationFrame(() => {
                const profile = document.querySelector(".profile");

                profile.classList.add("hide");
            });

            document.getElementById("back").addEventListener("click", login)
        })
        .catch(error => console.error(error));

    uploadProfile;

    document.getElementById("check-email").addEventListener("click", checkEmail)
    document.getElementById("check-nickname").addEventListener("click", checkNickname)

    document.getElementById("email").addEventListener("input", (e) => { validateEmail(e) });
    document.getElementById("password").addEventListener("input", (e) => { validatePassword(e) });
    document.getElementById("password-confirm").addEventListener("input", (e) => { validatePasswordConfirm(e) });
    document.getElementById("nickname").addEventListener("input", (e) => { validateNicknameConfirm(e) });

    const form = document.querySelector("#signup-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        signup(e)});

    document.getElementById("go-login").addEventListener("click", login);
});

// 이미지 업로드
uploadProfile = () => {
    const fileDOM = document.querySelector('#add-profile');
    const profile = document.querySelector('#profile');
    const plusIcon = document.querySelector('.profile-circle span'); // + 버튼

    fileDOM.addEventListener('change', () => {
        const reader = new FileReader();
        reader.onload = ({ target }) => {
            console.log(target.result);
            profile.src = target.result;

            profile.style.display = 'block';
            plusIcon.style.display = 'none'; // + 아이콘 숨기기
        };
        reader.readAsDataURL(fileDOM.files[0]);
    });
}

// 이메일 중복 체크 통과 시 이메일 입력 비활성화
checkEmail = () => {
    // TODO: 서버통신할 부분
    alert("이메일 사용 가능!");
    validationState.checkEmail = true;

    // 이메일 입력 비활성화
    const emailInput = document.getElementById("email");
    emailInput.readOnly = true;
    emailInput.classList.add("readonly");

    changeSignupButton();
}

// 닉네임 중복 체크 통과 시 닉네임 입력 비활성화
checkNickname = () => {
    // TODO: 서버통신할 부분
    alert("닉네임 사용 가능!");
    validationState.checkNickname = true;

    // 닉네임 입력 비활성화
    const nicknameInput = document.getElementById("nickname");
    nicknameInput.readOnly = true;
    nicknameInput.classList.add("readonly");

    changeSignupButton();
}

// 이메일 유효성 검사
validateEmail = (e) => {
    const email = e.target.value;
    const emailError = document.getElementById("email-error");
    const checkEmailButton = document.getElementById("check-email")

    const invalidChar = /[^a-zA-Z0-9@._]/.test(email);
    const containAt = email.includes("@");
    const containDot = email.includes(".");

    const isValid = !invalidChar && containAt && containDot;

    if (isValid) {
        emailError.classList.remove("show");
        checkEmailButton.disabled = false;
        checkEmailButton.classList.add("active");
    } else {
        emailError.textContent =
            "이메일은 영문과 @, . 만 사용이 가능합니다.";
        emailError.classList.add("show");
        checkEmailButton.disabled = true;
        checkEmailButton.classList.remove("active");
    }
}

// 비밀번호 유효성 검사
validatePassword = (e) => {
    const password = e.target.value;
    const passwordError = document.getElementById("password-error");

    const lengthValid = password.length >= 8 && password.length <= 20;      // 길이

    const hasUpper = /[A-Z]/.test(password);        // 대문자
    const hasLower = /[a-z]/.test(password);        // 소문자
    const hasNumber = /[0-9]/.test(password);       // 숫자
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);     // 특수문자

    // 모든 조건 만족하는지
    const isValid = lengthValid && hasUpper && hasLower && hasNumber && hasSpecial;
    validationState.password = isValid
    changeSignupButton();

    if (isValid) {
        passwordError.classList.remove("show");
    } else {
        passwordError.textContent =
            "비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.";
        passwordError.classList.add("show");
    }
}

// 비밀번호 한번 더 확인
validatePasswordConfirm = (e) => {
    const password = document.getElementById("password").value;
    const passwordConfirm = e.target.value;
    const passwordError = document.getElementById("password-confirm-error");

    // 모든 조건 만족하는지
    const isValid = password === passwordConfirm
    validationState.passwordConfirm = isValid
    changeSignupButton();

    if (isValid) {
        passwordError.classList.remove("show");
    } else {
        passwordError.textContent =
            "비밀번호가 일치하지 않습니다.";
        passwordError.classList.add("show");
    }
}

// 닉네임 유효성 검사
validateNicknameConfirm = (e) => {
    const nickname = e.target.value;
    const nicknameError = document.getElementById("nickname-error");
    const checkNicknameButton = document.getElementById("check-nickname")

    const lengthValid = nickname.length <= 10 && nickname.length > 0; // 1~10자
    const hasSpace = /\s/.test(nickname); // 공백문자 검사

    // 모든 조건 만족하는지
    const isValid = lengthValid && !hasSpace;

    if (isValid) {
        nicknameError.classList.remove("show");
        checkNicknameButton.disabled = false;
        checkNicknameButton.classList.add("active");
    } else {
        nicknameError.textContent =
            "띄어쓰기 불가, 10자 이내로 작성해주세요.";
        nicknameError.classList.add("show");
        checkNicknameButton.disabled = false;
        checkNicknameButton.classList.remove("active");
    }
}

changeSignupButton = () => {
    const signupButton = document.getElementById("signup-btn");
    const allValid = validationState.password && validationState.passwordConfirm && validationState.checkEmail && validationState.checkNickname

    if (allValid) {
        signupButton.disabled = false;
        signupButton.classList.add("active");
    } else {
        signupButton.disabled = true;
        signupButton.classList.remove("active");
    }
}

login = () => {
    window.location.href = "/login"
};

signup = () => {
    window.location.href = "/login";
}