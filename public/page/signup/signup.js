console.log("signup js loaded");

const validationState = {
    password: false,
    passwordConfirm: false,
    checkEmail: false,
    checkNickname: false,
};

// window.addEventListener("load") 사용했으나 속도면에서 느릴 수 있기 때문에
// document.addEventListener("DOMContentLoaded")로 바꾸고
// header.css 를 header.html안에 넣음
document.addEventListener("DOMContentLoaded", () => {
    // 로그인 한 상태라면 이 이전 페이지로 이동
    const token = sessionStorage.getItem("accessToken");
    if (token) {
        history.back();
    }

    loadHeader();
    uploadProfile();

    controlEmail();
    controlPassword();
    controlNickname();

    signupForm();
    login();
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

            // 프로필 사진 숨김
            const profile = document.querySelector(".profile");
            profile.classList.add("hide");

            document.getElementById("backBtn").addEventListener("click", () => { history.back() })
        })
        .catch(error => console.error(error));
};

// 이미지 업로드
uploadProfile = () => {
    const fileDOM = document.querySelector('#addProfile');
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

controlEmail = () => {
    document.getElementById("email").addEventListener("input", (e) => { validateEmail(e) });
    document.getElementById("checkEmail").addEventListener("click", checkEmail)
}

// 이메일 유효성 검사
validateEmail = (e) => {
    const email = e.target.value;
    const emailMsg = document.getElementById("emailMsg");
    const checkEmailButton = document.getElementById("checkEmail")

    const invalidChar = /[^a-zA-Z0-9@._]/.test(email);
    const containAt = email.includes("@");
    const containDot = email.includes(".");

    const isValid = !invalidChar && containAt && containDot;

    if (isValid) {
        emailMsg.classList.remove("show", "error");
        checkEmailButton.disabled = false;
        checkEmailButton.classList.add("active");
    } else {
        emailMsg.textContent =
            "이메일은 영문과 @, . 만 사용이 가능합니다.";
        emailMsg.classList.add("show", "error");
        checkEmailButton.disabled = true;
        checkEmailButton.classList.remove("active");
    }
}

// 이메일 중복 체크 통과 시 이메일 입력 비활성화
checkEmail = async () => {
    const emailInput = document.getElementById("email");

    try {
        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/users/availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                email: email.value
            })
        });

        const emailMsg = document.getElementById("emailMsg");

        // response 값
        const checkEmailResponse = await response.json();

        // statusCode = 200면 서버에 이메일 존재 유무에 따라 이메일 입력 비활성화
        // 아니라면 오류 메시지를 alert로 보여줌
        if (response.ok) {
            controlInputMsg(checkEmailResponse.data.exist, "email", emailMsg, emailInput, null);
        } else {
            controlInputMsg(null, null, emailMsg, emailInput)
        }
    } catch (error) { console.error(error) };
}

controlInputMsg = (exist, type, inputMsg, inputBox, message) => {
    // message 있으면 오류로 표시
    if (message != null) {
        inputMsg.textContent = message;

        inputBox.classList.remove("success");
        inputBox.classList.add("error");
        return;
    }

    // 이미 존재
    if (exist) {
        inputMsg.textContent = "이미 존재하는 이메일입니다."
        inputMsg.classList.add("show", "error");

        // 테두리 빨간색으로 변경
        inputBox.classList.remove("success");
        inputBox.classList.add("error");
    }
    // 사용 가능
    else {
        if (type == "email") {
            validationState.checkEmail = true;
            inputMsg.textContent = "사용 가능한 이메일입니다."
        }
        else if (type == "nickname") {
            validationState.checkNickname = true;
            inputMsg.textContent = "사용 가능한 닉네임입니다."
        }

        // 통과 시 inputBox 밑에 사용가능 함을 초록색으로 표시
        inputMsg.style.color = "green";
        inputMsg.classList.remove("error");
        inputMsg.classList.add("show", "success");

        // 입력 비활성화
        inputBox.readOnly = true;

        // 배경색 추가 및 테두리 초록색으로 변경
        inputBox.classList.remove("error");
        inputBox.classList.add("success", "readonly");

        changeSignupButton();
    }
}

controlPassword = () => {
    document.getElementById("password").addEventListener("input", (e) => { validatePassword(e) });
    document.getElementById("passwordConfirm").addEventListener("input", (e) => { validatePasswordConfirm(e) });

    const togglePassword = document.getElementById("togglePassword");
    const togglePasswordConfirm = document.getElementById("togglePasswordConfirm");
    const passwordInput = document.getElementById("password");
    const passwordConfirmInput = document.getElementById("passwordConfirm");

    clickEye(togglePassword, passwordInput);
    clickEye(togglePasswordConfirm, passwordConfirmInput);
}
// 비밀번호 유효성 검사
validatePassword = (e) => {
    const password = e.target.value;
    const passwordError = document.getElementById("passwordMsg");

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
        passwordError.classList.add("show", "error");
    }
}

