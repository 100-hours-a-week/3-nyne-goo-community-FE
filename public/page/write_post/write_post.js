console.log("write js loaded");

const fileArr = [];
let fileNo = 0;

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

            document.getElementById("backBtn").addEventListener("click", () => window.location.href = "/home");
        })
        .catch(error => console.error(error));

    document.getElementById("title").addEventListener("input", (e) => writeTitle(e));
    document.getElementById("content").addEventListener("input", (e) => writeContent(e));

    addFile()
    
    const form = document.querySelector("#writeForm");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        writePost(e)
    });

});

writeTitle = (e) => {
    const titleLength = e.target.value.length;
    const titleError = document.getElementById("titleError");

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
}

writeContent = (e)=>{
     const contentLength = e.target.value.length;
     const contentError = document.getElementById("contentError");

     document.getElementById("count").textContent = `${contentLength} / 2000`

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
}

addFile = () => {
    const fileDOM = document.querySelector('#images');
    const fileListDiv = document.querySelector(".file-list");

    fileDOM.addEventListener("change", (e) => {
        const maxCount = 3;
        const currentCount = document.querySelectorAll('.filebox').length;

        const addFiles = e.target.files;
        if (addFiles.length > maxCount - currentCount) {
            alert("이미지는 최대 " + maxCount + "개까지 업로드 가능합니다.");
            return;
        }

        for (const file of addFiles) {
            console.log('파일 이름:', file.name);
            console.log('파일 크기:', file.size);
            console.log('파일 유형:', file.type);

            if (!fileValidation(file)) continue;

            // fileArr에 파일 추가
            fileArr.push({ id: fileNo, file });

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

fileValidation = (file) => {
    const fileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!fileTypes.includes(file.type)) {
        alert("jpeg, png, jpg 확장자인 이미지만 첨부 가능합니다.");
        return false;
    }

    return true;
}

deleteFile = (deleteNum) => {
    const index = fileArr.findIndex(f => f.id === deleteNum)

    if (index === -1) return;

    // 배열에서 삭제
    fileArr.splice(index, 1);
    document.getElementById(`file${deleteNum}`).remove();
}

// 제목, 내용 모두 유효하면 완료버튼 활성화
activatePostButton = ()=>{
    const postButton = document.getElementById("completeBtn")

    if(validationState.title && validationState.content){
        postButton.disabled = false;
        postButton.classList.add("active");
    }else{
        console.log(`title: ${validationState.title}, content: ${validationState.content}`)
        postButton.disabled = true;
        postButton.classList.remove("active");
    }
}

writePost = () => {
   window.location.href="/home";
}