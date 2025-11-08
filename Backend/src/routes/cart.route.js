import express from "express";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Cart from "../models/Cart.js";
import authMiddleware from "../middleware/auth.js"; 
import PurchaseRequest from "../models/PurchaseRequest.js";
import NotificationService from "../services/notificationService.js";

const router = express.Router();

// Get cart items for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching cart" });
  }
});

// Add item to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    // Check if already purchased
    const alreadyPurchased = user.purchasedCourses.some(
      (c) => c.CourseId === courseId
    );
    if (alreadyPurchased) {
      return res.status(409).json({ error: "course already purchased" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    if (cart.items.includes(courseId)) {
      return res.status(409).json({ error: "course already in cart" });
    }

    cart.items.push(courseId);
    await cart.save();

    res.json(cart.items);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Server error adding to cart" });
  }
});

// Remove item from cart
router.post("/remove", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cart.items.filter((id) => id !== courseId);
      await cart.save();
    }

    res.json(cart ? cart.items : []);
  } catch (err) {
    res.status(500).json({ error: "Server error removing from cart" });
  }
});

// Checkout
// router.post("/checkout", authMiddleware, async (req, res) => {
//   const userId = req.user.id;
//   const { courseIds } = req.body;

//   if (!courseIds || !Array.isArray(courseIds)) {
//     return res.status(400).json({ error: "Invalid course IDs" });
//   }

//   try {
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // Filter out already purchased
//     const newCourses = courseIds.filter(
//       (id) => !user.purchasedCourses.some((c) => c.CourseId === id)
//     );

//     if (newCourses.length === 0) {
//       return res
//         .status(409)
//         .json({ error: "All courses already purchased" });
//     }

//     // Add new purchased courses
//     const courseObjects = newCourses.map((id) => ({
//       CourseId: id,
//       completedChapters: [],
//     }));

//     user.purchasedCourses.push(...courseObjects);
//     await user.save();

//     // Clear cart
//     await Cart.findOneAndUpdate({ userId }, { items: [] });

//     // Notify admins
//     for (const CourseId of newCourses) {
//       try {
//         const course = await Course.findOne({ id: CourseId });
//         if (course) {
//           await NotificationService.notifyUserEnrolled(
//             user.name || user.email,
//             course.title,
//             CourseId,
//             user._id
//           );
//         }
//       } catch (err) {
//         console.warn("Notification failed:", err.message);
//       }
//     }

//     res.json({
//       message: "Checkout successful",
//       purchasedCourses: user.purchasedCourses,
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Server error during checkout" });
//   }
// });
// Checkout (convert cart to request)
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // create purchase request doc
    const reqDoc = await PurchaseRequest.create({
      userId,
      courseIds: cart.items  // <-- your strings (UUID course ids)
    });

    // clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Request submitted for admin approval",
      requestId: reqDoc._id,
    });

  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
