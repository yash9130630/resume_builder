import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import ResumeEditor from "./components/ResumeEditor";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/editor" element={<ResumeEditor />} />
          <Route path="/editor/:templateId" element={<ResumeEditor />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;