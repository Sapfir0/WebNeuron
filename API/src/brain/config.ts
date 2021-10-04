import path from "path";

export const config = {
  binaryThresh: 0.5,
  hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
  leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
};

export const BRAIN_DATA_PATH = path.resolve("./data/brain");
