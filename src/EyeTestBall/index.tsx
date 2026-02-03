import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Character } from "./components/Character";
import { Ball } from "./components/Ball";
import { useCurvedMovement, MovementKeyframe } from "./useCurvedMovement";
import { createSeededRandom } from "../utils/seededRandom";
import { loadFont } from "@remotion/google-fonts/ComicRelief";

const { fontFamily } = loadFont();
// Character and Ball dimensions
const CHARACTER_SIZE = 300;
const BALL_SIZE = 80;
const CHARACTER_SPACING = 350;

// ===== CUSTOMIZE HERE =====
// Number of characters (2-5)
const NUM_CHARACTERS = 3;

// Which character has the ball underneath (0-indexed, this character starts higher)
const BALL_CHARACTER_INDEX = 1;

// How high the ball character starts (negative = higher)
const BALL_CHARACTER_START_OFFSET = -350;

// Random seed for shuffle patterns
// Use a specific number for reproducible results, or Math.random() for different results each time
const SHUFFLE_SEED = 4002;

// Character labels
const CHARACTER_LABELS = ["A", "B", "C", "D", "E"];
// ===========================

interface AnimatedCharacterProps {
  keyframes: MovementKeyframe[];
}

const AnimatedCharacter: React.FC<AnimatedCharacterProps> = ({ keyframes }) => {
  const { x, y } = useCurvedMovement(keyframes);
  return <Character x={x} y={y} />;
};

// Generate random curve value between 300-400, with random sign (up or down)
const getRandomCurve = (random: () => number): number => {
  const magnitude = 300 + random() * 100; // 300-400
  const sign = random() > 0.5 ? 1 : -1; // random up or down
  return magnitude * sign;
};

// Generate final positions for all characters (ensures no overlap)
const generateFinalPositions = (
  numCharacters: number,
  seed: number,
): number[] => {
  const random = createSeededRandom(seed);
  const positions = Array.from({ length: numCharacters }, (_, i) => i);

  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  return positions;
};

// Generate keyframes for a character with random shuffle curves
const generateKeyframes = (
  characterIndex: number,
  numCharacters: number,
  characterPositions: { x: number; y: number }[],
  centerY: number,
  startYOffset: number,
  shuffleStart: number,
  shuffleEnd: number,
  ballRevealEnd: number,
  finalPositionIndex: number,
  random: () => number,
): MovementKeyframe[] => {
  const startPos = characterPositions[characterIndex];

  // Generate random shuffle sequence (which positions to visit)
  const otherPositions = Array.from(
    { length: numCharacters },
    (_, i) => i,
  ).filter((i) => i !== characterIndex);
  const shuffledPositions = [...otherPositions].sort(() => random() - 0.5);

  // Calculate frame intervals for shuffle
  const shuffleDuration = shuffleEnd - shuffleStart;
  const numSegments = Math.min(shuffledPositions.length + 1, 4); // Up to 4 segments
  const segmentDuration = Math.floor(shuffleDuration / numSegments);

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

  // Shuffle movements - visit random positions
  for (let i = 0; i < Math.min(shuffledPositions.length, 2); i++) {
    keyframes.push({
      x: characterPositions[shuffledPositions[i]].x,
      y: centerY,
      frame: shuffleStart + segmentDuration * (i + 1),
      curve: getRandomCurve(random),
    });
  }

  // Return to assigned final position (no overlap)
  keyframes.push({
    x: characterPositions[finalPositionIndex].x,
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

  // Ball position (center, under the ball character)
  const ballY = height / 2 - BALL_SIZE / 2;

  // Generate character positions dynamically based on NUM_CHARACTERS
  const totalWidth = (NUM_CHARACTERS - 1) * CHARACTER_SPACING;
  const startX = centerX - totalWidth / 2;
  const characterPositions = Array.from({ length: NUM_CHARACTERS }, (_, i) => ({
    x: startX + i * CHARACTER_SPACING,
    y: centerY,
  }));

  // Generate starting offsets - only the ball character starts higher
  const characterStartOffsets = Array.from(
    { length: NUM_CHARACTERS },
    (_, i) => (i === BALL_CHARACTER_INDEX ? BALL_CHARACTER_START_OFFSET : 0),
  );

  // Timing (at 30fps)
  const ballRevealEnd = 60; // 2s - middle character comes down, hides ball
  const shuffleStart = 60; // 2s - shuffle begins
  const shuffleEnd = 300; // 10s - shuffle ends (8s of shuffling)
  const freezeStart = 300; // 10s - show CTA
  const commentTime = 330; // 11s - comment your answer
  const shareTime = 390; // 12s - share with friends

  // Generate unique final positions for all characters (no overlap)
  const finalPositions = generateFinalPositions(NUM_CHARACTERS, SHUFFLE_SEED);

  // Generate keyframes for each character with random curves
  const characterKeyframes = Array.from({ length: NUM_CHARACTERS }, (_, i) => {
    const random = createSeededRandom(SHUFFLE_SEED + i * 100); // Different seed per character
    return generateKeyframes(
      i,
      NUM_CHARACTERS,
      characterPositions,
      centerY,
      characterStartOffsets[i],
      shuffleStart,
      shuffleEnd,
      ballRevealEnd,
      finalPositions[i], // Each character gets a unique final position
      random,
    );
  });

  // Find which position the ball character ends up at
  const ballCharacterFinalPosition = finalPositions[BALL_CHARACTER_INDEX];

  // Log the answer (which position label the ball is under)
  if (frame === freezeStart) {
    console.log("=== BALL TRACKING ===");
    console.log(
      `Ball started under character: ${CHARACTER_LABELS[BALL_CHARACTER_INDEX]} (index ${BALL_CHARACTER_INDEX})`,
    );
    console.log(
      `Ball character ended at position: ${ballCharacterFinalPosition}`,
    );
    console.log(
      `Answer: The ball is under position ${CHARACTER_LABELS[ballCharacterFinalPosition]}`,
    );
    console.log("=====================");
  }

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
          top: 200,
          fontSize: 70,
          fontFamily,
          fontWeight: 600,
          letterSpacing: 1.5,
          textAlign: "center",
          color: "#6f3521",
        }}
      >
        {getTopText()}
      </div>

      {/* Ball: visible before shuffle starts, positioned under ball character */}
      {frame < shuffleStart && (
        <Ball
          x={
            characterPositions[BALL_CHARACTER_INDEX].x +
            CHARACTER_SIZE / 2 -
            BALL_SIZE / 2
          }
          y={ballY + 50}
        />
      )}

      {/* Characters */}
      {characterKeyframes.map((keyframes, i) => (
        <AnimatedCharacter key={i} keyframes={keyframes} />
      ))}

      {/* Bottom text - position labels after animation ends */}
      {frame >= freezeStart && (
        <div
          style={{
            position: "absolute",
            bottom: 580,
            fontFamily,
            fontSize: 80,
            fontWeight: 500,
            display: "flex",
            color: "#6f3521",
            gap: CHARACTER_SPACING - 30,
          }}
        >
          {Array.from({ length: NUM_CHARACTERS }, (_, i) => (
            <span key={i}>{CHARACTER_LABELS[i]}</span>
          ))}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 300,
          fontFamily,
          opacity: 0.7,
          fontSize: 40,
          fontWeight: 400,
          display: "flex",
          color: "#6f3521",
          letterSpacing: 2,
        }}
      >
        @EyeTestDaily
      </div>
    </AbsoluteFill>
  );
};
