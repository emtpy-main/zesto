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
  BiCheckShield 
} from 'react-icons/bi';

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [updating, setUpdating] = useState(false);

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

          {order.status === "picked_up" && (
            <button
              disabled={updating} 
              className="w-full flex items-center justify-center gap-2 bg-[#e23744] hover:bg-[#c9313d] text-white rounded-lg py-3.5 font-bold text-base shadow-sm shadow-[#e23744]/20 transition-all active:scale-[0.98] disabled:opacity-70"
              onClick={updateStatus}
            >
              {updating ? "Updating..." : (
                <>
                  <BiCheckShield className="text-xl" /> Mark as Delivered
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderCurrentOrder;