import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface trangthaiAttributes {
  matt?: string;
  tentrangthai?: string;
}

export type trangthaiOptionalAttributes = "matt" | "tentrangthai";
export type trangthaiCreationAttributes = Optional<trangthaiAttributes, trangthaiOptionalAttributes>;

export class trangthai extends Model<trangthaiAttributes, trangthaiCreationAttributes> implements trangthaiAttributes {
  matt?: string;
  tentrangthai?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof trangthai {
    return trangthai.init({
    matt: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    tentrangthai: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'trangthai',
    schema: 'public',
    timestamps: false
  });
  }
}
