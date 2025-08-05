console.log("Initializing Solar System Simulation");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 2, 1000);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(2, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(sun);
    console.log("Sun added to scene");

    const planetData = [
      { name: 'Mercury', size: 0.3, distance: 4, speed: 0.04, color: 0xaaaaaa },
      { name: 'Venus', size: 0.5, distance: 6, speed: 0.03, color: 0xffcc99 },
      { name: 'Earth', size: 0.6, distance: 8, speed: 0.02, color: 0x3399ff },
      { name: 'Mars', size: 0.5, distance: 10, speed: 0.015, color: 0xff3300 },
      { name: 'Jupiter', size: 1.2, distance: 13, speed: 0.01, color: 0xffcc66 },
      { name: 'Saturn', size: 1, distance: 16, speed: 0.008, color: 0xffe699 },
      { name: 'Uranus', size: 0.8, distance: 19, speed: 0.006, color: 0x66ffff },
      { name: 'Neptune', size: 0.8, distance: 22, speed: 0.005, color: 0x3333ff }
    ];

    const planets = [];
    const labels = [];
    const controls = document.getElementById('controls');

    planetData.forEach(data => {
      const planet = new THREE.Mesh(
        new THREE.SphereGeometry(data.size, 32, 32),
        new THREE.MeshStandardMaterial({ color: data.color })
      );
      scene.add(planet);
      planet.userData = { angle: Math.random() * Math.PI * 2, speed: data.speed, distance: data.distance };
      planets.push(planet);
      console.log(`Planet added: ${data.name}`);

      const orbit = new THREE.RingGeometry(data.distance - 0.02, data.distance + 0.02, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
      const orbitMesh = new THREE.Mesh(orbit, orbitMaterial);
      orbitMesh.rotation.x = Math.PI / 2;
      scene.add(orbitMesh);

      const label = document.createElement('div');
      label.className = 'planet-label';
      label.textContent = data.name;
      document.body.appendChild(label);
      labels.push(label);

      planet.userData.label = label;
      planet.userData.hover = false;

      planet.onBeforeRender = () => {
        const vector = planet.position.clone().project(camera);
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
      };

      const rangeLabel = document.createElement('label');
      rangeLabel.textContent = data.name + ' Speed';
      const input = document.createElement('input');
      input.type = 'range';
      input.min = 0;
      input.max = 0.1;
      input.step = 0.001;
      input.value = data.speed;
      input.oninput = () => {
        planet.userData.speed = parseFloat(input.value);
        console.log(`${data.name} speed updated to`, planet.userData.speed);
      };
      controls.appendChild(rangeLabel);
      controls.appendChild(input);
    });

    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'pauseBtn';
    pauseBtn.textContent = 'Pause';
    controls.appendChild(pauseBtn);

    let paused = false;
    pauseBtn.onclick = () => {
      paused = !paused;
      pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      console.log("Animation", paused ? "paused" : "resumed");
    };

    camera.position.z = 40;
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', e => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
      requestAnimationFrame(animate);
      if (!paused) {
        const delta = clock.getDelta();
        planets.forEach((p, i) => {
          p.userData.angle += p.userData.speed * delta * 60;
          p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
          p.position.z = Math.sin(p.userData.angle) * p.userData.distance;

          const vector = p.position.clone().project(camera);
          const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
          labels[i].style.left = `${x}px`;
          labels[i].style.top = `${y}px`;
        });

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);
        planets.forEach((planet, idx) => {
          const label = labels[idx];
          label.style.display = intersects.find(obj => obj.object === planet) ? 'block' : 'none';
        });
      }
      renderer.render(scene, camera);
    }

    animate();
 
