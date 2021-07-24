export type SegmentationModel = 'bodyPix' | 'meet' | 'mlkit';
export type SegmentationBackend = 'webgl' | 'wasm' | 'wasmSimd';
export type InputResolution = '640x360' | '256x256' | '256x144' | '160x96';

export const inputResolutions: {
  [resolution in InputResolution]: [number, number];
} = {
  '640x360': [640, 360],
  '256x256': [256, 256],
  '256x144': [256, 144],
  '160x96': [160, 96],
};

export type PipelineName = 'canvas2dCpu' | 'webgl2';

export type SegmentationConfig = {
  model: SegmentationModel;
  backend: SegmentationBackend;
  inputResolution: InputResolution;
  pipeline: PipelineName;
};

export type SourcePlayback = {
  htmlElement: HTMLImageElement | HTMLVideoElement;
  width: number;
  height: number;
};

export type BackgroundConfig = {
  type: 'none' | 'blur' | 'image';
  url?: string;
};

export type BlendMode = 'screen' | 'linearDodge';

export type PostProcessingConfig = {
  smoothSegmentationMask: boolean;
  jointBilateralFilter: JointBilateralFilterConfig;
  coverage: [number, number];
  lightWrapping: number;
  blendMode: BlendMode;
};

export type JointBilateralFilterConfig = {
  sigmaSpace: number;
  sigmaColor: number;
};

export type RenderingPipeline = {
  render(): Promise<void>;
  updatePostProcessingConfig(
    newPostProcessingConfig: PostProcessingConfig,
  ): void;
  // TODO Update background image only when loaded
  // updateBackgroundImage(backgroundImage: HTMLImageElement): void
  cleanUp(): void;
};

export interface TFLite extends EmscriptenModule {
  _getModelBufferMemoryOffset(): number;
  _getInputMemoryOffset(): number;
  _getInputHeight(): number;
  _getInputWidth(): number;
  _getInputChannelCount(): number;
  _getOutputMemoryOffset(): number;
  _getOutputHeight(): number;
  _getOutputWidth(): number;
  _getOutputChannelCount(): number;
  _loadModel(bufferSize: number): number;
  _runInference(): number;
}
