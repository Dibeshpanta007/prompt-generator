// This function runs automatically whenever a user clicks the "Generate Engineered Prompt" button
async function generatePrompt() {
    // 1. Grab the HTML elements from your webpage
    const userInputField = document.getElementById('userInput');
    const outputBox = document.getElementById('output');
    
    const rawIdea = userInputField.value;
    
    // 2. Validation: Prevent the user from sending an empty request
    if (!rawIdea.trim()) {
        alert("Please enter a basic idea first!");
        return;
    }
    
    // 3. Visual Feedback: Show a loading state to the user
    outputBox.innerText = "Engineering your prompt... Please wait.";
    
    try {
        // 4. Send the user's input to your local backend server using a POST request
        const response = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ idea: rawIdea }) // Pack the text into JSON format
        });
        
        // 5. Parse the incoming response from your server
        const data = await response.json();
        
        // 6. Update the webpage with the final engineered prompt text
        if (response.ok) {
            outputBox.innerText = data.engineeredPrompt;
        } else {
            // Handle server-side errors gracefully
            outputBox.innerText = "Error: " + (data.error || "Could not generate prompt.");
        }
        
    } catch (error) {
        // 7. Handle network errors (e.g., if your backend server isn't running)
        console.error("Network Error:", error);
        outputBox.innerText = "Connection error. Make sure your server is running on terminal.";
    }
}
