const capture = document.querySelector("#capture");
const viewport = document.querySelector("#captureViewport");
const stepText = document.querySelector("#stepText");
const progressBar = document.querySelector("#progressBar");
const selectedSituation = document.querySelector("#selectedSituation");
const answerCards = Array.from(document.querySelectorAll(".answer-card"));
const phoneInput = document.querySelector("#phone");
const phoneMessage = document.querySelector("#phoneMessage");
const leadForm = document.querySelector("#leadForm");

let activeScreen = document.querySelector(".capture-screen.is-active");
let transitionTimer = null;
let selectTimer = null;
let isTransitioning = false;

const screens = {
  situation: document.querySelector('[data-screen="situation"]'),
  phone: document.querySelector('[data-screen="phone"]'),
};

const phonePrefix = "+7 ";

const setViewportHeight = (screen = activeScreen) => {
  if (!screen) return;
  viewport.style.height = `${screen.offsetHeight}px`;
};

const onlyDigits = (value) => value.replace(/\D/g, "");

const normalizePhoneDigits = (value) => {
  let digits = onlyDigits(value);

  if (digits.startsWith("8") || digits.startsWith("7")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
};

const getPhoneDigits = () => {
  const digits = onlyDigits(phoneInput.value);

  if (digits.startsWith("8")) {
    return digits.slice(1, 11);
  }

  if (digits.startsWith("7")) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
};

const formatPhone = (value) => {
  const digits = normalizePhoneDigits(value);

  if (!digits) {
    return "";
  }

  const code = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 8);
  const third = digits.slice(8, 10);

  let formatted = phonePrefix;
  if (code) formatted += `(${code}`;
  if (code.length === 3) formatted += ")";
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;

  return formatted;
};

const movePhoneCursorAfterPrefix = () => {
  const position = phonePrefix.length;
  phoneInput.setSelectionRange(position, position);
};

const focusPhoneInput = () => {
  if (!phoneInput) return;

  if (!phoneInput.value) {
    phoneInput.value = phonePrefix;
  }

  phoneInput.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  phoneInput.focus({ preventScroll: true });
  movePhoneCursorAfterPrefix();
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
      window.setTimeout(focusPhoneInput, 120);
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

  selectedSituation.value = card.dataset.answer;

  window.clearTimeout(selectTimer);
  selectTimer = window.setTimeout(() => {
    showScreen("phone");
  }, 280);
};

answerCards.forEach((card) => {
  card.addEventListener("click", () => selectAnswer(card));
});

phoneInput.addEventListener("input", () => {
  phoneInput.value = formatPhone(phoneInput.value);
  phoneMessage.textContent = "";
  phoneMessage.classList.remove("is-success");
});

phoneInput.addEventListener("focus", () => {
  if (!phoneInput.value) {
    phoneInput.value = phonePrefix;
  }

  if (phoneInput.value === phonePrefix) {
    movePhoneCursorAfterPrefix();
  }
});

phoneInput.addEventListener("click", () => {
  if (phoneInput.value && phoneInput.selectionStart < phonePrefix.length) {
    movePhoneCursorAfterPrefix();
  }
});

phoneInput.addEventListener("keydown", (event) => {
  if (event.key !== "Backspace") return;

  const selectionStart = phoneInput.selectionStart;
  const selectionEnd = phoneInput.selectionEnd;
  const hasSelection = selectionStart !== selectionEnd;
  const digits = normalizePhoneDigits(phoneInput.value);
  const digitsBeforeCursor = normalizePhoneDigits(phoneInput.value.slice(0, selectionStart));
  const previousChar = phoneInput.value[selectionStart - 1] || "";
  const isMaskCharBeforeCursor = previousChar !== "" && /\D/.test(previousChar);

  const isDeletingEverything = !hasSelection && selectionStart <= phonePrefix.length;

  if (isDeletingEverything) {
    event.preventDefault();
    phoneInput.value = "";
    phoneMessage.textContent = "";
    phoneMessage.classList.remove("is-success");
    return;
  }

  if (!hasSelection && isMaskCharBeforeCursor && digitsBeforeCursor.length > 0) {
    event.preventDefault();

    const digitIndexToRemove = digitsBeforeCursor.length - 1;
    const nextDigits =
      digits.slice(0, digitIndexToRemove) + digits.slice(digitIndexToRemove + 1);

    phoneInput.value = nextDigits ? formatPhone(`7${nextDigits}`) : "";
    phoneMessage.textContent = "";
    phoneMessage.classList.remove("is-success");
  }
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (getPhoneDigits().length < 10) {
    phoneMessage.textContent = "Введите номер телефона полностью";
    phoneMessage.classList.remove("is-success");
    focusPhoneInput();
    return;
  }

  phoneMessage.textContent = "Спасибо, заявка готова к отправке";
  phoneMessage.classList.add("is-success");
});

window.addEventListener("resize", () => {
  setViewportHeight();
});

window.addEventListener("load", () => {
  setViewportHeight();
  capture.classList.add("is-ready");
});
