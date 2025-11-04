import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";
import { loadLayout } from "/common/js/load-layout.js";

let observer = null;
let currentPage = 0;
let isFetching = false;
let hasMore = true;
const size = 10;

let postId = -1;

document.addEventListener("DOMContentLoaded", () => {
    loadLayout("post_detail")

    postId = new URLSearchParams(window.location.search).get("postId");
    console.log(postId);

    getDetail();
    getComments();

    // 댓글 작성
    writeComment();
    submitComplete();

    // 좋아요 클릭
    clickLike();

    // 게시글 수정 후 돌아왔을 때 새로고침되도록
    window.addEventListener("pageshow", async (e) => {
        if (e.persisted) {
            getDetail();
            getComments();
        }
    });

    const toastMessage = sessionStorage.getItem("toastMessage");
    if (toastMessage) {
        showToast(toastMessage);
        sessionStorage.removeItem("toastMessage"); // 한 번만 뜨게
    }
});

// 게시물 상세 내용
const getDetail = async () => {
    try {
        const detailResponse = await apiRequest(`/posts/${postId}`, {
            method: "GET",
        });

        const post = detailResponse.data;

        // 제목, 유저프로필, 유저이름
        document.getElementById("postTitle").textContent = post.title;
        document.querySelector("#profile").src = (post.author.profileImageUrl == null)
            ? "/assets/image/default_profile.png"
            : post.author.profileImageUrl
        document.getElementById("postAuthorName").textContent = post.author.nickname;

        // 수정날짜 있으면 수정날짜 보여줌
        const date = document.getElementById("postDate");
        date.textContent = (post.updatedAt == null)
            ? post.createdAt.replace("T", " ").split(".")[0]
            : (post.updatedAt.replace("T", " ").split(".")[0] + " (수정)");

        // \n 여러 개를 <br>로 바꿔서 줄바꿈표시

        document.getElementById("postContent").textContent = post.content;

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
        imageListDiv.innerHTML = "";

        const fragment = document.createDocumentFragment();
        const imageList = post.imageList;

        imageList.forEach((img, i) => {
            const box = document.createElement("div");
            box.className = "imagebox";
            box.id = `image${i}`;

            const image = document.createElement("img");
            const safe = toSafeHttpUrl(img.imageUrl);
            image.src = safe ?? "/assets/image/default_image.png";   // 폴백
            image.alt = "첨부 이미지";
            image.loading = "lazy";
            image.decoding = "async";
            image.onerror = () => { image.src = "/assets/image/default_image.png"; };

            box.append(image);
            fragment.append(box);
        });

        imageListDiv.append(fragment);

        editPost();
    } catch (error) { showToast("게시글을 불러오는 중 오류가 발생했습니다."); }
}

// 게시글 수정, 삭제 리스너
const editPost = () => {
    const editDiv = document.getElementById("postEdit");
    const editBtn = editDiv.querySelector(".edit-btn");
    const deleteBtn = editDiv.querySelector(".delete-btn");

    editBtn.addEventListener("click", () => {
        window.location.href = `/write?postId=${postId}`
    });
    deleteBtn.addEventListener("click", () =>
        showDeleteDialog(null)
    );
}

const showDeleteDialog = (commentId) => {
    const dialog = document.getElementById("deleteDialog");
    dialog.classList.remove("hidden");

    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const cancelBtn = document.getElementById("cancelDeleteBtn");

    // 삭제
    confirmBtn.onclick = async () => {
        dialog.classList.add("hidden");
        if (commentId == null) await deletePost();
        else await deleteComment(commentId);
    };

    // 취소
    cancelBtn.onclick = () => {
        dialog.classList.add("hidden");
    };
}

