import brain from "brain.js";
import fs from "fs";
import {
  getTestImages,
  getTestLabels,
  getTrainImages,
  getTrainLabels,
} from "./mnist";

export async function trainBrain() {
  console.log("Train labels");

  const trainLabels = await getTrainLabels();
  console.log("Train images");

  const trainDigits = await getTrainImages();

  console.log("Test labels");

  const testLabels = await getTestLabels();
  console.log("Test images");

  const testDigits = await getTestImages();

  const labels = [...trainLabels, ...testLabels];
  const digits = [...trainDigits, ...testDigits];

  const imageSize = 28 * 28;
  const trainingData = [];

  console.log("Normalize");

  for (let ix = 0; ix < labels.length; ix++) {
    const start = ix * imageSize;
    const input = digits.slice(start, start + imageSize);
    const output = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    output[labels[ix]] = 1;
    trainingData.push({ input, output });
  }

  const trainingOptions: brain.INeuralNetworkTrainingOptions = {
    iterations: 20,
    log: (details) => console.log(details),
  };

  const config = {
    binaryThresh: 0.5,
    hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
    leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
  };

  const net = new brain.NeuralNetworkGPU(config);

  console.log("Training started");

  const stats = net.train(trainingData, trainingOptions);

  console.log("Export net to json");
  const model = net.toJSON();

  fs.writeFile("./data/model.json", JSON.stringify(model), "utf8", () =>
    console.log("model has been written")
  );
}

