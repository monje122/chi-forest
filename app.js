// CHI FOREST — Real 3D Can Showcase (Three.js)
// Linear Side-to-Side Horizontal Flow • 360° Inspection & Nutrition Facts

const CANS_DATA = [
  {
    id: 'lychee',
    title: 'Sparkling Lychee Fizzy',
    eyebrow: 'Chi Forest • Sabor Frutal Exótico',
    description: 'El embriagador aroma y dulzor natural del lichi tropical fusionado con finas micro-burbujas efervescentes. Cero azúcar añadido, frescura cristalina y un final floral inolvidable.',
    wrapImage: 'assets/lychee_wrap.jpg',
    accentColor: '#ff2d55',
    accentHex: 0xff2d55,
    glowColor: 'rgba(255, 45, 85, 0.4)',
    tags: ['330 mL (11.16 fl oz)', 'Lichi Natural', 'Zero Sugar & Cal', '100% Vegano'],
    nutrition: { cal: '0', sugar: '0g', fat: '0g', sodium: '1 mg' },
    note: 'Elaborado con esencia botánica de lichi fresco. Carbonatación fina 2.5x más duradera.'
  },
  {
    id: 'orange',
    title: 'Sparkling Orange',
    eyebrow: 'Chi Forest • Explosión Cítrica Solar',
    description: 'Notas jugosas, vibrantes y aromáticas de naranja mediterránea con un toque cítrico revitalizante. El balance perfecto entre chispa ácida natural y refrescancia pura.',
    wrapImage: 'assets/orange_wrap.jpg',
    accentColor: '#ff7a00',
    accentHex: 0xff7a00,
    glowColor: 'rgba(255, 122, 0, 0.4)',
    tags: ['330 mL (11.16 fl oz)', 'Cáscara de Naranja', 'Zero Sugar & Cal', 'Sin Gluten'],
    nutrition: { cal: '0', sugar: '0g', fat: '0g', sodium: '1 mg' },
    note: 'Aceites esenciales de naranja prensada en frío. Sin colorantes ni saborizantes artificiales.'
  },
  {
    id: 'grape',
    title: 'Sparkling Grape Delight',
    eyebrow: 'Chi Forest • Uva Real Kyoho',
    description: 'Inspirado en la prestigiosa uva púrpura Kyoho, célebre por su sabor profundo, dulce y aterciopelado. Una experiencia gourmet burbujeante y totalmente libre de calorías.',
    wrapImage: 'assets/grape_wrap.jpg',
    accentColor: '#9d4edd',
    accentHex: 0x9d4edd,
    glowColor: 'rgba(157, 78, 221, 0.4)',
    tags: ['330 mL (11.16 fl oz)', 'Uva Kyoho', 'Zero Sugar & Cal', 'Antioxidante'],
    nutrition: { cal: '0', sugar: '0g', fat: '0g', sodium: '1 mg' },
    note: 'Extracto aromático de uva negra premium. Textura burbujeante aterciopelada al paladar.'
  },
  {
    id: 'peach',
    title: 'Sparkling White Peach',
    eyebrow: 'Chi Forest • Melocotón Blanco',
    description: 'El sabor insignia más aclamado a nivel global: el perfume delicado, suave y sedoso del melocotón blanco en su punto óptimo de maduración. Elegancia en cada sorbo.',
    wrapImage: 'assets/peach_wrap.jpg',
    accentColor: '#ff6584',
    accentHex: 0xff6584,
    glowColor: 'rgba(255, 101, 132, 0.4)',
    tags: ['330 mL (11.16 fl oz)', 'Melocotón Blanco', 'Zero Sugar & Cal', 'Bestseller'],
    nutrition: { cal: '0', sugar: '0g', fat: '0g', sodium: '1 mg' },
    note: 'Aroma delicado y floral. Endulzado naturalmente con eritritol botánico de índice glucémico 0.'
  }
];

