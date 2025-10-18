console.log("post_detail js loaded");

document.addEventListener("DOMContentLoaded", () => {
    // 헤더 파일 불러오기
    fetch("/common/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            // 뒤로가기 버튼 클릭 시 홈으로 감
            document.getElementById("backBtn").addEventListener("click", () => {
                history.back();
            })
        })
        .catch(error => console.error(error));

    const postId = new URLSearchParams(window.location.search).get("postId");
    const token = window.localStorage.getItem("accessToken");
    const BASE_URL = window.CONFIG.BASE_URL;

    getDetail(postId, token, BASE_URL);
    getComments(postId, token, BASE_URL);

    // 댓글 작성
    writeComment();
    submitComplete(postId, token, BASE_URL);

    // 좋아요 클릭
    clickLike(postId);
});

// 게시물 상세 내용
getDetail = async (postId, token, BASE_URL) => {
    try {
        const response = await fetch(`${BASE_URL}/posts/${postId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const detailResponse = await response.json();

        if (response.status === 200) {
            const post = detailResponse.data;
            // 제목, 유저프로필, 유저이름
            document.getElementById("postTitle").textContent = post.title;
            document.querySelector("#profile").src = (post.author.profileImageUrl == null) ? "/assets/image/default_profile.png" : post.author.profileImageUrl
            document.getElementById("postAuthorName").textContent = post.author.nickname;

            // 수정날짜 있으면 수정날짜 보여줌
            const date = document.getElementById("postDate");
            date.textContent = (post.updatedAt == null) ? post.createdAt.replace("T", " ").split(".")[0] : (post.updatedAt.replace("T", " ").split(".")[0] + " (수정)");

            // \n 여러 개를 <br>로 바꿔서 줄바꿈표시
            document.getElementById("postContent").innerHTML = post.content.replace(/\n/g, "<br>");

            // 좋아요, 조회수, 댓글 수
            document.getElementById("likeCount").textContent = post.likesCount;
            document.getElementById("viewCount").textContent = post.viewsCount;
            document.getElementById("commentCount").textContent = post.commentsCount;

            // 좋아요 버튼 활성화 여부
            const likeBtn = document.getElementById("likeBtn")
            if (post.like) {
                likeBtn.classList.add("active");
                document.getElementById("heartIcon").src = "/assets/image/ic_heart_red_64.png";
            }

            // 작성자가 자신이면 수정,삭제 버튼 보이게
            if (post.author.mine) {
                document.getElementById("postEdit").classList.add("show");
            }

            // 사진
            const imageListDiv = document.querySelector(".image-list");
            const imageList = post.imageUrlList;
            console.log("imagelist:", imageList, " , length: ", imageList.length);

            for (let i = 0; i < imageList.length; i++) {
                console.log(imageList[i]);
                const imageHtml =
                    `
                    <div id="image${i}" class="imagebox">
                        <img src = ${imageList[i]}>
                    </div>
                    `;

                imageListDiv.insertAdjacentHTML("beforeend", imageHtml);
            }

            editPost(postId);
        }
    } catch (error) { console.error(error) }
}

// 게시글 수정, 삭제 리스너
editPost = (postId) => {
    const editDiv = document.getElementById("postEdit");
    const editBtn = editDiv.querySelector(".edit-btn");
    const deleteBtn = editDiv.querySelector(".delete-btn");

    editBtn.addEventListener("click", () => {
        window.location.href = `/write?postId=${postId}`
    });
    deleteBtn.addEventListener("click", () => deletePost(postId));
}

// 댓글 리스트
getComments = async (postId, token, BASE_URL) => {
    try {
        const response = await fetch(`${BASE_URL}/posts/${postId}/comments?page=0&size=10&sort=createdAt,ASC`, {
            method: "GET",
            headers: { 'Authorization': `Bearer ${token}` }
        })

        const commentsResponse = await response.json();

        if (response.status === 200) {
            const commentList = commentsResponse.data.content;
            const commentListDiv = document.querySelector(".comment-list");

            // comments에 html들 넣어서 한 번에 comment-list에 넣기
            let comments = "";
            for (let i = 0; i < commentList.length; i++) {
                const comment = commentList[i];
                console.log("mine?: ", comment.author.mine);

                const date = (comment.updatedAt == null) ? comment.createdAt.replace("T", " ").split(".")[0] : (comment.updatedAt.replace("T", " ").split(".")[0] + " (수정)");
                const commentHtml =
                    `
                <div class="comment" id="comment${comment.commentId}">
                    <div class="comment-header">
                        <img src="${comment.author.profileImageUrl}" class="comment-profile" />
                        <div class="comment-info">
                            <p class="author-name", id="commentAuthor">${comment.author.name}</p>
                            <p class="date", id="commentDate">${date}</p>
                        </div>
                        ${comment.author.mine
                        ? `
                                <div class="edit-comment-btns" id="comment${comment.commentId}Edit">
                                    <button class="edit-btn">수정</button>
                                    <button class="delete-btn">삭제</button>
                                </div>
                            `: ""}
                        
                    </div>
                    <p class="comment-content">${comment.content}</p>
                </div>
            `

                comments += commentHtml;
            }

            commentListDiv.innerHTML = comments;

            editComment(token, BASE_URL);
        } else {
            alert(commentsResponse.message);
        }
    } catch (error) { console.error(error) }
}

// 댓글 수정, 삭제 리스너
editComment = (token, BASE_URL) => {
    const editButtons = document.querySelectorAll(".edit-comment-btns")
    editButtons.forEach((editDiv) => {
        const id = editDiv.id;
        const commentId = id.replace("comment", "").replace("Edit", "");
        // 수정
        editDiv.querySelector(".edit-btn").addEventListener("click", () => {
            rewriteComment(commentId, token, BASE_URL);
        }
        )
        // 삭제
        editDiv.querySelector(".delete-btn").addEventListener("click", () => {
            if (id.startsWith("comment")) {
                deleteComment(commentId, token, BASE_URL)
            }
        })
    });

}

// 댓글 수정
// 해당 댓글이 있는 위치에 textarea가 보이고 거기서 수정할 수 있도록
rewriteComment = (commentId, token, BASE_URL) => {
    const commentDiv = document.getElementById(`comment${commentId}`);
    const currentContent = commentDiv.querySelector(".comment-content");
    const editButtons = commentDiv.querySelector(".edit-comment-btns");

    const textarea = document.createElement("textarea");    // textarea 추가

    currentContent.style.display = "none";   // 기존 내용 숨김
    editButtons.style.display = "none";        // 수정, 삭제 버튼 숨김

    // textarea에는 원래 댓글 적혀있도록
    textarea.classList.add("edit-textarea");
    textarea.value = currentContent.textContent.trim();

    // 수정완료, 취소 버튼
    const buttonHtml =
        `
            <div class="rewrite-comment-btns">
                <button class="edit-btn" id="save${commentId}">완료</button>
                <button class="delete-btn" id="cancel${commentId}">취소</button>
            </div>
        `;

    // 수정완료&취소 버튼은 기존 수정&삭제 버튼 위치에 있도록 함
    editButtons.insertAdjacentHTML("afterend", buttonHtml);
    commentDiv.appendChild(textarea);

    // 수정 완료
    document.getElementById(`save${commentId}`).addEventListener("click", (e) => {
        saveEditedComment(commentId, token, BASE_URL, commentDiv);
    })

    // 수정 취소
    document.getElementById(`cancel${commentId}`).addEventListener("click", (e) => {
        cancelEdit(commentDiv);
    })
}

// 댓글 수정 완료
saveEditedComment = async (commentId, token, BASE_URL, commentDiv) => {
    try {
        const textarea = document.querySelector(".edit-textarea");
        const content = textarea.value.trim();

        const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`,
             },
            body: JSON.stringify({ content })
        })

        const editCommentResponse = response.json();

        if (response.status === 200) {
            // 아무 내용 안 쓰면 alert 발생
            if (content === "") return alert("내용을 입력하세요!");

            // 수정된 내용이 comment-content에 들어감
            commentDiv.querySelector(".comment-content").textContent = content;
            // 수정창, 완료&취소 버튼 숨기고 수정&삭제 버튼이 보이도록
            cancelEdit(commentDiv);
        }else{
            alert(editCommentResponse.message);
        }
    } catch (error) { console.error(error) }

}

