import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './components/login';
import Profile from './components/profile';
import LeaveForm from './components/leaveForm';
import { useMsal } from '@azure/msal-react';


export default function App() {
const { accounts } = useMsal();
const signedIn = accounts && accounts.length > 0;


return (
<div className="min-h-screen bg-gray-100 p-6">
<nav className="flex justify-between items-center mb-6">
<h1 className="text-2xl font-bold">Faculty Leave System</h1>
<div className="space-x-4">
<Link to="/">Home</Link>
{signedIn && <Link to="/profile">Profile</Link>}
{signedIn && <Link to="/leave">Request Leave</Link>}
<Link to="/login">{signedIn ? 'Switch User' : 'Login'}</Link>
<button>start</button>
</div>
</nav>


<Routes>
<Route path="/" element={<div>Welcome! Use the Login page to sign in.</div>} />
<Route path="/login" element={<Login />} />
<Route path="/profile" element={<Profile />} />
<Route path="/leave" element={<LeaveForm />} />
</Routes>
</div>
);
}
