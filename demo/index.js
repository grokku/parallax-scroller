import { init } from "./parallax-scroller.js";

const bubble = document.getElementById("speech-bubble");

init({
  root: document.getElementById("demo-root"),
  listener: ({ name, checkpoint, stage }) => {
    if (name === "copter") {
      bubble.innerHTML = "";

      if (stage === "scrollForward") {
        switch (checkpoint) {
          case 10:
            bubble.innerHTML = "Let's detour around the cloud ahead!";
            break;
          case 45:
          case 50:
            bubble.innerHTML =
              "We're just gonna have to go through the cloud. ";
            break;
          case 70:
            bubble.innerHTML = "Go under!";
            break;
          case 95:
            bubble.innerHTML = "Let's salto over it!";
            break;
          case 130:
            bubble.innerHTML = "Landing to mountains.";
            break;
        }
      } else if (stage === "scrollBackward" && checkpoint > 0) {
        bubble.innerHTML = "Rewind...";
      }

      if (bubble.innerHTML === "") {
        bubble.style.display = "none";
      } else {
        bubble.style.display = "block";
      }
    }
  },
});