// 댓글 수정 취소
cancelEdit = (commentDiv) => {
    document.querySelector(".edit-textarea")?.remove();
    document.querySelector(".rewrite-comment-btns")?.remove();

    commentDiv.querySelector(".comment-content").style.display = "block";   // 내용 보임
    commentDiv.querySelector(".edit-comment-btns").style.display = "block";        // 수정, 삭제 버튼 보임
}

// 댓글 작성
writeComment = () => {
    document.getElementById("commentInput").addEventListener("input", (e) => {


        const count = document.getElementById("count");
        const currentLength = e.target.value.length;

        count.textContent = currentLength + " / 500";

        const submitBtn = document.getElementById("submitComment");

        // 댓글 길이가 1이상이어야 완료 버튼 활성화됨
        if (currentLength > 0) {
            submitBtn.classList.add("active");
        } else submitBtn.classList.remove("active");
    });

}

// 댓글 작성 완료
submitComplete = (postId, token, BASE_URL) => {
    document.getElementById("submitComment").addEventListener("click", async () => {
        try {
            const content = document.getElementById("commentInput").value;
            const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            })

            const writeCommentResponse = await response.json();

            // 작성 완료 시 댓글 작성 칸 비우고 댓글 내역 불러옴
            if (response.status === 201) {
                document.getElementById("commentInput").value = ""
                document.getElementById("count").textContent = "0 / 500";
                getComments(postId, token, BASE_URL);
            }

        } catch (error) { console.error(error) }

    });

}

