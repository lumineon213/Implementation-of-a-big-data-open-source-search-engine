import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import OauthRedirect from "pages/login/OauthRedirect";
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
        <Route path="/login/oauth" element={<OauthRedirect />} />
      </Routes>

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
