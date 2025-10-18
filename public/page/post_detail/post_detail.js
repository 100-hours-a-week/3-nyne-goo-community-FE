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

    getDetail();
    getComments();

    // 댓글 작성
    document.getElementById("commentInput").addEventListener("input", (e) => writeComment(e));
    document.getElementById("submitComment").addEventListener("click", () => submitComplete());

    // 좋아요 클릭
    clickLike();
});

// 게시물 상세 내용
getDetail = () => {
    fetch("/data/postDetail.json")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.json();
        })
        .then(data => {
            const post = data.data.post;

            // 제목, 유저프로필, 유저이름
            document.getElementById("postTitle").textContent = post.title;
            document.querySelector("#profile").src = post.author.profileImageUrl;
            document.getElementById("postAuthorName").textContent = post.author.nickname;

            // 수정날짜 있으면 수정날짜 보여줌
            const date = document.getElementById("postDate");
            date.textContent = (post.updatedAt == "") ? post.createdAt.replace("T", " ") : (post.updatedAt.replace("T", " ") + " (수정)");

            // \n 여러 개를 <br>로 바꿔서 줄바꿈표시
            document.getElementById("postContent").innerHTML = post.content.replace(/\n/g, "<br>");

            // 좋아요, 조회수, 댓글 수
            document.getElementById("likeCount").textContent = post.likesCount;
            document.getElementById("viewCount").textContent = post.viewsCount;
            document.getElementById("commentCount").textContent = post.commentsCount;

            // 좋아요 버튼 활성화 여부
            const likeBtn = document.getElementById("likeBtn")
            if (post.isLike) {
                likeBtn.classList.add("active");
                document.getElementById("heartIcon").src = "/assets/image/ic_heart_red_64.png";
            }

            // 작성자가 자신이면 수정,삭제 버튼 보이게
            if (post.author.mine) {
                console.log("it's mine!");
                document.getElementById("postEdit").classList.add("show");
            }

            // 사진
            const imageListDiv = document.querySelector(".image-list");
            const imageList = post.imageUrlList;

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

            editPost(post.postId);
        })
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
getComments = () => {
    fetch("/data/comments.json")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.json();
        })
        .then(data => {
            const commentList = data.data.comments;
            const commentListDiv = document.querySelector(".comment-list");

            // comments에 html들 넣어서 한 번에 comment-list에 넣기
            let comments = "";
            for (let i = 0; i < commentList.length; i++) {
                const comment = commentList[i];
                const date = (comment.updatedAt == "") ? comment.createdAt.replace("T", " ") : (comment.updatedAt.replace("T", " ") + " (수정)");

                console.log("mine: " + comment.author.mine);
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

            editComment();
        });
}

// 댓글 수정, 삭제 리스너
editComment = () => {
    const editButtons = document.querySelectorAll(".edit-comment-btns")
    editButtons.forEach((editDiv) => {
        const id = editDiv.id;
        const commentId = id.replace("comment", "").replace("Edit", "");
        // 수정
        editDiv.querySelector(".edit-btn").addEventListener("click", () => {
            rewriteComment(commentId);
        }
        )
        // 삭제
        editDiv.querySelector(".delete-btn").addEventListener("click", () => {
            if (id.startsWith("comment")) {
                deleteComment(commentId)
            }
        })
    });

}

// 댓글 수정
// 해당 댓글이 있는 위치에 textarea가 보이고 거기서 수정할 수 있도록
rewriteComment = (commentId) => {
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

    console.log("comment: " + commentDiv.innerHTML);

    // 수정 완료
    document.getElementById(`save${commentId}`).addEventListener("click", (e) => {
        saveEditedComment(commentDiv);
    })

    // 수정 취소
    document.getElementById(`cancel${commentId}`).addEventListener("click", (e) => {
        cancelEdit(commentDiv);
    })
}

// 댓글 수정 완료
saveEditedComment = (commentDiv) => {
    const textarea = document.querySelector(".edit-textarea");
    const newText = textarea.value.trim();

    // 아무 내용 안 쓰면 alert 발생
    if (newText === "") return alert("내용을 입력하세요!");

    // 수정된 내용이 comment-content에 들어감
    commentDiv.querySelector(".comment-content").textContent = newText;
    // 수정창, 완료&취소 버튼 숨기고 수정&삭제 버튼이 보이도록
    cancelEdit(commentDiv);
}

// 댓글 수정 취소
cancelEdit = (commentDiv) => {
    document.querySelector(".edit-textarea")?.remove();
    document.querySelector(".rewrite-comment-btns")?.remove();

    commentDiv.querySelector(".comment-content").style.display = "block";   // 내용 보임
    commentDiv.querySelector(".edit-comment-btns").style.display = "block";        // 수정, 삭제 버튼 보임
}

// 댓글 작성
writeComment = (e) => {
    const count = document.getElementById("count");
    const currentLength = e.target.value.length;

    count.textContent = currentLength + " / 500";

    const submitBtn = document.getElementById("submitComment");

    // 댓글 길이가 1이상이어야 완료 버튼 활성화됨
    if (currentLength > 0) {
        submitBtn.classList.add("active");
    } else submitBtn.classList.remove("active");
}

// 댓글 작성 완료
submitComplete = () => {
    alert("댓글 작성 완료!");
    document.getElementById("commentInput").value = ""
    document.getElementById("count").textContent = "0 / 500";
}

// 서버 연동하게 되면 삭제 api 호출 후 바로 댓글 리스트 api 호출해서
// 서버로부터 댓글 리스트 새로 받아옴
deleteComment = (commentDiv) => {
    alert("삭제 완료!");
}

// 좋아요 클릭
clickLike = () => {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = document.getElementById("likeCount");
    const heartIcon = document.getElementById("heartIcon");

    // toggle을 사용해서 좋아요 클릭 시 active 가 붙어있으면 제거, 없으면 추가함
    // active 상태에 따라 좋아요 이미지 아이콘 바꿈
    // 서버 연동 시 서버로부터 좋아요 수 가져와서 보여줌
    likeBtn.addEventListener("click", () => {
        const isActive = likeBtn.classList.toggle("active");

        heartIcon.src = isActive
            ? "/assets/image/ic_heart_red_64.png"
            : "/assets/image/ic_heart_white_64.png";

        likeCount.textContent = parseInt(likeCount.textContent) + (isActive ? 1 : -1);
    });
}