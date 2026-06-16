import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RouteGuard } from '@/components/layout/RouteGuard'
import { HomePage } from '@/pages/HomePage'
import { ExplorePage } from '@/pages/ExplorePage'
import { CommunityPage } from '@/pages/CommunityPage'
import { CreateCommunityPage } from '@/pages/CreateCommunityPage'
import { EditCommunityPage } from '@/pages/EditCommunityPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { EditProfilePage } from '@/pages/EditProfilePage'
import { ChatPage } from '@/pages/ChatPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { useRealtime } from '@/hooks/useRealtime'
import { ToastProvider } from '@/components/ui/Toast'

function AppRoutes(): JSX.Element {
  useRealtime()
  return (
    <Routes>
      <Route element={<RouteGuard requireAuth><AppLayout /></RouteGuard>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/communities" element={<ExplorePage />} />
        <Route path="/community/:id" element={<CommunityPage />} />
        <Route path="/create-community" element={<CreateCommunityPage />} />
        <Route path="/edit-community/:id" element={<EditCommunityPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:conversationId" element={<ChatPage />} />
        <Route path="/chat/new/:userId" element={<ChatPage />} />
      </Route>
      <Route element={<RouteGuard requireAuth={false}><Outlet /></RouteGuard>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export function App(): JSX.Element {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}
