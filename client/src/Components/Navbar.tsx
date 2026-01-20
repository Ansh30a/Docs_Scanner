import { signOut } from 'firebase/auth';
import { auth } from '../Services/firebase';

export default function Navbar() {
    return (
        <div className="flex justify-between items-center p-4 bg-white shadow">
            <h1 className="font-bold text-lg">DocScanner</h1>
            <button
                onClick={() => signOut(auth)}
                className="text-sm text-red-600"
            >
                Logout
            </button>
        </div>
    );
};
