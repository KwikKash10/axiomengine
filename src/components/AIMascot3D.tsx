// @ts-nocheck - Disabling type checking for this file to prevent unused import warnings
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Tooltip } from 'react-tooltip';

// Simple error boundary component to catch and handle rendering errors
class ThreeJSErrorBoundary extends React.Component<
  {children: React.ReactNode; onError?: () => void}, 
  {hasError: boolean}
> {
  constructor(props: {children: React.ReactNode; onError?: () => void}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error("ThreeJS Error caught in boundary:", error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error in ThreeJS component:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Return null to let parent handle the error display
    }

    return this.props.children;
  }
}

// WebGL Context recovery handler
const ContextHandler = () => {
  const { gl } = useThree();
  
  useEffect(() => {
    // Handle context lost
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log("WebGL context lost. Trying to restore...");
    };
    
    // Handle context restored
    const handleContextRestored = () => {
      console.log("WebGL context restored!");
    };
    
    // Get the canvas element
    const canvas = gl.domElement;
    
    // Add event listeners
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    
    return () => {
      // Clean up event listeners
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);
  
  return null;
};

// Snooze effect component
const SnoozeEffect = () => {
  const zzzRefs = useRef<THREE.Group[]>([]);
  const numZzzs = 3;
  const speed = 0.5;
  const lifeSpan = 4; // Increased from 2 to slow down frequency

  // Initialize refs array
  useEffect(() => {
    zzzRefs.current = zzzRefs.current.slice(0, numZzzs);
  }, [numZzzs]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    zzzRefs.current.forEach((ref, i) => {
      if (ref && ref.userData) {
        // Initialize if needed
        if (ref.userData.startTime === undefined) {
          ref.userData.startTime = time + (i * lifeSpan / numZzzs); // Stagger start times (will be more spaced out due to longer lifeSpan)
          ref.userData.initialY = 0.3 + Math.random() * 0.1; // Start slightly above head
          ref.userData.initialX = 0.1 + Math.random() * 0.2; // Shifted starting X range further right
        }

        const timeAlive = (time - ref.userData.startTime) % lifeSpan;
        const progress = timeAlive / lifeSpan;

        ref.position.y = ref.userData.initialY + progress * speed;
        ref.position.x = ref.userData.initialX + progress * (speed * 0.5);

        let finalOpacity = 0; // Default to invisible

        // Only calculate opacity and make visible for even indices (0, 2, ...)
        if (i % 2 === 0) {
          // Fade out towards the end
          finalOpacity = 1.0 - Math.pow(progress, 3); // Fade out faster at the end
        }

        // Access the material of the Text mesh - Text creates a mesh internally
        const textMesh = ref.children[0] as THREE.Mesh;
        if (textMesh && textMesh.material) {
          const material = textMesh.material as THREE.MeshBasicMaterial | THREE.MeshBasicMaterial[];
          if (Array.isArray(material)) {
            material.forEach(m => m.opacity = finalOpacity);
          } else {
            material.opacity = finalOpacity;
          }
        }
        
        // Reset if cycle completes (handled by modulo)
        if (progress >= 1.0 && ref.userData.startTime <= time - lifeSpan) {
             ref.userData.startTime = time; // Reset start time for next cycle
        }
      }
    });
  });

  return (
    <group>
      {Array.from({ length: numZzzs }).map((_, i) => (
        <group
          key={i}
          ref={(el) => { if (el) zzzRefs.current[i] = el; }}
          userData={{ startTime: undefined, initialY: 0, initialX: 0 }} // Initialize userData
        >
          <Text
            fontSize={0.15}
            color="#FFFFFF" // White Zzzs
            anchorX="center"
            anchorY="middle"
            material-transparent={true} // Enable transparency
            material-opacity={0} // Start invisible
          >
            Zzz
            <meshBasicMaterial attach="material" depthTest={false} transparent={true} side={THREE.DoubleSide} color="#FFFFFF" />
          </Text>
        </group>
      ))}
    </group>
  );
};

