module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = 'orders';
    const desc = await queryInterface.describeTable(table);

    if (!desc.paymentProof && !desc.payment_proof) {
      await queryInterface.addColumn(table, 'paymentProof', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // Re-describe after potential addColumn
    const desc2 = await queryInterface.describeTable(table);
    if (!desc2.paymentProofUploadedAt && !desc2.payment_proof_uploaded_at) {
      await queryInterface.addColumn(table, 'paymentProofUploadedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = 'orders';
    const desc = await queryInterface.describeTable(table);

    if (desc.paymentProof) await queryInterface.removeColumn(table, 'paymentProof');
    if (desc.payment_proof) await queryInterface.removeColumn(table, 'payment_proof');

    if (desc.paymentProofUploadedAt) await queryInterface.removeColumn(table, 'paymentProofUploadedAt');
    if (desc.payment_proof_uploaded_at) await queryInterface.removeColumn(table, 'payment_proof_uploaded_at');
  },
};
