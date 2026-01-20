import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Services/firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');

        } catch {
            setError("Invalid credentials!!!");
        };
    };

    return (
        <div className="flex h-screen items-center justify-center">
        <div className="bg-white p-8 rounded shadow w-96">
            <h1 className="text-xl font-semibold mb-4">Login</h1>
            {error && <p className="text-red-500">{error}</p>}
            <input className="border p-2 w-full mb-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input className="border p-2 w-full mb-4" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button className="bg-blue-600 text-white w-full p-2 rounded" onClick={handleLogin}>Login</button>
        </div>
        </div>
    );
};