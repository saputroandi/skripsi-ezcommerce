module.exports = {
  up: async (queryInterface) => {
    const safeAdd = async (name, fields) => {
      try {
        await queryInterface.addIndex('orders', fields, { name });
      } catch (e) {
        // Best-effort: ignore if index/column already exists or schema differs
      }
    };

    await safeAdd('idx_orders_created_at', ['createdAt']);
    await safeAdd('idx_orders_userid_created_at', ['userId', 'createdAt']);
    await safeAdd('idx_orders_transaction_code', ['transactionCode']);
  },

  down: async (queryInterface) => {
    const safeRemove = async (name) => {
      try {
        await queryInterface.removeIndex('orders', name);
      } catch (e) {
        // Best-effort
      }
    };

    await safeRemove('idx_orders_created_at');
    await safeRemove('idx_orders_userid_created_at');
    await safeRemove('idx_orders_transaction_code');
  }
};
