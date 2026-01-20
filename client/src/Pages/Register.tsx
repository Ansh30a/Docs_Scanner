import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Services/firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/');
    };

    return (
        <div className="flex h-screen items-center justify-center">
        <div className="bg-white p-8 rounded shadow w-96">
            <h1 className="text-xl font-semibold mb-4">Register</h1>
            <input className="border p-2 w-full mb-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input className="border p-2 w-full mb-4" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button className="bg-green-600 text-white w-full p-2 rounded" onClick={handleRegister}>Create Account</button>
        </div>
        </div>
    );
};