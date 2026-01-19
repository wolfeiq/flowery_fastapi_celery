'use client';

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

interface ShaderGradientBackgroundProps {
  cameraZoom?: number;
}

export default function ShaderGradientBackground({ 
  cameraZoom = 3.01 
}: ShaderGradientBackgroundProps) {
  return (
    <ShaderGradientCanvas
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}
    >
      <ShaderGradient
        control="props"
        cAzimuthAngle={311}
        cPolarAngle={78}
        cDistance={3.6}
        cameraZoom={cameraZoom}
        color1="#e89a9c"
        color2="#c98e8f"
        color3="#841e15"
        brightness={0.8}
        grain="on"
        type="sphere"
        uAmplitude={7}
        uDensity={0.4}
        uFrequency={5.5}
        uSpeed={0.2}
        uStrength={2.5}
      />
    </ShaderGradientCanvas>
  );
}