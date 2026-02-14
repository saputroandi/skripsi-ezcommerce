'use strict';

/**
 * Removes orders.paymentReference column and drops unused tables:
 * - flash_sales
 * - articles
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1) Remove paymentReference from orders (if exists)
    const orders = await queryInterface.describeTable('orders');
    if (orders.paymentReference) {
      await queryInterface.removeColumn('orders', 'paymentReference');
    }
    if (orders.payment_reference) {
      await queryInterface.removeColumn('orders', 'payment_reference');
    }

    // 2) Drop flash_sales (safe even if already dropped in some envs)
    try {
      await queryInterface.dropTable('flash_sales');
    } catch (_) {}

    // 3) Drop articles
    try {
      await queryInterface.dropTable('articles');
    } catch (_) {}
  },

  down: async () => {
    throw new Error('This migration is irreversible. Restore from backup if needed.');
  }
};
