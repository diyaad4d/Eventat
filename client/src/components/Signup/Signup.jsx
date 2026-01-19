import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Signup() {
    const location = useLocation();
    const navigate = useNavigate();


    const roleRaw = location.state?.role || 'customer';
    const roleDisplay = roleRaw === 'customer' ? 'Client' : 'Vendor';

    const [formData, setFormData] = useState({
        full_name: '', username: '', email: '', password: '', phone: '', role: roleRaw
    });

    // Colors
    const gold = '#C9A24D';
    const darkText = '#333';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://eventat-backend.onrender.com/api/register', formData);
            alert('Account Created Successfully! Please Login.');
            navigate('/login');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.error || err.message));
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

                <h2 style={{ color: darkText, marginBottom: '20px' }}>Sign up as a {roleDisplay}</h2>

                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Full Name" required
                        style={inputStyle}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })} />

                    <input type="text" placeholder="Username" required
                        style={inputStyle}
                        onChange={e => setFormData({ ...formData, username: e.target.value })} />

                    <input type="email" placeholder="Email Address" required
                        style={inputStyle}
                        onChange={e => setFormData({ ...formData, email: e.target.value })} />

                    <input type="text" placeholder="Phone Number" required
                        style={inputStyle}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} />

                    <input type="password" placeholder="Password" required
                        style={inputStyle}
                        onChange={e => setFormData({ ...formData, password: e.target.value })} />

                    <button type="submit" style={{
                        width: '100%', padding: '15px', backgroundColor: gold, color: 'white',
                        border: 'none', borderRadius: '25px', fontSize: '1rem', fontWeight: 'bold',
                        cursor: 'pointer', marginTop: '10px', transition: '0.3s'
                    }}>
                        Create Account
                    </button>
                </form>

                <p style={{ marginTop: '20px', color: '#666', fontSize: '0.9rem' }}>
                    Already have an account? <Link to="/login" style={{ color: gold, fontWeight: 'bold', textDecoration: 'none' }}>Log In</Link>
                </p>

            </div>
        </div>
    );
}

export default Signup;