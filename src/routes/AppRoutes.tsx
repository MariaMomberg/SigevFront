import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Login } from "../views/Login";
import { Cadastro } from "../views/Cadastro";
import { Dashboard } from "../views/Dashboard";
import { Mapa } from "../views/Mapa";
import { Filtros } from "../views/Filtros";
import EditStation from "../views/mudarStation";
import Admin from "../pages/Admin";
import RedefinirSenha from "../pages/RedefinirSenha";
import AdminCarregamentos from "../pages/AdminCarregamentos";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/mapa"
          element={<Mapa />}
        />

        <Route
          path="/filtros"
          element={<Filtros />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
  path="/admin/carregamentos"
  element={<AdminCarregamentos />}
/>

        <Route
          path="/admin/editar-estacao/:id"
          element={<EditStation />}
        />

        <Route
          path="/Redefinir-senha"
          element={<RedefinirSenha />}
        />

      </Routes>
    </BrowserRouter>
  );
}