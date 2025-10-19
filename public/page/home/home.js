console.log("home js loaded");

let currentPage = 0;
let isFetching = false;
let hasMore = true;

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
    getList();
    writePost();

    // 게시글 상세에서 홈으로 온 경우 게시글 리스트 새로고침 되도록
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            currentPage = 0;
            hasMore = true;
            document.querySelector(".post-list").innerHTML = "";
            getList();
        }
    });
});

// 헤더 파일 불러오기
loadHeader = ()=>{
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

            // 뒤로가기 버튼 숨김
            const backButton = document.getElementById("backBtn")
            backButton.classList.add("hide");
        })
        .catch(error => console.error(error));
}

// 게시글 리스트 불러오기
getList = async () => {
    try {
        isFetching = true;
        const token = sessionStorage.getItem('accessToken');

        const BASE_URL = window.CONFIG.BASE_URL;
        const response = await fetch(`${BASE_URL}/posts?page=${currentPage++}&size=10&sort=createdAt,ASC`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        });

        // response 값
        const postListResponse = await response.json();

        if (response.status===200) {
            // posts에 게시글들 html로 만들어서 post-lists에 한번에 넣기
            let posts = "";
            for (const post of postList) {
                // 서버에서 localdatetime으로 오기 때문에 날짜와 시간 사이의 "T"를 제거하고 초의 소수점 뒤를 날림
                // updatedAt에 값이 있으면 수정된 시간을 보여주고 아니면 생성시간을 보여줌
                console.log("post: ",post);
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
            list.insertAdjacentHTML("beforeend", posts);

            // 각 게시글 클릭 시 해당 게시글 상세 페이지로 이동
            const postsDiv = document.querySelectorAll(".post");
            postsDiv.forEach((postDiv) => {
                postDiv.addEventListener("click", () => { goDetail(postDiv.id.replace("post", "")) });
            })

            if (postListResponse.data.last) hasMore = false;
            else {
                hasMore = true;

                const lastIndex = postsDiv.length - 2; // 마지막에서 두 번째
                if (lastIndex > 0) onScroll(postsDiv[lastIndex]);
            }
            

            isFetching = false;
        }
        else {
            alert(postListResponse.message);
        }

    } catch (error) { console.error(error) };
}

onScroll = (post) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                if(!isFetching && hasMore) getList();

                observer.unobserve(entry.target);
            }
        });
    });
    observer.observe(post);
}

// 게시글 상세페이지
goDetail = (postId) => {
    window.location.href = `/detail?postId=${postId}`
}

// 게시글 작성
writePost = () => {
    // 게시글 작성 버튼 클릭
    const writePostButton = document.getElementById("writePostBtn")
    writePostButton.addEventListener("click", () => window.location.href = "/write");

}

