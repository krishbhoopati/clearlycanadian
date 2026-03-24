export default function SimulationLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-y-auto dark-scroll bg-[#2a3441]">
      {children}
    </div>
  );
}
