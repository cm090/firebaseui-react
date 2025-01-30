import { resolve as _resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  mode: "production",
  entry: _resolve(__dirname, "src/FirebaseAuthUi.tsx"),
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
    path: _resolve(__dirname, "dist"),
    filename: "index.js",
    library: "FirebaseAuthUi",
    libraryTarget: "umd",
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    firebase: "firebase",
  }
};

export default config;
