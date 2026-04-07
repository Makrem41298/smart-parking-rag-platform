import { Model,Sequelize,DataTypes,Optional } from 'sequelize';
import {ReclamationStatus} from "./enum.type";



export interface ReclamationAttributes {
  id: number;
  clientId: number;
  adminId: number|null;
  subject: string|null;
  content: string;
  solution: string|null;
  status: ReclamationStatus;
}
interface ReclamationCreationAttributes extends Optional<ReclamationAttributes, 'id'|"status"> {}

export class Reclamation extends Model<ReclamationAttributes,ReclamationCreationAttributes> implements ReclamationAttributes {
     declare id: number;
     declare clientId: number;
     declare adminId: number;
     declare subject: string;
     declare content: string;
     declare solution: string;
     declare status: ReclamationStatus;
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

  }
  export const initReclamation = (sequelize: Sequelize) => {
    Reclamation.init({
      id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      clientId:{
       type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },

      } ,
      adminId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
        }
      },
        subject:{
          type: DataTypes.STRING,
            allowNull: true,
        },
      content:{
      type:  DataTypes.STRING,
        allowNull: false,
      } ,
      solution: {
        type:DataTypes.STRING,
        allowNull: true,
      },
        status: {
          type:DataTypes.ENUM(...Object.values(ReclamationStatus)),
            allowNull: false,
            defaultValue: ReclamationStatus.IN_PROGRESS,
        }

    }, {
      sequelize,
      modelName: 'Reclamation',
      tableName: 'reclamations',
      timestamps: true,
    });
  };









