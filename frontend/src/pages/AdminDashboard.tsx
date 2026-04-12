import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import { useAppData } from "../context/AppContext";
import AdminRiderCard from "../components/RiderCard.admin";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import { FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import Tooltip from "../ui/Tooltip";

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  // Extract auth setters from context
  const { user, setIsAuth, setUser } = useAppData();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [res1, res2] = await Promise.all([
        axios.get(`${adminService}/api/v1/admin/restaurant/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${adminService}/api/v1/admin/rider/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setRestaurants(res1.data.restaurants || []);
      setRiders(res2.data.riders || []);
    } catch (error) {
      console.error("Failed to fetch pending approvals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("Admin logged out successfully");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#e23744]"></div>
        <p className="mt-4 font-medium text-gray-500">
          Loading admin workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-16 text-2xl items-center justify-center rounded-md bg-[#e23744] text-white font-bold">
              <p className="bg-transparent m-1">Zesto</p>
            </div>
            <h1 className="md:text-xl font-bold text-gray-800 text-sm">
              Admin Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-gray-600 sm:block">
              Welcome, {user?.name || "Admin"}
            </span>

            <Tooltip text="Sign Out" position="bottom">
              <button
                onClick={handleLogout}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-[#e23744] transition-colors focus:outline-none"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </Tooltip>

            <Tooltip text={user?.email || "admin@zesto.com"} position="bottom">
              <div className="h-9 w-9 cursor-pointer rounded-full border-2 border-white bg-gray-200 shadow-sm overflow-hidden">
                <img
                  src={
                    user?.image ||
                    `https://ui-avatars.com/api/?name=${user?.name || "A"}&background=e23744&color=fff`
                  }
                  alt="Admin"
                  className="h-full w-full object-cover"
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pt-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Pending Approvals
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and verify new onboarding requests.
            </p>
          </div>

          <div className="flex w-max rounded-lg bg-gray-200/80 p-1">
            <button
              onClick={() => setTab("restaurant")}
              className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold transition-all ${
                tab === "restaurant"
                  ? "bg-white text-[#e23744] shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Restaurants
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${tab === "restaurant" ? "bg-[#e23744]/10" : "bg-gray-300 text-gray-600"}`}
              >
                {restaurants.length}
              </span>
            </button>
            <button
              onClick={() => setTab("rider")}
              className={`flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold transition-all ${
                tab === "rider"
                  ? "bg-white text-[#e23744] shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Riders
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs ${tab === "rider" ? "bg-[#e23744]/10" : "bg-gray-300 text-gray-600"}`}
              >
                {riders.length}
              </span>
            </button>
          </div>
        </div>

        {tab === "restaurant" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.length === 0 ? (
              <EmptyState title="No pending restaurants" />
            ) : (
              restaurants.map((rest) => (
                <AdminRestaurantCard
                  restaurant={rest}
                  key={rest._id}
                  onVerify={fetchData}
                />
              ))
            )}
          </div>
        )}

        {tab === "rider" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {riders.length === 0 ? (
              <EmptyState title="No pending riders" />
            ) : (
              riders.map((r) => (
                <AdminRiderCard
                  rider={r}
                  user={user}
                  key={r._id}
                  onVerify={fetchData}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const EmptyState = ({ title }: { title: string }) => (
  <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
      <span className="text-2xl">✨</span>
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">
      You're all caught up! Great job.
    </p>
  </div>
);

export default AdminDashboard;
