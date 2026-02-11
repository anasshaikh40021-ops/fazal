import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    // ✅ Support both custom header and Bearer token
    let token = req.headers.token;

    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default authUser;
