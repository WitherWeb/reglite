const capture = document.querySelector("#capture");
const viewport = document.querySelector("#captureViewport");
const stepText = document.querySelector("#stepText");
const progressBar = document.querySelector("#progressBar");
const answerCards = Array.from(document.querySelectorAll(".answer-card"));

let activeScreen = document.querySelector(".capture-screen.is-active");
let transitionTimer = null;
let selectTimer = null;
let isTransitioning = false;

const screens = {
  situation: document.querySelector('[data-screen="situation"]'),
  phone: document.querySelector('[data-screen="phone"]'),
};

const setViewportHeight = (screen = activeScreen) => {
  if (!screen) return;
  viewport.style.height = `${screen.offsetHeight}px`;
};

const showScreen = (name) => {
  const nextScreen = screens[name];

  if (!nextScreen || nextScreen === activeScreen || isTransitioning) return;

  isTransitioning = true;
  window.clearTimeout(transitionTimer);
  setViewportHeight(activeScreen);

  const previousScreen = activeScreen;
  previousScreen.classList.add("is-leaving");
  previousScreen.classList.remove("is-active");

  transitionTimer = window.setTimeout(() => {
    previousScreen.hidden = true;
    previousScreen.classList.remove("is-leaving");

    nextScreen.hidden = false;
    activeScreen = nextScreen;
    setViewportHeight(nextScreen);

    requestAnimationFrame(() => {
      nextScreen.classList.add("is-active");
    });

    if (name === "phone") {
      stepText.textContent = "Шаг 2 из 2";
      progressBar.style.width = "100%";
    } else {
      stepText.textContent = "Шаг 1 из 2";
      progressBar.style.width = "50%";
    }

    isTransitioning = false;
  }, 260);
};

const selectAnswer = (card) => {
  answerCards.forEach((item) => {
    const isSelected = item === card;
    item.classList.toggle("is-selected", isSelected);
    item.setAttribute("aria-checked", String(isSelected));
  });
  window.clearTimeout(selectTimer);
  selectTimer = window.setTimeout(() => {
    showScreen("phone");
  }, 280);
};

answerCards.forEach((card) => {
  card.addEventListener("click", () => selectAnswer(card));
});

window.addEventListener("resize", () => {
  setViewportHeight();
});

window.addEventListener("load", () => {
  setViewportHeight();
  capture.classList.add("is-ready");
});
