import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";
import { COUPON_TYPE } from "../config/constants.js";

const Coupon = sequelize.define(
  "Coupons",
  {
    couponId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(COUPON_TYPE)),
      allowNull: false,
      defaultValue: COUPON_TYPE.percentage,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Percentage (0-100) or fixed amount",
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: "Minimum order amount to apply this coupon",
    },
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Maximum discount cap for percentage coupons",
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Total times this coupon can be used",
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    perUserLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);

export default Coupon;
