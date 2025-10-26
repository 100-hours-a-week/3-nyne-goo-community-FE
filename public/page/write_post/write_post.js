import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";

// 파일 저장하는 리스트
const fileArr = [];
let fileNo = 0;

// 제목, 내용 유효성 검사
const validationState = {
    title: false,
    content: false
}

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    verifyToken();

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            verifyToken();
        }
    });
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

            const script = document.createElement("script");
            script.src = "/common/js/header.js";
            document.body.appendChild(script);

            document.getElementById("backBtn").addEventListener("click", () => history.back());
        })
        .catch(error => {
            console.error(error);
            showToast("페이지에 문제가 발생했습니다.");
        });
}

const verifyToken = async () => {
    try {
        // 인증 확인: 쿠키에 유효한 토큰 있는지 확인
        const res = await apiRequest("/users", { method: "GET" });
        if (!res) return; // 401/403이면 apiRequest가 이미 /login으로 이동시킴

        // 파라미터로 postId가 왔다면 해당 게시글 내용을 불러옴
        const postId = new URLSearchParams(window.location.search).get("postId");
        if (postId != null) {
            editPost(Number(postId));
            writeForm(Number(postId));
        } else writeForm(null);

        // 제목과 내용에 적는 동시에 유효성 검사
        validateTitle();
        validateContent();
        addFile();
    } catch (err) {
        showToast("로그인이 필요합니다.");
        window.location.replace("/login");
    }
}

// 수정 페이지
const editPost = async (postId) => {
    try {
        const response = await apiRequest(`/posts/${postId}`, { method: "GET" });
        const post = response.data;

        // 제목, 내용
        document.getElementById("title").value = post.title;
        document.getElementById("content").value = post.content;
        document.getElementById("count").textContent = `${post.content.length} / 2000`;

        validationState.title = true;
        validationState.content = true;
        activatePostButton();

        // 이미지
        const fileListDiv = document.querySelector(".file-list");
        const imageList = post.imageList;

        for (let i = 0; i < imageList.length; i++) {
            const imageName = imageList[i].imageName;
            const imageUrl = imageList[i].imageUrl;


            // 이미지 url로 이미지 잠시 데이터에 저장한다음 file 객체 만들어서 저장
            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();
            const file = new File([blob], imageName, { type: blob.type });

            fileArr.push({ id: fileNo, type: "exist", file });

            // 파일 리스트 추가
            const fileHtml = `
        <div id="file${fileNo++}" class="filebox">
            <p class="name"> ${imageName}</p>
            <button type="button" class="delete-btn">삭제</button>
        </div>`;
            fileListDiv.insertAdjacentHTML("beforeend", fileHtml);
        }

        document.querySelector(".file-list").addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-btn")) {
                const id = e.target.parentElement.id.replace("file", "");
                deleteFile(Number(id));
            }
        });
    } catch (error) {
        showToast("게시글 데이터를 불러오는 중 오류가 발생했습니다.");
    }

}

// 제목 길이 검사
const validateTitle = () => {
    document.getElementById("title").addEventListener("input", (e) => {
        const titleLength = e.target.value.length;
        const titleError = document.getElementById("titleError");

        // 제목 길이가 0 이상이면 validationState.title을 true로 바꾸고 버튼 활성화 가능한지 확인
        // 아니면 titleError 보임
        if (titleLength > 0) {
            titleError.classList.remove("show");
            validationState.title = true;
            activatePostButton()
        } else {
            titleError.textContent =
                "제목을 입력해주세요.";
            titleError.classList.add("show");
            validationState.title = false;
            activatePostButton()
        }
    });

}

