import Review from "../models/reviewModel.js";

/* =========================
   ADD / UPDATE REVIEW
========================= */
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user.id, product: productId },
      {
        user: req.user.id,
        product: productId,
        rating,
        comment,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, review });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   GET 3 REVIEWS (DEFAULT)
========================= */
export const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .limit(3);

    const totalCount = await Review.countDocuments({ product: productId });

    res.json({
      success: true,
      reviews,
      totalCount,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/* =========================
   GET ALL REVIEWS
========================= */
export const getAllReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
