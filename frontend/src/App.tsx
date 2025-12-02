import { Routes, Route } from "react-router-dom";
import Header from "../src/components/common/header";
import Footer from "../src/components/common/footer";
import Home from "../src/pages/main_Page/home";

function App() {
  return (
    <>
      
      <Header />

      <main style={{ paddingTop: "60px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

     
      <Footer />
    </>
  );
}

export default App;
