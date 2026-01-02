import HomePage from "./pages/home";
import ContactPage from "./pages/contact";
import BookingPage from "./pages/booking";
import PaymentPage from "./pages/payment";
import { Route, Routes } from "react-router";

const FutsalBooking = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </>
  );
};

export default FutsalBooking;