// 내용 길이 검사
const validateContent = () => {
    document.getElementById("content").addEventListener("input", (e) => {
        const contentLength = e.target.value.length;
        const contentError = document.getElementById("contentError");

        document.getElementById("count").textContent = `${contentLength} / 2000`

        // 내용 길이가 0 이상이면 validationState.content을 true로 바꾸고 버튼 활성화 가능한지 확인
        // 아니면 titleError 보임
        if (contentLength > 0) {
            contentError.classList.remove("show");
            validationState.content = true;
            activatePostButton()
        } else {
            contentError.textContent =
                "내용을 작성해주세요.";
            contentError.classList.add("show");
            validationState.content = false;
            activatePostButton()
        }
    });
}

// 이미지 추가 (최대 3장)
const addFile = () => {
    const fileDOM = document.querySelector('#images');
    const fileListDiv = document.querySelector(".file-list");

    fileDOM.addEventListener("change", (e) => {
        const maxCount = 3;
        const currentCount = document.querySelectorAll('.filebox').length;
        const addFiles = e.target.files;

        // 현재까지 추가한 파일 개수와 추가하려고 하는 파일 개수를 더했을 때 최대 개수를 넘기면
        // 추가하려고 하는 파일을 추가하지 않음
        if (currentCount + addFiles.length > maxCount) {
            showToast(`이미지는 최대 ${maxCount}개까지 업로드 가능합니다.`);
            return;
        }

        for (const file of addFiles) {
            // 이미지가 아닌 다른 파일을 올리면 올리지 않음
            if (!fileValidation(file)) continue;

            // fileArr에 파일 추가
            fileArr.push({
                id: fileNo,
                type: "new",
                file: file
            });

            // 파일 리스트 추가
            const fileHtml =
                `
                    <div id="file${fileNo}" class="filebox">
                        <p class="name"> ${file.name}</p>
                        <button type="button" class="delete-btn" onclick="deleteFile(${fileNo++})">삭제</button>
                    </div>
                    `;

            fileListDiv.insertAdjacentHTML("beforeend", fileHtml);
        }
        // 입력한 값 초기화 -> 동일한 파일 재선택 가능
        e.target.value = "";
    });
}

// jpeg, png, jpg 만 가능
const fileValidation = (file) => {
    const fileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!fileTypes.includes(file.type)) {
        showToast("jpeg, png, jpg 확장자만 첨부 가능합니다.");
        return false;
    }

    return true;
}

// 파일 삭제
const deleteFile = (deleteNum) => {
    // 삭제하려는 파일의 id을 fileArr에서 찾음
    const index = fileArr.findIndex(f => f.id === deleteNum)

    // 삭제하려는 파일을 찾지 못하면 (index가 -1이면) return
    if (index === -1) return;

    // 배열에서 삭제
    fileArr.splice(index, 1);
    document.getElementById(`file${deleteNum}`).remove();
}

// 제목, 내용 모두 유효하면 완료버튼 활성화
const activatePostButton = () => {
    const postButton = document.getElementById("completeBtn")

    if (validationState.title && validationState.content) {
        postButton.disabled = false;
        postButton.classList.add("active");
    } else {
        postButton.disabled = true;
        postButton.classList.remove("active");
    }
}

const writeForm = (postId) => {
    const form = document.querySelector("#writeForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        writePost(postId)
    });
}

// 작성 완료 시 이전 화면으로 돌아감
const writePost = async (postId) => {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    if (title === "" || content === "") {
        showToast("제목과 내용을 모두 입력해주세요.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    for (const file of fileArr) {
        formData.append("images", file.file);
    }

    try {
        let response;
        if (postId == null) {
            response = await apiRequest("/posts", {
                method: "POST",
                body: formData,
                headers: {}, // multipart 헤더 자동 처리
            });
        } else {
            response = await apiRequest(`/posts/${postId}`, {
                method: "PATCH",
                body: formData,
                headers: {},
            });
        }

        if (response.statusCode === 201 || response.statusCode === 200) {
            showToast(postId ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다!");
            window.sessionStorage.setItem("refreshHome", "true");
            history.back();
        } else {
            showToast("게시글 저장 실패");
        }
    } catch (error) {
        showToast("게시글 저장 중 오류가 발생했습니다.");
    }
}