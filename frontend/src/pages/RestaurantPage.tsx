import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import { FiAlertCircle } from "react-icons/fi";
import { VscLoading } from "react-icons/vsc";
import Footer from "../components/Footer";

const RestaurantPage = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuitems, setMenuitems] = useState<IMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurant(data?.restaurant || null);
    } catch (error) {
      // console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setMenuitems(data);
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <VscLoading className="h-10 w-10 animate-spin text-red-600" />
          <p className="animate-pulse text-sm font-semibold tracking-wide text-slate-500 uppercase">
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex max-w-sm flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/50 text-slate-400 ring-8 ring-slate-100">
            <FiAlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Restaurant Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            We couldn't find the restaurant you're looking for. It may have been
            removed or the link might be incorrect.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-screen bg-gray-50"> 
      <div className="flex-1 w-full px-4 py-6 space-y-6">
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={false}
        />

        <div className="rounded-xl bg-white shadow-sm p-4">
          <MenuItems
            isSeller={false}
            items={menuitems}
            onItemDeleted={() => {}}
          />
        </div>
      </div>
 
       <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default RestaurantPage;
