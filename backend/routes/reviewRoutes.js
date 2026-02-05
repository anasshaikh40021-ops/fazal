import express from "express";
import Review from "../models/review.js";
import Product from "../models/productModel.js";
import authUser from "../middleware/auth.js";

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Reviews route working" });
});

// GET ALL REVIEWS FOR A PRODUCT
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).populate("user", "name");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// CREATE A REVIEW
router.post("/:productId", authUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      user: req.user.id || req.user._id,
      product: req.params.productId,
      rating,
      comment,
    });

    const reviews = await Review.find({
      product: req.params.productId,
    });

    const avgRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) /
      reviews.length;

    await Product.findByIdAndUpdate(req.params.productId, {
      rating: avgRating,
      numReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    res.status(500).json({ message: "Failed to submit review" });
  }
});

export default router;
