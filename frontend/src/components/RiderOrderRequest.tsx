import axios from "axios";
import { useEffect, useState } from "react";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { BiTimeFive } from "react-icons/bi";

interface Props {
  orderId: string;
  onAccepted: () => void;
  onTimeout: () => void; // Added to handle when the user misses the order
}

const RiderOrderRequest = ({ orderId, onAccepted, onTimeout }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout(); // Automatically dismiss the order, don't accept it!
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeout]);

  const acceptOrder = async () => {
    setAccepting(true);
    try {
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Internal Server Error");
      setAccepting(false);
    }
  };

  // Calculate percentage for the progress bar
  const progressPercentage = (secondsLeft / 10) * 100;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg border border-green-200 transition-all hover:shadow-xl">
      {/* Animated Timer Bar */}
      <div className="h-1.5 w-full bg-gray-100">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            secondsLeft <= 3 ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-green-600 uppercase tracking-wider">
              New Delivery
            </p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              #{orderId.slice(-6).toUpperCase()}
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${
              secondsLeft <= 3
                ? "bg-red-50 text-red-600 animate-pulse"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <BiTimeFive className="h-4 w-4" />
            00:{secondsLeft.toString().padStart(2, "0")}
          </div>
        </div>

        <button
          disabled={accepting}
          onClick={acceptOrder}
          className="w-full flex items-center justify-center rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white shadow-md shadow-green-600/20 transition-all hover:bg-green-700 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <span className="animate-pulse">Accepting...</span>
          ) : (
            "Accept Order"
          )}
        </button>
      </div>
    </div>
  );
};

export default RiderOrderRequest;