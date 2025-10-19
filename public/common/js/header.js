console.log("header js loaded");

setProfile = () => {
    const userInfo = JSON.parse(window.localStorage.getItem("userInfo"));
    document.getElementById("user-profile").src = userInfo.profileImgUrl;
}

setProfile();