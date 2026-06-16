const particles = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  left: `${(index * 23) % 100}%`,
  top: `${(index * 41) % 100}%`,
  delay: `${(index % 9) * 0.45}s`,
  duration: `${7 + (index % 6)}s`,
}));

export default function ParticleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden bg-[#050814]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.22),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(168,85,247,0.20),transparent_30%),radial-gradient(circle_at_62%_84%,rgba(16,185,129,0.12),transparent_26%)]" />
      <div className="cyber-grid absolute inset-0 opacity-35" />
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particle-dot"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-400/10 to-transparent" />
    </div>
  );
}
