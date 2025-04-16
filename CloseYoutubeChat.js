// ==UserScript==
// @name         Auto Close YouTube Live Chat
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Automatically closes YouTube live chat when it opens and adds a toggle button
// @author       You
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // Keep track of chat container and button references
  let chatContainerRef = null;
  let chatFrameRef = null;

  // Variable to track chat visibility state
  let isChatVisible = false;

  // Variable to pause the auto-closing functionality
  let pauseAutoClose = false;

  // CSS for our custom toggle button
  const customCSS = `
    #yt-chat-toggle-button {
      position: fixed;
      right: 20px;
      top: 80px;
      background-color: rgba(33, 33, 33, 0.8);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 14px;
      cursor: pointer;
      z-index: 9999;
      display: none; /* Hidden initially until we detect a video page */
      transition: background-color 0.2s;
    }
    #yt-chat-toggle-button:hover {
      background-color: rgba(33, 33, 33, 1);
    }
    #yt-chat-toggle-button.chat-visible::before {
      content: "Hide Chat";
    }
    #yt-chat-toggle-button.chat-hidden::before {
      content: "Show Chat";
    }
  `;

  // Add the CSS to the document
  function addCustomCSS() {
    const style = document.createElement("style");
    style.textContent = customCSS;
    document.head.appendChild(style);
  }

  // Create and add our toggle button
  function createToggleButton() {
    // Check if button already exists
    if (document.getElementById("yt-chat-toggle-button")) {
      return document.getElementById("yt-chat-toggle-button");
    }

    const toggleButton = document.createElement("button");
    toggleButton.id = "yt-chat-toggle-button";
    toggleButton.className = "chat-hidden"; // Start with chat hidden state
    document.body.appendChild(toggleButton);

    // Add click event listener
    toggleButton.addEventListener("click", () => {
      toggleChat();
    });

    return toggleButton;
  }

  // Find the chat container and store references
  function findChatContainer() {
    // First try standard containers
    const container = document.querySelector(
      "#chat-container, ytd-live-chat-frame, #chat"
    );

    if (container) {
      chatContainerRef = container;
      chatFrameRef = document.querySelector("#chatframe");
    }

    return container;
  }

  // Function to show the YouTube chat
  function showChat() {
    console.log("Showing chat");

    // Stop auto-closing for a while
    pauseAutoClose = true;

    // If we have a container reference, make it visible
    if (chatContainerRef) {
      chatContainerRef.style.display = "";

      // Also try YouTube's show button if hiding didn't work
      const showButtons = document.querySelectorAll(
        "button, ytd-button-renderer"
      );
      for (const button of showButtons) {
        const buttonText = button.innerText || button.textContent || "";
        if (
          buttonText.toLowerCase().includes("show chat") ||
          buttonText.toLowerCase().includes("sohbeti göster")
        ) {
          console.log('Found "Show chat" button, clicking it');
          button.click();
          break;
        }
      }

      // Try to click the toggle button if available
      const showChatButton = document.querySelector("#show-hide-button button");
      if (
        showChatButton &&
        showChatButton.getAttribute("aria-label") &&
        showChatButton
          .getAttribute("aria-label")
          .toLowerCase()
          .includes("göster")
      ) {
        console.log("Found show chat button, clicking it");
        showChatButton.click();
      }

      return true;
    }

    // If we can't find our stored reference, try to find YouTube's show button
    const showChatBtn = document.querySelector(
      '[aria-label="Sohbeti göster"], [aria-label="Show chat"]'
    );
    if (showChatBtn) {
      console.log("Found YouTube's show chat button, clicking it");
      showChatBtn.click();
      return true;
    }

    return false;
  }

  // Toggle chat visibility
  function toggleChat() {
    const toggleButton = document.getElementById("yt-chat-toggle-button");
    if (!toggleButton) return;

    if (isChatVisible) {
      // Hide chat
      hideChat();
      toggleButton.className = "chat-hidden";
      isChatVisible = false;
    } else {
      // Show chat
      if (showChat()) {
        toggleButton.className = "chat-visible";
        isChatVisible = true;

        // Reset the auto-close pause after a delay
        // This gives time for the chat to fully open
        setTimeout(() => {
          pauseAutoClose = false;
        }, 2000);
      }
    }
  }

  // Function to hide the chat
  function hideChat() {
    console.log("Hiding chat");

    if (chatContainerRef) {
      chatContainerRef.style.display = "none";
      return true;
    }

    return false;
  }

  // Function to find and close the chat
  function closeChat() {
    // Don't close if user has opened it and we're in the pause period
    if (isChatVisible && pauseAutoClose) {
      console.log("Auto-close paused because user opened chat");
      return false;
    }

    // Find the chat container based on the actual structure
    const chatContainer = findChatContainer();

    if (!chatContainer) {
      return false;
    }

    // Update the toggle button visibility if we found chat
    const toggleButton = document.getElementById("yt-chat-toggle-button");
    if (toggleButton) {
      toggleButton.style.display = "block";
    }

    // If user has manually opened the chat, don't auto-close it
    if (isChatVisible) {
      return false;
    }

    // Try multiple approaches to close the chat

    // APPROACH 1: Try to find the iframe and hide the parent container
    const chatFrame = document.querySelector("#chatframe");
    if (chatFrame) {
      // Store the iframe reference for later use
      chatFrameRef = chatFrame;

      // Either hide the entire chat container
      const parentContainer = chatFrame.closest(
        "#chat-container, ytd-live-chat-frame"
      );
      if (parentContainer) {
        // Store the parent container reference
        chatContainerRef = parentContainer;

        console.log("Found chat container with iframe, hiding it");
        parentContainer.style.display = "none";
        isChatVisible = false;
        return true;
      }
    }

    // APPROACH 2: Try to find and click the "Hide chat" button
    // Look for buttons with text related to hiding chat
    const buttons = document.querySelectorAll("button, ytd-button-renderer");
    for (const button of buttons) {
      const buttonText = button.innerText || button.textContent;
      if (
        buttonText &&
        (buttonText.toLowerCase().includes("hide chat") ||
          buttonText.toLowerCase().includes("sohbeti gizle"))
      ) {
        console.log('Found "Hide chat" button, clicking it');
        button.click();
        isChatVisible = false;
        return true;
      }
    }

    // APPROACH 3: Look for the toggle button in the chat structure
    const ytToggleButton = document.querySelector(
      "#show-hide-button button, #collapse-button button"
    );
    if (ytToggleButton) {
      console.log("Found chat toggle button, clicking it");
      ytToggleButton.click();
      isChatVisible = false;
      return true;
    }

    // APPROACH 4: If the chat container exists but we couldn't find a way to hide it,
    // try applying the style directly
    if (chatContainer.style) {
      // Store the container reference
      chatContainerRef = chatContainer;

      console.log("Applying styles to hide chat container");
      chatContainer.style.display = "none";
      isChatVisible = false;
      return true;
    }

    return false;
  }

  // Function to check regularly for chat and close it
  function monitorAndCloseChat() {
    // Create toggle button if not already created
    createToggleButton();

    // Only close the chat if the user hasn't explicitly opened it
    if (!isChatVisible) {
      // Try to close the chat immediately
      closeChat();
    }

    // Then set up a monitor to keep checking
    const intervalId = setInterval(() => {
      // Check if we're still on a video page
      if (!location.href.includes("watch")) {
        clearInterval(intervalId);
        // Hide the toggle button when not on a video page
        const toggleButton = document.getElementById("yt-chat-toggle-button");
        if (toggleButton) {
          toggleButton.style.display = "none";
        }
        // Reset our references
        chatContainerRef = null;
        chatFrameRef = null;
        return;
      }

      // If chat container reference is lost (page structure changed)
      // try to find it again
      if (!chatContainerRef) {
        findChatContainer();
      }

      // Check if the chat was automatically opened by YouTube
      // but only if the user hasn't explicitly made it visible
      if (!isChatVisible && !pauseAutoClose) {
        closeChat();
      }

      // Update our toggle button to match the actual state
      const toggleButton = document.getElementById("yt-chat-toggle-button");
      if (toggleButton) {
        // Check if YouTube's chat is actually visible despite our state
        const actuallyVisible =
          chatContainerRef &&
          window.getComputedStyle(chatContainerRef).display !== "none";

        // Sync our state with reality if needed
        if (actuallyVisible !== isChatVisible) {
          toggleButton.className = actuallyVisible
            ? "chat-visible"
            : "chat-hidden";
          isChatVisible = actuallyVisible;
        }
      }
    }, 1000);
  }

  // Initialize
  function init() {
    // Add our custom CSS
    addCustomCSS();

    // Create the toggle button
    createToggleButton();

    // Start monitoring for chat
    if (location.href.includes("watch")) {
      // Small delay to make sure YouTube has initialized
      setTimeout(monitorAndCloseChat, 1000);
    }

    // Monitor for navigation within YouTube (no full page reload)
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;

        // Update button visibility based on page type
        const toggleButton = document.getElementById("yt-chat-toggle-button");
        if (toggleButton) {
          toggleButton.style.display = location.href.includes("watch")
            ? "block"
            : "none";
        }

        if (location.href.includes("watch")) {
          // Reset our state on navigation
          isChatVisible = false;
          pauseAutoClose = false;
          chatContainerRef = null;
          chatFrameRef = null;

          // Wait a moment for the chat to load after navigation
          setTimeout(monitorAndCloseChat, 1500);
        }
      }
    }).observe(document, { subtree: true, childList: true });
  }

  // Start when page loads
  if (document.readyState === "loading") {
    window.addEventListener("load", init);
  } else {
    init();
  }
})();
