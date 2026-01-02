import { useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import Image4 from "../assets/b.jpg";
import axios from 'axios';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

// Declare PayHere on window object
declare global {
  interface Window {
    payhere: any;
  }
}

const PaymentPage = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const handleBack = () => {
    navigate("/booking", { state }) // Maintain state when going back
  }

  // Use passed state or fallbacks
  const bookingDetails = {
    order_id: state.orderId || "Order_" + new Date().getTime(),
    items: `Futsal Court Booking - ${state.court?.name || 'Court'}`,
    amount: state.court?.price ? state.court.price.toFixed(2) : "3500.00",
    currency: "LKR",
    first_name: state.customerName || "Guest",
    last_name: "",
    email: "test@example.com", // Keeping hardcoded as email wasn't collected
    phone: state.customerMobile || "0771234567",
    address: "Colombo",
    city: "Colombo",
    country: "Sri Lanka",
  };

  // ... inside component ...

  const generateBill = (paymentDetails: any) => {
    const doc = new jsPDF();

    // -- Header --
    doc.setFillColor(12, 26, 37); // Dark Blue background
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("S7 Futsal & Sports", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Your Game, Your Court", 105, 30, { align: "center" });

    // -- Invoice Info --
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Booking Invoice", 14, 55);

    doc.setFontSize(10);
    doc.text(`Invoice No: ${paymentDetails.order_id}`, 14, 62);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 67);

    // -- Customer Details --
    doc.text(`Customer Name: ${paymentDetails.first_name}`, 14, 80);
    doc.text(`Mobile: ${paymentDetails.phone}`, 14, 85);

    // -- Table --
    autoTable(doc, {
      startY: 95,
      head: [['Description', 'Detail']],
      body: [
        ['Item', paymentDetails.items],
        ['Court', state.court?.name || 'N/A'],
        ['Booking Date', state.date],
        ['Booking Time', state.time],
        ['Amount', `Rs. ${paymentDetails.amount}`],
        ['Payment Status', 'PAID'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 240, 255], textColor: [0, 0, 0] }, // Cyan header
    });

    // -- Footer --
    doc.setFontSize(10);
    doc.text("Thank you for booking with S7 Futsal!", 105, 280, { align: "center" });

    // Save
    doc.save(`Futsal_Bill_${paymentDetails.order_id}.pdf`);
  };

  const handlePayHerePayment = async () => {
    try {
      // 1. Get Hash from Server
      const response = await axios.post('http://localhost:3001/api/payhere/hash', {
        order_id: bookingDetails.order_id,
        amount: bookingDetails.amount,
        currency: bookingDetails.currency,
        // Pass booking details to save pending booking
        courtId: state.court?.id,
        date: state.date,
        time: state.time,
        customerName: bookingDetails.first_name,
      });

      const hash = response.data.hash;

      // 2. Prepare Payment Object
      const payment = {
        sandbox: true, // true if using Sandbox
        merchant_id: "1211149", // Replace with your Merchant ID (must match server .env)
        return_url: "http://localhost:5173/payment", // Verify these URLs
        cancel_url: "http://localhost:5173/payment",
        notify_url: "http://localhost:3001/api/payhere/notify", // Your server's notify endpoint (must be public in production)
        order_id: bookingDetails.order_id,
        items: bookingDetails.items,
        amount: bookingDetails.amount,
        currency: bookingDetails.currency,
        hash: hash,
        first_name: bookingDetails.first_name,
        last_name: bookingDetails.last_name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        address: bookingDetails.address,
        city: bookingDetails.city,
        country: bookingDetails.country,
      };

      // 3. Start Payment
      if (window.payhere) {
        window.payhere.startPayment(payment);
      } else {
        alert("PayHere SDK not loaded");
      }

    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment");
    }
  };

  useEffect(() => {
    // Load PayHere/Handling events
    if (window.payhere) {
      window.payhere.onCompleted = function onCompleted(orderId: string) {
        console.log("Payment completed. OrderID:" + orderId);
        alert("Payment Completed! Downloading your bill...");
        generateBill(bookingDetails); // Generate PDF
      };

      window.payhere.onDismissed = function onDismissed() {
        // Note: Prompt user to pay again or show an error page
        console.log("Payment dismissed");
      };

      window.payhere.onError = function onError(error: string) {
        // Note: show an error page
        console.log("Error:" + error);
        alert("Payment Error: " + error);
      };
    }
  }, [bookingDetails, state]) // Add dependencies to ensure generateBill has latest data


  return (
    <>
      <div className="min-h-screen bg-[#0c1a25] flex flex-col md:flex-row">
        {/* Left Content */}
        <div className="w-full md:w-2/3 flex flex-col justify-center items-center text-white py-10 md:py-0 order-2 md:order-1">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-6">
              Select Your Payment Method
            </h1>
            <p className="text-lg mb-4">
              Choose a method to proceed with your booking payment.
            </p>

            <div className="flex flex-col gap-4">
              <button
                className="bg-[#00f0ff] text-black px-6 py-3 rounded-lg font-semibold hover:bg-white"
                onClick={handlePayHerePayment}
              >
                Pay with PayHere
              </button>

              <button
                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600"
                onClick={handleBack}
              >
                Go Back to Booking
              </button>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/3 h-[40vh] md:h-screen relative order-1 md:order-2">
          <img
            src={Image4}
            alt="futsal"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </>
  );
};

export default PaymentPage;