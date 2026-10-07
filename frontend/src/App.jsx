// App.jsx — layout + client-side ROUTING (React Router).
// Changing the URL swaps the page component WITHOUT reloading the browser (SPA).
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Donations from './pages/Donations.jsx';
import AddDonation from './pages/AddDonation.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Only logged-in donors may open this page */}
          <Route
            path="/donate"
            element={
              <ProtectedRoute roles={['donor']}>
                <AddDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        FoodBridge · Rescue food, feed people · Supporting UN SDG 2 (Zero Hunger) &amp; SDG 12 (Responsible Consumption)
      </footer>
    </>
  );
}
