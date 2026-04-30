/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar, Footer } from "./components/Navigation";
import Panchang from "./pages/Panchang";
import Horoscope from "./pages/Horoscope";
import PujaList from "./pages/PujaList";
import AdminPortal from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Panchang />} />
            <Route path="/rashiphalau" element={<Horoscope />} />
            <Route path="/pujas" element={<PujaList />} />
            <Route path="/om12026AstrologerName" element={<AdminPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
