import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import { ProtectedRoute } from './Components/ProtectedRoute';
import './App.css'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path = '/login' element={<Login />} />
                <Route path = '/register' element={<Register />} />
                <Route 
                    path='/'
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};
