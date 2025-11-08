/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import React from "react";
import { toast } from "sonner";
import type { CourseData } from "../../types/course";
import { useNavigate } from "react-router";
import { ShoppingCart } from "lucide-react";
import { useCart, useAddToCart } from "../../hooks/queries/cart";

interface AddToCartButtonProps {
  course: CourseData;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ course }) => {
  const navigate = useNavigate();
  const { data: cartItems = [] } = useCart();
  const addToCartMutation = useAddToCart();

  const alreadyInCart = cartItems.some((item) => item.id === course.id);
  const [text, setText] = React.useState(alreadyInCart ? "View Cart" : "Register");
  const [color, setColor] = React.useState(alreadyInCart ? "bg-[#FF6D00]" : "");

  React.useEffect(() => {
    if (alreadyInCart) {
      setText("View Cart");
      setColor("bg-[#FF6D00]");
    } else {
      setText("Register");
      setColor("");
    }
  }, [alreadyInCart]);

  const handleAddToCart = () => {
    if (alreadyInCart) {
      toast.warning(`${course.title} is already in your cart`);
      return;
    }

    addToCartMutation.mutate(course.id!, {
      onSuccess: () => {
        toast.success(`${course.title} added to cart`);
        setText("View Cart");
        setColor("bg-[#FF6D00]");
      },
      onError: (err: any) => {
        
        const message =
          err?.response?.data?.error ||
          "Failed to add course to cart";
        if (message.includes("purchased")) {
          toast.error(`${course.title} is already purchased`);
        } else if (message.includes("cart")) {
          toast.warning(`${course.title} is already in your cart`);
        } else {
          console.log(err);
          toast.error(message);
        }
      },
    });
  };

  return (
    <button
      onClick={() => {
        text === "View Cart" ? navigate("/cart") : handleAddToCart();
      }}
      className={`${color} hover:bg-[#ffa968] ${
        color === "bg-[#FF6D00]" ? "text-white" : "border"
      } px-3 py-1.5 justify-center items-center flex gap-2 rounded text-xs sm:text-sm font-medium transition`}
      disabled={addToCartMutation.status === "pending"}
    >
      {text === "View Cart" ? <ShoppingCart className="h-5" /> : ""}
      {text}
    </button>
  );
};

export default AddToCartButton;
