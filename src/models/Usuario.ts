export type TipoUsuario = "MOTORISTA" | "EMPRESA" | "ADMIN";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  tipo_usuario: TipoUsuario;
  created_at?: string;
  updated_at?: string;
}