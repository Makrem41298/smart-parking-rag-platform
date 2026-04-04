import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("plans", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      activeDays: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      },

      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      NumberOfBenefitDays:{
        allowNull: false,
        type: DataTypes.INTEGER,
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
    await queryInterface.dropTable("plans");
  },
};