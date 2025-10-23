console.log("my js loaded");

const my = JSON.parse(sessionStorage.getItem("userInfo"));

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    getMyInfo();
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

            // 프로필 사진을 메뉴로 변경
            const menu = document.getElementById("userProfile")
            const dropdown = document.getElementById("dropdownMenu");

            menu.src = "/assets/image/ic_menu_black_512.png";
            menu.classList.add("menu");
            menu.addEventListener("click", (e) => { clickMenu(e, dropdown) })

            // 메뉴 밖 클릭 시 닫기
            document.addEventListener("click", () => dropdown.classList.remove("show"));

            document.getElementById("backBtn").addEventListener("click", () => { history.back() })
        })
        .catch(error => console.error(error));
};

clickMenu = (e, dropdown) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");

    document.getElementById("editInfo").addEventListener("click", () => clickEditInfo());
    document.getElementById("editPw").addEventListener("click", () => {
        console.log("click edit password")
        window.location.href = "/edit-password"
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

clickEditInfo = () => {
    const nicknameValue = document.getElementById("nicknameValue");
    const current = nicknameValue.textContent;

    nicknameValue.innerHTML = `
      <input type="text" id="nicknameInput" class="nickname-input" maxlength = "10", value="${current}" />
    `;
    document.getElementById("nicknameInput").focus();

    document.getElementById("changeProfileBtn").classList.add("show");
    const buttonBox = document.getElementById("bottomBtns").classList.add("show");


    // 사진 변경
    editProfile();

    // 저장
    document.getElementById("saveBtn").addEventListener("click", async () => {
        const newNicknameInput = document.getElementById("nicknameInput");
        const newNickname = newNicknameInput ? newNicknameInput.value.trim() : document.getElementById("nicknameValue").textContent;
        const profile = document.getElementById("profileInput");
        const newProfileUrl = document.getElementById("profileImg").src;

        const formData = new FormData();
        formData.append("nickname", newNickname);

        if (profile.files.length > 0) {
            formData.append("image", profile.files[0]);
        } else formData.append("image", null);

        try {
            const BASE_URL = window.CONFIG.BASE_URL;
            const response = await fetch(`${BASE_URL}/users`, {
                method: 'PATCH',
                credentials: 'include',
                body: formData
            })

            const editInfoResponse = await response.json();
            if (response.status === 200) {
                const updatedInfo = {
                    email: my.email,
                    nickname: newNickname,
                    profileImgUrl: newProfileUrl
                };

                sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
                window.location.reload();
            }
            else {
                console.log(editInfoResponse.message);
            }
        } catch (error) { console.error(error) }

    });

    // 탈퇴
    document.getElementById("deleteBtn").addEventListener("click", () => {
        const deleteAlert = document.getElementById("deleteAlert").style.display = "flex";
        document.getElementById("cancelBtn").addEventListener("click", () => {
            deleteAlert.style.display = "none";
        })

        document.getElementById("confirmBtn").addEventListener("click", () => deleteUser());
    })
}

editProfile = () => {
    const profileInput = document.getElementById("profileInput");
    const profileImg = document.getElementById("profileImg");

    document.getElementById("changeProfileBtn").addEventListener("click", () => {
        profileInput.click();
    });

    profileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            profileImg.src = ev.target.result; // 미리보기 반영
        };
        reader.readAsDataURL(file);
    });

}

deleteUser = async () => {
    try {
        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/users`, {
            method: "DELETE",
            credentials: 'include',
        })

        const deleteUserResponse = await response.json();

        if (response.status === 200) {
            alert("회원 탈퇴가 완료되었습니다.");

            // 클라이언트 저장소 초기화
            window.localStorage.clear();
            window.sessionStorage.clear();

            // 브라우저 히스토리 초기화
            window.location.replace("/login");

            // 히스토리 스택 방어 (뒤로가기 막기)
            window.history.pushState(null, "", window.location.href);
            window.onpopstate = () => {
                window.history.go(1);
            };
        } else {
            console.log(deleteUserResponse.message);
        }
    } catch (error) { console.error(error); }

}

getMyInfo = () => {
    document.getElementById("profileImg").src = my.profileImgUrl
    document.getElementById("emailValue").textContent = my.email;
    document.getElementById("nicknameValue").textContent = my.nickname;
}

