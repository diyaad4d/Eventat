import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Colors
    const gold = '#C9A24D';
    const darkText = '#333';

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://eventat.onrender.com/api/login', { email, password });


            localStorage.setItem('user', JSON.stringify(res.data));

            navigate('/home');
        } catch (err) {
            alert('Login Failed: ' + (err.response?.data?.error || err.message));
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh',
            fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9'
        }}>

            <div style={{
                backgroundColor: 'white', padding: '40px', borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center'
            }}>

                <h1 style={{ color: darkText, marginBottom: '10px' }}>Welcome Back</h1>
                <p style={{ color: '#888', marginBottom: '30px' }}>Log in to continue planning</p>

                <form onSubmit={handleLogin}>
                    <input type="email" placeholder="Email Address" required
                        style={inputStyle}
                        onChange={e => setEmail(e.target.value)} />

                    <input type="password" placeholder="Password" required
                        style={inputStyle}
                        onChange={e => setPassword(e.target.value)} />

                    <button type="submit" style={{
                        width: '100%', padding: '15px', backgroundColor: darkText, color: 'white',
                        border: 'none', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold',
                        cursor: 'pointer', marginTop: '10px'
                    }}>
                        Log In
                    </button>
                </form>

                <p style={{ marginTop: '20px', color: '#666', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/" style={{ color: gold, fontWeight: 'bold', textDecoration: 'none' }}>Sign Up</Link>
                </p>

            </div>
        </div>
    );
}

export default Login;