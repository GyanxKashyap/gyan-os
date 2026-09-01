export const creatorGithubUrl = 'https://github.com/GyanxKashyap'

export function AboutPanel() {
  return (
    <section className="about-workspace view-transition-surface" aria-labelledby="about-title">
      <article className="about-card">
        <header className="about-header">
          <span>STUDY TIMER / CREATOR</span>
          <h1 id="about-title">ABOUT THE CREATOR</h1>
        </header>

        <div className="about-identity">
          <span>BUILT BY</span>
          <strong>GYAN KASHYAP</strong>
        </div>

        <figure className="about-qr">
          <div className="about-qr-frame">
            <img
              src="/assets/github-gyanxkashyap-qr.png"
              alt="QR code linking to Gyan Kashyap on GitHub"
              width="492"
              height="492"
            />
          </div>
          <figcaption>SCAN TO VIEW THE CREATOR PROFILE</figcaption>
        </figure>

        <div className="about-github" aria-label={`GitHub profile ${creatorGithubUrl}`}>
          <strong>@GYANXKASHYAP</strong>
          <span>GITHUB.COM/GYANXKASHYAP</span>
        </div>

        <footer className="about-version">
          <span>PERSONAL STUDY TIMER</span>
          <span>VERSION 1.1.0</span>
        </footer>
      </article>
    </section>
  )
}
