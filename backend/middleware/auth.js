import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ✅ decoded is defined here
    
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Invalid Token" });
  }
  next();
};

export default authUser;
