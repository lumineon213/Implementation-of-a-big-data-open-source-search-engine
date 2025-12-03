import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import Home from "pages/main_Page/home";


function App() {
  return (
          <>
          <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                </Routes>

          <Footer />
              </>
          );
}

export default App;
