import { supabase } from "../lib/supabase";

export interface Conector {
  id: string;
  nome: string;
  tipo: string;
  descricao?: string | null;
}

export async function listarConectores() {
  const { data, error } = await supabase
    .from("conectores")
    .select("*")
    .order("nome");

  if (error) {
    throw new Error(error.message);
  }

  return data as Conector[];
}

interface EnderecoData {
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

interface EstacaoData {
  nome: string;
  endereco_id: string;
  empresa_id?: string | null;
}

interface CarregadorData {
  estacao_id: string;
  conector_id: string;
  potencia_kw: number;
  identificacao?: string | null;
}

export async function cadastrarEndereco(
  endereco: EnderecoData
) {
  const { data, error } = await supabase
    .from("enderecos")
    .insert({
      rua: endereco.rua,
      numero: endereco.numero,
      cidade: endereco.cidade,
      estado: endereco.estado,
      latitude: endereco.latitude,
      longitude: endereco.longitude,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function cadastrarEstacao(
  estacao: EstacaoData
) {
  const { data, error } = await supabase
    .from("estacoes_recarga")
    .insert({
      nome: estacao.nome,
      endereco_id: estacao.endereco_id,
      empresa_id: estacao.empresa_id ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function cadastrarCarregador(
  carregador: CarregadorData
) {
  const { data, error } = await supabase
    .from("carregadores")
    .insert({
      estacao_id: carregador.estacao_id,
      conector_id: carregador.conector_id,
      potencia_kw: carregador.potencia_kw,
      identificacao:
        carregador.identificacao ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
export async function listarEstacoes() {
  const { data, error } = await supabase
    .from("estacoes_recarga")
    .select("id, nome")
    .eq("status", "ATIVA")
    .order("nome");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}