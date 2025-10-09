import React from 'react';
import { useMsal } from '@azure/msal-react';


export default function Login() {
const { instance } = useMsal();
const login = async () => {
try {
await instance.loginPopup({ scopes: ['User.Read'] });
} catch (e) {
console.error(e);
alert('Login failed. Check console for details.');
}
};


const logout = async () => {
try {
await instance.logoutPopup();
} catch (e) {
console.error(e);
alert('Logout failed.');
}
};


return (
<div>
<h2 className="text-xl font-semibold mb-4">Login</h2>
<button onClick={login} className="px-4 py-2 rounded bg-blue-600 text-white">Sign in with Microsoft</button>
<button onClick={logout} className="ml-4 px-4 py-2 rounded border">Sign out</button>
</div>
);
}