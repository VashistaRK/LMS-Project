import React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import type { CourseData } from "../../types/course";
import { useAddToCart, useCart } from "../../hooks/queries/cart";

type Props = {
  course: CourseData;
  onWishlist?: () => void;
  className?: string;
};

const formatCurrency = (val: number) =>
  val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const CourseSidebar: React.FC<Props> = ({
  course,
  onWishlist,
  className = "",
}) => {
  const { data: cartItems = [] } = useCart();
  const addToCartMutation = useAddToCart();

  const priceNum = course.price;
  const discountNum = course.discountPrice;
  const saving = Math.max(0, priceNum - discountNum);
  const percent = priceNum > 0 ? Math.round((saving / priceNum) * 100) : 0;

  const handleEnroll = () => {
    const alreadyInCart = cartItems.some((item) => item.id === course.id);
    if (alreadyInCart) {
      toast.warning(`${course.title} is already in your cart`);
      return;
    }

    addToCartMutation.mutate(course.id!, {
      onSuccess: () => {
        toast.success(`${course.title} added to cart`);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to add to cart");
      },
    });
  };

  return (
    <aside
      className={`bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl p-6 sticky top-10 border border-gray-100 ${className}`}
    >
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{formatCurrency(priceNum)}
          </span>
          {discountNum > 0 && (
            <span className="text-sm text-gray-400 line-through">
              ₹{formatCurrency(discountNum)}
            </span>
          )}
        </div>
        {saving > 0 && (
          <div className="text-green-600 font-medium text-sm">
            Save ₹{formatCurrency(saving)} ({percent}% off)
          </div>
        )}
      </div>

      {/* Enroll Now acts as Add to Cart */}
      <button
        onClick={handleEnroll}
        disabled={addToCartMutation.isPending}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-102 transition mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {addToCartMutation.isPending ? "Adding..." : "🚀 Enroll Now"}
      </button>

      <button
        onClick={onWishlist}
        className="w-full border border-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-50 transition mb-5"
      >
        ❤️ Add to Wishlist
      </button>

      {/* certificate */}
      {course.certificateEnabled && (
        <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg mb-4">
          <Check className="w-5 h-5 text-yellow-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              Certificate of Completion
            </div>
            <div className="text-xs text-gray-500">
              Verified certificate when you finish the course
            </div>
          </div>
        </div>
      )}

      {/* short features list */}
      <div className="text-sm space-y-3 mt-4">
        <h3 className="font-semibold text-gray-900">This course includes</h3>
        <div className="space-y-2 mt-2">
          {Array.isArray(course.features) &&
            course.features.slice(0, 6).map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{f}</span>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default CourseSidebar;