// 댓글 리스트
const getComments = async () => {
    try {
        const commentsResponse = await apiRequest(
            `/posts/${postId}/comments?page=${currentPage}&size=${size}&sort=createdAt,DESC`,
            { method: "GET" }
        );

        const commentList = commentsResponse.data.content;
        const commentListDiv = document.querySelector(".comment-list");

        // 첫 페이지면 초기화
        if (currentPage++ === 0) commentListDiv.replaceChildren();

        const fragment = document.createDocumentFragment();

        for (const comment of commentList) {
            const raw = (comment.updatedAt==null)? comment.createdAt : comment.updatedAt;
            const base = String(raw).replace("T", " ").split(".")[0] || "";
            const date = comment.updatedAt ? `${base} (수정)` : base;

            const profileImage = (comment.author.profileImageUrl==null)? "/assets/image/default_profile.png":comment.author.profileImageUrl;

            const wrap = document.createElement("div");
            wrap.className = "comment";
            wrap.id = `comment${comment.commentId}`;

            const header = document.createElement("div");
            header.className = "comment-header";

            const img = document.createElement("img");
            img.className = "comment-profile";
            img.alt = "작성자 이미지";
            img.src = profileImage;
            img.loading = "lazy";
            img.decoding = "async";
            img.onerror = () => { img.src = "/assets/image/default_profile.png"; };

            const info = document.createElement("div");
            info.className = "comment-info";

            const nameP = document.createElement("p");
            nameP.className = "author-name";
            nameP.id = "commentAuthor";
            nameP.textContent = comment.author.name;

            const dateP = document.createElement("p");
            dateP.className = "date";
            dateP.id = "commentDate";
            dateP.textContent = date;

            info.append(nameP, dateP);

            header.append(img, info);

            if (comment.author.mine) {
                const btns = document.createElement("div");
                btns.className = "edit-comment-btns";
                btns.id = `comment${comment.commentId}Edit`;

                const editBtn = document.createElement("button");
                editBtn.className = "edit-btn";
                editBtn.type = "button";
                editBtn.textContent = "수정";

                const delBtn = document.createElement("button");
                delBtn.className = "delete-btn";
                delBtn.type = "button";
                delBtn.textContent = "삭제";

                btns.append(editBtn, delBtn);
                header.append(btns);
            }

            const contentP = document.createElement("p");
            contentP.className = "comment-content";
            contentP.textContent = comment.content;

            wrap.append(header, contentP);
            fragment.append(wrap);
            commentListDiv.append(fragment);
        }

        // 뒤에 더 있으면 intersection observer 연결
        if (commentsResponse.data.last) hasMore = false;
        else {
            hasMore = true;

            const commentsDiv = document.querySelectorAll(".comment");
            const lastIndex = commentsDiv.length - 2;
            if (lastIndex > 0) onScroll(commentsDiv[lastIndex]);
        }

        editComment();
        commentListDiv.classList.remove("fade");
    } catch (error) { showToast("댓글을 불러오는 중 오류가 발생했습니다."); }
}

const onScroll = (post) => {
    const io = getObserver();
    io.observe(post);
}

const getObserver = () => {
    if (!observer) {
        observer = new IntersectionObserver((entries, io) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                if (!isFetching && hasMore) getList();
                io.unobserve(entry.target); // 한번 감지 후 해제
            });
        })
    }

    return observer;
}

// 댓글 수정, 삭제 리스너
const editComment = () => {
    const editButtons = document.querySelectorAll(".edit-comment-btns")
    editButtons.forEach((editDiv) => {
        const id = editDiv.id;
        const commentId = id.replace("comment", "").replace("Edit", "");
        // 수정
        editDiv.querySelector(".edit-btn").addEventListener("click", () => {
            rewriteComment(commentId);
        })
        // 삭제
        editDiv.querySelector(".delete-btn").addEventListener("click", () => {
            if (id.startsWith("comment")) {
                showDeleteDialog(commentId)
            }
        })
    });

}

// 댓글 수정
// 해당 댓글이 있는 위치에 textarea가 보이고 거기서 수정할 수 있도록
const rewriteComment = (commentId) => {
    const commentDiv = document.getElementById(`comment${commentId}`);

    // ✅ 이미 수정 중이면 return (중복 생성 방지)
    if (commentDiv.querySelector(".edit-textarea")) return;

    const currentContent = commentDiv.querySelector(".comment-content");
    const editButtons = commentDiv.querySelector(".edit-comment-btns");

    const textarea = document.createElement("textarea");    // textarea 추가

    currentContent.style.display = "none";   // 기존 내용 숨김
    editButtons.style.display = "none";        // 수정, 삭제 버튼 숨김

    // textarea에는 원래 댓글 적혀있도록
    textarea.classList.add("edit-textarea");
    textarea.value = currentContent.innerHTML.trim().replace(/<br\s*\/?>/g, "\n");;

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
        saveEditedComment(commentId, commentDiv);
    })

    // 수정 취소
    document.getElementById(`cancel${commentId}`).addEventListener("click", (e) => {
        cancelEdit(commentDiv);
    })
}

