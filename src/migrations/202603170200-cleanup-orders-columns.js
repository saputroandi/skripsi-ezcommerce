module.exports = {
  up: async (queryInterface) => {
    const desc = await queryInterface.describeTable('orders');

    if (desc.gameId || desc.game_id) {
      await queryInterface.removeColumn('orders', desc.gameId ? 'gameId' : 'game_id');
    }

    if (desc.price) {
      await queryInterface.removeColumn('orders', 'price');
    }

    if (desc.discountApplied) {
      await queryInterface.removeColumn('orders', 'discountApplied');
    }

    if (desc.paymentReference) {
      await queryInterface.removeColumn('orders', 'paymentReference');
    }

    if (desc.payment_reference) {
      await queryInterface.removeColumn('orders', 'payment_reference');
    }
  },

  down: async () => {
    // No rollback: legacy columns are intentionally removed.
  }
};
