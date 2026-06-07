import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("event_logs", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      paymentTransactionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "payment_transactions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    });

    // Index for fast lookups by payment transaction
    await queryInterface.addIndex("event_logs", ["paymentTransactionId"], {
      name: "idx_event_logs_payment_transaction",
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("event_logs");
  },
};
