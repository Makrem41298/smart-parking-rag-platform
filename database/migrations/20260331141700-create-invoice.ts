import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("invoices", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      paymentTransactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 🔥 ensures 1:1 relation
        references: {
          model: "payment_transactions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("invoices");
  },
};