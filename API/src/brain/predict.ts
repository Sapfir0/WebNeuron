import brain from "brain.js";
import fs from "fs";
import { cpuUsage } from "os-utils";
import path from "path";
import { BRAIN_DATA_PATH, config } from "./config";

const getLastModel = () => {
  const files = fs.readdirSync(BRAIN_DATA_PATH);
  files.sort();
  return path.join(BRAIN_DATA_PATH, files[files.length - 1]);
};

export function predict(data: any) {
  const net = new brain.NeuralNetworkGPU(config);
  const modelName = getLastModel();
  console.log("Model used:", modelName);

  const networkState = JSON.parse(fs.readFileSync(modelName, "utf-8"));
  net.fromJSON(networkState);
  console.time("brain predict");

  cpuUsage((usage: number) => {
    console.log(`CPU usage: ${usage.toFixed(3)}%`);
  });

  const predicted = net.run(data);

  console.timeEnd("brain predict");

  return predicted;
}
