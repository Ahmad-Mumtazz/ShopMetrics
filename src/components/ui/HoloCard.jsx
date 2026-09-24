export default function HoloCard({ children, className = '', onClick }) {
  return <div className={`holo-card ${className}`} onClick={onClick}>{children}</div>;
}
