// ==UserScript==
// @name         Memrise Seslendirme
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Memrise sitesinde Almanca kelimeleri seslendirir.
// @author       Your Name
// @match        https://app.memrise.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Fonksiyon, Almanca metni seslendirir
  function speakGerman(text) {
    var utterance = new SpeechSynthesisUtterance();
    utterance.lang = "de-DE"; // Almanca dil kodu
    utterance.text = text;

    window.speechSynthesis.speak(utterance);
  }

  // Ekranı dinleme ve işleme fonksiyonu
  function observeScreen() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          // Yeni eklenen öğeleri kontrol et
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (
                node.getAttribute("data-testid") === "presentationLearnableCard"
              ) {
                // Almanca kelimeyi bul ve seslendir
                var h2Element = node.querySelector("h2");
                if (h2Element) {
                  speakGerman(h2Element.innerText);
                  h2Element.addEventListener("click", function () {
                    speakGerman(h2Element.innerText);
                  });
                }
              } else if (
                node.getAttribute("data-testid") === "testLearnableCard"
              ) {
                // Buttonları bul ve tıklandığında seslendir
                var buttons = node.querySelectorAll("button");
                if (buttons) {
                  alert("Button bulundu! " + buttons.length);
                  buttons.forEach(function (button) {
                    button.addEventListener("click", function () {
                      speakGerman(button.innerText);
                      alert("Button tıklandı! " + button.innerText);
                    });
                  });
                } else {
                  alert("Button bulunamadı!");
                }
              }
            }
          });
        }
      });
    });

    // Doküman kökünü ve alt düğümlerini izle
    observer.observe(document, { childList: true, subtree: true });
  }

  // Betik çalıştığında ekranı dinlemeye başla
  observeScreen();
})();
