import { Routes, Route } from "react-router-dom";
import Home from "pages/Home";  // Home 페이지 임시


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
