/* eslint-disable no-undef */
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // ===== YOUR CODE RUNS HERE =====

      console.clear();
      console.log("Script running in page context");
      if (document) {
        const input = document.getElementsByClassName(
          "ql-editor textarea new-input-ui",
        )[0];

        const paragraph = input?.getElementsByTagName("p")[0];
        if (paragraph) {
          paragraph.innerText = "Why the sky is blue?";
        }
        const submitButton = document.getElementsByClassName(
          "mdc-icon-button mat-mdc-icon-button mat-mdc-button-base send-button submit mat-unthemed",
        )[0];

        console.log(submitButton);

        submitButton?.dispatchEvent(new MouseEvent("click"));
      }
    },
  });
});
