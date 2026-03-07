import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import { restaurantService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";

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
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="space-y-4">
        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          const isloading = loadingItemId === item._id;
          return (
            <div
              key={item._id}
              className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={`${item.name}'s image`}
                className="h-20 w-20 object-cover"
              />

              <div className="flex-1">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50"
                  disabled={isloading}
                  onClick={() => decreaseQty(item._id)}
                >
                  {" "}
                  {isloading ? (
                    <VscLoading size={16} className="animate-spin" />
                  ) : (
                    <BiMinus size={16} />
                  )}
                </button>
                <span className="font-medium">{cartItem.quantity}</span>
                <button
                  className="rounded-full border p-2 hover:bg-gray-100 disabled:opacity-50"
                  disabled={isloading}
                  onClick={() => increaseQty(item._id)}
                >
                  {" "}
                  {isloading ? (
                    <VscLoading size={16} className="animate-spin" />
                  ) : (
                    <BiPlus size={16} />
                  )}
                </button>
              </div>

              <p className="w-20 text-right font-medium">
                ₹{item.price * cartItem.quantity}
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm space-y-3">
        <div className="flex justify-between text-sm">
          <span className="">Total Items</span>
          <span>{quantity}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>SubTotal</span>
          <span>₹{subTotal}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Platform Fee</span>
          <span>{platformFee}</span>
        </div>

        {subTotal < 250 && (
          <p className="text-xs text-gray-500">
            Add item worth ₹{250 - subTotal} more to get Free delivery
          </p>
        )}

        <div className="flex justify-between text-base font-semibold border-t pt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>

        <button
          onClick={checkOut}
          className={`mt-3 w-full rounded-lg bg-[#e23744] py-3 text-sm font-semibold text-white hover:bg-red-500
         ${!restaurant.isOpen ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          disabled={!restaurant.isOpen}
        >
          {!restaurant.isOpen ? "Restaurant is currently closed ":"Proceed to Checkout"}
        </button>

        <button
          onClick={clearCart}
          disabled={clearingCart}
          className="mt-3 w-full rounded-lg bg-[#383838] py-3 text-sm font-semibold text-white hover:bg-gray-500 flex justify-center items-center gap-3 cursor-pointer"
        >
          Clear Cart <FaTrash size={16} />
        </button>
      </div>
    </div>
  );
};

export default Cart;
