import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface sanphamAttributes {
  masp?: string;
  tensp?: string;
  gia?: number;
  ghichu?: string;
  madmh?: string;
  mahh?: string;
  thongtin?: string;
  soluong?: number;
}

export type sanphamOptionalAttributes = "masp" | "tensp" | "gia" | "ghichu" | "madmh" | "mahh" | "thongtin" | "soluong";
export type sanphamCreationAttributes = Optional<sanphamAttributes, sanphamOptionalAttributes>;

export class sanpham extends Model<sanphamAttributes, sanphamCreationAttributes> implements sanphamAttributes {
  masp?: string;
  tensp?: string;
  gia?: number;
  ghichu?: string;
  madmh?: string;
  mahh?: string;
  thongtin?: string;
  soluong?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof sanpham {
    return sanpham.init({
    masp: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    tensp: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    gia: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    ghichu: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    madmh: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    mahh: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    thongtin: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    soluong: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sanpham',
    schema: 'public',
    timestamps: false
  });
  }
}
