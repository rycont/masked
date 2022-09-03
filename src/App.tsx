import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Masker } from "./pages";
import { ImageViewer } from "./pages/viewer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/new" element={<Masker />} />
        <Route path="/image/:id" element={<ImageViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
