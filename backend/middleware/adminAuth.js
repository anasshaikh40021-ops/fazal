import jwt from "jsonwebtoken"

const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.token

    if (!token) {
      return res.json({ success: false, message: "Not Authorised" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    


    if (decoded.role !== "admin") {
      return res.json({ success: false, message: "Admin access required" })
    }

    next()
  } catch (error) {
    return res.json({ success: false, message: error.message })
  }
}

export default adminAuth
