import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface khuyenmaiAttributes {
  makm?: string;
  tenkm?: string;
  ngaybd?: string;
  ngaykt?: string;
  mucgiam?: number;
  dieukien?: string;
  giatri?: number;
}

export type khuyenmaiOptionalAttributes = "makm" | "tenkm" | "ngaybd" | "ngaykt" | "mucgiam" | "dieukien" | "giatri";
export type khuyenmaiCreationAttributes = Optional<khuyenmaiAttributes, khuyenmaiOptionalAttributes>;

export class khuyenmai extends Model<khuyenmaiAttributes, khuyenmaiCreationAttributes> implements khuyenmaiAttributes {
  makm?: string;
  tenkm?: string;
  ngaybd?: string;
  ngaykt?: string;
  mucgiam?: number;
  dieukien?: string;
  giatri?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof khuyenmai {
    return khuyenmai.init({
    makm: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    tenkm: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngaybd: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ngaykt: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    mucgiam: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    dieukien: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    giatri: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'khuyenmai',
    schema: 'public',
    timestamps: false
  });
  }
}
