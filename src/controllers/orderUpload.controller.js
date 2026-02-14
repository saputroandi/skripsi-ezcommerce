const path = require('path');
const { Order } = require('../models');

exports.uploadPaymentProof = async (req, res, next) => {
  try {
    const id = req.params.id;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    // Only the owner (or admin) can upload proof
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Only when still pending
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Payment proof can only be uploaded for pending orders' });
    }

    // Store public-facing URL (served from /uploads)
    const publicUrl = `/uploads/proofs/${path.basename(file.path)}`;

    order.paymentProof = publicUrl;
    order.paymentProofUploadedAt = new Date();
    await order.save();

    res.json({
      message: 'Payment proof uploaded',
      paymentProof: order.paymentProof,
      paymentProofUploadedAt: order.paymentProofUploadedAt,
      order,
    });
  } catch (e) {
    next(e);
  }
};
