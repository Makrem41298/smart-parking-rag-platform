import { Migration } from "sequelize-cli";
import { QueryInterface, DataTypes } from "sequelize";
import {ReclamationStatus} from "../../models/enum.type";

export const up: Migration["up"] = async (queryInterface: QueryInterface) => {
  await queryInterface.createTable("Reclamations", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    subject:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    solution: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReclamationStatus)),
      allowNull: false,
      defaultValue: ReclamationStatus.IN_PROGRESS,
    },
    conversationHistory: {
      type:DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
};

export const down: Migration["down"] = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable("Reclamations");
};
