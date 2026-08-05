import logoSrc from '../assets/logo.png'

export function Logo() {
  return (
    <div className="overlay__logo">
      <img
        src={logoSrc}
        alt="Letters From Afar"
        width={876}
        height={285}
        decoding="async"
        draggable={false}
      />
    </div>
  )
}
