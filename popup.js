//  Variable declarations 
const submitButton = document.getElementById("submit");
const output = document.getElementById("output");
const privateNote = document.getElementById("notes");
const memKey = document.getElementById("key");


submitButton.addEventListener("click", () => {

  // Get the current tab's URL and title
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    var url = tabs[0].url;
    var title = tabs[0].title;
    const privateNoteValue = privateNote.value;
    const memKeyValue = memKey.value;

    // Calling the OpenAI GPT-3 API to getting description of the website
    // add your openAI key in the apiKeyLLM to get access to get to better improve usability.
    const apiKeyLLM = "YOUR_OPENAI_API_KEY_HERE";
    const apiUrlLLM = "https://api.openai.com/v1/completions";
    const prompt = `What is this webpage about and provide valuable tags with #.
                    In next line provide few useful links from it ?\nURL: ${url}\n`;

    fetch(apiUrlLLM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKeyLLM}`
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 80,
        temperature: 0.5,
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log("OpenAI response:", data);
        const description = data.choices[0].text.trim();

        // Setting up the Mem API request data
        const displaydata =  "#" + "  " + title + " \n" + url + "\n\n" + "Notes Taken: " + privateNoteValue + "\n\n Brief Description:\n " + " " + description;
        const memData = {
          "title": title,
          "content": displaydata
        };
        const memApiUrl = "https://api.mem.ai/v0/mems";

        // Send the API request to create the Mem
        fetch(memApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `ApiAccessToken ${memKeyValue}`
          },
          body: JSON.stringify(memData)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Authorization failed");
            }
            return response.json();
          })
          .then(data => {
            output.textContent = `Mem created`;
          })
          .catch(error => {
            // Display error message in the output element
            output.textContent = `Error: ${error.message}`;
          });
      })
      .catch(error => {
        output.textContent = "Error when getting description from OpenAI";
      });
  });
});

