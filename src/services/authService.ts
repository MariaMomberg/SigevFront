import { supabase } from "../lib/supabase";

export async function cadastrarUsuario(
  email: string,
  senha: string,
  nome: string,
  telefone: string,
  tipoUsuario: "MOTORISTA" | "EMPRESA"
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: {
        nome,
        telefone,
        tipo_usuario: tipoUsuario,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fazerLogin(
  email: string,
  senha: string
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fazerLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function obterUsuarioAtual() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function solicitarRedefinicaoSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/RedefinirSenha`,
  })

  if (error) {
    throw new Error(error.message)
  }
}