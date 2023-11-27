type ScrollConfig = {
  active: boolean;
  fullViewHeight: number;
  maxPercentage: number;
};

class ScrollManager {
  private config: ScrollConfig;

  constructor(config: ScrollConfig) {
    this.config = config;
  }

  isActive() {
    return this.config.active;
  }

  setIsActive(value: boolean) {
    this.config = { ...this.config, active: value };
  }

  getFullViewHeight() {
    return this.config.fullViewHeight;
  }

  setFullViewHeight(value: number) {
    this.config = { ...this.config, fullViewHeight: value };
  }

  getMaxPercentage() {
    return this.config.maxPercentage;
  }

  setMaxPercentage(value: number) {
    this.config = { ...this.config, maxPercentage: value };
  }
}

const initialScrollConfig: ScrollConfig = {
  active: false,
  fullViewHeight: 0,
  maxPercentage: 0,
};

export const scrollManager = new ScrollManager(initialScrollConfig);
