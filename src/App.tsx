import React, { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import "./App.css";

const DEFAULT_SHORTCUT = "Alt+Shift+S";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("Say something you want!");
  const [isLoading, setIsLoading] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [shortcut, setShortcut] = useState(DEFAULT_SHORTCUT);
  const [shortcutInput, setShortcutInput] = useState(DEFAULT_SHORTCUT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("sayit_api_key");
    const savedShortcut = localStorage.getItem("sayit_shortcut") || DEFAULT_SHORTCUT;

    if (savedKey) {
      setApiKey(savedKey);
      setHasSavedKey(true);
    } else {
      setIsSettingsOpen(true);
    }

    setShortcut(savedShortcut);
    setShortcutInput(savedShortcut);
  }, []);


  useEffect(() => {
    let isMounted = true;

    const setupShortcut = async () => {
      if (!shortcut.trim()) return;

      try {
        // Remove qualquer registro prévio desse atalho
        await unregister(shortcut).catch(() => {});

        if (!isMounted) return;

        // Registra o atalho no Tauri v2
        await register(shortcut, async (event) => {
          if (event.state === "Pressed") {
            const appWin = getCurrentWindow();
            const visible = await appWin.isVisible();
            if (visible) {
              await appWin.hide();
            } else {
              await appWin.show();
              await appWin.setFocus();
            }
          }
        });
      } catch (err) {
        console.warn(`Erro ao registrar atalho "${shortcut}":`, err);
      }
    };

    setupShortcut();

    return () => {
      isMounted = false;
      unregister(shortcut).catch(() => {});
    };
  }, [shortcut]);

  const handleSaveSettings = () => {
    const cleanApiKey = apiKey.trim();
    if (cleanApiKey !== "") {
      localStorage.setItem("sayit_api_key", cleanApiKey);
      setHasSavedKey(true);
    }

    const cleanShortcut = shortcutInput.trim() || DEFAULT_SHORTCUT;
    localStorage.setItem("sayit_shortcut", cleanShortcut);

    setShortcut(cleanShortcut);
    setIsSettingsOpen(false);
  };

  // Oculta a janela sem matá-la
  const handleHideApp = async () => {
    try {
      await getCurrentWindow().hide();
    } catch (e) {
      console.error("Erro ao ocultar janela:", e);
    }
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
          "X-User-API-Key": apiKey,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setResponse(data.response || data.aiResponse || data.prompt || "Sem resposta");
      setPrompt("");
    } catch (error) {
      console.error("Erro na requisição:", error);
      setResponse("Connection Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center bg-transparent justify-end w-screen h-screen pt-3 select-none overflow-hidden">
      {isSettingsOpen ? (
        <div className="bg-white text-black p-4 rounded-2xl shadow-lg relative mb-4 w-full max-w-[250px] flex flex-col items-center">
          <button
            onClick={handleHideApp}
            className="absolute top-2 left-2 text-gray-400 hover:text-red-500 text-xs cursor-pointer font-bold"
            title="Ocultar janela"
          >
            ✕
          </button>

          <h2 className="text-sm font-bold mb-2 mt-1">Configurações</h2>

          <div className="w-full mb-3">
            <label className="text-[10px] text-gray-500 block mb-1">API Key (OpenRouter)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full text-xs p-2 outline-none border border-gray-300 rounded bg-gray-50"
            />
          </div>

          <div className="w-full mb-3">
            <label className="text-[10px] text-gray-500 block mb-1">Atalho Global</label>
            <input
              type="text"
              value={shortcutInput}
              onChange={(e) => setShortcutInput(e.target.value)}
              placeholder="Ex: Alt+Shift+S"
              className="w-full text-xs p-2 outline-none border border-gray-300 rounded bg-gray-50 uppercase"
            />
          </div>

          <div className="flex gap-2 w-full mt-1">
            {hasSavedKey && (
              <button
                onClick={() => {
                  setShortcutInput(shortcut);
                  setIsSettingsOpen(false);
                }}
                className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSaveSettings}
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
            onClick={handleHideApp}
            className="absolute top-2 left-2 text-gray-400 hover:text-red-500 text-xs cursor-pointer font-bold"
            title="Ocultar janela"
          >
            ✕
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
            title="Configurações"
          >
            ⚙️
          </button>

          <p className="text-sm font-medium text-center mb-2 mt-3 px-2">{response}</p>
          <form onSubmit={handleSubmit} className="flex gap-1 border-t border-gray-200 pt-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type Something..."
              className="w-full text-xs p-1 outline-none bg-transparent"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="text-blue-500 text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {">"}
            </button>
          </form>

          <div className="absolute -bottom-2 right-10 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
        </div>
      )}

      <div className="w-24 h-24 flex items-center justify-center transition-transform hover:scale-105">
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