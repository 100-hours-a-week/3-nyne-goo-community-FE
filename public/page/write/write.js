import { apiRequest, upload, uploadPost } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";
import { loadLayout } from "/common/js/load-layout.js";

// 파일 저장하는 리스트
const fileArr = [];
let fileNo = 0;

// 제목, 내용 유효성 검사
const validationState = {
    title: false,
    content: false
}

document.addEventListener("DOMContentLoaded", () => {
    loadLayout("write_post");
    verifyToken();

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            verifyToken();
        }
    });
});

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

        // 이미지들을 병렬로 불러와 File로 변환
        const results = await Promise.allSettled(
            imageList.map(async (image) => {
                const imageName = String(image.imageName ?? "");
                return { imageName, imagePath: image.imagePath };
            })
        );


        for (const image of results) {
            if (image.status !== "fulfilled") {
                console.error("이미지 로드 실패:", image.reason);
                continue;
            }
            const { imageName, imagePath } = image.value;

            // fileArr에 파일 추가
            fileArr.push({ id: fileNo, type: "exist", imagePath: imagePath, imageName: imageName });

            const box = document.createElement("div");
            box.className = "filebox";
            box.id = `file${fileNo}`;
            box.dataset.id = String(fileNo); // id 파싱 대신 data-id 사용 권장

            const p = document.createElement("p");
            p.className = "name";
            p.textContent = imageName;

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "delete-btn";
            btn.textContent = "삭제";

            box.append(p, btn);
            fileListDiv.append(box);

            fileNo++;
        }

        fileListDiv.addEventListener("click", (e) => {
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
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                showToast("이미지 크기는 10MB 이하만 업로드 가능합니다.");
                e.target.value = ""; // 선택 초기화
                continue;
            }

            // 이미지가 아닌 다른 파일을 올리면 올리지 않음
            if (!fileValidation(file)) continue;

            // fileArr에 파일 추가
            fileArr.push({
                id: fileNo,
                type: "new",
                file: file,
                imageName: file.name
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

    try {
        const newImages = fileArr
            .map((item, index) => ({ ...item, index }))
            .filter((item) => item.type === "new");

        const newList = newImages.map((item) => item.file);
        const uploadedMap = new Map();

        const uploadResult = (newList.length > 0) ? await uploadPost(newList) : null;
        if (uploadResult != null && uploadResult.statusCode != 201) {
            throw new Error("이미지 업로드 중 오류가 발생했습니다.");
        } else {
            // 원래 fileArr 위치에 업로드 결과 매핑
            newImages.forEach((item, idx) => {
                uploadedMap.set(item.index, uploadResult.data[idx]);
            });
        }

        const imageList = null;
        for (let i = 0; i < fileArr.length; i++) {
            const image = fileArr[i];

            const imagePath = image.type === "new" ? new URL(uploadedMap.get(i).file_url).pathname : image.imagePath;
            const imageName = image.imageName;

            imageList.push({ imagePath, imageName });
        }

        const body = JSON.stringify({
            title,
            content,
            imageList
        });

        try {
            let response;
            if (postId == null) {
                response = await apiRequest("/posts", {
                    method: "POST",
                    body: body,
                    headers: {}, // multipart 헤더 자동 처리
                });
            } else {
                response = await apiRequest(`/posts/${postId}`, {
                    method: "PATCH",
                    body: body,
                    headers: {},
                });
            }

            if (response.statusCode === 201 || response.statusCode === 200) {
                window.sessionStorage.setItem("refreshHome", "true");
                window.sessionStorage.setItem("toastMessage", postId ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다!")
                history.back();
            } else {
                showToast("게시글 저장 실패");
            }
        } catch (error) {
            showToast("게시글 저장 중 오류가 발생했습니다.");
        }
    } catch (error) {
        showToast("게시글 저장 중 오류가 발생했습니다.");
    }
}