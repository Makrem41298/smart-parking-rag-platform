import { Migration } from "sequelize-cli";
import { QueryInterface, DataTypes } from "sequelize";

export const up: Migration["up"] = async (queryInterface: QueryInterface) => {
  await queryInterface.addColumn("reservations", "qrCode", {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  });
};

export const down: Migration["down"] = async (queryInterface: QueryInterface) => {
  await queryInterface.removeColumn("reservations", "qrCode");
};
