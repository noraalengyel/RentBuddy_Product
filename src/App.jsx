import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import Results from "./pages/Results";
import PropertyDetails from "./pages/PropertyDetails";
import ContactLandlord from "./pages/ContactLandlord";
import MessageSent from "./pages/MessageSent";
import PropertyReviews from "./pages/PropertyReviews";
import SubmitReview from "./pages/SubmitReview";
import ReviewSubmitted from "./pages/ReviewSubmitted";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        }
      />

      <Route
        path="/signup"
        element={
          <AuthRedirect>
            <Signup />
          </AuthRedirect>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/browse" element={<Browse />} />

      <Route path="/results" element={<Results />} />

      <Route path="/property/:id" element={<PropertyDetails />} />

      <Route path="/contact-landlord" element={<ContactLandlord />} />

      <Route path="/message-sent" element={<MessageSent />} />

      <Route path="/property/:id/reviews" element={<PropertyReviews />} />

      <Route path="/property/:id/review/new" element={<SubmitReview/>} />

      <Route path="/review-submitted" element={<ReviewSubmitted />} />
    </Routes>
  );
}