// 서버 연동하게 되면 삭제 api 호출 후 바로 댓글 리스트 api 호출해서
// 서버로부터 댓글 리스트 새로 받아옴
deleteComment = async(commentId, token, BASE_URL) => {
    try{
        const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
            method: "DELETE",
            headers: {'Authorization': `Bearer ${token}`}
        })

        if(response.status===200){
            alert("댓글이 삭제되었습니다.");
            window.location.reload();   // 전체 새로고침
        }else{
            alert(response.json().message);
        }
    }catch(error) {console.error(error)}
}

// 좋아요 클릭
clickLike = (postId) => {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = document.getElementById("likeCount");
    const heartIcon = document.getElementById("heartIcon");

    // toggle을 사용해서 좋아요 클릭 시 active 가 붙어있으면 제거, 없으면 추가함
    // active 상태에 따라 좋아요 이미지 아이콘 바꿈
    // 서버 연동 시 서버로부터 좋아요 수 가져와서 보여줌
    likeBtn.addEventListener("click", async () => {
        try {
            const isActive = likeBtn.classList.toggle("active");
            const token = window.localStorage.getItem("accessToken");
            const BASE_URL = window.CONFIG.BASE_URL
            const response = await fetch(`${BASE_URL}/post/${postId}/likes`, {
                method: `${isActive ? "POST" : "DELETE"}`,
                headers: { 'Authorization': `Bearer ${token}` },
            })

            const likeResponse = await response.json();

            if (response.status === 200 || response.status === 201) {
                heartIcon.src = isActive
                    ? "/assets/image/ic_heart_red_64.png"
                    : "/assets/image/ic_heart_white_64.png";

                likeCount.textContent = likeResponse.data.likesCount;
            } else {
                alert(likeResponse.message);
            }
        } catch (error) { console.error(error) };
    });
}