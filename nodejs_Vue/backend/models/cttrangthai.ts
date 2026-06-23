import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface cttrangthaiAttributes {
  mahd?: string;
  matt?: string;
  ngaycapnhat?: Date;
}

export type cttrangthaiOptionalAttributes = "mahd" | "matt" | "ngaycapnhat";
export type cttrangthaiCreationAttributes = Optional<cttrangthaiAttributes, cttrangthaiOptionalAttributes>;

export class cttrangthai extends Model<cttrangthaiAttributes, cttrangthaiCreationAttributes> implements cttrangthaiAttributes {
  mahd?: string;
  matt?: string;
  ngaycapnhat?: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof cttrangthai {
    return cttrangthai.init({
    mahd: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    matt: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ngaycapnhat: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cttrangthai',
    schema: 'public',
    timestamps: false
  });
  }
}
