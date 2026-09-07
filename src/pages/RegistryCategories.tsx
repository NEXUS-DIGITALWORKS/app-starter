import { RegistryAdminNav } from '../features/registry-admin/components/RegistryAdminNav'
import { CategoryList } from '../features/registry-admin/components/CategoryList'

export default function RegistryCategories() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="m-0 text-2xl font-bold text-[#111827]">Registry管理</h1>
        <p className="mt-1 text-sm text-[#667085]">技術・構成パターンの情報を編集します。保存すると即座にRegistry APIへ反映されます。</p>
      </div>
      <RegistryAdminNav />
      <CategoryList />
    </div>
  )
}
