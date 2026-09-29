/** CSS body outline only — no photo, no room, no video. */
export function PoseSilhouette() {
  return (
    <div className="pose-stage" aria-hidden>
      <div className="pose-figure pose-squat">
        <span className="head" />
        <span className="torso" />
        <span className="arm arm-l" />
        <span className="arm arm-r" />
        <span className="leg leg-l" />
        <span className="leg leg-r" />
      </div>
      <div className="pose-figure pose-plank">
        <span className="head" />
        <span className="torso" />
        <span className="arm arm-l" />
        <span className="arm arm-r" />
        <span className="leg leg-l" />
        <span className="leg leg-r" />
      </div>
      <div className="pose-figure pose-push">
        <span className="head" />
        <span className="torso" />
        <span className="arm arm-l" />
        <span className="arm arm-r" />
        <span className="leg leg-l" />
        <span className="leg leg-r" />
      </div>
    </div>
  );
}
