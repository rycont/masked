import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Masker } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/new" element={<Masker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
