import express from "express";
import Review from "../models/reviewModel.js";
import authUser from "../middleware/auth.js";

const router = express.Router();

/* ---------------- CREATE REVIEW ---------------- */
router.post("/:productId", authUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.create({
      user: req.user.id,
      product: req.params.productId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- GET REVIEWS ---------------- */
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ---------------- UPDATE REVIEW ---------------- */
router.put("/:reviewId", authUser, async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review)
    return res.status(404).json({ message: "Review not found" });

  if (review.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized" });

  review.rating = req.body.rating;
  review.comment = req.body.comment;
  await review.save();

  res.json({ success: true });
});

/* ---------------- DELETE REVIEW ---------------- */
router.delete("/:reviewId", authUser, async (req, res) => {
  const review = await Review.findById(req.params.reviewId);

  if (!review)
    return res.status(404).json({ message: "Review not found" });

  if (review.user.toString() !== req.user.id)
    return res.status(403).json({ message: "Not authorized" });

  await review.deleteOne();
  res.json({ success: true });
});

export default router;
