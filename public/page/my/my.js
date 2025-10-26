import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";

const my = JSON.parse(sessionStorage.getItem("userInfo"));

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();

    getMyInfo();

    const path = window.location.pathname;
    if (path.includes("/edit-info")) {
        // 헤더가 로드된 뒤 실행되도록 약간 딜레이 주기
        setTimeout(() => {
            clickEditInfo();
        }, 100);
    }
});

// 헤더 파일 불러오기
const loadHeader = () => {
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
        .catch(error => {
            console.error(error);
            showToast("페이지에 문제가 발생했습니다.");
        });
};

const clickMenu = (e, dropdown) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");

    document.getElementById("editInfo").addEventListener("click", () => window.location.replace("/my/edit-info"));
    document.getElementById("editPw").addEventListener("click", () => {
        window.location.replace("/my/edit-password");
    });
    document.getElementById("logout").addEventListener("click", async () => {
        try {
            await apiRequest("/auth", { method: "DELETE" });

            // 클라이언트 저장소 정리
            sessionStorage.clear();
            localStorage.clear();

            window.location.replace("/login");
        } catch (error) {
            showToast("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
}

const clickEditInfo = () => {
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
        const newNickname = newNicknameInput
            ? newNicknameInput.value.trim()
            : document.getElementById("nicknameValue").textContent;
        const profile = document.getElementById("profileInput");
        const newProfileUrl = document.getElementById("profileImg").src;

        const formData = new FormData();
        formData.append("nickname", newNickname);
        if (profile.files.length > 0) {
            formData.append("image", profile.files[0]);
        } else {
            formData.append("image", null);
        }

        try {
            // apiRequest 사용 (FormData는 Content-Type 자동 처리됨)
            const response = await apiRequest("/users", {
                method: "PATCH",
                body: formData,
                headers: {}, // Content-Type 자동 제거
            });

            if (response.statusCode === 200 || response.statusCode === 201) {
                const updatedInfo = {
                    email: my.email,
                    nickname: newNickname,
                    profileImgUrl: newProfileUrl,
                };
                sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
                showToast("회원정보가 수정되었습니다.");
                window.location.reload();
            }
        } catch (error) {
           showToast("회원정보 수정 중 오류가 발생했습니다.");
        }
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

const editProfile = () => {
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

const deleteUser = async () => {
    try {
    await apiRequest("/users", { method: "DELETE" });

    showToast("회원 탈퇴가 완료되었습니다.");

    // 클라이언트 저장소 초기화
    localStorage.clear();
    sessionStorage.clear();

    // 로그인 페이지로 이동
    window.location.replace("/login");

    // 뒤로가기 방지
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => window.history.go(1);

  } catch (error) {
    showToast("회원 탈퇴 중 오류가 발생했습니다.");
  }

}

const getMyInfo = () => {
    document.getElementById("profileImg").src = my.profileImgUrl
    document.getElementById("emailValue").textContent = my.email;
    document.getElementById("nicknameValue").textContent = my.nickname;
}

