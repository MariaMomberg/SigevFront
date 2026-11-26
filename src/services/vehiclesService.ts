import { supabase } from "../lib/supabase";
export async function enviarFotoVeiculo(foto: File, usuarioId: string) {
  const extensao = foto.name.split(".").pop();
  const nomeArquivo = `${usuarioId}/${crypto.randomUUID()}.${extensao}`;

  const { error } = await supabase.storage
    .from("fotos-veiculos")
    .upload(nomeArquivo, foto);

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("fotos-veiculos")
    .getPublicUrl(nomeArquivo);

  return data.publicUrl;
}

export interface Veiculo {
  id: string;
  usuario_id: string;
  marca: string;
  modelo: string;
  placa: string;
  foto_url?: string | null;
  ano: number;
  tipo: "CARRO" | "MOTO";
  autonomia_km?: number | null;
  capacidade_bateria_kwh?: number | null;
  conector_id?: string | null;
  criado_em?: string;
}

export async function listarVeiculos(usuarioId: string) {
  const { data, error } = await supabase
    .from("veiculos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Veiculo[];
}

export async function cadastrarVeiculo(
  usuarioId: string,
  veiculo: {
    marca: string;
    modelo: string;
    placa: string;
    ano: number;
    tipo: "CARRO" | "MOTO";
    capacidade_bateria_kwh: number;
    conector_id?: string | null;
    foto_url?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("veiculos")
    .insert({
      usuario_id: usuarioId,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      placa: veiculo.placa,
      foto_url: veiculo.foto_url ?? null,
      ano: veiculo.ano,
      tipo: veiculo.tipo,
      capacidade_bateria_kwh: veiculo.capacidade_bateria_kwh,
      conector_id: veiculo.conector_id ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Veiculo;
}


export async function atualizarVeiculo(
  id: string,
  veiculo: {
    marca: string;
    modelo: string;
    placa: string;
    ano: number;
    tipo: "CARRO" | "MOTO";
    capacidade_bateria_kwh: number;
    conector_id?: string | null;
    foto_url?: string | null;
  }
) {
  const dadosAtualizacao = {
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    placa: veiculo.placa,
    ano: veiculo.ano,
    tipo: veiculo.tipo,
    capacidade_bateria_kwh: veiculo.capacidade_bateria_kwh,
    conector_id: veiculo.conector_id ?? null,

    ...(veiculo.foto_url !== undefined
      ? { foto_url: veiculo.foto_url }
      : {}),
  };

  const { data, error } = await supabase
    .from("veiculos")
    .update(dadosAtualizacao)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Veiculo;
}


export async function excluirVeiculo(id: string) {
  const { error } = await supabase
    .from("veiculos")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

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