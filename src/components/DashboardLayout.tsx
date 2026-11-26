import { type ReactNode } from 'react'
import { Bell, Search } from 'lucide-react'
import {Sidebar} from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  description?: string
}

function DashboardLayout({
  children,
  title,
  description
}: DashboardLayoutProps) {

  return (
    <div className="dashboard-app">

      <Sidebar />

      <div className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>{title}</h1>

            {description && (
              <p>{description}</p>
            )}
          </div>

          <div className="dashboard-actions">


            

          </div>

        </header>

        <main className="dashboard-content">
          {children}
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout