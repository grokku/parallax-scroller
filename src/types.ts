export type Keyframe = {
  constant: number;
  template: string;
  values: number[];
};

export type ParallaxScrollerElement = {
  name: string;
  node: HTMLElement;
  styles: Record<string, Keyframe[]>;
};

export enum PARALLAX_SCROLLER_STAGE {
  init = "init",
  scrollForward = "scrollForward",
  scrollBackward = "scrollBackward",
}

export type ParallaxScrollerListenerParams = {
  name: string;
  stage: PARALLAX_SCROLLER_STAGE;
  checkpoint?: number;
};
