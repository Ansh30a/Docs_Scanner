import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../Services/firebase';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            setError("");
            setLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || "Registration failed!!!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded shadow w-96">
                <h1 className="text-xl font-semibold mb-4">Register</h1>
                {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
                <input 
                    className="border p-2 w-full mb-2 rounded" 
                    placeholder="Email" 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)} 
                />
                <input 
                    className="border p-2 w-full mb-4 rounded" 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)} 
                />
                <button 
                    className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700 disabled:bg-gray-400" 
                    onClick={handleRegister}
                    disabled={loading}
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>
                <p className="text-sm text-center mt-4">
                    Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
                </p>
            </div>
        </div>
    );
};