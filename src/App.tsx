import React, { useState } from "react";
import "./App.css";

function App() {

  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("Say something you want!")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponse("Pensando...")

    try {
      const res = await fetch("https://sayit-backend-b0th.onrender.com/api/v1/prompt", {
        method: "POST",
        headers: { "Content-Type": "Application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) throw new Error("Erro")
      const data = await res.json()

      setResponse(data.response || data.aiResponse || data.prompt)
      setPrompt("")
    } catch (error) {
      setResponse("Connexion Error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="flex flex-col items-center bg-transparent justify-end w-screen h-screen pt-3 select-none overflow-hidden">

      {/*Talk ballon*/}
      <div className="bg-white text-black p-3 rounded-2xl shadow-lg relative mb-4 w-full max-w-[250px]">
        <p className="text-sm font-medium text-center mb-2">{response}</p>
        <form onSubmit={handleSubmit} className="flex gap-1 border-t border-gray-200 pt-2">
          <input type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type Something..."
            className="w-full text-xs p-1 outline-none bg-transparent"
            autoFocus
          />
          <button type="submit" disabled={isLoading} className="text-blue-500 text-xs font-bold cursor-pointer">{'>'}</button>
        </form>

        <div className="absolute -bottom-2 right-10 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-white border-r-[10px] border-r-transparent"></div>
      </div>

      <div
        data-tauri-drag-region
        className="w-24 h-24 cursor-grab active:cursor-grabbing flex items-center justify-center transition-transform hover:scale-105"

      >
        <img

          src="/SayItIcon.png"
          alt="SayItIcon"
          className="w-full h-full object-contain drop-shadow-md "
        />

      </div>
    </main>
  );
}

export default App;