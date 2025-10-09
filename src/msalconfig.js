export const msalConfig = {
auth: {
clientId: "93e9d75b-8c48-4930-a7d1-36e6b35b41a7", // replace with Azure AD app (Application) (client) ID
authority: "https://login.microsoftonline.com/834c2bbe-3a4a-4347-991a-5339c5222571", // replace with your tenant ID or common
redirectUri: "http://localhost:5173"
},
cache: {
cacheLocation: "localStorage",
storeAuthStateInCookie: false
}
};