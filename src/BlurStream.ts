import canvas2dPipeline from "./canvas2dpipeline";
import {
  BackgroundConfig,
  RenderingPipeline,
  SegmentationConfig,
  SourcePlayback,
  TFLite,
} from "./types";
import { toArrayBuffer } from "./utils";
const fs = require("fs");
const loadScript = require("load-script2");

declare function createTFLiteSIMDModule(): Promise<TFLite>;

export class BlurStream {
  private pipeline!: RenderingPipeline;
  private renderRequestId!: number;
  private shouldRender: boolean = false;
  private canvas!: HTMLCanvasElement;
  private video!: HTMLVideoElement;
  private stream!: MediaStream;
  private captureStream!: MediaStream;
  /**
   * @param {MediaTrackConstraints} constraints is send to camera to get video stream (default = { deviceId: "default" })
   * @param {number} fps is the output fps (default = 30)
   */
  getBlurStream = async (
    constraints: MediaTrackConstraints = { deviceId: "default" },
    fps: number = 30
  ): Promise<MediaStream> => {
    this.video = document.createElement("video");
    this.canvas = document.createElement("canvas");
    await loadScript("./tflite/tflite-simd.js");

    this.video.autoplay = true;
    // video.width = 1280;
    // video.height = 720;
    this.canvas.width = 1280;
    this.canvas.height = 720;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: constraints,
      audio: false,
    });
    if (stream) {
      this.stream = stream;
      this.video.srcObject = stream;
    }

    const newSelectedTFLite = await createTFLiteSIMDModule();

    const modelResponse = await fetch(
      "https://github.com/RomeroCaetano/blur-cam/blob/main/src/models/segm_lite_v681.tflite"
    );
    const model = await modelResponse.arrayBuffer();

    const modelBufferOffset = newSelectedTFLite._getModelBufferMemoryOffset();

    newSelectedTFLite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);

    const sourcePlayback: SourcePlayback = {
      htmlElement: this.video,
      width: this.video.videoWidth,
      height: this.video.videoHeight,
    };
    const backgroundConfig: BackgroundConfig = {
      url: undefined,
      type: "blur",
    };
    const segmentationConfig: SegmentationConfig = {
      pipeline: "canvas2dCpu",
      inputResolution: "160x96",
      backend: "wasmSimd",
      model: "meet",
    };
    const tflite = newSelectedTFLite;

    this.shouldRender = true;

    const newPipeline = canvas2dPipeline(
      sourcePlayback,
      backgroundConfig,
      segmentationConfig,
      this.canvas,
      tflite
    );

    this.pipeline = newPipeline;

    this.render();

    // @ts-ignore
    this.captureStream = this.canvas.captureStream(fps);

    return this.captureStream;
  };
  render = async (): Promise<void> => {
    if (!this.shouldRender) {
      return;
    }
    await this.pipeline.render();
    this.renderRequestId = requestAnimationFrame(this.render);
  };
  stop = (): void => {
    this.shouldRender = false;
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.captureStream) {
      this.captureStream.getTracks().forEach((t) => t.stop());
      this.captureStream = null;
    }
    if (this.pipeline) {
      this.pipeline.cleanUp();

      this.pipeline = null;
    }
    if (this.renderRequestId) cancelAnimationFrame(this.renderRequestId);
  };
}