// 비밀번호 한번 더 확인
validatePasswordConfirm = (e) => {
    const passwordBox = document.getElementById("password");
    const passwordConfirmBox = e.target
    const password = passwordBox.value;
    const passwordConfirm = passwordConfirmBox.value;

    const passwordError = document.getElementById("passwordMsg");

    // 비밀번호 유효성 맞지 않으면 비밀번호 재입력 칸도 빨갛게 표시
    if (passwordError.classList.contains("show")) showPwError(false, null, passwordBox, passwordConfirmBox)
    // 비밀번호 유효성 맞으면 일치 여부에 따라 표시
    else {
        console.log("비번 유효성은 맞음")
        const isValid = password === passwordConfirm
        validationState.passwordConfirm = isValid
        changeSignupButton();

        showPwError(isValid, "비밀번호가 일치하지 않습니다.", passwordBox, passwordConfirmBox)
    }

}

showPwError = (isValid, errorContext, passwordBox, passwordConfirmBox) => {
    const passwordConfirmError = document.getElementById("passwordConfirmMsg");

    if (isValid) {
        passwordConfirmError.classList.remove("show");

        passwordBox.classList.add("success")
        passwordConfirmBox.classList.add("success")

        passwordBox.classList.remove("error")
        passwordConfirmBox.classList.remove("error")
    } else {
        passwordBox.classList.remove("success")
        passwordConfirmBox.classList.remove("success")

        passwordBox.classList.add("error")
        passwordConfirmBox.classList.add("error")

        if (errorContext != null) {
            passwordConfirmError.textContent =
                "비밀번호가 일치하지 않습니다.";
            passwordConfirmError.classList.add("show", "error");
        }
    }
}

clickEye = (toggle, Input) => {
    toggle.addEventListener("click", () => {
        const isHidden = Input.type === "password";

        // 비밀번호 감추기/보이기 토글
        Input.type = isHidden ? "text" : "password";

        // 아이콘 변경
        toggle.src = isHidden
            ? "/assets/image/ic_eye_opend_black_64.png"     // 눈 뜬 이미지
            : "/assets/image/ic_eye_closed_black_64.png";  // 눈 감은 이미지
    });
}

controlNickname = () => {
    document.getElementById("nickname").addEventListener("input", (e) => { validateNicknameConfirm(e) });
    document.getElementById("checkNickname").addEventListener("click", checkNickname)

}

// 닉네임 유효성 검사
validateNicknameConfirm = (e) => {
    const nickname = e.target.value;
    const nicknameError = document.getElementById("nicknameMsg");
    const checkNicknameButton = document.getElementById("checkNickname")

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
        nicknameError.classList.add("show", "error");
        checkNicknameButton.disabled = false;
        checkNicknameButton.classList.remove("active");
    }
}

// 닉네임 중복 체크 통과 시 닉네임 입력 비활성화
checkNickname = async () => {
    const nicknameInput = document.getElementById("nickname");

    try {
        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/users/availability?nickname=${nicknameInput.value}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });

        const nicknameMsg = document.getElementById("nicknameMsg");

        // response 값
        const checkNicknameResponse = await response.json();

        // statusCode = 200면 서버에 닉네임 존재 유무에 따라 닉네임 입력 비활성화
        // 아니라면 오류 메시지를 alert로 보여줌
        if (response.ok) {
            controlInputMsg(checkNicknameResponse.data.exist, "nickname", nicknameMsg, nicknameInput, null)
        } else {
            controlInputMsg(null, null, nicknameMsg, nicknameInput, checkNicknameResponse.message)
        }
    } catch (error) { console.error(error) };
}


changeSignupButton = () => {
    const signupButton = document.getElementById("signupBtn");
    const allValid = validationState.password && validationState.passwordConfirm && validationState.checkEmail && validationState.checkNickname

    if (allValid) {
        signupButton.disabled = false;
        signupButton.classList.add("active");
    } else {
        signupButton.disabled = true;
        signupButton.classList.remove("active");
    }
}

ogin = () => {
    document.getElementById("goLoginBtn").addEventListener("click", () => {
        // 이전 페이지 URL
        const prev = document.referrer;

        // 이전 페이지가 로그인 화면이면 뒤로가기 실행
        if (prev && prev.includes("/login")) {
            history.back();
        }
        // 직접 url로 들어온 경우라면 login 페이지로 교체
        else {
            window.location.replace("/login");
        }
    })
};

signupForm = () => {
    const form = document.querySelector("#signupForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        signup(e)
    });
}

signup = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const nickname = document.getElementById("nickname").value;
    const profile = document.getElementById("addProfile");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("nickname", nickname);

    if (profile.files.length > 0) {
        formData.append("image", profile.files[0]);
    }

    try {
        // BASE_URL/auth로 보냄
        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            body: formData
        });

        // response 값
        const signupResponse = await response.json();

        // statusCode = 200이면 제대로 받은 것이므로 토큰 저장 후 홈으로 이동
        // 아니라면 오류 메시지를 alert로 보여줌
        if (response.status === 201) {
            window.location.href = "/login"
        } else {
            alert(signupResponse.message);
        }
    } catch (error) { console.error(error) };
}