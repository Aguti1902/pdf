export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // No global Header here — DashboardShell has its own dark sidebar
  return <>{children}</>;
}
