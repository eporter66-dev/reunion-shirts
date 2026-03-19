import { useState } from "react";
import UploadForm from "./components/UploadForm";
import DesignGallery from "./components/DesignGallery";
import Countdown, { isVotingOpen } from "./components/Countdown";
import smaLogo from "./assets/sma-logo.png";
import { Analytics } from "@vercel/analytics/react"

function App() {
  const [showUpload, setShowUpload] = useState(false);
  const votingOpen = isVotingOpen();

  return (
    
    <>
    <Analytics />
    <div className="min-h-screen bg-sma-cream">
      <header className="bg-sma-blue sticky top-0 z-10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={smaLogo} alt="St. Mary's Academy logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Class of '09!'
              </h1>
              <p className="text-sma-gold text-sm font-medium">
                St. Mary&rsquo;s Academy * Cougars *
              </p>
            </div>
          </div>
          {votingOpen && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-sma-gold text-sma-blue px-4 py-2 rounded-lg font-bold hover:bg-sma-gold-light transition"
            >
              {showUpload ? "Close" : "+ Submit Design"}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Countdown />

        {showUpload && votingOpen && (
          <div className="mb-8">
            <UploadForm onUploaded={() => setShowUpload(false)} />
          </div>
        )}

        <DesignGallery />
      </main>

      <footer className="bg-sma-blue text-center py-4 mt-12">
        <p className="text-sma-gold/70 text-xs italic">
          &ldquo;No Excellence Without Hard Labor&rdquo;
        </p>
      </footer>
    </div>
    </>
  );
}

export default App;
