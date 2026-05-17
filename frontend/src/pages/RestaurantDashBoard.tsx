import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import AddMenuItem from "../components/AddMenuItem";
import MenuItems from "../components/MenuItems";
import RestaurantOrders from "../components/RestaurantOrders";
import {
  FiCalendar,
  FiClock,
  FiGrid,
  FiMail,
  FiMapPin,
  FiPhoneCall,
  FiPlus,
  FiTrendingUp,
} from "react-icons/fi";
import { useAppData } from "../context/AppContext";
import Tooltip from "../ui/Tooltip";
import Footer from "../components/Footer";
const Restaurant = () => {
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<String | "menu">("menu");
  const { user} = useAppData();

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurant(data.restaurant || null);
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
    } catch (error: any) {
      // console.log(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const [menuItem, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setMenuItems(data);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant]);

  const tabs = [
    {
      key: "menu",
      label: "Menu Items",
      icon: <FiGrid className="mr-2 h-4 w-4" />,
    },
    {
      key: "add-item",
      label: "Add Item",
      icon: <FiPlus className="mr-2 h-4 w-4" />,
    },
    {
      key: "sales",
      label: "Sales",
      icon: <FiTrendingUp className="mr-2 h-4 w-4" />,
    },
  ];

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your restaurant...</p>
      </div>
    );
  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }
  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-100 selection:text-red-900">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>

        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-red-200/40 blur-[100px]"></div>
        <div className="absolute top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-orange-100/50 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-blue-100/40 blur-[100px]"></div>
      </div>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 py-3 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight text-red-600">
            Zesto.
          </h1>
          <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>
          <span className="hidden text-sm font-semibold tracking-wide text-slate-500 sm:block uppercase">
            Restaurant Dashboard
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.name}
          </span>
          <Tooltip text={user?.email || "error"} position={"bottom"}>
            <button className="overflow-hidden rounded-full ring-2 ring-transparent transition-all hover:ring-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm">
              <img
                src={user?.image}
                alt="User profile"
                className="h-9 w-9 rounded-full object-cover"
              />
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Added flex-1 and w-full here to push the footer down normally */}
      <main className="relative z-10 flex-1 w-full mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* CONDITIONAL RENDER: IF NOT VERIFIED */}
        {!restaurant.isVerified ? (
          <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
            {/* Status Card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-100">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center border-b border-orange-100">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 mb-6 shadow-inner">
                  <FiClock className="h-10 w-10 text-orange-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Verification Pending
                </h2>
                <p className="mt-3 text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Your restaurant profile has been submitted and is currently
                  under review by the Zesto admin team.
                </p>
              </div>

              {/* Limited Restaurant Info */}
              <div className="p-8 bg-white">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Registration Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-lg font-bold text-slate-800">
                      {restaurant.name}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600">
                    <FiMapPin className="mt-1 h-5 w-5 flex-shrink-0 text-red-400" />
                    <p className="leading-relaxed">
                      {restaurant.autoLocation?.formattedAddress ||
                        "Address not provided"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <FiCalendar className="h-5 w-5 flex-shrink-0 text-red-400" />
                    <p>
                      Registered on{" "}
                      {new Date(restaurant.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Helpdesk / Support Card */}
            <div className="rounded-2xl bg-slate-800 p-8 text-white shadow-lg ring-1 ring-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Taking longer than expected?
                  </h3>
                  <p className="mt-1 text-slate-300 text-sm max-w-md">
                    Verification normally takes up to <strong>24 hours</strong>.
                    If you have been waiting longer, please reach out to our
                    Helpdesk.
                  </p>
                </div>
                <div className="flex w-full sm:w-auto flex-col gap-3">
                  <a
                    href="mailto:zesto.testing@gmail.com"
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-600 transition-colors focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    <FiMail className="h-4 w-4" />
                    Email Support
                  </a>
                  <a
                    href="tel:+918178891329"
                    className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)] focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-800"
                  >
                    <FiPhoneCall className="h-4 w-4" />
                    Call Helpdesk
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <section className="transition-all duration-300 hover:shadow-md rounded-2xl">
              <RestaurantProfile
                restaurant={restaurant}
                onUpdate={setRestaurant}
                isSeller={true}
              />
            </section>

            <section className="transition-all duration-300 hover:shadow-md rounded-xl">
              <RestaurantOrders restaurantId={restaurant._id.toString()} />
            </section>

            <section className="overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:shadow-md hover:bg-white">
              <div className="border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6">
                <nav
                  className="-mb-px flex space-x-6 overflow-x-auto scrollbar-hide"
                  aria-label="Tabs"
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`group flex items-center whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.key
                          ? "border-red-500 text-red-600"
                          : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                      }`}
                    >
                      <span
                        className={`transition-colors duration-200 ${
                          activeTab === tab.key
                            ? "text-red-500"
                            : "text-slate-400 group-hover:text-slate-500"
                        }`}
                      >
                        {tab.icon}
                      </span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="min-h-[400px] p-4 sm:p-6 lg:p-8">
                {activeTab === "menu" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MenuItems
                      items={menuItem}
                      onItemDeleted={() => fetchMenuItems(restaurant._id)}
                      isSeller={true}
                    />
                  </div>
                )}

                {activeTab === "add-item" && (
                  <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AddMenuItem
                      onItemAdded={() => fetchMenuItems(restaurant._id)}
                    />
                  </div>
                )}

                {activeTab === "sales" && (
                  <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="rounded-full bg-slate-100 p-3 mb-3">
                      <FiTrendingUp className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-600">
                      Sales Dashboard Integration Pending
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      Check back later for analytics and reports.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Removed absolute positioning so it flows naturally under the main content */}
      <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Restaurant;
