import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Masker, Gallery, ImageViewer } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/new" element={<Masker />} />
        <Route path="/image/:id" element={<ImageViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
