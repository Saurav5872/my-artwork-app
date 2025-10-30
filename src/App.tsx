import React from "react";
import ArtworkTable from "./components/ArtworkTable";


const App: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1>Art Institute — Artworks (PrimeReact DataTable)</h1>
      <ArtworkTable />
    </div>
  );
};

export default App;
