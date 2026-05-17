import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type {IMenuItem, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { FiInfo, FiMapPin } from "react-icons/fi";
import Footer from "../components/Footer";

const Cart = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      await fetchCart();
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      await fetchCart();
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your cart");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchCart();
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  const checkOut = async () => {
    navigate("/checkout");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 font-sans text-slate-900">
      {/* NEW: Thin Header */}
      <div className="mb-6 border-b border-slate-200 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Your Cart
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* --- LEFT COLUMN: Cart Items & Restaurant Info (Spans 8 cols) --- */}
        <div className="space-y-5 lg:col-span-8">
          {/* Restaurant Info Header */}
          <div className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <FiMapPin size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {restaurant.name}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 leading-snug max-w-xl line-clamp-2">
                {restaurant.autoLocation.formattedAddress}
              </p>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 uppercase">
                Order Summary ({quantity} {quantity === 1 ? "item" : "items"})
              </h3>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {cart.map((cartItem) => {
                const item = cartItem.itemId as IMenuItem;
                const isloading = loadingItemId === item._id;

                return ( 
                  <div
                    key={item._id}
                    className="group flex items-start sm:items-center gap-3 p-3 transition-colors hover:bg-slate-50 rounded-lg"
                  > 
                    <div className="shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                      />
                    </div>
 
                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 line-clamp-2 sm:line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                          ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                        <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-sm">
                          <button
                            className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-red-600 disabled:opacity-50 rounded-l-md"
                            disabled={isloading}
                            onClick={() => decreaseQty(item._id)}
                          >
                            {isloading ? (
                              <VscLoading size={14} className="animate-spin" />
                            ) : (
                              <BiMinus size={16} />
                            )}
                          </button>
                          <span className="flex w-8 items-center justify-center text-sm font-semibold text-slate-900">
                            {cartItem.quantity}
                          </span>
                          <button
                            className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-emerald-600 disabled:opacity-50 rounded-r-md"
                            disabled={isloading}
                            onClick={() => increaseQty(item._id)}
                          >
                            {isloading ? (
                              <VscLoading size={14} className="animate-spin" />
                            ) : (
                              <BiPlus size={16} />
                            )}
                          </button>
                        </div>

                        {/* Total Line Price */}
                        <p className="w-16 text-right text-base font-bold text-slate-900">
                          ₹{item.price * cartItem.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
 
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-4">
              Bill Details
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="font-medium text-slate-900">₹{subTotal}</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1.5">
                  Delivery Fee
                  <FiInfo className="text-slate-400" size={14} />
                </span>
                <span
                  className={`font-medium ${deliveryFee === 0 ? "text-emerald-600" : "text-slate-900"}`}
                >
                  {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="font-medium text-slate-900">
                  ₹{platformFee}
                </span>
              </div>
            </div>
            {subTotal < 250 && (
              <div className="mt-4 rounded-lg bg-blue-50 p-3 ring-1 ring-blue-100">
                <p className="text-xs font-medium text-blue-800">
                  Add items worth{" "}
                  <span className="font-bold">₹{250 - subTotal}</span> more to
                  get Free Delivery!
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min((subTotal / 250) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
 
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
              <span className="text-base font-bold text-slate-900">To Pay</span>
              <span className="text-xl font-black tracking-tight text-slate-900">
                ₹{grandTotal}
              </span>
            </div>
 
            <button
              onClick={checkOut}
              disabled={!restaurant.isOpen}
              className={`mt-5 w-full rounded-lg py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] ${
                restaurant.isOpen
                  ? "bg-red-600 hover:bg-red-700"
                  : "cursor-not-allowed bg-slate-300 text-slate-500"
              }`}
            >
              {!restaurant.isOpen ? "Restaurant Closed" : "Proceed to Checkout"}
            </button>
          </div>
          <button
            onClick={clearCart}
            disabled={clearingCart}
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <span>Clear Cart</span>
            <FaTrash
              size={14}
              className="transition-transform group-hover:scale-110"
            />
          </button>
        </div>
      </div>
      <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
      
    </div>
  );
};

export default Cart;
