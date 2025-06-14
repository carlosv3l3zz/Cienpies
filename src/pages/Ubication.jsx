import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Ubication = () => {
  // useRef nos permite mantener una referencia al elemento DOM donde montaremos nuestra escena 3D
  const mountRef = useRef(null);

  useEffect(() => {
    // Crear una nueva escena 3D - es como un contenedor donde pondremos todos nuestros objetos 3D
    const scene = new THREE.Scene();

    // Configurar la cámara
    // PerspectiveCamera simula cómo vemos con nuestros ojos
    // Parámetros:
    // 1. FOV (Field of View) - 10 grados: ángulo de visión más estrecho (objeto se ve más cerca)
    // 2. Aspect ratio - relación entre ancho y alto de la pantalla
    // 3. Near plane - 0.1: distancia mínima que la cámara puede ver
    // 4. Far plane - 1000: distancia máxima que la cámara puede ver
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Crear el renderizador WebGL que dibujará nuestra escena
    const renderer = new THREE.WebGLRenderer();

    // Establecer el tamaño del renderizador al tamaño de la ventana
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Agregar el canvas del renderizador al DOM
    mountRef.current.appendChild(renderer.domElement);

    // Crear la geometría de la Tierra
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);

    // Crear la geometría de las nubes (ligeramente más grande que la Tierra)
    const cloudsGeometry = new THREE.SphereGeometry(1.01, 64, 64);

    // Crear el cargador de texturas
    const textureLoader = new THREE.TextureLoader();

    // Cargar las texturas
    const dayTexture = textureLoader.load("/images/earthAtmos.jpg");
    const nightTexture = textureLoader.load("/images/8k_earth_nightmap.jpg");

    // Cargar la textura de nubes
    const cloudsTexture = textureLoader.load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png"
    );

    // Luz direccional (el "Sol") inicial
    let sunDirection = new THREE.Vector3(5, 0, 5).normalize();
    const sunRadius = 5;
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.copy(sunDirection);
    scene.add(directionalLight);

    // Posicionar la cámara 3 unidades hacia atrás en el eje Z
    // Esto nos permite ver la esfera desde una distancia
    camera.position.z = 3;

    // Crear los controles de órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    // Habilitar el zoom
    controls.enableZoom = true;
    // Habilitar la rotación
    controls.enableRotate = true;
    // Habilitar el pan (movimiento lateral)
    controls.enablePan = true;

    // Variables para animación
    let time = 0;
    const earthSpeed = 0.0004; // Velocidad de rotación de la Tierra
    const cloudSpeed = 0.001; // Velocidad de rotación de las nubes
    const cloudTilt = 0.1; 

    // ShaderMaterial para mezclar día y noche
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: sunDirection.clone() },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          float dotNL = dot(vNormal, sunDirection);
          float mixAmount = smoothstep(-0.1, 0.2, dotNL);
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          vec4 color = mix(nightColor, dayColor, mixAmount);
          gl_FragColor = color;
        }
      `,
    });

    // Material de las nubes
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.6,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

    scene.add(earth);
    scene.add(clouds);

    // Luz ambiental suave
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    // Función de animación para actualizar los controles
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.003;

      // Rotar la dirección del sol alrededor de la Tierra
      sunDirection = new THREE.Vector3(Math.sin(time) * sunRadius, 0, Math.cos(time) * sunRadius).normalize();
      directionalLight.position.copy(sunDirection);

      // Rotar la Tierra sobre su eje Y
      earth.rotation.y += earthSpeed;

      // Rotar las nubes en diferentes direcciones
      clouds.rotation.y += cloudSpeed;
      clouds.rotation.x = Math.sin(time) * cloudTilt;
      clouds.rotation.z = Math.cos(time) * cloudTilt;

      // Actualizar la dirección del sol en el shader (en espacio local de la malla)
      const inverseMatrix = earth.matrixWorld.clone().invert();
      const localSunDirection = sunDirection.clone().applyMatrix4(inverseMatrix).normalize();
      earthMaterial.uniforms.sunDirection.value = localSunDirection;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-screen h-screen"></div>;
};

export default Ubication;
