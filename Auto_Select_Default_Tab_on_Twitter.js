// ==UserScript==
// @name        Auto Select Default Tab on Twitter
// @namespace   Violentmonkey Scripts
// @match       https://x.com/home*
// @grant       GM_registerMenuCommand
// @version     1.0
// @author      -
// @description Automatically selects the user's preferred tab when Twitter homepage loads
// ==/UserScript==

(function () {
  "use strict";

  // Storage key for the default tab
  const STORAGE_KEY = "twitter_default_tab";

  // Get the default tab from storage, return null if not set
  function getDefaultTab() {
    return localStorage.getItem(STORAGE_KEY) || null;
  }

  // Save the default tab to storage and switch to it immediately
  function setDefaultTab(tabName) {
    localStorage.setItem(STORAGE_KEY, tabName);
    // Click the tab immediately after setting it
    clickTab(tabName);
    alert(`Default tab has been set to: ${tabName}`);
  }

  // Function to find and click the specified tab
  function clickTab(tabName) {
    // If no tab is specified, don't change anything
    if (!tabName) return true;

    const tabs = document.querySelectorAll('a[role="tab"]');
    for (const tab of tabs) {
      const spanElement = tab.querySelector("span");
      if (spanElement && spanElement.textContent.trim() === tabName) {
        tab.click();
        return true; // Tab found and clicked
      }
    }
    return false; // Tab not found
  }

  // Function to get all available tab names
  function getAvailableTabs() {
    const tabs = [];
    document.querySelectorAll('a[role="tab"] span').forEach((span) => {
      const tabName = span.textContent.trim();
      if (tabName) tabs.push(tabName);
    });
    return tabs;
  }

  // Function to show tab selection prompt
  function showTabSelectionPrompt() {
    const tabs = getAvailableTabs();
    if (tabs.length === 0) {
      alert("No tabs found. Please try again when the page is fully loaded.");
      return;
    }

    const tabList = tabs.map((tab, index) => `${index + 1}. ${tab}`).join("\n");
    const selection = prompt(`Select the default tab number:\n${tabList}`, "1");

    if (selection === null) return; // User cancelled

    const index = parseInt(selection) - 1;
    if (isNaN(index) || index < 0 || index >= tabs.length) {
      alert("Invalid selection");
      return;
    }

    setDefaultTab(tabs[index]);
  }

  // Function to clear default tab setting
  function clearDefaultTab() {
    localStorage.removeItem(STORAGE_KEY);
    alert(
      "Default tab setting has been cleared. Twitter will now open with its default tab."
    );
  }

  // Function to wait for the default tab to appear
  function waitForDefaultTab() {
    const defaultTab = getDefaultTab();

    // Create an observer instance
    const observer = new MutationObserver((mutations, obs) => {
      // Try to find and click the default tab
      if (clickTab(defaultTab)) {
        // If successful, disconnect the observer
        obs.disconnect();
        return;
      }
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Set a timeout to stop the observer after 30 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 30000);
  }

  // Register menu commands
  GM_registerMenuCommand("Set Default Tab", showTabSelectionPrompt);
  GM_registerMenuCommand("Clear Default Tab", clearDefaultTab);

  // Initialize when the page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForDefaultTab);
  } else {
    waitForDefaultTab();
  }
})();
