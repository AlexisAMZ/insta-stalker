// Pastille de marque partagée par la favicon et l'icône iOS : un « A » blanc sur noir
// avec la barre dégradée Instagram.
export function BrandTile({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0d0d0d",
        fontFamily: "Bricolage Grotesque",
        borderRadius: size * 0.22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.05,
      }}
    >
      <div style={{ color: "#fff", fontSize: size * 0.66, fontWeight: 800, lineHeight: 0.9, letterSpacing: -size * 0.03, display: "flex" }}>
        A
      </div>
      <div
        style={{
          width: size * 0.56,
          height: size * 0.09,
          borderRadius: size,
          background: "linear-gradient(90deg, #f9ce34, #ee2a7b, #6228d7)",
          display: "flex",
        }}
      />
    </div>
  );
}
