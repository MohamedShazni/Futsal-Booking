import { useState } from "react";
import { Calendar, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image3 from "../assets/5.jpg";
import { useNavigate } from "react-router-dom";

// Booking Page Component
const BookingPage = () => {

  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/payment");
  };

  const handleBack = () => {
    navigate("/contact")
  }

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<{
      id: number;
      name: string;
      price: number;
    } | null>(null);
  
    const courts = [
      { id: 1, name: "Court A", price: 3500.0, type: "Indoor" },
      { id: 2, name: "Court B", price: 3500.0, type: "Indoor" },
      { id: 3, name: "Court C", price: 3500.0, type: "Indoor" },
    ];
  
    const timeSlots = [
      "09 AM",
      "10 AM",
      "11 AM",
      "12 PM",
      " 1 AM",
      " 2 PM",
      " 3 PM",
      " 4 PM",
      " 5 PM",
      " 6 PM",
      " 7 PM",
      " 8 PM",
      " 9 PM",
      "10 PM",
      "11 PM",
    ];
  
    const handleBooking = (court: any) => {
      if (selectedDate && selectedTime) {
        setSelectedCourt(court);
        setShowConfirmation(true);
      }
    };
  
    return (
      <div>
        <div className="min-h-screen flex bg-[#0c1a25]">
          {/* Image Section */}
          <div className="w-2/3 relative h-screen w-[1400px]">
            <img
              src={Image3}
              alt="futsal"
              className="w-full h-full object-cover"
            />
          </div>
  
          {/* Form Section */}
          <div className="w-1/3 flex flex-col justify-center items-center text-white px-5 ">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-6">
                Futsal Court Booking
              </h1>
  
              {/* Buttons */}
              <button
                onClick={handleBack}
                className="bg-[#00f0ff] text-black font-medium px-6 py-2 rounded-lg mb-4 hover:bg-white"
              >
                Go Back to Contact
              </button>
  
              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Calendar className="w-5 h-5" /> Select Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <input
                      type="date"
                      className="w-full p-2 border rounded-lg text-white"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </CardContent>
                </Card>
  
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4">
                      <Clock className="w-5 h-5" /> Select Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          className={`p-2 rounded-lg text-sm transition-colors ${
                            selectedTime === time
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
  
              {/* Court List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {courts.map((court) => (
                  <Card
                    key={court.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle>{court.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-6">{court.type}</p>
                      <p className="text-[18px] mb-6">Rs.{court.price} /hour</p>
                      <button
                        className={`w-full py-2 px-4 rounded-lg transition-colors ${
                          selectedDate && selectedTime
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => handleBooking(court)}
                        disabled={!selectedDate || !selectedTime}
                      >
                        Book Now
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
  
              {/* Alert if date/time not selected */}
              {(!selectedDate || !selectedTime) && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription>
                    Please select both date and time to proceed with booking
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
  
        {/* Confirmation Modal */}
        {showConfirmation && selectedCourt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Confirm Booking</CardTitle>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="p-2 bg-white hover:bg-black rounded-full hover:text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-gray-600">Court</p>
                    <p className="font-medium">{selectedCourt.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600">Date</p>
                    <p className="font-medium">{selectedDate}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600">Time</p>
                    <p className="font-medium">{selectedTime}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-600">Price</p>
                    <p className="font-medium">Rs. {selectedCourt.price}</p>
                  </div>
                  <button
                    className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => {
                      setShowConfirmation(false); // Handle booking confirmation here
                      handleNext();
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  export default BookingPage;