import type { Sequelize } from "sequelize";
import { chitiettag as _chitiettag } from "./chitiettag";
import type { chitiettagAttributes, chitiettagCreationAttributes } from "./chitiettag";
import { cthoadon as _cthoadon } from "./cthoadon";
import type { cthoadonAttributes, cthoadonCreationAttributes } from "./cthoadon";
import { cttrangthai as _cttrangthai } from "./cttrangthai";
import type { cttrangthaiAttributes, cttrangthaiCreationAttributes } from "./cttrangthai";
import { danhgia as _danhgia } from "./danhgia";
import type { danhgiaAttributes, danhgiaCreationAttributes } from "./danhgia";
import { danhmuchang as _danhmuchang } from "./danhmuchang";
import type { danhmuchangAttributes, danhmuchangCreationAttributes } from "./danhmuchang";
import { hinhanhnd as _hinhanhnd } from "./hinhanhnd";
import type { hinhanhndAttributes, hinhanhndCreationAttributes } from "./hinhanhnd";
import { hinhanhsp as _hinhanhsp } from "./hinhanhsp";
import type { hinhanhspAttributes, hinhanhspCreationAttributes } from "./hinhanhsp";
import { hoadon as _hoadon } from "./hoadon";
import type { hoadonAttributes, hoadonCreationAttributes } from "./hoadon";
import { hoathinh as _hoathinh } from "./hoathinh";
import type { hoathinhAttributes, hoathinhCreationAttributes } from "./hoathinh";
import { khuyenmai as _khuyenmai } from "./khuyenmai";
import type { khuyenmaiAttributes, khuyenmaiCreationAttributes } from "./khuyenmai";
import { nguoidung as _nguoidung } from "./nguoidung";
import type { nguoidungAttributes, nguoidungCreationAttributes } from "./nguoidung";
import { sanpham as _sanpham } from "./sanpham";
import type { sanphamAttributes, sanphamCreationAttributes } from "./sanpham";
import { tag as _tag } from "./tag";
import type { tagAttributes, tagCreationAttributes } from "./tag";
import { trangthai as _trangthai } from "./trangthai";
import type { trangthaiAttributes, trangthaiCreationAttributes } from "./trangthai";

export {
  _chitiettag as chitiettag,
  _cthoadon as cthoadon,
  _cttrangthai as cttrangthai,
  _danhgia as danhgia,
  _danhmuchang as danhmuchang,
  _hinhanhnd as hinhanhnd,
  _hinhanhsp as hinhanhsp,
  _hoadon as hoadon,
  _hoathinh as hoathinh,
  _khuyenmai as khuyenmai,
  _nguoidung as nguoidung,
  _sanpham as sanpham,
  _tag as tag,
  _trangthai as trangthai,
};

export type {
  chitiettagAttributes,
  chitiettagCreationAttributes,
  cthoadonAttributes,
  cthoadonCreationAttributes,
  cttrangthaiAttributes,
  cttrangthaiCreationAttributes,
  danhgiaAttributes,
  danhgiaCreationAttributes,
  danhmuchangAttributes,
  danhmuchangCreationAttributes,
  hinhanhndAttributes,
  hinhanhndCreationAttributes,
  hinhanhspAttributes,
  hinhanhspCreationAttributes,
  hoadonAttributes,
  hoadonCreationAttributes,
  hoathinhAttributes,
  hoathinhCreationAttributes,
  khuyenmaiAttributes,
  khuyenmaiCreationAttributes,
  nguoidungAttributes,
  nguoidungCreationAttributes,
  sanphamAttributes,
  sanphamCreationAttributes,
  tagAttributes,
  tagCreationAttributes,
  trangthaiAttributes,
  trangthaiCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const chitiettag = _chitiettag.initModel(sequelize);
  const cthoadon = _cthoadon.initModel(sequelize);
  const cttrangthai = _cttrangthai.initModel(sequelize);
  const danhgia = _danhgia.initModel(sequelize);
  const danhmuchang = _danhmuchang.initModel(sequelize);
  const hinhanhnd = _hinhanhnd.initModel(sequelize);
  const hinhanhsp = _hinhanhsp.initModel(sequelize);
  const hoadon = _hoadon.initModel(sequelize);
  const hoathinh = _hoathinh.initModel(sequelize);
  const khuyenmai = _khuyenmai.initModel(sequelize);
  const nguoidung = _nguoidung.initModel(sequelize);
  const sanpham = _sanpham.initModel(sequelize);
  const tag = _tag.initModel(sequelize);
  const trangthai = _trangthai.initModel(sequelize);


  return {
    chitiettag: chitiettag,
    cthoadon: cthoadon,
    cttrangthai: cttrangthai,
    danhgia: danhgia,
    danhmuchang: danhmuchang,
    hinhanhnd: hinhanhnd,
    hinhanhsp: hinhanhsp,
    hoadon: hoadon,
    hoathinh: hoathinh,
    khuyenmai: khuyenmai,
    nguoidung: nguoidung,
    sanpham: sanpham,
    tag: tag,
    trangthai: trangthai,
  };
}
