import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("reservations", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      parkingLotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "parking_lots",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      startTimeDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      endTimeDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("REQUESTED", "CONFIRMED", "CANCELLED","EXPIRED","USED"),
        allowNull: false,
        defaultValue: "REQUESTED",
      },
      entryTime:{
        type: DataTypes.DATE,
        allowNull: true,
      }
      ,
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("reservations");

  },
};