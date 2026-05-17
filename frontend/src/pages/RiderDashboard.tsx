import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import axios from "axios";
import toast from "react-hot-toast";
import AddRiderProfile from "../components/AddRiderProfile";
import { riderService } from "../main";
import {
  BiErrorCircle,
  BiPowerOff,
  BiRadioCircleMarked,
  BiInfoCircle,
  BiUserCircle,
  BiBell,
} from "react-icons/bi";
import { BsShieldCheck } from "react-icons/bs";
import type { IOrder } from "../types";
import audio from "../assets/fahhh.mp3";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";
import Tooltip from "../ui/Tooltip";
import { FiLogOut } from "react-icons/fi";
import Footer from "../components/Footer";

export interface IRider {
  _id: string;
  picture: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenceNumber: string;
  isVerified: boolean;
  isAvailable: boolean;
}

const RiderDashboard = () => {
  const { user,setIsAuth,setUser } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audio);
    audioRef.current.preload = "auto";
  }, []);

  const unlockAudio = async () => {
    try {
      if (!audioRef.current) return;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      toast.success("Sound Enabled");
      setAudioUnlocked(true);
    } catch (error) {
      toast.error("Tap again to enable sound");
    }
  };
  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      if (!profile?.isAvailable) return;

      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId],
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked, profile?.isAvailable]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProfile(data || null);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => reject("Location permission denied"),
      );
    });
  };

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailability = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setToggling(true);
    const newAvailability = !profile?.isAvailable;

    try {
      const { latitude, longitude } = await getLocation();

      await axios.put(
        `${riderService}/api/rider/toggle`,
        {
          isAvailable: newAvailability,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setProfile((prev) =>
        prev ? { ...prev, isAvailable: newAvailability } : null,
      );

      toast.success(
        newAvailability ? "You are now online!" : "You are now offline.",
      );
    } catch (error: any) {
      toast.error(
        error === "Location permission denied"
          ? "Please allow location access"
          : error?.response?.data?.message || "Failed to update availability",
      );
    } finally {
      setToggling(false);
    }
  };

  // Function to handle removing an order from the list (either accepted or timed out)
  const removeOrderFromList = (orderIdToRemove: string) => {
    setIncomingOrders((prev) => prev.filter((id) => id !== orderIdToRemove));
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-gray-500 font-sans px-4 text-center">
        <BiUserCircle className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-sm mt-2">
          You are not registered as a rider on this account.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#e23744]"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 tracking-wide">
          Loading Dashboard...
        </p>
      </div>
    );
  }
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
  };
 if (!profile) return <AddRiderProfile fetchProfile={fetchProfile} />;
 
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col"> 
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-black tracking-tighter text-[#e23744]">
              Zesto.
            </h1>
            <span className="hidden rounded-md bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 uppercase tracking-wider sm:block">
              | Rider Dashboard
            </span>
          </div> 
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {profile.isAvailable ? "Status: Online" : "Status: Offline"}
              </p>
            </div>
             <Tooltip text="Sign Out" position="bottom">
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-[#e23744] transition-colors focus:outline-none"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </Tooltip>

            <Tooltip text={user?.email || "admin@zesto.com"} position="bottom">
              <div className="relative h-10 w-10 rounded-full border-2 border-gray-200 shadow-sm bg-gray-100">
              <img
                src={user.image}
                alt="profile"
                className="h-full w-full rounded-full object-cover"
              />
              <span
                className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white ${
                  profile.isAvailable ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
            </Tooltip>
           
          </div>
        </div>
      </header> 
      <div className="flex-1 w-full px-4 py-8 md:py-10"> 
        <div className="mx-auto w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
           
          <div className="md:col-span-5 lg:col-span-4 space-y-6"> 
            <div className="overflow-hidden rounded-xl bg-white shadow-xl shadow-gray-200/50 border border-gray-100">
              <div
                className={`h-32 w-full transition-colors duration-500 ${
                  profile.isAvailable
                    ? "bg-linear-to-r from-[#e23744] to-[#ff6b76]" 
                    : "bg-linear-to-r from-gray-700 to-gray-900"
                }`}
              ></div>
              <div className="px-6 pb-8">
                <div className="relative -mt-16 flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={profile.picture}
                      alt={`${user?.name}'s picture`}
                      className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                    />
                    <span
                      className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-4 border-white ${
                        profile.isAvailable ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {user?.name}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    {profile.phoneNumber}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        profile.isVerified
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                      }`}
                    >
                      {profile.isVerified ? (
                        <BsShieldCheck className="h-4 w-4" />
                      ) : (
                        <BiErrorCircle className="h-4 w-4" />
                      )}
                      {profile.isVerified ? "Verified" : "Pending Review"}
                    </span>

                    <span
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                        profile.isAvailable
                          ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                          : "bg-gray-100 text-gray-600 ring-1 ring-gray-500/20"
                      }`}
                    >
                      <BiRadioCircleMarked
                        className={`h-4 w-4 ${profile.isAvailable ? "animate-pulse" : ""}`}
                      />
                      {profile.isAvailable ? "Online" : "Offline"}
                    </span>
                  </div>
                </div> 
                <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
                  <div className="flex gap-3">
                    <BiInfoCircle className="h-6 w-6 shrink-0 text-blue-500 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <span className="font-semibold block mb-0.5">
                        Hotspot Status
                      </span>
                      Stay within a <strong className="font-bold">500m radius</strong> of
                      restaurants to receive requests.
                    </p>
                  </div>
                </div>

                {!profile.isVerified ? ( 
                  <div className="rounded-lg bg-amber-50 border border-amber-200 py-4 px-4 text-center">
                    <p className="text-sm font-medium text-amber-700">
                      Profile under review. Check back later.
                    </p>
                  </div>
                ) : currentOrder ? ( 
                  <div className="rounded-lg bg-indigo-50 border border-indigo-200 py-4 px-4 text-center shadow-inner">
                    <p className="text-sm font-semibold text-indigo-700 flex items-center justify-center gap-2">
                      <BiInfoCircle className="h-5 w-5" />
                      Complete active order to change status.
                    </p>
                  </div>
                ) : (
                  <button 
                    className={`flex w-full items-center justify-center gap-2 rounded-lg py-4 text-base font-bold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 active:scale-[0.98] ${
                      toggling
                        ? "bg-gray-400 cursor-not-allowed shadow-none"
                        : profile.isAvailable
                        ? "bg-gray-800 hover:bg-gray-900 hover:shadow-gray-900/30"
                        : "bg-[#e23744] hover:bg-[#c9313d] hover:shadow-[#e23744]/40"
                    }`}
                    onClick={toggleAvailability}
                    disabled={toggling}
                  >
                    {toggling ? (
                      "Updating..."
                    ) : profile.isAvailable ? (
                      <>
                        <BiPowerOff className="h-6 w-6" /> Go Offline
                      </>
                    ) : (
                      <>
                        <BiRadioCircleMarked className="h-6 w-6" /> Go Online
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div> 
          <div className="md:col-span-7 lg:col-span-8 space-y-6"> 
            {!audioUnlocked && ( 
              <div className="bg-white shadow-md shadow-gray-200/50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                    <BiBell className="text-2xl text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      Enable Sound Notifications
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Never miss a delivery request while waiting.
                    </p>
                  </div>
                </div>
                <button
                  onClick={unlockAudio} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  Enable
                </button>
              </div>
            )} 
            {profile.isAvailable &&
              !currentOrder &&
              incomingOrders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e23744] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e23744]"></span>
                    </span>
                    New Requests ({incomingOrders.length})
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {incomingOrders.map((id) => (
                      <RiderOrderRequest
                        key={id}
                        orderId={id}
                        onAccepted={() => {
                          removeOrderFromList(id);
                          fetchProfile();
                          fetchCurrentOrder();
                        }}
                        onTimeout={() => {
                          removeOrderFromList(id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )} 
            {profile.isAvailable &&
              !currentOrder &&
              incomingOrders.length === 0 && ( 
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-xl border border-gray-100 border-dashed">
                  <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <BiRadioCircleMarked className="text-4xl text-[#e23744] animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Searching for nearby orders
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Ensure you are near a restaurant hotspot. Requests will appear
                    here instantly.
                  </p>
                </div>
              )}
 
            {currentOrder && (
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e23744] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e23744]"></span>
                  </span>
                  Current Delivery
                </h3>

                <RiderOrderMap order={currentOrder} />
                <RiderCurrentOrder
                  order={currentOrder}
                  onStatusUpdate={fetchCurrentOrder}
                />
              </div>
            )}
          </div>
        </div>
      </div>
        <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default RiderDashboard;
