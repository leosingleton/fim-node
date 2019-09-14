// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeGLCanvas } from '../FimNodeGLCanvas';
import { FimNodeGLTexture } from '../FimNodeGLTexture';
import { FimColor, FimGLProgramMatrixOperation1D, FimGLProgramMatrixOperation1DFast, FimRgbaBuffer, FimGLTextureFlags,
  GaussianKernel } from '@leosingleton/fim';
import { using } from '@leosingleton/commonlibs';

describe('FimNodeGLCanvas', () => {

  it('Creates, fills, and disposes', () => {
    let canvas = new FimNodeGLCanvas(100, 200, '#f00');
    expect(canvas.w).toBe(100);
    expect(canvas.h).toBe(200);
    expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#f00'));

    // Fill with a different color
    canvas.fillCanvas('#0f0');
    expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    canvas.dispose();

    // No error on double-dispose
    canvas.dispose();
  });

  it('Executes a Gaussian blur', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let color = new FimRgbaBuffer(100, 200, '#00f');
      let texture = FimNodeGLTexture.createFrom(canvas, color);
      let program = new FimGLProgramMatrixOperation1D(canvas, 13);
      let kernel = GaussianKernel.calculate(2, 13);
      program.setInputs(texture, kernel);
      program.execute();
  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#000')); // BUGBUG: Should be #00f!!!
    });
  });

  it('Executes a Gaussian blur with linear sampling', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let color = new FimRgbaBuffer(100, 200, '#0f0');
      let texture = FimNodeGLTexture.createFrom(canvas, color, FimGLTextureFlags.LinearSampling);
      let program = new FimGLProgramMatrixOperation1DFast(canvas, 13);
      let kernel = GaussianKernel.calculate(2, 13);
      program.setInputs(texture, kernel);
      program.execute();
  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#000')); // BUGBUG: Should be #0f0!!!
    });
  });

});
