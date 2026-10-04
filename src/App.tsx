import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("Say something you want!");
  const [isLoading, setIsLoading] = useState(false);
  
  const [apiKey, setApiKey] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("sayit_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim() === "") return;
    localStorage.setItem("sayit_api_key", apiKey.trim());
    setIsSettingsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (!apiKey) {
      setResponse("Por favor, configure sua API Key primeiro.");
      setIsSettingsOpen(true);
      return;
    }

    setIsLoading(true);
    setResponse("Pensando...");

    try {
      const res = await fetch("https://sayit-backend-b0th.onrender.com/api/v1/prompt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-API-Key": apiKey 
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Erro");
      const data = await res.json();

      setResponse(data.response || data.aiResponse || data.prompt);
      setPrompt("");
    } catch (error) {
      setResponse("Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center bg-transparent justify-end w-screen h-screen pt-3 select-none overflow-hidden">
      
      {isSettingsOpen ? (
        <div className="bg-white text-black p-4 rounded-2xl shadow-lg relative mb-4 w-full max-w-[250px] flex flex-col items-center">
          <h2 className="text-sm font-bold mb-2">Configurar API</h2>
          <p className="text-[10px] text-gray-500 text-center mb-3">
            Cole sua chave do OpenRouter para usar a capivara.
          </p>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full text-xs p-2 outline-none border border-gray-300 rounded mb-2 bg-gray-50"
          />
          <div className="flex gap-2 w-full">
            {localStorage.getItem("sayit_api_key") && (
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button 
              onClick={handleSaveKey}
              className="flex-1 bg-blue-500 text-white text-xs font-bold py-2 rounded cursor-pointer"
            >
              Salvar
            </button>
          </div>
          <div className="absolute -bottom-2 right-10 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
        </div>
      ) : (

        <div className="bg-white text-black p-3 rounded-2xl shadow-lg relative mb-4 w-full max-w-[250px]">

          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            title="Configurações"
          >
            ⚙️
          </button>

          <p className="text-sm font-medium text-center mb-2 mt-2 px-2">{response}</p>
          <form onSubmit={handleSubmit} className="flex gap-1 border-t border-gray-200 pt-2">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type Something..."
              className="w-full text-xs p-1 outline-none bg-transparent"
              autoFocus
            />
            <button type="submit" disabled={isLoading} className="text-blue-500 text-xs font-bold cursor-pointer">
              {'>'}
            </button>
          </form>

          <div className="absolute -bottom-2 right-10 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
        </div>
      )}

      <div
        data-tauri-drag-region
        className="w-24 h-24 cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform hover:scale-105"
      >
        <img
          src="/SayItIcon.png"
          alt="SayItIcon"
          className="w-full h-full object-contain drop-shadow-md pointer-events-none"
        />
      </div>
    </main>
  );
}

export default App;