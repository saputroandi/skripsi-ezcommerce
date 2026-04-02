const { Cart, CartItem, VoucherPackage, Game, Order, OrderItem, UserAddress, sequelize } = require('../models');
const { sendTelegramLog } = require('../utils/telegramLogger');

const clampQty = (val) => {
  const n = parseInt(val, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 999);
};

const buildTransactionCode = (gameId, voucherPackageId) => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TRX-${ts}-${gameId}-${voucherPackageId}-${rand}`;
};

const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({ where: { userId }, defaults: { userId } });
  return cart;
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: VoucherPackage, include: [Game] }],
      order: [['id', 'DESC']]
    });
    res.json({ cartId: cart.id, items });
  } catch (e) {
    next(e);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const voucherPackageId = Number(req.body.voucherPackageId);
    const quantity = clampQty(req.body.quantity || 1);
    if (!Number.isFinite(voucherPackageId)) return res.status(400).json({ message: 'Invalid package' });

    const voucherPackage = await VoucherPackage.findByPk(voucherPackageId);
    if (!voucherPackage) return res.status(400).json({ message: 'Invalid package' });

    const cart = await getOrCreateCart(req.user.id);
    const existing = await CartItem.findOne({ where: { cartId: cart.id, voucherPackageId } });
    if (existing) {
      existing.quantity = clampQty(existing.quantity + quantity);
      await existing.save();
      return res.json(existing);
    }
    const item = await CartItem.create({ cartId: cart.id, voucherPackageId, quantity });
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const cart = await getOrCreateCart(req.user.id);
    const item = await CartItem.findOne({ where: { id, cartId: cart.id } });
    if (!item) return res.status(404).json({ message: 'Not found' });

    const quantity = clampQty(req.body.quantity || 1);
    item.quantity = quantity;
    await item.save();
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: 'Invalid id' });
    const cart = await getOrCreateCart(req.user.id);
    await CartItem.destroy({ where: { id, cartId: cart.id } });
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

  exports.checkout = async (req, res, next) => {
    try {
      const addressId = Number(req.body.addressId);
      if (!Number.isFinite(addressId)) return res.status(400).json({ message: 'Alamat tidak valid' });

      const address = await UserAddress.findOne({ where: { id: addressId, userId: req.user.id } });
      if (!address) return res.status(400).json({ message: 'Alamat tidak valid' });

      const rawItemIds = req.body.itemIds;
      const itemIds = (Array.isArray(rawItemIds) ? rawItemIds : typeof rawItemIds === 'string' ? rawItemIds.split(',') : [])
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id));
      const hasItemFilter = Array.isArray(rawItemIds) || typeof rawItemIds === 'string';
      if (hasItemFilter && !itemIds.length) return res.status(400).json({ message: 'Pilih item checkout' });

      const cart = await getOrCreateCart(req.user.id);
      const items = await CartItem.findAll({
        where: hasItemFilter ? { cartId: cart.id, id: itemIds } : { cartId: cart.id },
        include: [{ model: VoucherPackage, include: [Game] }],
        order: [['id', 'ASC']]
      });
      if (!items.length) {
        return res.status(400).json({ message: hasItemFilter ? 'Pilih item checkout' : 'Keranjang masih kosong' });
      }

    const totalPrice = items.reduce((sum, item) => {
      const price = Number(item.VoucherPackage?.price) || 0;
      return sum + price * (item.quantity || 1);
    }, 0);
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const firstItem = items[0];
    const transactionCode = buildTransactionCode(firstItem.VoucherPackage?.gameId || 0, firstItem.voucherPackageId);

      const order = await sequelize.transaction(async (t) => {
        const created = await Order.create({
          userId: req.user.id,
          addressId: address.id,
          voucherPackageId: firstItem.voucherPackageId,
        quantity: totalQty,
        uid: 'Cart checkout',
        whatsapp: null,
        transactionCode,
        finalPrice: totalPrice
      }, { transaction: t });

      const orderItems = items.map((item) => {
        const unitPrice = Number(item.VoucherPackage?.price) || 0;
        const qty = item.quantity || 1;
        return {
          orderId: created.id,
          voucherPackageId: item.voucherPackageId,
          quantity: qty,
          unitPrice,
          totalPrice: unitPrice * qty,
        };
      });

      await OrderItem.bulkCreate(orderItems, { transaction: t });
        const destroyWhere = hasItemFilter ? { cartId: cart.id, id: itemIds } : { cartId: cart.id };
        await CartItem.destroy({ where: destroyWhere, transaction: t });
        return created;
      });

    sendTelegramLog(`Order baru dibuat:\nKode: ${order.transactionCode}\nTotal: ${order.finalPrice}`);
    res.json(order);
  } catch (e) {
    next(e);
  }
};
