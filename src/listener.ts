import type { ParallaxScrollerListenerParams } from "./types.js";

type ListenerFunction = (params: ParallaxScrollerListenerParams) => void;

let listenerFunction: ListenerFunction | null = null;

export const setListener = (listener?: ListenerFunction) => {
  if (!listener) return;

  if (typeof listener === "function") {
    listenerFunction = listener;
  } else {
    throw new Error("Listener must be a function");
  }
};

export const notify = (args: ParallaxScrollerListenerParams) => {
  if (listenerFunction) {
    listenerFunction(args);
    return true;
  }

  return false;
};
