// ==UserScript==
// @name        Remove Suggestions - X.com
// @namespace   Violentmonkey Scripts
// @match       https://x.com/*
// @grant       none
// @version     1.0
// @author      -
// @description Removes suggestion sections from X.com
// ==/UserScript==

function removeSuggestions() {
  // Find and remove "Who to follow" section
  const whoToFollowElements = document.querySelectorAll(
    'aside[aria-label="Kimi takip etmeli"]'
  );
  whoToFollowElements.forEach((element) => {
    element.closest(".css-175oi2r.r-kemksi.r-1kqtdi0").remove();
  });

  // Find and remove "You might like" section
  const youMightLikeElements = document.querySelectorAll(
    'div[dir="ltr"] span.css-1jxf684:not([dir])'
  );
  youMightLikeElements.forEach((element) => {
    if (element.textContent === "Bunları beğenebilirsin") {
      element.closest(".css-175oi2r.r-kemksi.r-1kqtdi0")?.remove() ||
        element.closest(".css-175oi2r.r-1bro5k0")?.remove();
    }
  });
}

// Run when page loads
removeSuggestions();

// Create observer to handle dynamic content
const observer = new MutationObserver(() => {
  removeSuggestions();
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
