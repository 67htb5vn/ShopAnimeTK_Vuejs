import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface cthoadonAttributes {
  masp?: string;
  mahd?: string;
  gia?: number;
  soluong?: number;
}

export type cthoadonOptionalAttributes = "masp" | "mahd" | "gia" | "soluong";
export type cthoadonCreationAttributes = Optional<cthoadonAttributes, cthoadonOptionalAttributes>;

export class cthoadon extends Model<cthoadonAttributes, cthoadonCreationAttributes> implements cthoadonAttributes {
  masp?: string;
  mahd?: string;
  gia?: number;
  soluong?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof cthoadon {
    return cthoadon.init({
    masp: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    mahd: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    gia: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    soluong: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cthoadon',
    schema: 'public',
    timestamps: false
  });
  }
}
