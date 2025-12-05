import { showToast } from "/common/js/toast.js";
import { apiRequest } from "/common/js/api.js";
import { toAbsUrl } from "/common/js/to-url.js";

// layout 파일 불러오기
export function loadLayout(location) {
    fetch("/common/html/layout.html")
        .then(response => {
            if (!response.ok) throw new Error("파일을 불러올 수 없습니다.");
            return response.text();
        })
        .then(data => {
            // layout.html에서 header, footer를 가져와서 html의 header, footer 위치에 넣기
            const layout = new DOMParser().parseFromString(data, "text/html");
            const headerLayout = layout.querySelector("header#header");
            const footerLayout = layout.querySelector("footer#footer");

            const header = document.getElementById("header");
            const footer = document.getElementById("footer");

            if (headerLayout && header) header.replaceChildren(document.importNode(headerLayout, true));
            if (footerLayout && footer) footer.replaceChildren(document.importNode(footerLayout, true));

            const backButton = header.querySelector("#backBtn")
            const menu = header.querySelector("#userProfile")

            switch (location) {
                case "my":
                    const dropdown = header.querySelector("#dropdownMenu");

                    menu.src = "/assets/image/ic_menu_black_512.png";
                    menu.classList.add("menu");     // menu 붙여서 border-radius=0으로.
                    menu.dataset.lock = "menu";     // setProfile 이 덮어쓰지 못함
                    menu.addEventListener("click", (e) => { clickMenu(header, e, dropdown) })

                    // 메뉴 밖 클릭 시 닫기
                    document.addEventListener("click", () => dropdown.classList.remove("show"));
                    break;

                case "home":
                    // 뒤로가기 버튼 숨김
                    backButton.classList.add("hide");

                default:
                    // menu 제거
                    menu.removeAttribute("data-lock");
                    menu.classList.remove("menu");
            }

            backButton.addEventListener("click", () => { history.back() });

            setProfile();
        })
        .catch(error => {
            console.error(error);
            showToast("페이지에 문제가 발생했습니다.");
        });
}

const setProfile = () => {
    const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));

    const profile = document.getElementById("userProfile");
    if(profile.dataset && profile.dataset.lock==="menu") return;
    profile.src = userInfo.profileImagePath || "/assets/image/default_profile.png";

    clickProfile();
}

const clickProfile = () => {
    document.getElementById("userProfile").addEventListener("click", ()=>{
        window.location.href="/my";
    })
}

const clickMenu = (header, e, dropdown) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");

    header.querySelector("#editInfo").addEventListener("click", () => {
        window.location.href = "/my/edit-info"
    });

    header.querySelector("#editPw").addEventListener("click", () => {
        window.location.href = "/my/edit-password";
    });
    header.querySelector("#logout").addEventListener("click", async () => {
        console.log("click logout");
        try {
            console.log("logout request");
            await apiRequest("/auth", { method: "DELETE" });

            // 클라이언트 저장소 정리
            sessionStorage.clear();
            localStorage.clear();

            window.location.replace("/login");
        } catch (error) {
            showToast("로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
    });
}