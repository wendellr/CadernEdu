import { redirect } from 'next/navigation'

// Ponto de entrada — delega para o app autenticado
export default function RootPage() {
  redirect('/turmas')
}
