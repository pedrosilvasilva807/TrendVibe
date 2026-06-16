import { CommunityForm } from '@/components/community/CommunityForm'

export function CreateCommunityPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-escuro dark:text-darkText">Criar comunidade</h1>
      <CommunityForm />
    </div>
  )
}
