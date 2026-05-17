import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import { FiShoppingBag } from "react-icons/fi";
import Footer from "../components/Footer";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Main Content Wrapper - flex-1 allows it to grow and push the footer down */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {/* The Card */}
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden rounded-2xl bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200 text-center sm:p-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
            <BiCheckCircle className="h-12 w-12 text-emerald-500" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Payment Successful!
            </h1>
            <p className="text-base text-slate-500">
              Your order has been placed and is being sent to the kitchen. 🎉
            </p>
          </div>

          {paymentId && (
            <div className="mx-auto mt-6 max-w-xs rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 border-t border-dashed border-slate-300">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transaction ID
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-700 break-all">
                {paymentId}
              </p>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
              onClick={() => navigate("/orders")}
            >
              Track Your Order
              <BsArrowRight
                className="transition-transform group-hover:translate-x-1"
                size={18}
              />
            </button>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
              onClick={() => navigate("/")}
            >
              <FiShoppingBag size={16} className="text-slate-400" />
              Order Something Else
            </button>
          </div>
        </div>
      </div>

      {/* Footer Wrapper - stays at the bottom naturally */}
      <div className="w-full relative z-10 shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default PaymentSuccess;
