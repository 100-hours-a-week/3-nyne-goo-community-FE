console.log("my js loaded");

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();

    getMyInfo();
});

// 헤더 파일 불러오기
loadHeader = () => {
    fetch("/common/html/header.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            document.getElementById("header").innerHTML = data;

            // 프로필 사진 숨김
            const menu = document.getElementById("userProfile")
            const dropdown = document.getElementById("dropdownMenu");

            menu.src = "/assets/image/ic_menu_black_512.png";
            menu.classList.add("menu");
            menu.addEventListener("click", (e) => { clickMenu(e, dropdown) })

            // 메뉴 밖 클릭 시 닫기
            document.addEventListener("click", () => {
                dropdown.classList.remove("show");
            });

            document.getElementById("backBtn").addEventListener("click", () => { history.back() })
        })
        .catch(error => console.error(error));
};

clickMenu = (e, dropdown) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
}

getMyInfo = () => {
    const my = JSON.parse(sessionStorage.getItem("userInfo"));
    console.log("my: ", my);
    document.getElementById("emailValue").textContent = my.email;
    document.getElementById("nicknameValue").textContent = my.nickname;
}