import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface Props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20";
    case "accepted":
      return "bg-sky-50 text-sky-700 ring-1 ring-sky-600/20";
    case "preparing":
      return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20";
    case "ready_for_rider":
      return "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20";
    case "picked_up":
      return "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20";
    default:
      return "bg-slate-50 text-slate-700 ring-1 ring-slate-600/20";
  }
};

const OrderCard = ({ order, onStatusUpdate }: Props) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);
  const actions = ORDER_ACTIONS[order.status] || [];

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status]);

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Order updated successfully");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:shadow-md">
      <div className="space-y-3"> 
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Order ID
            </p>
            <p className="font-mono text-base font-bold text-slate-900 leading-none mt-0.5">
              #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusStyles(
              order.status
            )}`}
          >
            {order.status.replaceAll("_", " ")}
          </span>
        </div> 
        <div className="rounded-lg bg-slate-50 p-2.5 shadow-inner">
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start text-[13px] leading-snug">
                <span className="mr-2 min-w-[20px] font-bold text-slate-700">
                  {item.quantity}x
                </span>
                <span className="font-medium text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
 
        <div className="flex items-end justify-between pt-0.5">
          <div>
            <p className="text-[10px] font-semibold text-slate-400">Payment</p>
            <span
              className={`mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {order.paymentStatus}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold text-slate-400">Total</p>
            <p className="text-lg font-bold tracking-tight text-slate-900 leading-none mt-0.5">
              ₹{order.totalAmount}
            </p>
          </div>
        </div>
      </div> 
      <div className="mt-4 space-y-1.5 pt-3 border-t border-slate-100">
        {order.paymentStatus === "paid" && actions.length > 0 && (
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {actions.map((status) => (
              <button
                key={status}
                disabled={loading}
                onClick={() => updateStatus(status)}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold capitalize text-white shadow-sm transition-all hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1 first:sm:col-span-full"
              >
                {loading ? "Updating..." : `Mark ${status.replaceAll("_", " ")}`}
              </button>
            ))}
          </div>
        )}
 
        {order.status === "ready_for_rider" && retryVisible && (
          <button
            disabled={loading}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100 hover:border-red-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => updateStatus("ready_for_rider")}
          >
            {loading ? "Retrying..." : "Retry Rider"}
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
