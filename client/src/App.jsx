import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing/Landing.jsx';
import Signup from './components/Signup/Signup.jsx';
import Login from './components/Login/Login.jsx';
import Home from './components/Home/Home.jsx';
import Services from './components/Services/Services.jsx';


function App() {
    return (
        <BrowserRouter>


            <Routes>

                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/Login" element={<Login />} />

                <Route path="/Home" element={<Home />} />

                <Route path="/Services" element={<Services />} />


            </Routes>
        </BrowserRouter>
    );
}

export default App;