// AI Robot face model
const AIRobotModel: React.FC<{
  emotion: 'neutral' | 'thinking' | 'speaking' | 'analyzing' | 'happy' | 'sleeping';
  scale?: number;
  animationState?: 'idle' | 'teleport-in' | 'teleport-out';
  onAnimationComplete?: (state: 'teleport-in' | 'teleport-out') => void;
}> = ({ 
  emotion, 
  scale = 1, 
  animationState = 'idle', 
  onAnimationComplete 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  // Refs for the analyzing mouth dots
  const dot1Ref = useRef<THREE.Mesh>(null);
  const dot2Ref = useRef<THREE.Mesh>(null);
  const dot3Ref = useRef<THREE.Mesh>(null);
  const dot4Ref = useRef<THREE.Mesh>(null);
  const speakingMouthRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Animation state variables
  const animationDuration = 0.5; // seconds
  const animationTimer = useRef(0);
  const currentAnimationState = useRef(animationState); // Track internal state
  
  useEffect(() => {
    // Reset timer when animation state prop changes
    if (animationState !== currentAnimationState.current) {
      animationTimer.current = 0;
      currentAnimationState.current = animationState;
       if (groupRef.current) {
           // Make visible immediately if starting teleport-in
           if (animationState === 'teleport-in') {
               groupRef.current.visible = true;
           }
       }
    }
  }, [animationState]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const elapsedTime = state.clock.elapsedTime;
    
    // Handle Teleport Animations
    if (currentAnimationState.current === 'teleport-in' || currentAnimationState.current === 'teleport-out') {
      animationTimer.current += delta;
      let progress = Math.min(animationTimer.current / animationDuration, 1);
      // Use simple cubic easing (Math.pow(progress, 3))
      progress = Math.pow(progress, 3); 

      let currentScale: number;
      
      if (currentAnimationState.current === 'teleport-in') {
        currentScale = progress * scale;
      } else { // teleport-out
        currentScale = (1 - progress) * scale;
      }
      
      groupRef.current.scale.set(currentScale, currentScale, currentScale);
      groupRef.current.visible = currentScale > 0.01; // Hide when very small

      // Check if animation finished
      if (animationTimer.current >= animationDuration) {
        const completedState = currentAnimationState.current;
        currentAnimationState.current = 'idle'; // Transition to idle internally
        animationTimer.current = 0; 
        if (onAnimationComplete) {
          onAnimationComplete(completedState); // Notify parent
        }
         // Ensure final state for teleport-in
         if (completedState === 'teleport-in' && groupRef.current) {
            groupRef.current.scale.set(scale, scale, scale);
            groupRef.current.visible = true;
         }
      }
      // Skip emotion animations during teleport
      return; 
    }

    // Regular emotion-based animations (only run if state is 'idle')
    groupRef.current.scale.set(scale, scale, scale); // Ensure correct scale in idle
    groupRef.current.visible = true; // Ensure visible in idle

    // Reset tilt before applying emotion-specific rotations
    groupRef.current.rotation.x = 0;
    let targetYRotation = 0; // Define target Y rotation for lerping

    if (emotion === 'analyzing') {
      groupRef.current.position.y = Math.sin(elapsedTime * 1.2) * 0.05;
      targetYRotation = Math.sin(elapsedTime * 0.8) * 0.1; // Set target rotation instead
      const cycleDuration = 2;
      const numSteps = 16;
      const stepDuration = cycleDuration / numSteps;
      const timeInCycle = elapsedTime % cycleDuration;
      const currentStep = Math.floor(timeInCycle / stepDuration);
      if (dot1Ref.current && dot2Ref.current && dot3Ref.current && dot4Ref.current) {
        dot1Ref.current.visible = currentStep >= 0 && currentStep <= 3 || currentStep >= 11 && currentStep <= 14;
        dot2Ref.current.visible = currentStep >= 1 && currentStep <= 4 || currentStep >= 10 && currentStep <= 13;
        dot3Ref.current.visible = currentStep >= 2 && currentStep <= 5 || currentStep >= 9 && currentStep <= 12;
        dot4Ref.current.visible = currentStep >= 3 && currentStep <= 6 || currentStep >= 8 && currentStep <= 11;
      }
    } else if (emotion === 'thinking') {
      groupRef.current.rotation.z = Math.sin(elapsedTime * 0.5) * 0.05;
      groupRef.current.rotation.x = Math.sin(elapsedTime * 0.3) * 0.02;
    } else if (emotion === 'happy') {
      groupRef.current.position.y = Math.sin(elapsedTime * 1.5) * 0.03;
      groupRef.current.rotation.z = Math.sin(elapsedTime * 0.7) * 0.03;
    } else if (emotion === 'speaking') {
      groupRef.current.position.y = Math.sin(elapsedTime * 4) * 0.03;
      if (speakingMouthRef.current) {
        const mouthScale = 0.8 + Math.abs(Math.sin(elapsedTime * 8) * 0.4);
        speakingMouthRef.current.scale.set(mouthScale * 1.5, mouthScale * 0.7, 1);
      }
    } else if (emotion === 'sleeping') {
      groupRef.current.position.y = Math.sin(elapsedTime * 0.3) * 0.02;
      groupRef.current.rotation.z = Math.sin(elapsedTime * 0.2) * 0.01;
      groupRef.current.rotation.x = -0.3;
      targetYRotation = -0.5; // Set target Y rotation to the other side
    } else { // neutral
      groupRef.current.position.y = Math.sin(elapsedTime * 0.8) * 0.02;
      // No specific rotation.x needed here as it was reset above
      targetYRotation = 0; // Target is 0 for neutral
    }

    // Ensure dots are hidden if not in analyzing state
    if (emotion !== 'analyzing' && dot1Ref.current && dot2Ref.current && dot3Ref.current && dot4Ref.current) {
      dot1Ref.current.visible = false;
      dot2Ref.current.visible = false;
      dot3Ref.current.visible = false;
      dot4Ref.current.visible = false;
    }
    
    // Smoothly interpolate Y rotation towards the target
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetYRotation, delta * 5); // Adjust lerp speed (5) as needed
  });
  
  // Colors
  const secondaryColor = new THREE.Color('#FFFFFF'); // White for face/display
  const accentColor = new THREE.Color('#111133'); // Dark blue for eyes and details
  const glowColor = emotion === 'analyzing' ? '#00FFFF' :
                    emotion === 'thinking' ? '#FFCC00' : // Yellow for thinking
                    emotion === 'happy' ? '#FFAA00' : // Orange-yellow for happy
                    emotion === 'speaking' ? '#00FF00' : 
                    emotion === 'sleeping' ? '#6600CC' : // Purple for sleeping
                    '#FF0000';
                    
  return (
    <group 
      ref={groupRef} 
      // Start invisible if teleporting in, otherwise visible
      visible={animationState !== 'teleport-in'} 
      scale={[
        animationState === 'teleport-in' || animationState === 'teleport-out' ? 0 : scale, 
        animationState === 'teleport-in' || animationState === 'teleport-out' ? 0 : scale, 
        animationState === 'teleport-in' || animationState === 'teleport-out' ? 0 : scale
      ]} // Initial scale for teleport
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Robot head - main shape */}
      <group position={[0, 0, 0.01]}>
        {/* Robot face outer casing (white rounded rectangle) */}
        <RoundedBox position={[0, 0, 0]} args={[1.3, 0.9, 0.1]} radius={0.25} smoothness={4}>
          <meshStandardMaterial color={secondaryColor} />
        </RoundedBox>
        
        {/* Robot face inner screen (dark rounded rectangle) */}
        <RoundedBox position={[0, 0, 0.06]} args={[1.1, 0.7, 0.1]} radius={0.2} smoothness={4}>
          <meshStandardMaterial color={accentColor} />
        </RoundedBox>
        
        {/* Antenna Base - Always Visible */}
        <mesh position={[0, 0.45, 0]}> 
          <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /> 
          <meshStandardMaterial color={accentColor} />
        </mesh>

        {/* Antenna Stem and Ball - Conditionally Render */} 
        {emotion !== 'sleeping' && (
          <>
            {/* Stem */}
            <mesh position={[0, 0.685, 0]}> 
              <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
              <meshStandardMaterial color={accentColor} />
            </mesh>
            {/* Ball */}
            <mesh position={[0, 0.88, 0]}> 
              <sphereGeometry args={[0.08, 16, 16]} /> 
              <meshStandardMaterial color={accentColor} />
            </mesh>
          </>
        )}

        {/* Snooze Hat - Conditionally Render on top of base */} 
        {emotion === 'sleeping' && (
          // Position hat group slightly above the antenna base center (0.45) 
          // and apply the tilt
          <group position={[0, 0.5, 0]} rotation={[0, 0, -Math.PI / 8]}> {/* Raised Y position */}
            {/* Brim (Torus) - Flat and slightly raised from group base */}
            <mesh 
              position={[0, 0.04, 0]} // Raise brim by its tube radius relative to hat group origin
              rotation={[Math.PI / 2, 0, 0]} // Rotate 90 degrees around X-axis to make it flat
            >
              <torusGeometry args={[0.14, 0.04, 16, 32]} /> {/* Radius, tube radius */}
              <meshStandardMaterial color={secondaryColor} />
            </mesh>
            {/* Hat Cone - Positioned relative to hat group origin */}
            <mesh position={[0, 0.25, 0]}> {/* Position cone half its height above the brim */}
              <coneGeometry args={[0.14, 0.5, 32]} /> {/* Radius, height, segments */}
              <meshStandardMaterial color={'#4169E1'} /> {/* New royal blue color */}
            </mesh>
            {/* Pom-pom - Positioned relative to hat group origin */}
            <mesh position={[0, 0.5, 0]}> {/* Position pom-pom at cone height */}
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial color={secondaryColor} />
            </mesh>
          </group>
        )}
        
        {/* Side elements (white hand/arm shapes) */}
        <group position={[-0.75, -0.15, 0]}>
          {/* Left arm/hand */}
          <mesh rotation={[0, 0, Math.PI/6]}>
            <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
          {/* Thumb-like protrusion */}
          <mesh position={[-0.12, -0.05, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
        </group>
        
        <group position={[0.75, -0.15, 0]}>
          {/* Right arm/hand */}
          <mesh rotation={[0, 0, -Math.PI/6]}>
            <capsuleGeometry args={[0.06, 0.1, 8, 16]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
          {/* Thumb-like protrusion */}
          <mesh position={[0.12, -0.05, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={secondaryColor} />
          </mesh>
        </group>
      </group>
      
      {/* Facial expressions based on emotion */}
      <group position={[0, 0, 0.2]}>
        {emotion === 'neutral' && (
          <>
            {/* Neutral expression - simple eyes and neutral mouth */}
            <mesh position={[-0.3, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            <mesh position={[0.3, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            <mesh position={[0, -0.1, 0]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.3, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
          </>
        )}
        
        {emotion === 'analyzing' && (
          <>
            {/* Analyzing expression - scanning eyes and busy mouth */}
            <mesh position={[-0.3, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} emissive={glowColor} emissiveIntensity={hovered ? 2 : 1} />
            </mesh>
            <mesh position={[0.3, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} emissive={glowColor} emissiveIntensity={hovered ? 2 : 1} />
            </mesh>
            
            {/* Analyzing mouth - series of dots */}
            <mesh ref={dot1Ref} position={[-0.25, -0.1, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color={'#FFFFFF'} emissive={glowColor} emissiveIntensity={hovered ? 2 : 1} />
            </mesh>
            <mesh ref={dot2Ref} position={[-0.08, -0.1, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color={'#FFFFFF'} emissive={glowColor} emissiveIntensity={hovered ? 2 : 1} />
            </mesh>
            <mesh ref={dot3Ref} position={[0.08, -0.1, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color={'#FFFFFF'} emissive={glowColor} emissiveIntensity={hovered ? 2 : 1} />
            </mesh>
            <mesh ref={dot4Ref} position={[0.25, -0.1, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshStandardMaterial color={'#FFFFFF'} emissive={glowColor} emissiveIntensity={hovered ? 2 : 1} />
            </mesh>
          </>
        )}
        
        {emotion === 'thinking' && (
          <>
            {/* Thinking expression - chevron eyes with straight line mouth for concentration */}
            {/* Left eye "<" */}
            <group position={[-0.25, 0.1, 0]}>
              <mesh position={[0.025, 0.025, 0]} rotation={[0, 0, 3*Math.PI/4]}>
                <boxGeometry args={[0.1, 0.04, 0.01]} />
                <meshStandardMaterial color={'#FFFFFF'} />
              </mesh>
              <mesh position={[0.025, -0.025, 0]} rotation={[0, 0, -3*Math.PI/4]}>
                <boxGeometry args={[0.1, 0.04, 0.01]} />
                <meshStandardMaterial color={'#FFFFFF'} />
              </mesh>
            </group>
            
            {/* Right eye ">" */}
            <group position={[0.25, 0.1, 0]}>
              <mesh position={[-0.025, 0.025, 0]} rotation={[0, 0, Math.PI/4]}>
                <boxGeometry args={[0.1, 0.04, 0.01]} />
                <meshStandardMaterial color={'#FFFFFF'} />
              </mesh>
              <mesh position={[-0.025, -0.025, 0]} rotation={[0, 0, -Math.PI/4]}>
                <boxGeometry args={[0.1, 0.04, 0.01]} />
                <meshStandardMaterial color={'#FFFFFF'} />
              </mesh>
            </group>
            
            {/* Thinking mouth - small straight line for concentration */}
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
          </>
        )}
        
        {emotion === 'happy' && (
          <>
            {/* Happy expression - 'U' shaped eyes and smile */}
            {/* Left eye - 'U' shape */}
            <mesh position={[-0.25, 0.1, 0]}>
              <torusGeometry args={[0.05, 0.02, 16, 16, Math.PI]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            
            {/* Right eye - 'U' shape */}
            <mesh position={[0.25, 0.1, 0]}>
              <torusGeometry args={[0.05, 0.02, 16, 16, Math.PI]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            
            {/* Happy mouth - curved upward smile */}
            <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.15, 0.02, 16, 16, Math.PI]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
          </>
        )}
        
        {emotion === 'speaking' && (
          <>
            {/* Speaking expression - normal eyes and open mouth */}
            <mesh position={[-0.3, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            <mesh position={[0.3, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.05, 0.01]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            
            {/* Speaking mouth - Oval shape */}
            <mesh ref={speakingMouthRef} position={[0, -0.1, 0]} scale={[1.5, 1, 1]}> 
              <circleGeometry args={[0.1, 16]} /> 
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
          </>
        )}
        
        {emotion === 'sleeping' && (
          <>
            {/* Sleeping expression - 'n' shaped eyes (downward 'U') */}
            {/* Left eye - 'n' shape */}
            <mesh position={[-0.25, 0.1, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.05, 0.02, 16, 16, Math.PI]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
            
            {/* Right eye - 'n' shape */}
            <mesh position={[0.25, 0.1, 0]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.05, 0.02, 16, 16, Math.PI]} />
              <meshStandardMaterial color={'#FFFFFF'} />
            </mesh>
          </>
        )}
      </group>
      
      {/* Snooze Effect - Render only when sleeping */}
      {emotion === 'sleeping' && <SnoozeEffect />}
    </group>
  );
};

// Main AIMascot3D component
interface AIMascot3DProps {
  emotion: 'neutral' | 'thinking' | 'speaking' | 'analyzing' | 'happy' | 'sleeping';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withSpeechBubble?: boolean;
  speechText?: string;
  onError?: () => void;
  animationState?: 'idle' | 'teleport-in' | 'teleport-out';
  onAnimationComplete?: (state: 'teleport-in' | 'teleport-out') => void;
  showAutoRotateButton?: boolean;
}

const AIMascot3D: React.FC<AIMascot3DProps> = ({ 
  emotion = 'neutral', 
  size = 'md', 
  className = '', 
  withSpeechBubble = false,
  speechText = '',
  onError,
  animationState = 'idle',
  onAnimationComplete,
  showAutoRotateButton = false
}) => {
  const sizeValues = {
    sm: { scale: 0.85 }, // Increased from 0.6
    md: { scale: 1.1 },  // Increased from 0.8
    lg: { scale: 1.4 },  // Increased from 1.0
  };
  
  const [autoRotate, setAutoRotate] = useState(false);
  
  // Remove internal renderFallback state, rely on parent via onError
  
  // Fallback handler in case WebGL fails (calls onError immediately now)
  useEffect(() => {
    const failsafeTimer = setTimeout(() => {
      console.warn("WebGL rendering might be failing, checking status...");
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          console.error("WebGL not supported or enabled");
          if (onError) onError(); // Call parent error handler
        }
      } catch (e) {
        console.error("WebGL check failed:", e);
        if (onError) onError(); // Call parent error handler
      }
    }, 2000); 
    
    return () => clearTimeout(failsafeTimer);
  }, [onError]);
  
  // No internal fallback rendering needed now
  
  return (
    <div className={`relative ${className} w-full h-full`}>
      {withSpeechBubble && speechText && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 p-3 rounded-xl shadow-lg z-10 w-auto max-w-[80%]">
          <p className="text-sm text-white text-center">{speechText}</p>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-800"></div>
        </div>
      )}
      
      {showAutoRotateButton && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-full ${autoRotate ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'} transition-colors`}
            data-tooltip-id="auto-rotate-tooltip"
            data-tooltip-content={autoRotate ? "Stop auto-rotate" : "Start auto-rotate"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="w-full h-full">
        <ThreeJSErrorBoundary onError={onError}>
          <Canvas 
            camera={{ position: [0, 0.1, 2.0], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ 
              antialias: true,
              outputColorSpace: THREE.SRGBColorSpace,
              powerPreference: 'high-performance',
              alpha: true,
              depth: true,
              stencil: false,
              preserveDrawingBuffer: true
            }}
            dpr={[1, 1.5]} // Limit pixel ratio for performance
          >
            <ContextHandler />
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <hemisphereLight args={['#ffeeb1', '#080820', 1.5]} />
            <group position={[0, -0.2, 0]}>
              <AIRobotModel 
                emotion={emotion} 
                scale={sizeValues[size].scale} 
                animationState={animationState}
                onAnimationComplete={onAnimationComplete}
              />
            </group>
            {/* <ContactShadows 
              position={[0, -0.5, 0]} 
              opacity={0.4} 
              scale={5} 
              blur={2} 
              far={4} 
              color="#000000" 
            /> */}
            {/* <Floor /> */}
            <Environment preset="sunset" />
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              rotateSpeed={0.5}
              autoRotate={autoRotate}
              autoRotateSpeed={1.0}
              makeDefault
            />
          </Canvas>
        </ThreeJSErrorBoundary>
      </div>
      <Tooltip id="auto-rotate-tooltip" delayShow={0} />
    </div>
  );
};

export default AIMascot3D; 