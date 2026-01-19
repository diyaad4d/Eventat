import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    const handleContinue = () => {
        if (selectedRole) {
            navigate('/signup', { state: { role: selectedRole } });
        }
    };

    // main colors
    const heroBlue = '#CEDBE2';
    const gold = '#C9A24D';

    const cardStyle = (role) => ({
        border: selectedRole === role ? `3px solid ${gold}` : '2px solid #ddd',
        borderRadius: '12px',
        padding: '40px',
        width: '300px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left',

        backgroundColor: selectedRole === role ? '#fffdf5' : 'white',
        boxShadow: selectedRole === role ? '0 8px 16px rgba(201, 162, 77, 0.2)' : 'none',
        position: 'relative'
    });

    return (
        <div style={{ textAlign: 'center', marginTop: '60px', fontFamily: 'Arial, sans-serif' }}>

            {/* Header */}
            <h1 style={{ color: '#333', marginBottom: '10px' }}>Welcome to Eventat</h1>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>How will you use the platform?</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '40px', marginBottom: '40px' }}>

                {/* Client Box ) */}
                <div
                    style={cardStyle('customer')} // We keep internal role as 'customer' for DB, but show 'Client'
                    onClick={() => setSelectedRole('customer')}
                    onMouseOver={(e) => {
                        if (selectedRole !== 'customer') e.currentTarget.style.borderColor = gold;
                    }}
                    onMouseOut={(e) => {
                        if (selectedRole !== 'customer') e.currentTarget.style.borderColor = '#ddd';
                    }}
                >
                    {/* Radio Circle */}
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: `2px solid ${selectedRole === 'customer' ? gold : '#ddd'}`,
                        backgroundColor: selectedRole === 'customer' ? gold : 'transparent'
                    }}></div>

                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>👤</div>


                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>I am a Client</h3>
                    <p style={{ color: '#666', lineHeight: '1.5' }}>
                        I want to plan an event (Booking a service)
                    </p>
                </div>

                {/* Vendor Box */}
                <div
                    style={cardStyle('vendor')}
                    onClick={() => setSelectedRole('vendor')}
                    onMouseOver={(e) => {
                        if (selectedRole !== 'vendor') e.currentTarget.style.borderColor = gold;
                    }}
                    onMouseOut={(e) => {
                        if (selectedRole !== 'vendor') e.currentTarget.style.borderColor = '#ddd';
                    }}
                >
                    {/* Radio Circle */}
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: `2px solid ${selectedRole === 'vendor' ? gold : '#ddd'}`,
                        backgroundColor: selectedRole === 'vendor' ? gold : 'transparent'
                    }}></div>

                    <div style={{ fontSize: '50px', marginBottom: '20px' }}>🏢</div>

                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>I am a Vendor</h3>
                    <p style={{ color: '#666', lineHeight: '1.5' }}>
                        I want to list my services (Offering services)
                    </p>
                </div>

            </div>

            {/* button */}
            <button
                onClick={handleContinue}
                disabled={!selectedRole}
                style={{
                    backgroundColor: selectedRole ? gold : '#ccc',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    padding: '15px 40px',
                    fontSize: '1rem',
                    borderRadius: '25px',
                    cursor: selectedRole ? 'pointer' : 'not-allowed',
                    transition: 'background-color 0.3s',
                    boxShadow: selectedRole ? '0 4px 10px rgba(201, 162, 77, 0.4)' : 'none'
                }}
            >
                {/* send role to backend  : */}
                {selectedRole === 'customer' ? 'Join as a Client' :
                    selectedRole === 'vendor' ? 'Join as a Vendor' :
                        'Create Account'}
            </button>

            <p style={{ marginTop: '30px', color: '#888' }}>
                Already have an account? <a href="/login" style={{ color: gold, fontWeight: 'bold', textDecoration: 'none' }}>Log In</a>
            </p>
        </div>
    );
}

export default Landing;