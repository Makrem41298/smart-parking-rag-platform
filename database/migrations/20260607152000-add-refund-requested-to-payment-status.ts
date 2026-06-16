import { QueryInterface, DataTypes } from "sequelize";
import { PaymentStatus } from "../../models/enum.type";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.changeColumn("payment_transactions", "status", {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
    });
  },

  async down(queryInterface: QueryInterface) {
    // Revert is not strictly necessary for this addition, but we can do a fallback
  },
};
