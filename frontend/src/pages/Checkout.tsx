import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import type { IAddress, ICart, IMenuItem, IRestaurant } from "../types";
import { restaurantService, utilsSerive } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import Footer from "../components/Footer";

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();

  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [loadingAddress, setloadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  // const [loadingStripe,setLoadingStripe]=useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length == 0) {
        setloadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setAddresses(data.addresses || []);
      } catch (error) {
        console.log(error);
      } finally {
        setloadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  // useEffect(()=>{
  //   console.log(addresses);
  // },[addresses])
  const navigate = useNavigate();
  if (!cart || cart.length == 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center ">
        <p className="text-gray-500 text-lg">Your Cart is Empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return data;
    } catch (error:any) {
      const errormessage = error.response?.data?.message + "Please add new address";
      toast.error( errormessage || "Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);
      const order = await createOrder("razorpay");
      if (!order) return;
      const { orderId, amount } = order;
      const { data } = await axios.post(`${utilsSerive}/api/payment/create`, {
        orderId,
      });
      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount,
        currency: "INR",
        name: "Zesto",
        description: "Quick delivery application",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsSerive}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });
            toast.success("Payment successful🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            console.log(error);
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "e23744",
        },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed please refresh page");
    }
  };
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* Restaurant */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>

      {/* Address */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Delivery Address</h3>

        {loadingAddress ? (
          <p className="text-sm text-gray-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No address found. Please add one <a href="/address" className="text-md text-blue-600 hover:text-blue-900 capitalize ">click to add</a>
          </p>
        ) : (
          addresses.map((add) => (
            <label
              key={add._id}
              className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${
                selectedAddressId === add._id
                  ? "border-[#e23744] bg-red-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                checked={selectedAddressId === add._id}
                onChange={() => setSelectedAddressId(add._id)}
              />

              <div>
                <p className="text-sm font-medium">{add.formattedAddress}</p>
                <p className="text-xs text-gray-500">{add.mobile}</p>
              </div>
            </label>
          ))
        )}
      </div>

      {/* Order Summary */}
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order Summary</h3>

        {cart.map((cartItem: ICart) => {
          const item = cartItem.itemId as IMenuItem;
          return (
            <div className="flex justify-between text-sm" key={cartItem._id}>
              <span>
                {item.name} x {cartItem.quantity}
              </span>
              <span>₹{item.price * cartItem.quantity}</span>
            </div>
          );
        })}
      </div>

      <hr />

      {/* Pricing */}
      <div className="flex justify-between text-sm">
        <span>Items ({quantity})</span>
        <span>₹{subTotal}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Delivery Fee</span>
        <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Platform Fee</span>
        <span>₹{platformFee}</span>
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
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <button
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2d7ff9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay with Razorpay
        </button>
      </div>
      <div className="w-full mt-auto relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Checkout;
