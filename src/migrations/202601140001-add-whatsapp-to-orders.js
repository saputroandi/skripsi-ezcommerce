module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('orders');

    // Prefer canonical column name: whatsapp
    if (!desc.whatsapp) {
      await queryInterface.addColumn('orders', 'whatsapp', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }

    // Detect legacy reference column name (schema drift safe)
    const hasPaymentReference = !!desc.paymentReference;
    const hasPayment_reference = !!desc.payment_reference;
    const refCol = hasPaymentReference ? 'paymentReference' : (hasPayment_reference ? 'payment_reference' : null);

    // If previous workaround stored WhatsApp inside payment reference as `WA:<number>`, migrate it.
    if (refCol) {
      await queryInterface.sequelize.query(`
        UPDATE orders
        SET whatsapp = regexp_replace("${refCol}", '^WA:', '')
        WHERE whatsapp IS NULL
          AND "${refCol}" IS NOT NULL
          AND "${refCol}" LIKE 'WA:%'
      `);
    }
  },

  down: async (queryInterface) => {
    const desc = await queryInterface.describeTable('orders');
    if (desc.whatsapp) {
      await queryInterface.removeColumn('orders', 'whatsapp');
    }
  }
};
