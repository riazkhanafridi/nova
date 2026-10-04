import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";
import { PRODUCT_STATUS, PRODUCT_CONDITION } from "../config/constants.js";

const Product = sequelize.define(
  "Products",
  {
    productId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    shortDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    comparePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Original price before discount",
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lowStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    weight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: "Weight in kg",
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PRODUCT_STATUS)),
      defaultValue: PRODUCT_STATUS.active,
    },
    condition: {
      type: DataTypes.ENUM(...Object.values(PRODUCT_CONDITION)),
      defaultValue: PRODUCT_CONDITION.new,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBestSeller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isNewArrival: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalSold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Product specifications as key-value pairs",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Array of tag strings",
    },
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "Categories",
        key: "categoryId",
      },
    },
    brandId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "Brands",
        key: "brandId",
      },
    },
  },
  {
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);

export default Product;
