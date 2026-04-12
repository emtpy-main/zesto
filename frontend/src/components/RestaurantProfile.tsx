import { useState } from "react";
import type { IRestaurant } from "../types";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import axios from "axios";
import { useAppData } from "../context/AppContext";
import { HiOutlineLogout } from "react-icons/hi";
import { MdOutlineRestaurant } from "react-icons/md";

interface Props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}
const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);
  const { setIsAuth, setUser } = useAppData();
  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        {
          status: !isOpen,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const logoutHandler = async () => {
    axios.put(
      `${restaurantService}/api/restaurant/status`,
      {
        status: false,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    localStorage.setItem("token", " ");
    setIsAuth(false);
    setUser(null);
    toast.success("LoggedOut Sucessfully");
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        {
          name,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error: any) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="mx-auto max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_-8px_rgba(0,0,0,0.18)] border border-stone-100"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Hero Image */}
      <div className="relative h-52 w-full bg-stone-100 overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt="restaurant photo"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-amber-50 to-stone-200">
            <MdOutlineRestaurant className="h-16 w-16 text-stone-300" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-md backdrop-blur-sm ${
              isOpen
                ? "bg-emerald-500/90 text-white"
                : "bg-rose-500/90 text-white"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOpen ? "bg-white animate-pulse" : "bg-white/70"
              }`}
            />
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>
        {isSeller && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur-sm transition-all ${
              editMode
                ? "bg-white text-stone-800 hover:bg-stone-100"
                : "bg-black/40 text-white hover:bg-black/60"
            }`}
          >
            <BiEdit size={14} />
            {editMode ? "Cancel" : "Edit"}
          </button>
        )}
      </div> 
      <div className="p-6 space-y-5">

        <div>
          {editMode ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-lg font-semibold text-stone-900 outline-none focus:ring-2 focus:ring-amber-400 transition"
              placeholder="Restaurant name"
            />
          ) : (
            <h1
              className="text-2xl font-bold text-stone-900 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {name}
            </h1>
          )}

          <div className="mt-2 flex items-start gap-1.5 text-sm text-stone-400">
            <BiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <span className="leading-snug">
              {restaurant.autoLocation?.formattedAddress ||
                "Location unavailable"}
            </span>
          </div>
        </div>
 
        <div className="h-px bg-stone-100" />
        {editMode ? (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-stone-700 outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
            placeholder="Add a description for your restaurant…"
          />
        ) : (
          <p className="text-sm leading-relaxed text-stone-500">
            {description || (
              <span className="italic text-stone-400">
                No description added yet.
              </span>
            )}
          </p>
        )} 
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
     
          <p className="text-xs text-stone-400">
            Since{" "}
            {new Date(restaurant.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p> 
          <div className="flex items-center gap-2">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-60"
              >
                <BiSave size={15} />
                {loading ? "Saving…" : "Save"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm active:scale-95 transition-all ${
                  isOpen
                    ? "bg-rose-500 hover:bg-rose-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {isOpen ? "Close" : "Open"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={logoutHandler}
                title="Log out"
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-600 shadow-sm hover:bg-stone-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 transition-all"
              >
                <HiOutlineLogout size={16} />
                Log out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
