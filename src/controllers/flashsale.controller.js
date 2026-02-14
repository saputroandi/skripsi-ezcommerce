const { FlashSale, VoucherPackage } = require('../models');
/**
 * @openapi
 * components:
 *   schemas:
 *     FlashSale:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         discountPercent: { type: integer }
 */

exports.list = async (req,res,next)=>{
  try { res.json(await FlashSale.findAll({ include: [VoucherPackage] })); } catch(e){ next(e); }
};
exports.create = async (req,res,next)=>{
  try { const fs = await FlashSale.create(req.body); res.json(fs);} catch(e){ next(e); }
};
exports.update = async (req,res,next)=>{
  try { const fs = await FlashSale.findByPk(req.params.id); if(!fs) return res.status(404).json({ message:'Not found'}); await fs.update(req.body); res.json(fs);} catch(e){ next(e); }
};
exports.remove = async (req,res,next)=>{
  try { const fs = await FlashSale.findByPk(req.params.id); if(!fs) return res.status(404).json({ message:'Not found'}); await fs.destroy(); res.json({ message:'Deleted'});} catch(e){ next(e); }
};
