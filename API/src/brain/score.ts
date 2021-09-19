import brain from "brain.js";
import fs from "fs";
import { getTestImages, getTestLabels, normalize } from "./mnist";

function maxScore(obj: brain.NeuralNetworkInput) {
  let maxKey = 0;
  let maxValue = 0;

  Object.entries(obj).forEach((entry) => {
    let key = entry[0];
    let value = entry[1];
    if (value > maxValue) {
      maxValue = value;
      maxKey = parseInt(key, 10);
    }
  });

  return maxKey;
}

export async function getAccuracy() {
  const networkModel = JSON.parse(fs.readFileSync("./data/model.json", "utf8"));

  const net = new brain.NeuralNetwork();
  net.fromJSON(networkModel);

  const testDigits = await getTestImages();
  const testLabels = await getTestLabels();

  const imageSize = 28 * 28;
  let errors = 0;

  for (let ix = 0; ix < testLabels.length; ix++) {
    const start = ix * imageSize;
    const input = testDigits.slice(start, start + imageSize).map(normalize);

    const detection = net.run(input);
    const max = maxScore(detection);
    //console.log(max, testLabels[ix]);
    if (max !== testLabels[ix]) {
      errors++;
    }
  }


  return {
      'Total': testLabels.length,
      'Number of errors': errors,
      'Accuracy': ((testLabels.length - errors) * 100) / testLabels.length
  }
}
