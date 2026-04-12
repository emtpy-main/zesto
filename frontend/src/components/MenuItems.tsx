import { useState } from "react";
import type { IMenuItem } from "../types";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { FiEyeOff } from "react-icons/fi";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}
const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item");
    if (!confirm) return;
    try {
      await axios.delete(`${restaurantService}/api/item/delete/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("failed to delete");
    }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("failed to update status");
    }
  };

  const { fetchCart } = useAppData();
  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Menu Items
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Explore our delicious offerings
          </p>
        </div>
        {items && (
          <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 sm:inline-block">
            {items.length} {items.length === 1 ? "Item" : "Items"}
          </span>
        )}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const isloading = loadingItemId === item._id;

          return (
            <div
              key={item._id}
              className={`group relative flex gap-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                !item.isAvailable ? "opacity-75" : ""
              }`}
            >
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-slate-50 sm:h-32 sm:w-32">
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    !item.isAvailable ? "grayscale brightness-75" : ""
                  }`}
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]">
                    <span className="rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-900 shadow-sm">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 sm:text-sm sm:leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex items-end justify-between sm:mt-0">
                  <p className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                    ₹{item.price}
                  </p>
                  {isSeller && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleAvailability(item._id)}
                        title={item.isAvailable ? "Hide Item" : "Show Item"}
                        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 active:scale-95"
                      >
                        {item.isAvailable ? (
                          <BsEye size={18} />
                        ) : (
                          <FiEyeOff size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete Item"
                        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95"
                      >
                        <BiTrash size={18} />
                      </button>
                    </div>
                  )}
                  {!isSeller && (
                    <button
                      disabled={!item.isAvailable || isloading}
                      onClick={() => addToCart(item.restaurantId, item._id)}
                      className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        !item.isAvailable || isloading
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white hover:shadow-sm hover:shadow-red-600/20 active:scale-95"
                      }`}
                    >
                      {isloading ? (
                        <VscLoading size={18} className="animate-spin" />
                      ) : (
                        <>
                          <BsCartPlus size={18} />
                          <span className="hidden sm:inline-block">Add</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuItems;
