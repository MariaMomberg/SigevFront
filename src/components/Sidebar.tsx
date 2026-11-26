import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Map,
  Car,
  Heart,
  History,
  Star,
  User,
  LogOut,
  Zap,
  Shield
} from 'lucide-react'

import { supabase } from '../lib/supabase'

function Sidebar() {
  const [nome, setNome] = useState('')

  useEffect(() => {
    carregarUsuario()
  }, [])

  async function carregarUsuario() {
    try {
      // Busca o usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return
      }

      // Busca os dados dele na tabela usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .select('nome')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erro ao buscar usuário:', error)
        return
      }

      if (data?.nome) {
        setNome(data.nome)
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
    }
  }

  // Cria as iniciais do nome
  const iniciais = nome
    ? nome
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((parte) => parte[0].toUpperCase())
        .join('')
    : 'US'

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img src="/SIGEV.png" alt="SIGEV" className="brand-img" />
        </div>

        <div>
          <strong>SIGEV</strong>
          <span>EcoRacing</span>
        </div>
      </div>

      {/* USUÁRIO */}
      <div className="sidebar-user">

        <div className="profile-avatar">
          {iniciais}
        </div>

        <div>
         <h2>{nome.trim().split(' ')[0] || 'Usuário'}</h2>
          <span>Usuário do SIGEV</span>
        </div>

      </div>

      {/* MENU */}
      <nav className="sidebar-nav">

        <p className="nav-title">
          MENU
        </p>

        <NavLink to="/dashboard">
          <Home size={18} />
          Início
        </NavLink>

        <NavLink to="/mapa">
          <Map size={18} />
          Mapa
        </NavLink>

        <NavLink to="/veiculos">
          <Car size={18} />
          Meus veículos
        </NavLink>

        <NavLink to="/favoritos">
          <Heart size={18} />
          Favoritos
        </NavLink>

        <NavLink to="/historico">
          <History size={18} />
          Registros
        </NavLink>

        <NavLink to="/avaliacoes">
          <Star size={18} />
          Avaliações
        </NavLink>

        <p className="nav-title nav-title-second">
          CONTA
        </p>

        <NavLink to="/perfil">
          <User size={18} />
          Meu perfil
        </NavLink>

        <NavLink to="/admin">
          <Shield size={18} />
          Administração
        </NavLink>

        <button
          type="button"
          className="logout-link"
          onClick={sair}
        >
          <LogOut size={18} />
          Sair
        </button>

      </nav>

      {/* RODAPÉ */}
      <div className="sidebar-bottom">
        <Zap size={16} />
        <span>SIGEV v1.0</span>
      </div>

    </aside>
  )
}

export { Sidebar }