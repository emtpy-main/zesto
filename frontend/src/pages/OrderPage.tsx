import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import UserOrderMap from "../components/UserOrderMap";
import { BiCreditCard, BiErrorCircle, BiMapPin, BiPackage, BiReceipt, BiTimeFive } from "react-icons/bi";
import Footer from "../components/Footer";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrder(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrder();
  }, [id]);
  useEffect(() => {
    if (!socket) return;
    const onOrderUpdate = () => {
      fetchOrder();
    };
    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);
    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);
  useEffect(() => {
    if (!socket || !id) return;
    socket.emit("join", `user:${id}`);
    return () => {
      socket.emit("leave", `user:${id}`);
    };
  }, [socket, id]);
  const [riderLocation, setRiderLoaction] = useState<[number, number] | null>(
    null,
  );
  useEffect(() => {
    if (!socket) return;
    const onRiderLocation = ({ latitude, longitude }: any) => {
      console.log("Rider location: ", latitude, longitude);
      setRiderLoaction([latitude, longitude]);
    };
    socket.on("rider:location", onRiderLocation);
    return () => {
      socket.off("rider:location", onRiderLocation);
    };
  }, [socket]);
 
  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-sans">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-100 border-t-[#e23744]"></div>
        <p className="mt-4 text-sm font-bold text-gray-500 tracking-wide animate-pulse">
          Fetching order details...
        </p>
      </div>
    );
  }
 
  if (!order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-sans text-center px-4">
        <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <BiErrorCircle className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          We couldn't locate this order. It may have been cancelled or the ID is incorrect.
        </p>
      </div>
    );
  }
 
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };
 
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      case "rider_assigned":
      case "picked_up": return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
      default: return "bg-orange-100 text-orange-700 border-orange-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans px-4 py-8 md:py-12">
      <div className="mx-auto max-w-6xl">
         
        <div className="mb-6 md:hidden">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            Order #{order._id?.slice(-6).toUpperCase()}
          </p>
          <h1 className="text-2xl font-black text-gray-900">
            Track your order
          </h1>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ======================================= */}
          {/* LEFT COLUMN: Map & Status (Col 1-7)     */}
          {/* ======================================= */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            
            {/* Desktop Header - Changed from rounded-3xl to rounded-xl */}
            <div className="hidden md:flex items-center justify-between bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div>
                <h1 className="text-2xl font-black text-gray-900">
                  Order Tracking
                </h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">
                  ID: #{order._id?.slice(-6).toUpperCase()}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
            </div>

            {/* Mobile Status Badge - Changed from rounded-2xl to rounded-lg */}
            <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <span className="font-bold text-gray-700">Current Status:</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
            </div>

            {/* Live Map Area - Changed from rounded-3xl to rounded-xl */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-lg relative flex-1 min-h-[400px]">
              {(order.status === "rider_assigned" || order.status === "picked_up") && riderLocation ? (
                <div className="absolute inset-0 h-full w-full">
                   <UserOrderMap 
                     riderLocation={riderLocation} 
                     deliveryLocation={[order.deliveryAddress.latitude!, order.deliveryAddress.longitude!]}
                   />
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                  {/* Kept rounded-full here because icons usually look best in perfect circles */}
                  <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    {order.status === "delivered" ? (
                      <BiPackage className="text-4xl text-green-500" />
                    ) : (
                      <BiTimeFive className="text-4xl text-[#e23744] animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {order.status === "delivered" ? "Order Delivered!" : "Preparing your order"}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-sm">
                    {order.status === "delivered" 
                      ? "Enjoy your food! Thanks for ordering with Zesto."
                      : "The restaurant is preparing your items. The map will appear once a rider picks up your order."}
                  </p>
                </div>
              )}
            </div>
          </div>


          <div className="lg:col-span-5 space-y-6">
             
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <BiReceipt className="text-xl text-[#e23744]" />
                <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div className="flex justify-between items-start" key={idx}>
                    <div className="flex gap-3">
                      <div className="mt-0.5 h-5 w-5 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                        {item.quantity}
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-tight pr-4">
                        {item.name}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address - Changed from rounded-3xl to rounded-xl */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <BiMapPin className="text-xl text-[#e23744]" />
                <h2 className="text-lg font-bold text-gray-900">Delivery Details</h2>
              </div>
              <div className="ml-7 space-y-2 text-sm text-gray-600">
                <p className="leading-relaxed">
                  {order.deliveryAddress.formattedAddress}
                </p>
                <p className="font-medium flex items-center gap-2 pt-2">
                  <span className="text-gray-400">Phone:</span> 
                  <span className="text-gray-900">{order.deliveryAddress.mobile}</span>
                </p>
              </div>
            </div>

            {/* Bill Summary / Receipt - Changed from rounded-3xl to rounded-xl */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              {/* Decorative top jagged edge for receipt look */}
              <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x" style={{ backgroundImage: "radial-gradient(circle at 5px 0, transparent 6px, #f9fafb 7px)", backgroundSize: "14px 10px" }}></div>
              
              <h2 className="text-lg font-bold text-gray-900 mb-5 pt-2">Bill Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Item Total</span>
                  <span className="font-medium text-gray-900">₹{order.subTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Partner Fee</span>
                  <span className="font-medium text-gray-900">₹{order.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Platform Fee</span>
                  <span className="font-medium text-gray-900">₹{order.platformFee}</span>
                </div>
              </div>

              {/* Dashed Divider */}
              <div className="my-4 border-t-2 border-dashed border-gray-200"></div>

              {/* Grand Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-xl font-black text-[#e23744]">₹{order.totalAmount}</span>
              </div>

              {/* Payment Status Info Box - Changed from rounded-xl to rounded-lg */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-start gap-3 border border-gray-100">
                <BiCreditCard className="text-xl text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Payment Status
                  </p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {order.paymentMethod} • <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}>{order.paymentStatus}</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
       <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};
export default OrderPage;
