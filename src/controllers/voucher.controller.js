const { VoucherPackage, Game } = require('../models');
/**
 * @openapi
 * components:
 *   schemas:
 *     VoucherPackage:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 */

exports.list = async (req,res,next)=>{
  try { res.json(await VoucherPackage.findAll({ include: [Game] })); } catch(e){ next(e); }
};
exports.get = async (req,res,next)=>{
  try { const v = await VoucherPackage.findByPk(req.params.id,{ include:[Game]}); if(!v) return res.status(404).json({ message:'Not found'}); res.json(v);} catch(e){ next(e); }
};
exports.create = async (req,res,next)=>{
  try { const v = await VoucherPackage.create(req.body); res.json(v);} catch(e){ next(e); }
};
exports.update = async (req,res,next)=>{
  try { const v = await VoucherPackage.findByPk(req.params.id); if(!v) return res.status(404).json({ message:'Not found'}); await v.update(req.body); res.json(v);} catch(e){ next(e); }
};
exports.remove = async (req,res,next)=>{
  try { const v = await VoucherPackage.findByPk(req.params.id); if(!v) return res.status(404).json({ message:'Not found'}); await v.destroy(); res.json({ message:'Deleted'});} catch(e){ next(e); }
};
