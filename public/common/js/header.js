console.log("header js loaded");

clickProfile = () => {
    document.getElementById("user-profile").addEventListener("click", ()=>{
        window.location.href="/my";
    })
}

setProfile = () => {
    const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));
    document.getElementById("user-profile").src = userInfo.profileImgUrl;

    clickProfile();
}

setProfile();

