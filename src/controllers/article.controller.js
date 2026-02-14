const { Article, User } = require('../models');
/**
 * @openapi
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         title: { type: string }
 */

exports.list = async (req,res,next)=>{ try { res.json(await Article.findAll({ include:[User] })); } catch(e){ next(e);} };
exports.get = async (req,res,next)=>{ try { const a = await Article.findByPk(req.params.id,{ include:[User]}); if(!a) return res.status(404).json({ message:'Not found'}); res.json(a);} catch(e){ next(e);} };
exports.create = async (req,res,next)=>{ try { const a = await Article.create({ ...req.body, authorId: req.user.id }); res.json(a);} catch(e){ next(e);} };
exports.update = async (req,res,next)=>{ try { const a = await Article.findByPk(req.params.id); if(!a) return res.status(404).json({ message:'Not found'}); await a.update(req.body); res.json(a);} catch(e){ next(e);} };
exports.remove = async (req,res,next)=>{ try { const a = await Article.findByPk(req.params.id); if(!a) return res.status(404).json({ message:'Not found'}); await a.destroy(); res.json({ message:'Deleted'});} catch(e){ next(e);} };
