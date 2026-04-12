import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audio from "../assets/mixkit-software-interface.wav";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";
import { FiBell, FiCheckCircle, FiInbox } from "react-icons/fi";
const ACTIVE_STATUS = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.load();
  }, []);

  const unlockAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          audioRef.current!.pause();
          audioRef.current!.currentTime = 0;
          setAudioUnlocked(true);
          console.log("Audio unlocked");
        })
        .catch((err) => {
          console.log("Failed to unlock audio: ", err);
        });
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setOrders(data.orders || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;
    const onNewOrder = () => {
      console.log("New order received socket");
      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.log("Audio play failed: ", err);
        });
      }
      fetchOrders();
    };

    socket.on("order:new", onNewOrder);

    return () => {
      socket.off("order:new");
    };
  }, [socket, audioUnlocked]);

  useEffect(()=>{
    if(!socket) return;
    const onUpdateOrder=()=>{
      fetchOrders();
    }
    socket.on("order:rider_assigned",onUpdateOrder);

    return ()=>{
          socket.off("order:rider_assigned",onUpdateOrder);

    }
  },[socket]);
  if (loading) {
    return <p className="text-gray-500">Loading Orders....</p>;
  }
  const activeOrders = orders.filter((o) => ACTIVE_STATUS.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUS.includes(o.status),
  );

  return (
   <div className="space-y-10"> 
  {!audioUnlocked && (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 shadow-sm transition-all hover:bg-blue-50">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <FiBell size={20} className="animate-pulse" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900">
            Enable Sound Notifications
          </h4>
          <p className="mt-0.5 text-sm text-blue-700">
            Don't miss out! Get instant alerts when new orders arrive.
          </p>
        </div>
      </div>
      <button
        onClick={unlockAudio}
        className="shrink-0 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95"
      >
        Enable Sound
      </button>
    </div>
  )}
 
  <div className="space-y-4"> 
    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <h3 className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
        Active Orders
      </h3>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        {activeOrders.length}
      </span>
    </div>
 
    {activeOrders.length === 0 ? (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 px-4 text-center">
        <div className="rounded-full bg-slate-100 p-3 text-slate-400 mb-3">
          <FiInbox size={24} />
        </div>
        <p className="text-base font-medium text-slate-600">No active orders</p>
        <p className="text-sm text-slate-400 mt-1">New orders will appear here in real-time.</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 p-1">
        {activeOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onStatusUpdate={fetchOrders}
          />
        ))}
      </div>
    )}
  </div>
 
  <div className="space-y-4">
    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
        <FiCheckCircle className="text-slate-400" size={18} />
        Completed Orders
      </h3>
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
        {completedOrders.length}
      </span>
    </div>
 
    {completedOrders.length === 0 ? (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 px-4 text-center">
        <p className="text-sm font-medium text-slate-500">No completed orders yet</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 opacity-80 transition-opacity hover:opacity-100">
        {completedOrders.map((order) => (
          <OrderCard
            key={order._id}
            order={order}
            onStatusUpdate={fetchOrders}
          />
        ))}
      </div>
    )}
  </div>
</div>
  );
};

export default RestaurantOrders;
