import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Character } from "./components/Character";
import { Ball } from "./components/Ball";
import { useCurvedMovement, MovementKeyframe } from "./useCurvedMovement";
import { createSeededRandom } from "../utils/seededRandom";

// Character and Ball dimensions
const CHARACTER_SIZE = 300;
const BALL_SIZE = 80;
const CHARACTER_SPACING = 350;

// ===== CUSTOMIZE STARTING OFFSETS HERE =====
// Y offset for each character's starting position (negative = higher, positive = lower)
const CHARACTER_START_OFFSETS = [
  0, // Character 0 (Orange/Left) - starts at center
  -350, // Character 1 (Green/Middle) - starts 250px higher to show ball
  0, // Character 2 (Blue/Right) - starts at center
  0, // Character 2 (Blue/Right) - starts at center
];

// Random seed for shuffle patterns (change this to get different shuffle patterns)
const SHUFFLE_SEED = 42;
// ==========================================

interface AnimatedCharacterProps {
  keyframes: MovementKeyframe[];
  color: string;
  label: string;
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({
  keyframes,
  color,
  label,
}) => {
  const { x, y } = useCurvedMovement(keyframes);
  return <Character x={x} y={y} color={color} label={label} />;
};

// Generate random curve value between 300-400, with random sign (up or down)
const getRandomCurve = (random: () => number): number => {
  const magnitude = 300 + random() * 100; // 300-400
  const sign = random() > 0.5 ? 1 : -1; // random up or down
  return magnitude * sign;
};

// Generate keyframes for a character with random shuffle curves
const generateKeyframes = (
  characterIndex: number,
  characterPositions: { x: number; y: number }[],
  centerY: number,
  startYOffset: number,
  shuffleStart: number,
  shuffleEnd: number,
  ballRevealEnd: number,
  random: () => number,
): MovementKeyframe[] => {
  const startPos = characterPositions[characterIndex];

  // Generate random shuffle sequence (which positions to visit)
  const otherPositions = [0, 1, 2].filter((i) => i !== characterIndex);
  const shuffledPositions = otherPositions.sort(() => random() - 0.5);

  // Calculate frame intervals for shuffle
  const shuffleDuration = shuffleEnd - shuffleStart;
  const segmentDuration = Math.floor(shuffleDuration / 3);

  const keyframes: MovementKeyframe[] = [
    // Starting position with offset
    { x: startPos.x, y: centerY + startYOffset, frame: 0, curve: 0 },
  ];

  // If this character has a starting offset, add a keyframe to come down
  if (startYOffset !== 0) {
    keyframes.push({
      x: startPos.x,
      y: centerY,
      frame: ballRevealEnd,
      curve: getRandomCurve(random),
    });
  } else {
    // Stay in place until shuffle starts
    keyframes.push({
      x: startPos.x,
      y: centerY,
      frame: shuffleStart,
      curve: getRandomCurve(random),
    });
  }

  // Shuffle movements
  keyframes.push({
    x: characterPositions[shuffledPositions[0]].x,
    y: centerY,
    frame: shuffleStart + segmentDuration,
    curve: getRandomCurve(random),
  });

  keyframes.push({
    x: characterPositions[shuffledPositions[1]].x,
    y: centerY,
    frame: shuffleStart + segmentDuration * 2,
    curve: getRandomCurve(random),
  });

  // Return to original position
  keyframes.push({
    x: startPos.x,
    y: centerY,
    frame: shuffleEnd,
    curve: 0,
  });

  return keyframes;
};

export const EyeTestBall: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Calculate center positions based on video dimensions
  const centerX = width / 2 - CHARACTER_SIZE / 2;
  const centerY = height / 2 - CHARACTER_SIZE / 2;

  // Ball position (center)
  const ballX = width / 2 - BALL_SIZE / 2;
  const ballY = height / 2 - BALL_SIZE / 2;

  // Character positions
  const characterPositions = [
    { x: centerX - CHARACTER_SPACING, y: centerY }, // Left
    { x: centerX, y: centerY }, // Middle (ball is here)
    { x: centerX + CHARACTER_SPACING, y: centerY }, // Right
  ];

  // Timing (at 30fps)
  const ballRevealEnd = 60; // 2s - middle character comes down, hides ball
  const shuffleStart = 60; // 2s - shuffle begins
  const shuffleEnd = 300; // 10s - shuffle ends (8s of shuffling)
  const freezeStart = 300; // 10s - show CTA
  const commentTime = 330; // 11s - comment your answer
  const shareTime = 390; // 12s - share with friends

  // Character colors
  const colors = ["#F97316", "#22C55E", "#3B82F6"];

  // Generate keyframes for each character with random curves
  const allKeyframes = [0, 1, 2].map((i) => {
    const random = createSeededRandom(SHUFFLE_SEED + i * 100); // Different seed per character
    return generateKeyframes(
      i,
      characterPositions,
      centerY,
      CHARACTER_START_OFFSETS[i],
      shuffleStart,
      shuffleEnd,
      ballRevealEnd,
      random,
    );
  });

  // Determine which top text to show
  const getTopText = () => {
    if (frame < ballRevealEnd) return "Remember the ball";
    if (frame < shuffleEnd) return "Watch carefully!!";
    if (frame < commentTime) return "Where is the ball?";
    if (frame < shareTime) return "Comment your answer";
    return "Share this with your friends!";
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fce8df",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Top text */}
      <div
        style={{
          position: "absolute",
          top: 180,
          fontSize: 70,
          fontFamily: "cursive",
          fontWeight: 600,
          letterSpacing: 1.5,
          textAlign: "center",
          color: "#6f3521",
        }}
      >
        {getTopText()}
      </div>

      {/* Ball: always at center, visible before shuffle starts */}
      {frame < shuffleStart && <Ball x={ballX} y={ballY + 50} />}

      {/* Characters */}
      {allKeyframes.map((keyframes, i) => (
        <AnimatedCharacter
          key={i}
          keyframes={keyframes}
          color={colors[i]}
          label={`${i + 1}`}
        />
      ))}

      {/* Bottom text - A B C after animation ends */}
      {frame >= freezeStart && (
        <div
          style={{
            position: "absolute",
            bottom: 580,
            fontFamily: "cursive",
            fontSize: 80,
            fontWeight: 500,
            display: "flex",
            color: "#6f3521",
            gap: 350,
          }}
        >
          <span>A</span>
          <span>B</span>
          <span>C</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
