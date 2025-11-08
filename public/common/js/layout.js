import { toAbsUrl } from "/common/js/to-url";

import (toAbsUrl)

const clickProfile = () => {
    document.getElementById("userProfile").addEventListener("click", ()=>{
        window.location.href="/my";
    })
}

const setProfile = () => {
    const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));

    const profile = document.getElementById("userProfile");
    if(profile.dataset && profile.dataset.lock==="menu") return;
    profile.src = toAbsUrl(userInfo.profileImageUrl) || "/assets/image/default_profile.png";

    clickProfile();
}

setProfile();