// Audio feedback (synthesized with Web Audio API)
class SoundFX {
  constructor() {
    this.ctx = null;
  }
  ensureCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playWhoosh() {
    try {
      this.ensureCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.16);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch(e) {}
  }
  playPop() {
    try {
      this.ensureCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch(e) {}
  }
}

class Real3DCanExperience {
  constructor() {
    this.sound = new SoundFX();
    this.canvas = document.getElementById('webglCanvas');
    this.stage = document.getElementById('stage');
    this.hud = document.getElementById('inspectionHud');
    this.hudTitle = document.getElementById('hudTitle');
    this.hudEyebrow = document.getElementById('hudEyebrow');
    this.hudDescription = document.getElementById('hudDescription');
    this.hudTags = document.getElementById('hudTags');
    this.hudNote = document.getElementById('hudNote');
    this.nutriCal = document.getElementById('nutriCal');
    this.nutriSugar = document.getElementById('nutriSugar');
    this.nutriFat = document.getElementById('nutriFat');
    this.nutriSodium = document.getElementById('nutriSodium');
    this.indicatorsContainer = document.getElementById('indicators');
    this.statusText = document.getElementById('currentStatusText');
    this.btnPrev = document.getElementById('btnPrev');
    this.btnNext = document.getElementById('btnNext');
    this.btnCloseInspect = document.getElementById('btnCloseInspect');
    this.btnCloseInspectIcon = document.getElementById('btnCloseInspectIcon');

    this.totalCans = CANS_DATA.length;
    this.selectedIndex = 0;
    this.isInspecting = false;

    // Linear Horizontal (Side-to-Side) Track Settings
    this.spacing = 3.35; // Horizontal gap between cans
    this.currentScroll = 0;
    this.targetScroll = 0;

    // Interaction variables
    this.isPointerDown = false;
    this.dragMoved = false;
    this.pointerStartX = 0;
    this.pointerStartY = 0;
    this.lastPointerX = 0;
    this.lastPointerY = 0;

    // Individual can rotation in inspect mode
    this.inspectRotX = 0.12; // subtle forward tilt
    this.inspectRotY = 0;
    this.targetInspectRotX = 0.12;
    this.targetInspectRotY = 0;

    this.canObjects = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initThree();
    this.initHUD();
    this.initEvents();
    this.animate();
  }

  initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = this.stage.clientWidth / this.stage.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.updateCameraDistance();

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.stage.clientWidth, this.stage.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.keyLight.position.set(5, 8, 7);
    this.scene.add(this.keyLight);

    const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.6);
    fillLight.position.set(-6, 2, 4);
    this.scene.add(fillLight);

    this.rimLight = new THREE.PointLight(CANS_DATA[0].accentHex, 3.2, 18);
    this.rimLight.position.set(0, 2, -3);
    this.scene.add(this.rimLight);

    // 5. Cans Pivot Group
    this.carouselPivot = new THREE.Group();
    this.scene.add(this.carouselPivot);

    // 6. Build the 4 Real 3D Cans
    const textureLoader = new THREE.TextureLoader();
    const lidTexture = textureLoader.load('assets/can_lid.png');
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    CANS_DATA.forEach((data, index) => {
      const wrapTexture = textureLoader.load(data.wrapImage);
      wrapTexture.encoding = THREE.sRGBEncoding;
      wrapTexture.minFilter = THREE.LinearMipmapLinearFilter;
      wrapTexture.magFilter = THREE.LinearFilter;
      wrapTexture.anisotropy = maxAnisotropy;

      const canGroup = this.createRealCanMesh(wrapTexture, lidTexture, index);
      canGroup.userData = { index, data };

      this.carouselPivot.add(canGroup);
      this.canObjects.push(canGroup);
    });

