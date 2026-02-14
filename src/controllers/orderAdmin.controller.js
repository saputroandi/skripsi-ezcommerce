const { Order } = require('../models');

exports.updateStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = String(req.body.status || '').toLowerCase();

    if (!['paid', 'failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Allowed: paid, failed' });
    }

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Not found' });

    // Optional rule: only allow changing from pending
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be updated' });
    }

    order.status = status;

    await order.save();
    res.json(order);
  } catch (e) {
    next(e);
  }
};
