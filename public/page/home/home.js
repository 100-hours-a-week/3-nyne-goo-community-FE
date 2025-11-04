import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";
import { loadLayout } from "/common/js/load-layout.js";

let observer = null;
let currentPage = 0;
const size = 10;
let isFetching = false;
let hasMore = true;

document.addEventListener("DOMContentLoaded", async () => {
    const isFirstVisit = window.sessionStorage.getItem("firstVisited");

    const userResponse = await apiRequest("/users", {
        method: "GET",
    });

    const userData = {
        profileImgUrl: userResponse.data.profileImgUrl ?? "/assets/image/default_profile.png",
        nickname: userResponse.data.nickname,
        email: userResponse.data.email,
    };

    // 사용자 정보 세션 스토리지에 저장
    window.sessionStorage.setItem("userInfo", JSON.stringify(userData));

    if (isFirstVisit) {
        // 홈에 처음 진입했을 때만 사용자 정보 요청
        // 로그인 성공 시 사용자 정보 요청
        const toastMessage = `${userData.nickname}님, 환영합니다!`;
        showToast(toastMessage);
        window.sessionStorage.removeItem("firstVisited");
    }


    loadLayout("home")
    loadPopularPosts();
    getList();
    writePost();

    const toastMessage = sessionStorage.getItem("toastMessage");
    if (toastMessage) {
        showToast(toastMessage);
        sessionStorage.removeItem("toastMessage"); // 한 번만 뜨게
    }
});

// 인기 게시글 가져오기
const loadPopularPosts = async () => {
    try {
        const data = await apiRequest(`/posts?page=0&size=5&sort=likesCount,DESC&sort=createdAt,ASC`);
        renderPopularPosts(data.data.content.slice(0, 3));
    } catch (err) {
        console.error(err);
        showToast("인기 게시글을 불러오는 중 오류가 발생했습니다.");
    }
};

// 인기 게시글 렌더링
const renderPopularPosts = (posts) => {
    const container = document.querySelector(".popular-scroll");
    if (posts.length === 0) {
        container.textContent = ""; // 초기화
        const p = document.createElement("p");
        p.className = "empty-msg";
        p.textContent = "인기 게시글이 아직 없습니다.";
        container.append(p);
        return;
    }

    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "popular-card";
        card.addEventListener("click", () => {
            if (post.postId != null) {
                window.location.href = `/detail?postId=${encodeURIComponent(post.postId)}`;
            }
        });

        const h4 = document.createElement("h4");
        h4.textContent = post.title ?? "";

        const p = document.createElement("p");
        const content = post.content ?? "";
        p.textContent = content.length > 60 ? content.slice(0, 60) + "..." : content;

        const meta = document.createElement("div");
        meta.className = "popular-meta";

        const like = document.createElement("span");
        like.textContent = `❤️ ${post.likesCount ?? 0}`;

        const comment = document.createElement("span");
        comment.textContent = `💬 ${post.commentsCount ?? 0}`;

        const author = document.createElement("span");
        author.textContent = post.author?.name ?? "";

        meta.append(like, comment, author);
        card.append(h4, p, meta);
        fragment.append(card);
    });

    container.replaceChildren(fragment);
};

// 게시글 리스트 불러오기
const getList = async () => {
    try {
        isFetching = true;
        const data = await apiRequest(`/posts?page=${currentPage++}&size=${size}&sort=createdAt,DESC`);
        const postListResponse = data.data;

        // 게시글이 아예 없을 때
        if (postListResponse.content.length === 0 && currentPage === 1) {
            showToast("아직 작성된 게시글이 없습니다.");
            return;
        }

        renderPosts(postListResponse);
        console.log("response:? ", postListResponse);

        if (postListResponse.last) hasMore = false;
        else hasMore = true;
    } catch (error) {
        showToast("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
        isFetching = false;
    }
}

const renderPosts = (postListResponse) => {
    const list = document.querySelector(".post-list");

    // 한 번에 그리기 위해 프래그먼트 사용
    const fragment = document.createDocumentFragment();

    for (const post of postListResponse.content) {
        // 날짜 문자열 정리
        const raw = post.updatedAt ?? post.createdAt ?? "";
        const base = String(raw).replace("T", " ").split(".")[0] || "";
        const date = post.updatedAt ? `${base} (수정)` : base;

        // 프로필 이미지 URL (비정상 값이면 기본 이미지로)
        const candidate = post?.author?.profileImageUrl || "/assets/image/default_profile.png";
        const imageUrl = (/^(https?:\/\/|\/)/.test(candidate)) ? candidate : "/assets/image/default_profile.png";

        const card = document.createElement("div");
        card.className = "post";
        card.id = `post${post.postId ?? ""}`;

        // 각 게시글 클릭 시 해당 게시글 상세 페이지로 이동
        card.addEventListener("click", () => {
            const id = post.postId ?? "";
            goDetail(String(id)); // 내부 함수라면 그대로 사용, 아니면 location.href 사용
        });

        // 헤더
        const header = document.createElement("div");
        header.className = "post-header";

        const h2 = document.createElement("h2");
        h2.className = "post-title";
        const title = String(post.title ?? "");
        h2.textContent = title.length > 26 ? title.slice(0, 26) : title;

        header.append(h2);

        // 본문 
        const section = document.createElement("div");
        section.className = "post-section";

        const counts = document.createElement("div");
        counts.className = "post-count";

        const like = document.createElement("span");
        like.textContent = `좋아요 ${post.likesCount ?? 0}`;

        const comment = document.createElement("span");
        comment.textContent = `댓글 ${post.commentsCount ?? 0}`;

        const view = document.createElement("span");
        view.textContent = `조회수 ${post.viewsCount ?? 0}`;

        counts.append(like, comment, view);

        const dateSpan = document.createElement("span");
        dateSpan.className = "post-date";
        dateSpan.textContent = date;

        section.append(counts, dateSpan);

        // 구분선
        const hr = document.createElement("hr");
        hr.className = "post-divider";

        // 푸터
        const footer = document.createElement("div");
        footer.className = "post-footer";

        const img = document.createElement("img");
        img.className = "author-img";
        img.alt = "작성자 이미지";
        img.src = imageUrl;
        img.onerror = () => { img.src = "/assets/image/default_profile.png"; };

        const author = document.createElement("span");
        author.className = "author-name";
        author.textContent = String(post?.author?.name ?? "");

        footer.append(img, author);

        // 합치기
        card.append(header, section, hr, footer);
        fragment.append(card);
    }

    // 기존 리스트 뒤에 추가(append)하거나, 교체하고 싶으면 replaceChildren(frag)
    list.append(fragment);

    if (postListResponse.last) hasMore = false;
    else {
        hasMore = true;

        const lastIndex = postsDiv.length - 2; // 마지막에서 두 번째
        if (lastIndex > 0) onScroll(postsDiv[lastIndex]);
    }

    isFetching = false;
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

// 게시글 상세페이지
const goDetail = (postId) => {
    window.location.href = `/detail?postId=${postId}`
}

// 게시글 작성
const writePost = () => {
    // 게시글 작성 버튼 클릭
    const writePostButton = document.getElementById("writePostBtn")
    writePostButton.addEventListener("click", () => window.location.href = "/write");
}

