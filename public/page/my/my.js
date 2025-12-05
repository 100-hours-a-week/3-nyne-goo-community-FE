import { apiRequest, upload } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";
import { loadLayout } from "/common/js/load-layout.js";

document.addEventListener("DOMContentLoaded", () => {
    loadLayout("my");
    getMyInfo();

    const isEdit = window.location.pathname.includes("/edit-info");
    document.documentElement.dataset.mode = isEdit ? "edit" : "view";

    if (isEdit) {
        // 헤더가 로드된 뒤 실행되도록 약간 딜레이 주기
        setTimeout(() => {
            clickEditInfo();
        }, 100);
    }

    const toastMessage = sessionStorage.getItem("toastMessage");
    if (toastMessage) {
        showToast(toastMessage);
        sessionStorage.removeItem("toastMessage"); // 한 번만 뜨게
    }

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            verifyToken();
        }
    });

    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    toTop();
});

const getMyInfo = async ()  => {
    const userResponse = await apiRequest("/users", {
        method: "GET",
    });

    const userInfo = userResponse.data

    document.getElementById("profileImage").src = userInfo.imagePath;
    document.getElementById("emailValue").textContent = userInfo.email;
    document.getElementById("nicknameValue").textContent = userInfo.nickname;
}

const clickEditInfo = () => {
    const nicknameValue = document.getElementById("nicknameValue");
    const current = nicknameValue.textContent;

    const input = document.createElement("input");
    input.type = "text";
    input.id = "nicknameInput";
    input.className = "nickname-input";
    input.maxLength = 10;
    input.value = current;
    input.autocomplete = "off";

    nicknameValue.replaceChildren(input);
    input.focus();

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
        const newProfileUrl = document.getElementById("profileImage").src;

        if (!newNickname) {
            // 닉네임 비어있을 때
            newNicknameInput.classList.add("input-error");
            showToast("닉네임을 입력해주세요.");

            // 0.5초 뒤 빨간 테두리 제거 (흔들림 효과 후 복원)
            setTimeout(() => {
                newNicknameInput.classList.remove("input-error");
            }, 600);

            return;
        }
        newNicknameInput.classList.remove("input-error");

        try {
            const file = profile.files[0] ?? null;

            const uploadResult = file ? await upload(file) : null;
            const imagePath = uploadResult.data.length > 0
            ? new URL(uploadResult.data[0].file_url).pathname 
            : null;
            const imageName = file ? file.name : null;

            if (uploadResult != null && !uploadResult.statusCode === 201) {
                showToast("")
                throw new Error("프로필 이미지 업로드 중 오류가 발생했습니다.");
            }

            const body = JSON.stringify({
                nickname: newNickname,
                image: imagePath && imageName ? {imagePath, imageName} : null
            });

            console.log("imageName: ", imageName);

            try {
                // apiRequest 사용 (FormData는 Content-Type 자동 처리됨)
                const response = await apiRequest("/users", {
                    method: "PATCH",
                    body: body,
                    headers: {}, // Content-Type 자동 제거
                });

                if (response != null) {
                    const updatedInfo = {
                        email: my.email,
                        nickname: newNickname,
                        profileImageUrl: imageUrl!=null?imageUrl:newProfileUrl,     // 새 프로필 이미지면 s3 에서 받은 값을 저장
                    };
                    sessionStorage.setItem("userInfo", JSON.stringify(updatedInfo));
                    sessionStorage.setItem("toastMessage", "회원정보가 성공적으로 변경되었습니다.");
                    window.location.replace("/my");
                }
            } catch (error) {
                if (error.status === 409) {
                    newNicknameInput.classList.add("input-error");
                    showToast("이미 사용 중인 닉네임입니다.");

                    setTimeout(() => {
                        newNicknameInput.classList.remove("input-error");
                    }, 600);

                    return;
                }
            }
        } catch (error) {
            showToast("프로필 수정 중 오류가 발생했습니다.");
        }

    });

    // 탈퇴
    document.getElementById("deleteBtn").addEventListener("click", () => {
        const deleteAlert = document.getElementById("deleteAlert")
        deleteAlert.style.display = "flex";
        document.getElementById("cancelBtn").addEventListener("click", () => {
            deleteAlert.style.display = "none";
        })

        document.getElementById("confirmBtn").addEventListener("click", () => deleteUser());
    })
}

const editProfile = () => {
    const profileInput = document.getElementById("profileInput");
    const profileImage = document.getElementById("profileImage");

    document.getElementById("changeProfileBtn").addEventListener("click", () => {
        profileInput.click();
    });

    profileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            showToast("이미지 크기는 10MB 이하만 업로드 가능합니다.");
            e.target.value = ""; // 선택 초기화 (같은 파일 다시 선택 가능하게)
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            profileImage.src = ev.target.result; // 미리보기 반영
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const verifyToken = async () => {
    try {
        // 인증 확인: 쿠키에 유효한 토큰 있는지 확인
        const res = await apiRequest("/users", { method: "GET" });

        if (!res) throw Error(res)
    } catch (err) {
        window.sessionStorage.setItem("toastMessage", "로그인이 필요합니다.");
        window.location.replace("/login");
    }
}