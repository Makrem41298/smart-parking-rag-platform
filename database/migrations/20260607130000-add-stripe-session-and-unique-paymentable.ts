import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    // 1. Add stripeSessionId column
    await queryInterface.addColumn("payment_transactions", "stripeSessionId", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    });

    // 2. Remove the old non-unique index on (paymentableId, paymentableType)
    await queryInterface.removeIndex(
      "payment_transactions",
      ["paymentableId", "paymentableType"]
    );

    // 3. Add unique composite index to enforce polymorphic 1:1
    await queryInterface.addIndex(
      "payment_transactions",
      ["paymentableId", "paymentableType"],
      {
        unique: true,
        name: "unique_paymentable",
      }
    );
  },

  async down(queryInterface: QueryInterface) {
    // Reverse: remove unique index
    await queryInterface.removeIndex("payment_transactions", "unique_paymentable");

    // Re-add the old non-unique index
    await queryInterface.addIndex("payment_transactions", [
      "paymentableId",
      "paymentableType",
    ]);

    // Remove stripeSessionId column
    await queryInterface.removeColumn("payment_transactions", "stripeSessionId");
  },
};
