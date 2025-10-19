console.log("write js loaded");

// 파일 저장하는 리스트
const fileArr = [];
let fileNo = 0;

// 제목, 내용 유효성 검사
const validationState = {
    title: false,
    content: false
}

document.addEventListener("DOMContentLoaded", () => {
    // 헤더 파일 불러오기
    fetch("/common/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            document.getElementById("backBtn").addEventListener("click", () => history.back());
        })
        .catch(error => console.error(error));

    // 파라미터로 postId가 왔다면 해당 게시글 내용을 불러옴
    const postId = new URLSearchParams(window.location.search).get("postId");
    if (postId != null) {
        editPost(Number(postId));
        writeForm(Number(postId));
    } else writeForm(null);

    // 제목과 내용에 적는 동시에 유효성 검사
    validateTitle();
    validateContent();

    // 이미지 추가
    addFile();
});

// 수정 페이지
editPost = async (postId) => {
    const token = window.localStorage.getItem("accessToken");
    const BASE_URL = window.CONFIG.BASE_URL;

    try {
        const response = await fetch(`${BASE_URL}/posts/${postId}`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const postDetailResponse = await response.json();

        if (response.status === 200) {
            const post = postDetailResponse.data;

            // 제목, 내용
            document.getElementById("title").value = post.title;
            document.getElementById("content").value = post.content;
            document.getElementById("count").textContent = `${post.content.length} / 2000`

            validationState.title = true;
            validationState.content = true;
            activatePostButton();

            // 사진
            const fileListDiv = document.querySelector(".file-list");
            const imageList = post.imageList;

            for (let i = 0; i < imageList.length; i++) {
                const imageName = imageList[i].imageName;
                const imageUrl = imageList[i].imageUrl;

                // 이미지 url로 이미지 잠시 데이터에 저장한다음 file 객체 만들어서 저장
                const imageResponse = await fetch(imageUrl);
                const blob = await imageResponse.blob();

                const file = new File([blob], imageName, { type: blob.type });

                fileArr.push({
                    id: fileNo,
                    type: "exist",
                    file: file
                });

                // 파일 리스트 추가
                const fileHtml =
                    `
                    <div id="file${fileNo}" class="filebox">
                        <p class="name"> ${imageName}</p>
                        <button type="button" class="delete-btn" onclick="deleteFile(${fileNo++})">삭제</button>
                    </div>
                    `;

                fileListDiv.insertAdjacentHTML("beforeend", fileHtml);
            }
        }
    } catch (error) { console.error(error); }
}

// 제목 길이 검사
validateTitle = () => {
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
validateContent = () => {
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
addFile = () => {
    const fileDOM = document.querySelector('#images');
    const fileListDiv = document.querySelector(".file-list");

    fileDOM.addEventListener("change", (e) => {
        const maxCount = 3;
        const currentCount = document.querySelectorAll('.filebox').length;
        const addFiles = e.target.files;

        // 현재까지 추가한 파일 개수와 추가하려고 하는 파일 개수를 더했을 때 최대 개수를 넘기면
        // 추가하려고 하는 파일을 추가하지 않음
        if (currentCount + addFiles.length > maxCount) {
            alert("이미지는 최대 " + maxCount + "개까지 업로드 가능합니다.");
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

        console.log("fileArr: ", fileArr);
        // 입력한 값 초기화 -> 동일한 파일 재선택 가능
        e.target.value = "";
    });
}

// jpeg, png, jpg 만 가능
fileValidation = (file) => {
    const fileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!fileTypes.includes(file.type)) {
        alert("jpeg, png, jpg 확장자인 이미지만 첨부 가능합니다.");
        return false;
    }

    return true;
}

// 파일 삭제
deleteFile = (deleteNum) => {
    // 삭제하려는 파일의 id을 fileArr에서 찾음
    const index = fileArr.findIndex(f => f.id === deleteNum)

    // 삭제하려는 파일을 찾지 못하면 (index가 -1이면) return
    if (index === -1) return;

    // 배열에서 삭제
    fileArr.splice(index, 1);
    document.getElementById(`file${deleteNum}`).remove();
}

// 제목, 내용 모두 유효하면 완료버튼 활성화
activatePostButton = () => {
    const postButton = document.getElementById("completeBtn")

    if (validationState.title && validationState.content) {
        postButton.disabled = false;
        postButton.classList.add("active");
    } else {
        postButton.disabled = true;
        postButton.classList.remove("active");
    }
}

writeForm = (postId) => {
    const form = document.querySelector("#writeForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        writePost(postId)
    });
}

// 작성 완료 시 이전 화면으로 돌아감
writePost = async (postId) => {
    console.log(postId);
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    for (const file of fileArr) {
        formData.append("images", file.file);
    }

    try {
        const token = localStorage.getItem('accessToken');
        const BASE_URL = window.CONFIG.BASE_URL

        let response = "";

        if (postId == null) {
            response = await fetch(`${BASE_URL}/posts`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
        } else {
            response = await fetch(`${BASE_URL}/posts/${postId}`, {
                method: "PATCH",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
        }

        const writePostResponse = await response.json();

        if (response.status === 201) {
            history.back();
        } else {
            alert(writePostResponse.message);
        }
    } catch (error) { console.error(error) };
}