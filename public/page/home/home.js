import { apiRequest } from "/common/js/api.js";
import { showToast } from "/common/js/toast.js";

let currentPage = 0;
const size = 10;
let isFetching = false;
let hasMore = true;

document.addEventListener("DOMContentLoaded", async () => {
    const isFirstVisit = !sessionStorage.getItem("homeVisited");

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
    }


    loadHeader();
    loadFooter();
    loadPopularPosts();
    getList();
    writePost();

    // 게시글 상세 또는 게시글 작성에서 홈으로 온 경우 게시글 리스트만 새로고침 되도록
    window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
            console.log("bfcache");
            currentPage = 0;
            hasMore = true;
            document.querySelector(".post-list").innerHTML = "";
            getList();
        }
    });

    const toastMessage = sessionStorage.getItem("toastMessage");
    if (toastMessage) {
        showToast(toastMessage);
        sessionStorage.removeItem("toastMessage"); // 한 번만 뜨게
    }
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

            // 뒤로가기 버튼 숨김
            const backButton = document.getElementById("backBtn")
            backButton.classList.add("hide");
        })
        .catch(error => {
            showToast("페이지에 문제가 발생했습니다.");
        });
}

// footer 불러오기
const loadFooter = () => {
  fetch("/common/html/footer.html")
    .then((response) => {
      if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
      return response.text();
    })
    .then((data) => {
      document.getElementById("footer").innerHTML = data;
    })
    .catch((error) => {
      console.error(error);
      showToast("푸터를 불러오는 중 문제가 발생했습니다.");
    });
};

// 인기 게시글 가져오기
const loadPopularPosts = async () => {
  try {
    const data = await apiRequest(`/posts?page=0&size=5&sort=likesCount,DESC`);
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
    container.innerHTML = `<p class="empty-msg">인기 게시글이 아직 없습니다.</p>`;
    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="popular-card" onclick="window.location.href='/detail?postId=${post.postId}'">
      <h4>${post.title}</h4>
      <p>${post.content?.slice(0, 60) ?? ""}...</p>
      <div class="popular-meta">
        <span>❤️ ${post.likesCount}</span>
        <span>💬 ${post.commentsCount}</span>
        <span>${post.author.name}</span>
      </div>
    </div>
  `).join("");
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

        if (postListResponse.last) hasMore = false;
        else hasMore = true;
    } catch (error) {
        showToast("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
        isFetching = false;
    }
}

const renderPosts = (postListResponse) => {
    // posts에 게시글들 html로 만들어서 post-lists에 한번에 넣기
    let posts = "";
    for (const post of postListResponse.content) {
        // 서버에서 localdatetime으로 오기 때문에 날짜와 시간 사이의 "T"를 제거하고 초의 소수점 뒤를 날림
        // updatedAt에 값이 있으면 수정된 시간을 보여주고 아니면 생성시간을 보여줌
        const date = (post.updatedAt == null) ? post.createdAt.replace("T", " ").split(".")[0] : (post.updatedAt.replace("T", " ").split(".")[0] + " (수정)");
        const imageUrl = (post.author.profileImageUrl == null) ? "/assets/image/default_profile.png" : post.author.profileImageUrl

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

    if (postListResponse.last) hasMore = false;
    else {
        hasMore = true;

        const lastIndex = postsDiv.length - 2; // 마지막에서 두 번째
        if (lastIndex > 0) onScroll(postsDiv[lastIndex]);
    }

    isFetching = false;
}

const onScroll = (post) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isFetching && hasMore) getList();

                observer.unobserve(entry.target);
            }
        });
    });
    observer.observe(post);
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