// 댓글 수정 완료
const saveEditedComment = async (commentId, commentDiv) => {
    try {
        const textarea = document.querySelector(".edit-textarea");
        const content = textarea.value.trim();

        const response = await apiRequest(`/comments/₩${commentId}`, {
            method: "PATCH",
            body: JSON.stringify({ content })
        });

        // 아무 내용 안 쓰면 alert 발생
        if (content === "") {
            showToast("내용을 입력하세요!");
        }

        // 수정된 내용이 comment-content에 들어감
        commentDiv.querySelector(".comment-content").innerHTML = content.replace(/\n/g, "<br>");
        // 수정창, 완료&취소 버튼 숨기고 수정&삭제 버튼이 보이도록
        cancelEdit(commentDiv);
        showToast("댓글이 수정되었습니다.");
    } catch (error) { showToast("댓글 수정 중 오류가 발생했습니다."); }

}

// 댓글 수정 취소
const cancelEdit = (commentDiv) => {
    document.querySelector(".edit-textarea")?.remove();
    document.querySelector(".rewrite-comment-btns")?.remove();

    commentDiv.querySelector(".comment-content").style.display = "block";   // 내용 보임
    commentDiv.querySelector(".edit-comment-btns").style.display = "block";        // 수정, 삭제 버튼 보임
}

// 댓글 작성
const writeComment = () => {
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
const submitComplete = () => {
    document.getElementById("submitComment").addEventListener("click", async () => {
        try {
            const content = document.getElementById("commentInput").value.trim();
            if (!content) {
                showToast("댓글 내용을 입력해주세요!");
                return;
            }

            const writeCommentResponse = await apiRequest(`/posts/${postId}/comments`, {
                method: "POST",
                body: JSON.stringify({ content })
            });

            // 작성 완료 시 댓글 리스트 초기화 후 새로 불러옴
            document.getElementById("commentInput").value = "";
            document.getElementById("count").textContent = "0 / 500";

            // 댓글 리스트 영역 초기화 후 깜빡임 효과
            const commentListDiv = document.querySelector(".comment-list");
            commentListDiv.classList.add("fade");
            commentListDiv.innerHTML = "";

            currentPage = 0;
            hasMore = true;
            await getComments();

            commentListDiv.classList.remove("fade");

        } catch (error) { showToast("댓글 등록 중 오류가 발생했습니다."); }

    });

}

// 삭제 api 호출 후 바로 댓글 리스트 api 호출해서
// 서버로부터 댓글 리스트 새로 받아옴
const deleteComment = async (commentId) => {
    try {
        await apiRequest(`/comments/${commentId}`, { method: "DELETE" });

        showToast("댓글이 삭제되었습니다.");
        window.location.reload();   // 전체 새로고침
    } catch (error) { showToast("댓글 삭제 중 오류가 발생했습니다."); }
}

// 좋아요 클릭
const clickLike = () => {
    const likeBtn = document.getElementById("likeBtn");
    const likeCount = document.getElementById("likeCount");
    const heartIcon = document.getElementById("heartIcon");

    // toggle을 사용해서 좋아요 클릭 시 active 가 붙어있으면 제거, 없으면 추가함
    // active 상태에 따라 좋아요 이미지 아이콘 바꿈
    // 서버 연동 시 서버로부터 좋아요 수 가져와서 보여줌
    likeBtn.addEventListener("click", async () => {
        try {
            const isActive = likeBtn.classList.toggle("active");

            const likeResponse = await apiRequest(`/posts/${postId}/likes`, {
                method: `${isActive ? "POST" : "DELETE"}`,
            });

            heartIcon.src = isActive
                ? "/assets/image/ic_heart_red_64.png"
                : "/assets/image/ic_heart_white_64.png";

            likeCount.textContent = likeResponse.data.likesCount;
        } catch (error) { showToast("오류가 발생했습니다."); };
    });
}

const deletePost = async () => {
    try {
        await apiRequest(`/posts/${postId}`, { method: "DELETE" });

        window.sessionStorage.setItem("toastMessage", "게시글이 삭제되었습니다.");
        history.back();
    } catch (error) { showToast("오류가 발생했습니다."); }
}

const escapeHTML = (str) => {
    return str.replace(/[&<>"']/g, (tag) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[tag]));
}