
import { supabase } from '../lib/supabase'

interface NovoCarregamento {
  usuario_id: string
  veiculo_id: string
  estacao_id: string
  carregador_id?: string | null
  inicio: string
  fim?: string | null
  energia_consumida_kwh?: number | null
}

export async function cadastrarCarregamento(
  carregamento: NovoCarregamento
) {
  const { data, error } = await supabase
    .from('historico_recargas')
    .insert({
      usuario_id: carregamento.usuario_id,
      veiculo_id: carregamento.veiculo_id,
      estacao_id: carregamento.estacao_id,
      carregador_id: carregamento.carregador_id ?? null,
      inicio: carregamento.inicio,
      fim: carregamento.fim ?? null,
      energia_consumida_kwh:
        carregamento.energia_consumida_kwh ?? null
    })
    .select()
    .single()

  if (error) {
    throw new Error(
      `Erro ao registrar carregamento: ${error.message}`
    )
  }

  return data
}

export async function listarHistorico(usuarioId: string) {
  const { data, error } = await supabase
    .from('historico_recargas')
    .select(`
  id,
  inicio,
  fim,
  energia_consumida_kwh,
  estacoes_recarga (
    nome
  ),
  veiculos (
    marca,
    modelo,
    placa
  )
`)
    .eq('usuario_id', usuarioId)
    .order('inicio', { ascending: false })

  if (error) {
    throw new Error(
      `Erro ao buscar histórico: ${error.message}`
    )
  }

  return data
}