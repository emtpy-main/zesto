import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { restaurantService } from "../main";
import axios from "axios";
import { BiShoppingBag, BiChevronRight, BiTime } from "react-icons/bi";
import Footer from "../components/Footer";

const ACTIVE_STATUS = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => {
      fetchOrders();
    };
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update");
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  // Premium Loading State
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-100 border-t-[#e23744]"></div>
        <p className="mt-4 text-sm font-bold text-gray-500 tracking-wide animate-pulse">
          Loading your orders...
        </p>
      </div>
    );
  }

  // Premium Empty State
  if (orders.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-sans text-center px-4">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BiShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Looks like you haven't placed any orders. Great food is just a few
          taps away!
        </p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => ACTIVE_STATUS.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUS.includes(o.status),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Order History
          </h1>
        </div>

        {/* Active Orders Section */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e23744] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e23744]"></span>
            </span>
            Active Orders
          </h2>

          {activeOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center">
              <p className="text-sm font-medium text-gray-500">
                No active orders right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/order/${order._id}`)}
                  isActive={true}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <BiTime className="text-lg" />
            Past Orders
          </h2>

          {completedOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center">
              <p className="text-sm font-medium text-gray-500">
                No past orders found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <OrderRow
                  key={order._id}
                  order={order}
                  onClick={() => navigate(`/order/${order._id}`)}
                  isActive={false}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Orders;

const OrderRow = ({
  order,
  onClick,
  isActive,
}: {
  order: IOrder;
  onClick: () => void;
  isActive: boolean;
}) => {
  const formatStatus = (status?: string) => {
    if (!status) return "Unknown";
    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const title =
    order.restaurantName ||
    `Order #${order?._id ? String(order._id).slice(-6).toUpperCase() : "----"}`;

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-xl bg-white p-5 shadow-sm border transition-all duration-200 hover:shadow-md ${
        isActive
          ? "border-[#e23744]/30 hover:border-[#e23744]"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {title}
          </h3>
          {/* Only show the ID subtitle if we used the restaurant name as the main title */}
          {order.restaurantName && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">
              Order #
              {order?._id ? String(order._id).slice(-6).toUpperCase() : "----"}
            </p>
          )}
        </div>

        {isActive ? (
          <span className="bg-[#e23744]/10 text-[#e23744] border border-[#e23744]/20 text-xs font-bold px-2.5 py-1 rounded-md shrink-0 animate-pulse">
            {formatStatus(order.status)}
          </span>
        ) : (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 ${getStatusColor(order.status)}`}
          >
            {formatStatus(order.status)}
          </span>
        )}
      </div>
      <div className="mb-4 text-sm text-gray-500 font-medium line-clamp-1">
        {order.items.map((item, i) => (
          <span key={i}>
            {item.quantity} x {item.name}
            {i < order.items.length - 1 && " • "}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total:
          </span>
          <span className="text-sm font-black text-gray-900">
            ₹{order.totalAmount}
          </span>
        </div>

        <div className="flex items-center text-sm font-bold text-[#e23744] group-hover:underline">
          View Details
          <BiChevronRight className="text-lg ml-0.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
};
