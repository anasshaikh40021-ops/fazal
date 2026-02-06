import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },

    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true },

    // Existing status (KEEPING IT)
    status: { type: String, required: true, default: 'Order Placed' },

    paymentMethod: { type: String, required: true },

    // Existing payment flag (KEEPING IT)
    payment: { type: Boolean, required: true, default: false },

    // 🔹 NEW (safe additions)
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    date: { type: Number, required: true },
})

const orderModel =
    mongoose.models.order || mongoose.model('order', orderSchema)

export default orderModel
