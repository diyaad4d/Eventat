import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


import heroBg from '../../assets/Hero.jpg';
import weddingImg from '../../assets/Wedding.png';
import graduationImg from '../../assets/Graduation.jpg';
import eventsImg from '../../assets/Events.jpg';
import genderImg from '../../assets/Gender.jpg';

function Home() {
    const [user, setUser] = useState(null);

    // colors
    const gold = '#C9A24D';
    const heroBlue = '#CEDBE2';

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);
    }, []);

    const navbarStyle = {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '15px 40px',
        backgroundColor: '#2C2C2C',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        zIndex: 1000,
        boxSizing: 'border-box'
    };

    const linkStyle = { color: 'white', textDecoration: 'none', margin: '0 15px', fontSize: '0.9rem' };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>

            {/*  NAVBAR*/}
            <nav style={navbarStyle}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>EVENTAT</div>
                <div style={{ display: 'flex' }}>
                    <Link to="/home" style={{ ...linkStyle, color: gold, fontWeight: 'bold' }}>Home</Link>
                    <Link to="/services" style={linkStyle}>Services</Link>
                    <span style={{ ...linkStyle, cursor: 'not-allowed', color: '#888' }}>About</span>
                    <span style={{ ...linkStyle, cursor: 'not-allowed', color: '#888' }}>Suppliers</span>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ color: heroBlue }}>{user ? `Hi, ${user.username}` : 'Guest'}</span>
                    <span>🔍</span>
                    <span>🛒</span>
                </div>
            </nav>

            {/*  HERO SECTION */}
            <div style={{
                position: 'relative',
                height: '100vh',
                backgroundImage: `url(${heroBg})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                marginTop: '0'
            }}>

                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(206, 219, 226, 0.6)'
                }}></div>

                <div style={{ zIndex: 2, textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '6rem', margin: 0, color: '#222',
                        textShadow: '0 4px 15px rgba(0,0,0,0.1)', letterSpacing: '3px', fontWeight: 'bold',
                        fontFamily: 'sans-serif'
                    }}>
                        EVENTAT
                    </h1>
                    <Link to="/services">
                        <button style={{
                            marginTop: '30px', padding: '15px 50px', backgroundColor: gold, color: '#222',
                            border: '1px solid #222', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold',
                            cursor: 'pointer', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', textTransform: 'uppercase'
                        }}>
                            Plan Your Graduation Party
                        </button>
                    </Link>
                </div>
            </div>

            {/*  CATEGORY GRID  */}
            <div style={{ padding: '100px 10%', backgroundColor: '#fff', minHeight: '100vh' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridTemplateRows: '250px 250px',
                    gap: '20px',
                    maxWidth: '1200px', margin: '0 auto'
                }}>

                    {/* 1. EVENTS  */}
                    <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', gridColumn: '1 / span 1' }}>
                        <img src={eventsImg} alt="Events" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                            <h3 style={{ color: 'white', fontSize: '1.8rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: 'serif' }}>
                                PLAN YOUR<br />EVENTS
                            </h3>
                        </div>
                    </div>

                    {/* 2. GRADUATION  */}
                    <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', gridColumn: '2 / span 1' }}>
                        <img src={graduationImg} alt="Graduation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                            <h3 style={{ color: 'white', fontSize: '1.8rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: 'serif' }}>
                                PLAN YOUR<br />GRADUATION<br />PARTY
                            </h3>
                        </div>
                    </div>

                    {/* 3. WEDDING (Right Side - Tall Column) */}
                    <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', gridColumn: '3 / span 1', gridRow: '1 / span 2' }}>
                        <img src={weddingImg} alt="Wedding" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '30px', left: '30px', right: '30px' }}>
                            <h3 style={{ color: 'white', fontSize: '2.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: 'serif', lineHeight: '1.2' }}>
                                LET'S PLAN<br />YOUR<br />WEDDING
                            </h3>
                        </div>
                        <button style={{
                            position: 'absolute', bottom: '30px', right: '30px',
                            padding: '10px 20px', backgroundColor: 'transparent', color: 'white',
                            border: '1px solid white', borderRadius: '5px', fontSize: '0.9rem', cursor: 'pointer'
                        }}>
                            TO NOW
                        </button>
                    </div>

                    {/* 4. GENDER REVEAL*/}
                    <div style={{ position: 'relative', borderRadius: '15px', overflow: 'hidden', gridColumn: '1 / span 2' }}>
                        <img src={genderImg} alt="Gender Reveal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
                            <h3 style={{ color: '#333', fontSize: '1.8rem', margin: 0, fontFamily: 'serif' }}>
                                PLAN YOUR<br />GENDER REVEAL<br />PARTY
                            </h3>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

export default Home;
