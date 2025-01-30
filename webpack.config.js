import { resolve as _resolve, dirname } from "path";
import { fileURLToPath } from "url";
import CopyWebpackPlugin from "copy-webpack-plugin";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { NODE_ENV } = process.env;

const config = {
  mode: NODE_ENV ?? "development",
  entry: _resolve(__dirname, "example/src/index.tsx"),
  module: {
    rules: [
      {
        test: /.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: _resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
  ],
};

export default config;
