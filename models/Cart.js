import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const Cart = sequelize.define(
  "Carts",
  {
    cartId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Users",
        key: "userId",
      },
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default Cart;
