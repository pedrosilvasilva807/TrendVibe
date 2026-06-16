import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function AppLayout(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-surface dark:bg-escuro">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">
          <div className="mx-auto max-w-3xl">
            <Outlet />
          </div>
        </main>
        <MobileNav />
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-4 dark:bg-darkSurface">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  )
}
