import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import type { IRestaurant } from "../types";
import { useEffect, useState } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { FiMap, FiMapPin } from "react-icons/fi";
import Footer from "../components/Footer";

const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // calculate Haversine formula
  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLon / 2) +
      Math.cos((lat1 * Math.PI) / 100) *
        Math.cos((lat2 * Math.PI) / 100) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (!location?.latitude || !location?.longitude) {
      // alert("You need to give permission of you location to continue")
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  if (loading || !location) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 font-sans">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-100 opacity-60"></div>
          <FiMapPin className="relative z-10 h-8 w-8 animate-bounce text-red-600" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Locating restaurants...
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Scanning your area for the best places to eat.
        </p>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans selection:bg-red-100 selection:text-red-900">
      <div className="mb-6 flex items-end justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Nearby Restaurants
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Discover great food around you
          </p>
        </div>
        {restaurants.length > 0 && (
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-block">
            {restaurants.length} places
          </span>
        )}
      </div>

      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {restaurants.map((res) => {
            const [resLng, resLat] = res.autoLocation.coordinates;

            const distance = getDistanceKm(
              location.latitude,
              location.longitude,
              resLat,
              resLng,
            );

            return (
              <RestaurantCard
                key={res._id}
                id={res._id}
                name={res.name}
                image={res.image ?? ""}
                distance={`${distance}`}
                isOpen={res.isOpen}
              />
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center transition-all hover:bg-slate-50">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-100">
            <FiMap className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            No restaurants nearby
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            We couldn't find any places delivering to your current location
            right now. Try expanding your search or checking back later.
          </p>
        </div>
      )}
     <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
