import { signOut } from 'firebase/auth';
import { auth } from '../Services/firebase';
import { useAuth } from '../Hooks/useAuth';

export default function Navbar() {
    const { user } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                </svg>
                <h1>DocScanner</h1>
            </div>
            <div className="navbar-user">
                {user?.email && (
                    <span className="user-email">{user.email}</span>
                )}
                <button
                    onClick={() => signOut(auth)}
                    className="logout-btn"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Logout
                </button>
            </div>
        </nav>
    );
};
