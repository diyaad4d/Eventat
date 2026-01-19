import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Services() {

    const [services, setServices] = useState([]);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [eventDate, setEventDate] = useState('');
    const navigate = useNavigate();

    // COLORS
    const gold = '#C9A24D';
    const heroBlue = '#CEDBE2';
    const darkText = '#333';


    useEffect(() => {

        const storedUser = JSON.parse(localStorage.getItem('user'));
        setUser(storedUser);


        axios.get('https://eventat-backend.onrender.com/api/services')
            .then(res => setServices(res.data))
            .catch(err => console.error("Error fetching services:", err));
    }, []);


    const handleBookClick = (service) => {
        if (!user) {
            alert("Please Login to book a service!");
            navigate('/login');
            return;
        }
        setSelectedService(service);
        setShowModal(true);
    };

    const confirmBooking = async () => {
        if (!eventDate) return alert("Please select a date for your event.");

        try {
            await axios.post('https://eventat-backend.onrender.com/api/bookings', {
                customer_id: user.user_id,
                service_id: selectedService.service_id,
                event_date: eventDate,
                estimated_total_cost: selectedService.base_price
            });

            alert("✅ Booking Successful! The vendor will contact you shortly.");
            setShowModal(false);
            setEventDate('');
        } catch (err) {
            console.error(err);
            alert("❌ Booking Failed. Please try again.");
        }
    };


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
        <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh', paddingTop: '80px' }}>

            {/* --- NAVBAR  */}
            <nav style={navbarStyle}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>EVENTAT</div>
                <div style={{ display: 'flex' }}>
                    <Link to="/home" style={{ ...linkStyle, fontWeight: 'bold' }}>Home</Link>
                    <Link to="/services" style={{ ...linkStyle, color: gold }}>Services</Link>
                    <span style={{ ...linkStyle, cursor: 'not-allowed', color: '#888' }}>About</span>
                    <span style={{ ...linkStyle, cursor: 'not-allowed', color: '#888' }}>Suppliers</span>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ color: heroBlue }}>{user ? `Hi, ${user.username}` : 'Guest'}</span>
                    <span>🔍</span>
                    <span>🛒</span>
                </div>
            </nav>

            {/*  PAGE HEADER  */}
            <div style={{
                backgroundColor: heroBlue,
                padding: '60px 20px',
                textAlign: 'center',
                borderBottom: `4px solid ${gold}`
            }}>
                <h1 style={{ margin: 0, color: darkText, fontSize: '3rem', fontFamily: 'serif' }}>Find Your Perfect Service</h1>
                <p style={{ color: '#555', marginTop: '10px', fontSize: '1.2rem' }}>
                    Browse our curated list of luxury venues, catering, and more.
                </p>
            </div>

            {/*  SERVICES GRID */}
            <div style={{ padding: '60px 40px', display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>

                {services.length === 0 ? (
                    <p style={{ color: '#888', fontStyle: 'italic', fontSize: '1.2rem' }}>Loading services...</p>
                ) : (
                    services.map(service => (
                        <div key={service.service_id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            width: '350px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease',
                            border: '1px solid #eee'
                        }}>

                            {/* Image */}
                            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={service.image_url || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=500&q=60"}
                                    alt={service.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* Category Badge */}
                                <div style={{
                                    position: 'absolute', top: '15px', left: '15px',
                                    backgroundColor: gold, color: 'white',
                                    padding: '5px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}>
                                    {service.category_name}
                                </div>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '25px' }}>
                                <h3 style={{ margin: '0 0 8px 0', color: darkText, fontSize: '1.4rem' }}>{service.title}</h3>
                                <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    📍 {service.service_location}
                                </p>

                                <div style={{ height: '1px', backgroundColor: '#eee', margin: '20px 0' }}></div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: darkText }}>
                                        {service.base_price} JOD
                                    </span>
                                    <button
                                        onClick={() => handleBookClick(service)}
                                        style={{
                                            backgroundColor: gold, color: 'white', border: 'none',
                                            padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(201, 162, 77, 0.3)'
                                        }}>
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/*BOOKING POPUP  */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ marginTop: 0, color: darkText, marginBottom: '10px' }}>Confirm Booking</h2>
                        <p style={{ color: '#666', fontSize: '1.1rem' }}>You are booking: <br /><strong>{selectedService?.title}</strong></p>

                        <div style={{ textAlign: 'left', marginTop: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>Select Event Date:</label>
                            <input
                                type="date"
                                value={eventDate}
                                onChange={(e) => setEventDate(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '1rem' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ padding: '12px 25px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '1rem' }}>
                                Cancel
                            </button>
                            <button
                                onClick={confirmBooking}
                                style={{ padding: '12px 30px', borderRadius: '8px', border: 'none', background: gold, color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Services;