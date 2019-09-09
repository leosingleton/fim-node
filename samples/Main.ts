// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeOffscreenCanvasFactory } from '../build/dist';
import { FimCanvas, FimGLCanvas } from '@leosingleton/fim';
import { readFileSync, writeFileSync } from 'fs';
import { buffer } from 'get-stdin';

export async function main(argv: string[]): Promise<number> {
  if (argv.length < 5) {
    usage();
    return -1;
  }

  let op = argv[2];
  let inFile = argv[3];
  let outFile = argv[4];

  let input: Buffer;
  if (inFile !== '--') {
    input = readFileSync(inFile);
  } else {
    input = await buffer();
  }

  let output = await processFile(op, input);

  if (outFile !== '--') {
    writeFileSync(outFile, output);
  } else {
    process.stdout.write(output);
  }

  return 0;
}

function usage(): void {
  process.stderr.write(
`Usage: node samples.js <operation> <input-file> <output-file>
  operation: TODO
  input-file: path to read the input JPEG or -- to read from stdin
  output-file: path to write the output JPEG or -- to write to stdout`);
}

async function processFile(op: string, input: Buffer): Promise<Buffer> {
  console.log('Length', new Uint8Array(input).length);
  let inputImage = await FimCanvas.createFromJpeg(new Uint8Array(input));
  console.log(inputImage.imageDimensions);
  throw new Error('not implemented');
}