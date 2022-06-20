export default function authHeader(token = "access") {
    if (token === "refresh"){
        const refresh_token = localStorage.getItem("refresh_token");
        if (refresh_token)
            return {Authorization: "Bearer " + refresh_token};
        else
            return {};
    }
    const access_token = localStorage.getItem("access_token");
    if (access_token)
        return {Authorization: "Bearer " + access_token};
    else
        return {};
}