import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";
import { REVIEW_STATUS } from "../config/constants.js";

const Review = sequelize.define(
  "Reviews",
  {
    reviewId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Products",
        key: "productId",
      },
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Users",
        key: "userId",
      },
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "Orders",
        key: "orderId",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of image URLs",
    },
    isVerifiedPurchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(REVIEW_STATUS)),
      defaultValue: REVIEW_STATUS.pending,
    },
    helpfulCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);

export default Review;
