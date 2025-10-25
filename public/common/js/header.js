clickProfile = () => {
    document.getElementById("userProfile").addEventListener("click", ()=>{
        window.location.href="/my";
    })
}

setProfile = () => {
    const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));
    document.getElementById("userProfile").src = userInfo.profileImgUrl;

    console.log("user profile img", userInfo.profileImgUrl);

    clickProfile();
}

setProfile();

