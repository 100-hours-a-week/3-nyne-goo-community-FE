console.log("header js loaded");

setProfile = () => {
    const userInfo = JSON.parse(window.sessionStorage.getItem("userInfo"));
    document.getElementById("user-profile").src = userInfo.profileImgUrl;
}

setProfile();