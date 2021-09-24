import brain from "brain.js";
import fs from "fs";
import path from 'path'
import { BRAIN_DATA_PATH, config } from "./config";

const getLastModel = () => {
  const files = fs.readdirSync(BRAIN_DATA_PATH);
  files.sort();
  return path.join(BRAIN_DATA_PATH, files[files.length - 1]);
};

export function predict(data: any) {
  const net = new brain.NeuralNetworkGPU(config);

  const networkState = JSON.parse(fs.readFileSync(getLastModel(), "utf-8"));
  net.fromJSON(networkState);
  return net.run(data);
}
