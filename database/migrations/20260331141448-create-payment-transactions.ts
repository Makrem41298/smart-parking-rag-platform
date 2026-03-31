import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("payment_transactions", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      paymentDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      method: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
        allowNull: false,
        defaultValue: "PENDING",
      },

      paymentableId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      paymentableType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // 🔥 Index for polymorphic queries (VERY IMPORTANT)
    await queryInterface.addIndex("payment_transactions", [
      "paymentableId",
      "paymentableType",
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("payment_transactions");


  },
};