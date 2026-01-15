import sceneSpecs from "./ai-input/scene_specs_100.json";
import fs from "fs";

interface SceneType {
  category: string;
  subject: string;
  pose: string;
  environment: string;
  lighting: string;
  camera: string;
  style: string;
  alternate: string[];
}

const jsonData = sceneSpecs as Array<SceneType>;

// Generate prompt from scene spec
function buildPrompt(scene: SceneType) {
  return `
A high-quality illustration of a ${scene.subject} (${scene.category}) in a ${scene.environment} environment, 
pose: ${scene.pose}, lighting: ${scene.lighting}, camera: ${scene.camera}, style: ${scene.style}.
`;
}

function generateVariantPrompt(scene: SceneType) {
  return `
Make ONLY ${scene.alternate.length} subtle visual changes:
${scene.alternate.map((alt, idx) => `${idx + 1}. ${alt}`).join("\n")}

Do not change anything else.
`;
}

(async () => {
  let allPrompts = "";
  for (let i = 0; i < jsonData.length; i++) {
    // <-- fixed loop
    const scene = jsonData[i];

    try {
      const base = buildPrompt(scene);
      const variant = generateVariantPrompt(scene);

      allPrompts += `Base Prompt:\n${base}\n\nVariant Prompt:\nSame Image ${variant}\n\n`;
    } catch (e) {
      console.error("Retrying:", (e as Error).message);
      i--;
    }
  }
  fs.writeFileSync("prmpts.txt", allPrompts);
})();
