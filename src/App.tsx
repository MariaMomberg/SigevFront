import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Header from './components/Header'
import Hero from './components/Hero'
import Stats from './components/Stats'
import WhySigev from './components/WhySigev'
import HowItWorks from './components/HowItWorks'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import EditStation from './views/mudarStation'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MapPage from './pages/MapPage'
import Vehicles from './pages/Vehicles'
import Favorites from './pages/Favorites'
import History from './pages/History'
import Reviews from './pages/Reviews'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import RegisterStation from './pages/RegisterStation'
import RedefinirSenha from './pages/RedefinirSenha'
import AdminUsuarios from './pages/AdminUsuarios'
import AdminCarregamentos from './pages/AdminCarregamentos'
import AdminVeiculos from './pages/AdminVeiculos'


function Home() {
  return (
    <div className="app">
      <Header />

      <main>
        <Hero />
        <Stats />
        <WhySigev />
        <HowItWorks />
        <FinalCTA />
      </main>

      <Footer />

  
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/cadastro" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/mapa" element={<MapPage />} />

        <Route path="/veiculos" element={<Vehicles />} />

        <Route path="/favoritos" element={<Favorites />} />

        <Route path="/historico" element={<History />} />

        <Route path="/avaliacoes" element={<Reviews />} />

        <Route path="/perfil" element={<Profile />} />

        <Route path="/admin" element={<Admin />} />
<Route path="/admin/usuarios" element={<AdminUsuarios />} />
<Route
  path="/admin/usuarios/:id/carregamentos"
  element={<AdminCarregamentos />}
/>

<Route
  path="/admin/carregamentos"
  element={<AdminCarregamentos />}
/>
<Route
  path="/admin/veiculos"
  element={<AdminVeiculos />}
/>

<Route
  path="/admin/usuarios/:id/veiculos"
  element={<AdminVeiculos />}
/>
        <Route
         path="/RedefinirSenha" element={<RedefinirSenha />} />

        <Route
  path="/admin/editar-estacao/:id"
  element={<EditStation />}
/>

        <Route
          path="/admin/nova-estacao"
          element={<RegisterStation />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App