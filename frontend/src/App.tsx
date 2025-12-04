import { Routes, Route } from "react-router-dom";
import Login from "pages/login/login";
import Header from "components/common/header";
import Footer from "components/common/footer";
import DetailView from "pages/detail_view/detailview";
import MainPage from "pages/main_Page/main_page";



function App() {
  return (
          <>
          <Header />
                <Routes>                
                  <Route path="/" element={<MainPage/>} />                   
                  
                  <Route path="/login" element={<Login />} />
                  
                  <Route path="/detail/:id" element={<DetailView />} />
                </Routes>
         
          <Footer />
              </>
          );
}
export default App;
