import { useState } from 'react';
import type { IOrder } from '../types';
import { riderService } from '../main';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BiStoreAlt, 
  BiMapPin, 
  BiPhoneCall, 
  BiNavigation, 
  BiCheckShield,
  BiRefresh // Added refresh icon for the resend button
} from 'react-icons/bi';

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [updating, setUpdating] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false); // New state for resend OTP
  const [otpCode, setOtpCode] = useState("");

  const updateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Internal Server Error");
    } finally {
      setUpdating(false);
    }
  };

  const confirmOrderDelivery = async () => {
    setUpdating(true);
    try {
      console.log(order._id);
      await axios.put(
        `${riderService}/api/rider/order/update/confirmation/${order._id}`,
        { otpCode },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order delivered successfully!");
      setOtpCode(""); 
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Invalid OTP");
    } finally {
      setUpdating(false);
    }
  };
 
  const resendOtp = async () => {
    setResendingOtp(true);
    try { 
      await axios.post(
        `${riderService}/api/rider/order/resend-otp/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("OTP resent to customer!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendingOtp(false);
    }
  };

  const formatStatus = (status?: string) => { 
    if (!status) return "Pending";  
    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden"> 
      <div className="bg-gray-50/80 border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Active Order
          </p>
          <p className="text-lg font-black text-gray-900 mt-0.5">
            <span className="text-[#e23744]">#</span>
            {order?._id ? String(order._id).slice(-6).toUpperCase() : "----"}
          </p>
        </div> 
        <span className="bg-[#e23744]/10 text-[#e23744] border border-[#e23744]/20 text-xs font-bold px-3 py-1.5 rounded-md">
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="p-5 space-y-6"> 
        <div className="relative pl-4 space-y-6"> 
          <div className="absolute left-[1.35rem] top-6 bottom-6 w-0.5 bg-gray-200 border-dashed border-l-2 border-gray-300"></div>
 
          <div className="relative z-10 flex gap-4"> 
            <div className="bg-white p-2 rounded-lg h-min shadow-sm border border-gray-200 text-[#e23744]">
              <BiStoreAlt className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Pickup</p>
              <p className="font-bold text-gray-900">{order.restaurantName}</p>
            </div>
          </div>
 
          <div className="relative z-10 flex gap-4">
            <div className="bg-gray-900 p-2 rounded-lg h-min shadow-sm border border-gray-800 text-white">
              <BiMapPin className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Drop-off</p>
              <p className="font-medium text-gray-800 leading-tight">
                {order.deliveryAddress?.formattedAddress}
              </p>
            </div>
          </div>
        </div>
 
        <div className="grid grid-cols-2 gap-3"> 
          <div className="bg-green-50/50 border border-green-100 rounded-lg p-3">
            <p className="text-xs font-bold text-green-700 uppercase mb-0.5">Your Earning</p>
            <p className="text-lg font-black text-green-700 flex items-center">
              ₹{order.riderAmount}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">Order Total</p>
            <p className="text-lg font-black text-gray-900 flex items-center">
              ₹{order.totalAmount}
            </p>
          </div>
        </div> 

        {order.deliveryAddress?.mobile && (
          <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 p-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                Customer Phone
              </p>
              <p className="font-bold text-gray-900 tracking-wide">
                {order.deliveryAddress.mobile}
              </p>
            </div>
            <a
              href={`tel:${order.deliveryAddress.mobile}`} 
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all text-white px-4 py-2 rounded-md text-sm font-bold shadow-sm"
            >
              <BiPhoneCall className="text-lg" />
              Call
            </a>
          </div>
        )} 

        <div className="pt-2">
          {order.status === "rider_assigned" && (
            <button
              disabled={updating} 
              className="w-full flex items-center justify-center gap-2 bg-[#e23744] hover:bg-[#c9313d] text-white rounded-lg py-3.5 font-bold text-base shadow-sm shadow-[#e23744]/20 transition-all active:scale-[0.98] disabled:opacity-70"
              onClick={updateStatus}
            >
              {updating ? "Updating..." : (
                <>
                  <BiNavigation className="text-xl" /> Reached Restaurant
                </>
              )}
            </button>
          )}

          {/* ----- UPDATED SECTION FOR OTP CONFIRMATION & RESEND ----- */}
          {order.status === "picked_up" && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <div>
                <label htmlFor="otpCode" className="block text-xs font-bold text-gray-500 uppercase text-center mb-2 tracking-wider">
                  Ask Customer for 4-Digit OTP
                </label>
                <input
                  id="otpCode"
                  type="text"
                  maxLength={4}
                  placeholder="• • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-[1em] font-black text-gray-800 bg-white border border-gray-300 rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-[#e23744] focus:border-transparent transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <button
                  disabled={updating || otpCode.length !== 4} 
                  className="w-full flex items-center justify-center gap-2 bg-[#e23744] hover:bg-[#c9313d] text-white rounded-lg py-3.5 font-bold text-base shadow-sm shadow-[#e23744]/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={confirmOrderDelivery}
                >
                  {updating ? "Verifying..." : (
                    <>
                      <BiCheckShield className="text-xl" /> Confirm Delivery
                    </>
                  )}
                </button>

                {/* New Resend OTP Button */}
                <button
                  disabled={resendingOtp || updating}
                  onClick={resendOtp}
                  className="w-full flex items-center justify-center gap-1.5 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50 py-2 cursor-pointer"
                >
                  <BiRefresh className={`text-lg ${resendingOtp ? 'animate-spin' : ''}`} />
                  {resendingOtp ? "Resending..." : "Didn't receive code? Resend OTP"}
                </button>
              </div>
            </div>
          )}
          {/* ------------------------------------------------ */}

        </div>
      </div>
    </div>
  );
};

export default RiderCurrentOrder;