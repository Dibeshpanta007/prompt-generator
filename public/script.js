async function generatePrompt() {
   
    const userInputField = document.getElementById('userInput');
    const outputBox = document.getElementById('output');
    
    const rawIdea = userInputField.value;
    
    
    if (!rawIdea.trim()) {
        alert("Please enter a basic idea first!");
        return;
    }
    

    outputBox.innerText = "Engineering your prompt... Please wait.";
    
    try {
          const response = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ idea: rawIdea }) 
        });
      
        const data = await response.json();
        
     
        if (response.ok) {
            outputBox.innerText = data.engineeredPrompt;
        } else {
           
            outputBox.innerText = "Error: " + (data.error || "Could not generate prompt.");
        }
        
    } catch (error) {
  
        console.error("Network Error:", error);
        outputBox.innerText = "Connection error. Make sure your server is running on terminal.";
    }
}
