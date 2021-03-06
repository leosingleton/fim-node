// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNode } from './FimNode';
import { FimNodeGLCanvas } from './FimNodeGLCanvas';
import { NodeOffscreenCanvas, _NodeOffscreenCanvas, MimeTypes } from './NodeOffscreenCanvas';
import { using, IDisposable } from '@leosingleton/commonlibs';
import { FimCanvas, FimColor, FimRect } from '@leosingleton/fim';
import { CanvasRenderingContext2D, Image } from 'canvas';

/**
 * Enhanced version of FimCanvas to support Node.js
 */
export class FimNodeCanvas extends FimCanvas {
  /**
   * Creates an invisible canvas
   * @param fim FIM canvas factory
   * @param width Canvas width, in pixels
   * @param height Canvas height, in pixels
   * @param initialColor If specified, the canvas is initalized to this color.
   */
  protected constructor(fim: FimNode, width: number, height: number, initialColor?: FimColor | string) {
    super(fim, width, height, initialColor);
  }

  protected canvasElement: NodeOffscreenCanvas;

  /** Returns the underlying NodeOffscreenCanvas */
  public getCanvas(): OffscreenCanvas {
    return this.canvasElement as OffscreenCanvas;
  }

  /**
   * Exports the canvas to a PNG file
   * @returns Buffer containing PNG data
   */
  public toPngBuffer(): Promise<Buffer> {
    return this.canvasElement.convertToBuffer({});
  }

  /**
   * Exports the canvas to a PNG file
   * @returns Array containing PNG data
   */
  public async toPng(): Promise<Uint8Array> {
    const buffer = await this.toPngBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Exports the canvas to a JPEG file
   * @param quality JPEG quality, 0 to 1
   * @returns Buffer containing JPEG data
   */
  public async toJpegBuffer(quality = 0.95): Promise<Buffer> {
    return this.canvasElement.convertToBuffer({ type: MimeTypes.JPEG, quality });
  }

  /**
   * Exports the canvas to a JPEG file
   * @param quality JPEG quality, 0 to 1
   * @returns Array containing JPEG data
   */
  public async toJpeg(quality = 0.95): Promise<Uint8Array> {
    const buffer = await this.toJpegBuffer(quality);
    return new Uint8Array(buffer);
  }

  /** Creates a new FimCanvas which is a duplicate of this one */
  public duplicateCanvas(): FimNodeCanvas {
    const dupe = (this.fim as any as FimNode).createCanvas(this.imageDimensions.w, this.imageDimensions.h);
    dupe.copyFromCanvas(this, this.imageDimensions, this.imageDimensions);
    return dupe;
  }

  /**
   * Constructs a drawing context
   * @param imageSmoothingEnabled Enables image smoothing
   * @param operation CanvasRenderingContext2D.globalCompositeOperation value, e.g. 'copy' or 'source-over'
   * @param alpha CanvasRenderingContext2D.alpha value, where 0 = transparent and 1 = opaque
   */
  public createDrawingContext(imageSmoothingEnabled = false, operation = 'copy', alpha = 1):
      CanvasRenderingContext2D & IDisposable {
    return super.createDrawingContext(imageSmoothingEnabled, operation, alpha) as
      (CanvasRenderingContext2D & IDisposable);
  }

  protected copyFromCanvas(srcImage: FimNodeCanvas | FimNodeGLCanvas, srcCoords?: FimRect, destCoords?: FimRect): void {
    // Default parameters
    srcCoords = srcCoords || srcImage.imageDimensions;
    destCoords = destCoords || this.imageDimensions;

    // Scale the coordinates
    srcCoords = srcCoords.rescale(srcImage.downscaleRatio);
    destCoords = destCoords.rescale(this.downscaleRatio);

    // Copy the canvas
    const canvas = srcImage.getCanvas() as _NodeOffscreenCanvas;
    if (srcImage instanceof FimNodeCanvas) {
      const oc = canvas.getCanvas() as any as OffscreenCanvas;
      FimCanvas.copyCanvasToCanvas(oc, this.canvasElement, srcCoords, destCoords);
    } else if (srcImage instanceof FimNodeGLCanvas) {
      const oc = canvas.convertGLToCanvas() as any as OffscreenCanvas;
      FimCanvas.copyCanvasToCanvas(oc, this.canvasElement, srcCoords, destCoords);
    } else {
      this.throwOnInvalidImageKind(srcImage);
    }
  }
}

/** Internal only version of the class */
export class _FimNodeCanvas extends FimNodeCanvas {
  public constructor(fim: FimNode, width: number, height: number, initialColor?: FimColor | string) {
    super(fim, width, height, initialColor);
  }

  /**
   * Creates a FimCanvas from a JPEG file
   * @param fim FIM canvas factory
   * @param jpegFile JPEG file, loaded into a byte array
   */
  public static createFromJpegAsync(fim: FimNode, jpegFile: Uint8Array): Promise<FimNodeCanvas> {
    const buffer = Buffer.from(jpegFile);
    return _FimNodeCanvas.createFromImageBufferAsync(fim, buffer);
  }

  /**
   * Creates a FimCanvas from a Buffer containing an image
   * @param fim FIM canvas factory
   * @param buffer Buffer containing an image encoded in JPEG or PNG format
   */
  public static createFromImageBufferAsync(fim: FimNode, buffer: Buffer): Promise<FimNodeCanvas> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // On success, copy the image to a FimCanvas and return it via the Promise
      img.onload = () => {
        const result = fim.createCanvas(img.width, img.height);
        using(result.createDrawingContext(), ctx => {
          ctx.drawImage(img, 0, 0);
        });

        resolve(result);
      };

      // On error, return an exception via the Promise
      img.onerror = err => {
        reject(err);
      };

      img.src = buffer;
    });
  }
}
