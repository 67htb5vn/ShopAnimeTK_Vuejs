import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface hoadonAttributes {
  mahd?: string;
  ngaylap?: string;
  diachi?: string;
  thanhtien?: number;
  htthanhtoan?: string;
  mand?: string;
  makm?: string;
}

export type hoadonOptionalAttributes = "mahd" | "ngaylap" | "diachi" | "thanhtien" | "htthanhtoan" | "mand" | "makm";
export type hoadonCreationAttributes = Optional<hoadonAttributes, hoadonOptionalAttributes>;

export class hoadon extends Model<hoadonAttributes, hoadonCreationAttributes> implements hoadonAttributes {
  mahd?: string;
  ngaylap?: string;
  diachi?: string;
  thanhtien?: number;
  htthanhtoan?: string;
  mand?: string;
  makm?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof hoadon {
    return hoadon.init({
    mahd: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ngaylap: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    diachi: {
      type: DataTypes.STRING(300),
      allowNull: true
    },
    thanhtien: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    htthanhtoan: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    mand: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    makm: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'hoadon',
    schema: 'public',
    timestamps: false
  });
  }
}
