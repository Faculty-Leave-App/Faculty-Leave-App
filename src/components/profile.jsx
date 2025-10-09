import React from 'react';
import { useMsal } from '@azure/msal-react';


export default function Profile() {
const { accounts } = useMsal();
const account = accounts[0];


if (!account) {
return <div>Please login first.</div>;
}


return (
<div className="max-w-md bg-white p-6 rounded shadow">
<h2 className="text-xl font-semibold mb-2">Profile</h2>
<p><strong>Name:</strong> {account.name}</p>
<p><strong>Email:</strong> {account.username}</p>
<p><strong>Home Account ID:</strong> {account.homeAccountId}</p>
</div>
);
}