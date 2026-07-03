import * as THREE from 'three';

// Membrana cellulare: traslucida al centro, luminosa sul bordo (fresnel),
// con una lieve ondulazione organica dei vertici.
export function createMembraneMaterial(color, opts = {}) {
  const uniforms = {
    uTime: { value: 0 },
    uWobble: { value: opts.wobble ?? 0.06 },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opts.opacity ?? 0.38 },
    uRim: { value: opts.rim ?? 1.6 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uWobble;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 p = position;
        float w =
          sin(position.x * 3.1 + uTime * 2.0) * 0.5 +
          sin(position.y * 4.3 - uTime * 1.6) * 0.3 +
          sin(position.z * 5.2 + uTime * 2.4) * 0.2;
        p += normal * w * uWobble;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uRim;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0), 2.4);
        vec3 col = uColor * (0.55 + fres * uRim) + vec3(fres * 0.35);
        float alpha = mix(uOpacity, 0.95, fres);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });

  material.userData.uniforms = uniforms;
  return material;
}
