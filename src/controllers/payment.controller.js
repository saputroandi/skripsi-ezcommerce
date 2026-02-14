const { Order } = require('../models');
/**
 * @openapi
 * components:
 *   schemas:
 *     PaymentSimulateRequest:
 *       type: object
 *       properties:
 *         orderId: { type: integer }
 */
exports.simulate = async (req,res,next)=>{
  try {
    const { orderId } = req.body;
    const o = await Order.findByPk(orderId);
    if(!o) return res.status(404).json({ message:'Order not found'});
    if(o.status==='paid') return res.json(o);

    o.status='paid';
    // paymentReference removed; we only update status
    await o.save();
    res.json(o);
  } catch(e){
    next(e);
  }
};