    this.updateCanPositions(true);
  }

  createRealCanMesh(wrapTexture, lidTexture, index) {
    const group = new THREE.Group();

    // Sleek 330 mL beverage can proportions matching real Chi Forest can
    const radius = 0.74;
    const bodyHeight = 3.65;
    const segments = 64;
    const heightSegments = 32;

    // Polished Aluminum Chime & Lid Material (bright metallic lip)
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xe8eaf0,
      metalness: 0.95,
      roughness: 0.16
    });

    // 1. Can Body Cylinder (covers 100% of the can body from top rim to bottom rim)
    const bodyGeo = new THREE.CylinderGeometry(radius, radius, bodyHeight, segments, heightSegments, true);

    // Apply smooth shoulder taper at top and bevel taper at bottom directly on wrapped mesh
    const pos = bodyGeo.attributes.position;
    const topTaperH = 0.22;
    const botTaperH = 0.18;
    const topYStart = bodyHeight / 2 - topTaperH;
    const botYStart = -bodyHeight / 2 + botTaperH;
    const topNeckRadius = radius * 0.89; // 0.66
    const botBaseRadius = radius * 0.88; // 0.65

    for (let j = 0; j < pos.count; j++) {
      const y = pos.getY(j);
      let r = radius;
      if (y > topYStart) {
        const t = (y - topYStart) / topTaperH;
        r = radius - (radius - topNeckRadius) * Math.sin(t * Math.PI * 0.5);
      } else if (y < botYStart) {
        const t = (botYStart - y) / botTaperH;
        r = radius - (radius - botBaseRadius) * Math.sin(t * Math.PI * 0.5);
      }
      const currentR = Math.hypot(pos.getX(j), pos.getZ(j));
      if (currentR > 0.0001) {
        const factor = r / currentR;
        pos.setX(j, pos.getX(j) * factor);
        pos.setZ(j, pos.getZ(j) * factor);
      }
    }
    bodyGeo.computeVertexNormals();
    bodyGeo.rotateY(Math.PI / 2);

    // Glossy coated can print finish
    const bodyMat = new THREE.MeshStandardMaterial({
      map: wrapTexture,
      metalness: 0.14,
      roughness: 0.18
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(bodyMesh);

    // 2. Top Rim Chime (Thin curled aluminum lip of the lid seam)
    const topRimGeo = new THREE.TorusGeometry(topNeckRadius, 0.026, 12, segments);
    topRimGeo.rotateX(Math.PI / 2);
    const topRimMesh = new THREE.Mesh(topRimGeo, metalMat);
    topRimMesh.position.y = bodyHeight / 2;
    group.add(topRimMesh);

    // 3. Recessed Aluminum Top Lid (with pull-tab texture)
    const lidGeo = new THREE.CircleGeometry(topNeckRadius - 0.015, segments);
    lidGeo.rotateX(-Math.PI / 2);
    const lidMat = new THREE.MeshStandardMaterial({
      map: lidTexture,
      metalness: 0.86,
      roughness: 0.22
    });
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = bodyHeight / 2 - 0.018;
    group.add(lidMesh);

    // 4. Bottom Rim Chime (Thin curled aluminum base lip)
    const bottomRimGeo = new THREE.TorusGeometry(botBaseRadius, 0.022, 12, segments);
    bottomRimGeo.rotateX(Math.PI / 2);
    const bottomRimMesh = new THREE.Mesh(bottomRimGeo, metalMat);
    bottomRimMesh.position.y = -bodyHeight / 2;
    group.add(bottomRimMesh);

    // 5. Bottom Concave Dome (Recessed underside of can)
    const domeGeo = new THREE.CircleGeometry(botBaseRadius - 0.015, segments);
    domeGeo.rotateX(Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, metalMat);
    domeMesh.position.y = -bodyHeight / 2 + 0.02;
    group.add(domeMesh);

    // 6. Soft Floor Drop Shadow
    const shadowGeo = new THREE.CircleGeometry(radius * 1.5, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -bodyHeight / 2 - 0.35;
    group.add(shadowMesh);

    return group;
  }

  initHUD() {
    this.indicatorsContainer.innerHTML = '';
    CANS_DATA.forEach((can, i) => {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
      dot.dataset.index = i;
      dot.addEventListener('click', () => {
        this.sound.playWhoosh();
        this.rotateToIndex(i);
      });
      this.indicatorsContainer.appendChild(dot);
    });

    this.updateHUDContent(0);
  }

  updateCameraDistance() {
    const isMobile = window.innerWidth < 640;
    const targetZ = isMobile ? 11.2 : 10.2;
    const targetY = isMobile ? 0.35 : 0.2;
    if (this.camera) {
      this.camera.position.set(0, targetY, targetZ);
    }
  }

  initEvents() {
    // Window resize
    window.addEventListener('resize', () => {
      const w = this.stage.clientWidth;
      const h = this.stage.clientHeight;
      this.camera.aspect = w / h;
      this.updateCameraDistance();
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Pointer events on canvas
    const onDown = (e) => {
      this.isPointerDown = true;
      this.dragMoved = false;
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      this.pointerStartX = x;
      this.pointerStartY = y;
      this.lastPointerX = x;
      this.lastPointerY = y;
      this.canvas.classList.add('grabbing');
    };

    const onMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);

      // Raycast hover check when not dragging
      if (!this.isPointerDown && !this.isInspecting) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((x - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((y - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.canObjects, true);
        this.canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
      }

      if (!this.isPointerDown) return;

      const deltaX = x - this.lastPointerX;
      const deltaY = y - this.lastPointerY;

      if (Math.hypot(x - this.pointerStartX, y - this.pointerStartY) > 5) {
        this.dragMoved = true;
      }

      if (this.isInspecting) {
        // Rotate the 3D can 360° freely in inspection mode
        this.targetInspectRotY += deltaX * 0.009;
        this.targetInspectRotX += deltaY * 0.007;
        this.targetInspectRotX = Math.max(-0.6, Math.min(0.8, this.targetInspectRotX));
      } else {
        // Slide cans linearly from SIDE TO SIDE
        this.targetScroll -= deltaX * 0.0038;
      }

      this.lastPointerX = x;
      this.lastPointerY = y;
    };

    const onUp = (e) => {
      if (!this.isPointerDown) return;
      this.isPointerDown = false;
      this.canvas.classList.remove('grabbing');

      if (!this.dragMoved) {
        // It was a click / tap!
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((this.lastPointerX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((this.lastPointerY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.canObjects, true);

        if (intersects.length > 0) {
          let root = intersects[0].object;
          while (root.parent && root.parent !== this.carouselPivot) {
            root = root.parent;
          }
          if (root && root.userData.index !== undefined) {
            this.sound.playPop();
            this.inspectCan(root.userData.index);
          }
        }
      } else {
        if (!this.isInspecting) {
          // Snap horizontally to the closest can in linear track
          const snapped = Math.round(this.targetScroll);
          this.rotateToIndex(snapped);
        }
      }
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    // Buttons
    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => {
        this.sound.playWhoosh();
        this.prev();
      });
    }
    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => {
        this.sound.playWhoosh();
        this.next();
      });
    }
    if (this.btnCloseInspect) {
      this.btnCloseInspect.addEventListener('click', () => {
        this.sound.playWhoosh();
        this.closeInspection();
      });
    }
    if (this.btnCloseInspectIcon) {
      this.btnCloseInspectIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.sound.playWhoosh();
        this.closeInspection();
      });
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.sound.playWhoosh();
        this.prev();
      }
      if (e.key === 'ArrowRight') {
        this.sound.playWhoosh();
        this.next();
      }
      if (e.key === 'Escape' && this.isInspecting) {
        this.sound.playWhoosh();
        this.closeInspection();
      }
      if (e.key === 'Enter' && !this.isInspecting) {
        this.sound.playPop();
        this.inspectCan(this.selectedIndex);
      }
    });
  }

  rotateToIndex(index) {
    this.selectedIndex = ((index % this.totalCans) + this.totalCans) % this.totalCans;

    // Smooth shortest distance on linear wrapped scroll
    const current = this.targetScroll;
    const target = index;
    const diff = ((target - current + this.totalCans / 2) % this.totalCans + this.totalCans) % this.totalCans - (this.totalCans / 2);
    this.targetScroll = current + diff;

    this.updateIndicators();
    this.updateHUDContent(this.selectedIndex);
  }

  prev() {
    this.rotateToIndex(this.selectedIndex - 1);
  }

  next() {
    this.rotateToIndex(this.selectedIndex + 1);
  }

  inspectCan(index) {
    this.selectedIndex = index;
    this.rotateToIndex(index);
    this.isInspecting = true;
    document.body.classList.add('is-inspecting');

    // Start 100% front facing
    this.inspectRotX = 0.05;
    this.inspectRotY = 0;
    this.targetInspectRotX = 0.05;
    this.targetInspectRotY = 0;

    this.hud.classList.add('active');
    this.statusText.textContent = `Inspección 3D: ${CANS_DATA[index].title} • Arrastra para girar 360° o pulsa "Volver"`;
    this.updateHUDContent(index);
  }

  closeInspection() {
    this.isInspecting = false;
    document.body.classList.remove('is-inspecting');
    this.hud.classList.remove('active');
    this.statusText.textContent = 'Galería 3D • Pasa las latas de lado a lado o haz clic en una para abrirla';
    this.rotateToIndex(this.selectedIndex);
  }

  updateHUDContent(index) {
    const data = CANS_DATA[index];
    if (this.hudTitle) this.hudTitle.textContent = data.title;
    if (this.hudEyebrow) this.hudEyebrow.textContent = data.eyebrow;
    if (this.hudDescription) this.hudDescription.textContent = data.description;
    if (this.hudNote) this.hudNote.textContent = data.note;

    if (this.nutriCal) this.nutriCal.textContent = data.nutrition.cal;
    if (this.nutriSugar) this.nutriSugar.textContent = data.nutrition.sugar;
    if (this.nutriFat) this.nutriFat.textContent = data.nutrition.fat;
    if (this.nutriSodium) this.nutriSodium.textContent = data.nutrition.sodium;

    if (this.hudTags) {
      this.hudTags.innerHTML = data.tags.map(t => `<span class="tag-badge">${t}</span>`).join('');
    }

    document.documentElement.style.setProperty('--accent-primary', data.accentColor);
    document.documentElement.style.setProperty('--accent-glow', data.glowColor);

    if (this.rimLight) {
      this.rimLight.color.setHex(data.accentHex);
    }
  }

  updateIndicators() {
    const dots = this.indicatorsContainer.querySelectorAll('.indicator-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.selectedIndex);
    });
  }

  updateCanPositions(immediate = false) {
    const time = performance.now() * 0.0015;

    // Smooth lerp of horizontal linear scroll
    if (!this.isInspecting) {
      this.currentScroll += (this.targetScroll - this.currentScroll) * 0.12;
    }

    this.canObjects.forEach((can, i) => {
      if (this.isInspecting) {
        if (i === this.selectedIndex) {
          can.visible = true;
          // Responsive inspection positioning:
          // Desktop/PC: Can shifts smoothly to the LEFT (x = -1.65), card on the RIGHT.
          // Tablets: Can shifts to x = -1.35.
          // Mobile (iPhone / Android): Can shifts to upper half (y = 1.42), card on bottom.
          const w = window.innerWidth;
          let targetX = -1.65;
          let targetY = 0;
          let targetZ = 1.4;
          let targetScaleVal = 1.05;

          if (w < 640) {
            targetX = 0;
            targetY = 1.50;
            targetZ = 0.2;
            targetScaleVal = 0.75;
          } else if (w < 960) {
            targetX = -1.35;
            targetY = 0;
            targetZ = 1.2;
            targetScaleVal = 0.95;
          }

          const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
          const targetScale = new THREE.Vector3(targetScaleVal, targetScaleVal, targetScaleVal);
          
          if (immediate) {
            can.position.copy(targetPos);
            can.scale.copy(targetScale);
            can.rotation.set(this.inspectRotX, this.inspectRotY, 0);
          } else {
            can.position.lerp(targetPos, 0.1);
            can.scale.lerp(targetScale, 0.1);
            can.rotation.x += (this.targetInspectRotX - can.rotation.x) * 0.12;
            can.rotation.y += (this.targetInspectRotY - can.rotation.y) * 0.12;
            can.rotation.z += (0 - can.rotation.z) * 0.12;
          }
        } else {
          // Hide flanking cans during inspection mode
          can.visible = false;
        }
      } else {
        // LINEAR HORIZONTAL SIDE-TO-SIDE (DE LADO A LADO)
        can.visible = true;
        let offset = (i - this.currentScroll) % this.totalCans;
        if (offset < -this.totalCans / 2) offset += this.totalCans;
        if (offset > this.totalCans / 2) offset -= this.totalCans;

        const isMobile = window.innerWidth < 640;
        const currentSpacing = isMobile ? 2.5 : this.spacing;
        const x = offset * currentSpacing;
        const z = -Math.abs(offset) * (isMobile ? 0.55 : 0.75);
        const floatY = Math.sin(time + i * 1.5) * (isMobile ? 0.08 : 0.12);
        const baseScale = isMobile ? 0.85 : 1.0;
        const scale = Math.max(isMobile ? 0.55 : 0.65, baseScale - Math.abs(offset) * (isMobile ? 0.12 : 0.16));

        const targetPos = new THREE.Vector3(x, floatY, z);
        const targetScale = new THREE.Vector3(scale, scale, scale);

        // All cans face directly front towards camera with 0 rotation
        const targetRotY = 0;

        // If can wraps around modularly off-screen, snap immediately to prevent flying across viewport
        if (Math.abs(targetPos.x - can.position.x) > currentSpacing * 1.6) {
          can.position.copy(targetPos);
          can.scale.copy(targetScale);
          can.rotation.set(0, targetRotY, 0);
        } else if (immediate) {
          can.position.copy(targetPos);
          can.scale.copy(targetScale);
          can.rotation.set(0, targetRotY, 0);
        } else {
          can.position.lerp(targetPos, 0.12);
          can.scale.lerp(targetScale, 0.12);
          can.rotation.x += (0 - can.rotation.x) * 0.15;
          can.rotation.y += (targetRotY - can.rotation.y) * 0.15;
          can.rotation.z += (0 - can.rotation.z) * 0.15;
        }
        can.visible = true;
      }
    });

    // Keep pivot at 0 rotation since movement is linear along X axis
    this.carouselPivot.rotation.set(0, 0, 0);
  }

  animate() {
    this.updateCanPositions();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }
}

// Start experience when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Real3DCanExperience();
});
