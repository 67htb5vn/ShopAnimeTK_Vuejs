import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface danhgiaAttributes {
  madg?: string;
  noidung?: string;
  sao?: number;
  thoigian?: string;
  mand?: string;
  masp?: string;
}

export type danhgiaOptionalAttributes = "madg" | "noidung" | "sao" | "thoigian" | "mand" | "masp";
export type danhgiaCreationAttributes = Optional<danhgiaAttributes, danhgiaOptionalAttributes>;

export class danhgia extends Model<danhgiaAttributes, danhgiaCreationAttributes> implements danhgiaAttributes {
  madg?: string;
  noidung?: string;
  sao?: number;
  thoigian?: string;
  mand?: string;
  masp?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof danhgia {
    return danhgia.init({
    madg: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    noidung: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    sao: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    thoigian: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    mand: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    masp: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'danhgia',
    schema: 'public',
    timestamps: false
  });
  }
}
