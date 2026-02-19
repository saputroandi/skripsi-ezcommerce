const { Order, VoucherPackage, Game } = require('../models');
const { Sequelize } = require('sequelize');
const { sendTelegramLog } = require('../utils/telegramLogger');

/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         status: { type: string }
 */

exports.create = async (req,res,next)=>{
  try {
    const { gameId, voucherPackageId, uid, whatsapp } = req.body;

    const vp = await VoucherPackage.findByPk(voucherPackageId, { include: [Game] });
    if(!vp) return res.status(400).json({ message:'Invalid package' });

    // keep guarding mismatch if client sends gameId
    if (gameId && Number(vp.gameId) !== Number(gameId)) {
      return res.status(400).json({ message:'Invalid package/game' });
    }

    // Option A: store only the final snapshot amount to be paid.
    const finalPrice = parseFloat(vp.price);

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const effectiveGameId = vp.gameId;
    const transactionCode = `TRX-${ts}-${effectiveGameId}-${voucherPackageId}-${rand}`;

    const order = await Order.create({
      userId: req.user.id,
      voucherPackageId,
      uid,
      whatsapp: whatsapp ? String(whatsapp).trim() : null,
      transactionCode,
      finalPrice
    });
    sendTelegramLog(`Order baru dibuat:\nKode: ${order.transactionCode}\nWhatsapp: ${order.whatsapp}`);
    res.json(order);
  } catch(e){ next(e); }
};

exports.list = async (req,res,next)=>{
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: VoucherPackage, include: [Game] }
      ]
    });
    res.json(orders);
  } catch(e){ next(e); }
};

exports.pay = async (req,res,next)=>{
  try {
    const order = await Order.findByPk(req.params.id);
    if(!order) return res.status(404).json({ message:'Not found'});
    if(order.userId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message:'Forbidden'});
    if(order.status==='paid') return res.json(order);

    order.status='paid';
    await order.save();
    res.json(order);
  } catch(e){ next(e); }
};

exports.adminList = async (req,res,next)=>{
  try {
    const orders = await Order.findAll({
      include: [
        { model: VoucherPackage, include: [Game] }
      ]
    });
    res.json(orders);
  } catch(e){ next(e); }
};

exports.invoice = async (req,res,next)=>{
  try {
    const o = await Order.findByPk(req.params.id, {
      include: [
        { model: VoucherPackage, include: [Game] }
      ]
    });
    if(!o) return res.status(404).json({ message:'Not found'});
    if(o.userId !== req.user.id && req.user.role!=='admin') return res.status(403).json({ message:'Forbidden'});
    res.json(o);
  } catch(e){ next(e); }
};
