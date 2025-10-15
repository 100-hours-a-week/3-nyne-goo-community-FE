console.log("home js loaded");

document.addEventListener("DOMContentLoaded", () => {
    fetch("/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            // 프로필 사진 숨김
            requestAnimationFrame(() => {
                const backButton = document.getElementById("back")

                backButton.classList.add("hide");
            });
        })
        .catch(error => console.error(error));
    
        getList();
});

getList = ()=>{
    fetch("/data/allPost.json")
    .then(response=>{
        if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.json();
    })
    .then(data=>{
        const postList = data.data.postList;
        
        let posts = "";
        for(const post of postList){ 
            console.log(post.title);

            let date = post.createdDate.replace("T", " ");
            if(post.updatedDate!=""){
                date =`${post.updatedDate.replace("T", " ")} (수정)`;
            }

            posts +=
            `
            <div class="post">
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
                    <img src="${post.author.profileImageUrl}" alt="작성자 이미지" class="author-img">
                    <span class="author-name">${post.author.nickname}</span>
                </div>
            </div>
            `
        }

        const list = document.querySelector(".post-list");
        list.innerHTML = posts;
    })
}