// for Multiple Language
const getLanguage = navigator.language;
const languagePrefix = getLanguage.slice(0, 2) === "ko" ? "ko" : "ja";
const $lang = document.querySelectorAll(".lang-" + languagePrefix);

$lang.forEach((element) => {
  element.classList.remove("text-secret");
});
