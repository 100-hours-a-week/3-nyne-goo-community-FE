console.log("home js loaded");

document.addEventListener("DOMContentLoaded", () => {
    // 헤더 파일 불러오기
    fetch("/common/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            // 뒤로가기 버튼 숨김
            const backButton = document.getElementById("backBtn")
            backButton.classList.add("hide");
        })
        .catch(error => console.error(error));

    getList();
    writePost();
});

// 게시글 리스트 불러오기
getList = async () => {
    try {
        const token = localStorage.getItem('accessToken');

        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/posts?page=0&size=10&sort=createdAt,ASC`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        });

        // response 값
        const postListResponse = await response.json();

        if (response.ok) {
            const postList = postListResponse.data.content;

            // posts에 게시글들 html로 만들어서 post-lists에 한번에 넣기
            let posts = "";
            for (const post of postList) {
                // 서버에서 localdatetime으로 오기 때문에 날짜와 시간 사이의 "T"를 제거하고 초의 소수점 뒤를 날림
                // updatedAt에 값이 있으면 수정된 시간을 보여주고 아니면 생성시간을 보여줌
                const date = (post.updatedAt == null) ? post.createdAt.replace("T", " ").split(".")[0] : (post.updatedAt.replace("T", " ").split(".")[0] + " (수정)");
                const imageUrl = (post.author.profileImageUrl == null) ? "/assets/image/default_profile.png" : post.author.profileImageUrl
                console.log("imageUrl: ", post.author.profileImageUrl);

                // 제목, 좋아요&댓글&조회수, 날짜, 작성자 이미지&작성자 이름
                posts +=
                    `
            <div class="post" id="post${post.postId}">
                <div class="post-header">
                    <h2 class="post-title">${post.title.slice(0, 26)}</h2>
                </div>
                <div class="post-section">
                    <div class="post-count">
                        <span>좋아요 ${post.likesCount}</span>
                        <span>댓글 ${post.commentsCount}</span>
                        <span>조회수 ${post.viewsCount}</span>
                    </div>
                    <span class="post-date">${date}</span>
                </div>
                <hr class="post-divider">
                <div class="post-footer">
                    <img src="${imageUrl}" alt="작성자 이미지" class="author-img">
                    <span class="author-name">${post.author.name}</span>
                </div>
            </div>
            `
            }

            const list = document.querySelector(".post-list");
            list.innerHTML = posts;

            // 각 게시글 클릭 시 해당 게시글 상세 페이지로 이동
            document.querySelectorAll(".post").forEach((postDiv) => {
                postDiv.addEventListener("click", () => { goDetail() });
            })
        }
        else {
            alert(postListResponse.message);
        }

    } catch (error) { console.error(error) };
}

// 게시글 상세페이지
goDetail = () => {
    window.location.href = "/detail"
}

// 게시글 작성
writePost = () => {
    // 게시글 작성 버튼 클릭
    const writePostButton = document.getElementById("writePostBtn")
    writePostButton.addEventListener("click", () => window.location.href = "/write");

}

