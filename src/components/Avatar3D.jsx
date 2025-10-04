import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Avatar3D = ({ animation, isPlaying }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Load 3D model (placeholder - replace with actual sign language avatar)
    const loader = new GLTFLoader();
    
    // For demo: Create a simple hand model with boxes
    const handGroup = new THREE.Group();
    
    // Create finger segments
    const fingerGeometry = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const fingerMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    
    for (let i = 0; i < 5; i++) {
      const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
      finger.position.x = (i - 2) * 0.3;
      handGroup.add(finger);
    }
    
    // Palm
    const palmGeometry = new THREE.BoxGeometry(1.5, 1, 0.3);
    const palm = new THREE.Mesh(palmGeometry, fingerMaterial);
    palm.position.y = -0.7;
    handGroup.add(palm);
    
    scene.add(handGroup);
    modelRef.current = handGroup;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.005;
      }
      
      if (mixerRef.current) {
        mixerRef.current.update(0.01);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!modelRef.current || !animation) return;

    // Animate based on sign
    if (isPlaying) {
      // Apply animation to model
      // This is simplified - you'd map specific hand poses to each sign
      modelRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
      modelRef.current.rotation.z = Math.cos(Date.now() * 0.001) * 0.1;
    }
  }, [animation, isPlaying]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-96 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
    />
  );
};

export default Avatar3D;