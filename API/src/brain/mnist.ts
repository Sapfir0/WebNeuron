const fs = require("fs");
const http = require("http");
const zlib = require("zlib");

const dataDir = "./data/";
const mnistBaseURL = "http://yann.lecun.com/exdb/mnist/";
const trainImagesFile = "train-images-idx3-ubyte";
const trainLabelsFile = "train-labels-idx1-ubyte";
const testImagesFile = "t10k-images-idx3-ubyte";
const testLabelsFile = "t10k-labels-idx1-ubyte";

export async function downloadMnistDataset(fileName: string) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  if (!fs.existsSync(dataDir + fileName)) {
    const gzFile = dataDir + fileName + ".gz";
    if (!fs.existsSync(gzFile)) {
      const outputStream = fs.createWriteStream(gzFile);
      const response: any = await httpGetPromisified(
        mnistBaseURL + fileName + ".gz"
      );
      response.pipe(outputStream);
      await new Promise((resolve) =>
        outputStream.on("finish", (res: any) => outputStream.close(() => resolve(res)))
      );
    }

    await gunzip(gzFile, dataDir + fileName);
  }
}

export function downloadAll() {
  return Promise.all(
    [trainImagesFile, trainLabelsFile, testImagesFile, testLabelsFile].map(
      downloadMnistDataset
    )
  );
}

export function httpGetPromisified(url: string) {
  return new Promise((resolve, reject) => http.get(url, (res: any) => resolve(res)));
}

export function gunzip(compressedFile: any, uncompressedFile: any) {
  const compressed = fs.createReadStream(compressedFile);
  const uncompressed = fs.createWriteStream(uncompressedFile);

  return new Promise((resolve, reject) => {
    compressed
      .pipe(zlib.createGunzip())
      .pipe(uncompressed)
      .on("finish", (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(err);
        }
      });
  });
}

export async function readLabels(fileName: string) {
  const stream = fs.createReadStream(dataDir + fileName, {
    highWaterMark: 32 * 1024,
  });
  let firstChunk = true;

  const labels = [];

  for await (const chunk of stream) {
    let start = 0;
    if (firstChunk) {
      const version = chunk.readInt32BE(0);
      if (version !== 2049) {
        throw "label file: wrong format";
      }
      start = 8;
      firstChunk = false;
    }
    for (let i = start; i < chunk.length; i++) {
      labels.push(chunk.readUInt8(i));
    }
  }

  return labels;
}

export async function readImages(fileName: string) {
  const stream = fs.createReadStream(dataDir + fileName, {
    highWaterMark: 32 * 1024,
  });
  let firstChunk = true;

  const digits = [];

  for await (const chunk of stream) {
    let start = 0;
    if (firstChunk) {
      const version = chunk.readInt32BE(0);
      if (version !== 2051) {
        throw "label file: wrong format";
      }
      start = 16;
      firstChunk = false;
    }
    for (let i = start; i < chunk.length; i++) {
      digits.push(chunk.readUInt8(i));
    }
  }

  return digits;
}

export function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function getShuffledIndexes(noOfEntries: any) {
  const array = [];
  for (let i = 0; i < noOfEntries; i++) {
    array[i] = i;
  }
  shuffleArray(array);
  return array;
}

export async function getTrainImages() {
  await downloadAll();
  return readImages(trainImagesFile);
}

export async function getTrainLabels() {
  await downloadAll();
  return readLabels(trainLabelsFile);
}

export async function getTestImages() {
  await downloadAll();
  return readImages(testImagesFile);
}

export async function getTestLabels() {
  await downloadAll();
  return readLabels(testLabelsFile);
}

export function normalize(num: number) {
  if (num != 0) {
    return num / 255;
  }
  return 0;
}

export function toRadians(angle: number) {
  return angle * (Math.PI / 180);
}

export function rotate(flatArray: any[], angleInDegrees: number) {
  const sourceArray2d = [];
  const targetArray2d = [];

  for (let i = 0; i < 28; i++) {
    const start = i * 28;
    sourceArray2d.push(flatArray.slice(start, start + 28));
    targetArray2d.push(Array(28).fill(0));
  }

  const angle = toRadians(angleInDegrees);
  const cosAngle = Math.cos(angle);
  const sinAngle = Math.sin(angle);

  const x0 =
    sourceArray2d[0].length / 2 -
    (cosAngle * sourceArray2d[0].length) / 2 -
    (sinAngle * sourceArray2d.length) / 2;
  const y0 =
    sourceArray2d.length / 2 -
    (cosAngle * sourceArray2d.length) / 2 +
    (sinAngle * sourceArray2d[0].length) / 2;

  for (let y = 0; y < sourceArray2d.length; y++) {
    for (let x = 0; x < sourceArray2d[y].length; x++) {
      const xRot = Math.floor(x * cosAngle + y * sinAngle + x0);
      const yRot = Math.floor(-x * sinAngle + y * cosAngle + y0);

      if (xRot >= 0 && yRot >= 0 && xRot <= 27 && yRot <= 27) {
        targetArray2d[y][x] = sourceArray2d[yRot][xRot];
      }
    }
  }

  return [...targetArray2d];
}
