export interface EncuestaUI {
  id: number
  title: string
  options: string[]
  active: boolean
  createdAt: Date

  // campos backend (PascalCase como en el backend)
  idAdmin?: number
  pregunta?: string
  opcion1?: string
  opcion2?: string
  opcion3?: string
  opcion4?: string
  porcentaje1?: number
  porcentaje2?: number
  porcentaje3?: number
  porcentaje4?: number
  activo?: boolean
  fecha?: string
}

export interface EncuestaFormState {
  title: string
  options: string[]
  active: boolean
}