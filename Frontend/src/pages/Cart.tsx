/* eslint-disable @typescript-eslint/no-explicit-any */
// import React from "react";
import {
  useCart,
  useRemoveFromCart,
  useCheckout,
  useRequestPurchase,
} from "../hooks/queries/cart";
import type { CourseData } from "../types/course";

const FALLBACK_THUMB = "images/no-image.png";

const CartPage = () => {
  const { data: cartItems = [], isLoading, isError } = useCart();
  const removeFromCartMutation = useRemoveFromCart();
  const checkoutMutation = useCheckout();
  const requestPurchaseMutation = useRequestPurchase();

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.price),
    0
  );

  const getThumbnailUrl = (c: CourseData): string => {
    const t: any = (c as any)?.thumbnail;
    if (!t) return FALLBACK_THUMB;

    if (typeof t === "string") return t || FALLBACK_THUMB;

    if (t?.data && t?.contentType) {
      try {
        const maybeArray = t.data?.data ?? t.data;
        const byteArray = new Uint8Array(maybeArray);
        let binary = "";
        for (let i = 0; i < byteArray.length; i++) {
          binary += String.fromCharCode(byteArray[i]);
        }
        const base64 = btoa(binary);
        return `data:${t.contentType};base64,${base64}`;
      } catch (e) {
        console.error("Thumbnail convert error:", e);
        return FALLBACK_THUMB;
      }
    }

    return FALLBACK_THUMB;
  };

  const handleCheckout = () => {
  checkoutMutation.mutate(undefined, {
    onSuccess: () => alert("Request submitted"),
    onError: (e:any) => alert(e.response?.data?.message)
  });
};

  if (isLoading) {
    return <div>Loading cart...</div>;
  }

  if (isError) {
    return <div>Error loading cart. Please try again later.</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <h2 className="text-xl font-semibold text-gray-500">
          Your cart is empty 🛒
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4">
        {/* Main Cart Section */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Shopping Cart
          </h1>

          <ul className="space-y-5">
            {cartItems.map((item) => {
              const thumbUrl = getThumbnailUrl(item);
              return (
                <li
                  key={item.id}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 transition p-5 flex items-center gap-5"
                >
                  {/* Thumbnail */}
                  <div className="w-28 h-20 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                    <img
                      src={thumbUrl || "https://via.placeholder.com/150"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Course Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Course Tag: {item.difficulty}
                    </p>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => removeFromCartMutation.mutate(item.id!)}
                      className="text-red-600 text-sm font-medium hover:underline"
                      disabled={removeFromCartMutation.isPending}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Checkout Summary */}
        <aside className="md:w-80 md:sticky md:top-10 h-fit bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary</h2>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Total ({cartItems.length} courses)</span>
            <span className="font-bold text-gray-900">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg shadow-md bg-gradient-to-r from-[#C21817] to-[#A51515] hover:opacity-95 transition"
            disabled={requestPurchaseMutation.isPending}
          >
            Make it yours
          </button>
          <p className="text-xs text-gray-500 mt-3">
            30-day money-back guarantee
          </p>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
