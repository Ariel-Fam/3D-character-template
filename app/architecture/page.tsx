import Link from "next/link";

export const metadata = { title: "Architecture · Character Control Template" };
export default function ArchitecturePage() {
  return (
    <main className="architecture-page">
      <header>
        <Link href="/">← Back to the character controller</Link>
        <h1>How the template fits together</h1>
        <p>
          Follow input through movement, shared simulation refs, character
          animation, and the camera to the final blue scene. The diagram also
          shows the template’s boundary inside the parent Astro Runner project.
        </p>
        <nav className="architecture-links" aria-label="Diagram files">
          <a href="/diagrams/architecture.excalidraw" download>
            Download editable Excalidraw
          </a>
          <a href="/diagrams/architecture.svg" target="_blank" rel="noreferrer">
            Open full-size diagram
          </a>
        </nav>
        <p>
          Open the .excalidraw file in Excalidraw to move nodes, change
          connections, or add your own modules. Scroll horizontally on small
          screens to read the diagram.
        </p>
      </header>
      <div className="diagram-scroll">
        {/* Native SVG is a local documentation artifact, shown without raster conversion. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/diagrams/architecture.svg"
          width="1800"
          height="1580"
          alt="Architecture of the character control template: Next.js shell, keyboard and mouse inputs, shared character and camera refs, movement physics, animation, asset loading, camera follow, rendering, configuration, and tests."
        />
      </div>
    </main>
  );
}
