const clickProfile = () => {
    document.getElementById("userProfile").addEventListener("click", ()=>{
        window.location.href="/my";
    })
}

const setProfile = () => {
    const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));

    const profile = document.getElementById("userProfile");
    if(profile.dataset && profile.dataset.lock==="menu") return;
    profile.src = userInfo.profileImgUrl;

    clickProfile();
}

setProfile();

