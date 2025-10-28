import { useNavigate } from "react-router";
import Image4 from "../assets/b.jpg";

const PaymentPage = () => {

    const navigate = useNavigate();

    const handleBack = () => {
      navigate("/booking")
    }

    return (
      <>
        <div className="min-h-screen bg-[#0c1a25] flex">
          {/* Left Content */}
          <div className="w-2/3 flex flex-col justify-center items-center text-white">
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
                  onClick={() => alert("Redirecting to Card Payment...")}
                >
                  Pay with Credit/Debit Card
                </button>
                <button
                  className="bg-[#00f0ff] text-black px-6 py-3 rounded-lg font-semibold hover:bg-white"
                  onClick={() => alert("Redirecting to PayPal...")}
                >
                  Pay with PayPal
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
          <div className="w-2/3 h-screen realtive">
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