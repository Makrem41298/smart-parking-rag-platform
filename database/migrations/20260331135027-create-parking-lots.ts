import { QueryInterface, DataTypes } from "sequelize";
import { ParkingStatus } from "../../models/enum.type";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("parking_lots", {
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

      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      country: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      covered: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      numberOfPlaces: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      numberOfPlaceAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      statusParking: {
        type: DataTypes.ENUM(...Object.values(ParkingStatus)),
        allowNull: false,
        defaultValue: ParkingStatus.OPEN,
      },

      reservationAvailability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      subscriptionAvailability: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      tarifGridId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "tariff_grids",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      url_image: {
        type: DataTypes.STRING,
        allowNull: true,
      }

    ,
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
    await queryInterface.dropTable("parking_lots");

  },
};