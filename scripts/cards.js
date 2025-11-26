//Animación constante
const radius = 8; // radio de oscilación
const speed = 0.010; // velocidad base

//Animación ocasional de vibración
const vibrationDuration = 1000; // milisegundos
const vibrationIntensity = 20;  // píxeles
const vibrationInterval = 3000; // cada 3 segundos

const cards = document.querySelectorAll(".graduate-card");
const overlay = document.querySelector(".overlay");
const closeOverlayBtn = document.querySelector(".clone-close");

let focusedEl = null;

const states = [];

function doFakeFlipOnce(clone) {
  const flipInner = clone.querySelector(".flip-inner");
  if (clone.dataset.flipped === "true") return;

  let base = getComputedStyle(flipInner).transform;
  if (base === "none") {
    base = "rotateY(0deg)";
  }
  flipInner.animate(
    [
      { transform: base},
      { transform: "rotateY(40deg)" },
      { transform: base}
    ],
    { duration: 1200, easing: "ease-in-out" }
  );
}

function enableCardSwipeFlip(clone) {
  const flipInner = clone.querySelector(".flip-inner");
  let localFlipped = false;

  let startX = 0;
  let isDragging = false;
  const flipThreshold = 40;

  console.log("Card flipped:", localFlipped);

  const handleStart = e => {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleMove = e => {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diffX = currentX - startX;

    if (Math.abs(diffX) > flipThreshold) {

      isDragging = false;
      clone.style.transition = "transform 0.6s ease";

      localFlipped = !localFlipped;
      clone.dataset.flipped = localFlipped;

      console.log("Card flipped:", localFlipped);

      flipInner.style.transform = localFlipped
        ? "rotateY(180deg)"
        : "rotateY(0deg)";
    }
  };

  const handleEnd = () => { isDragging = false; };

  clone.addEventListener("mousedown", handleStart);
  clone.addEventListener("mousemove", handleMove);
  clone.addEventListener("mouseup", handleEnd);

  clone.addEventListener("touchstart", handleStart);
  clone.addEventListener("touchmove", handleMove);
  clone.addEventListener("touchend", handleEnd);
}

function showCenteredRippleOnClone(clone, size = 120) {
    if (!clone) return;

    // Encontrar el objetivo visual para centrar el ripple:
    // preferimos .face-card (la cara visible clonada), si no está usamos el clone completo.
    const target = clone.querySelector('.face-card') || clone;

    const cloneRect = clone.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    // Coordenadas del centro del target relativas al clone (en px)
    const centerX = (targetRect.left - cloneRect.left) + targetRect.width / 2;
    const centerY = (targetRect.top - cloneRect.top) + targetRect.height / 2;

    // --- RIPPLES BASE (gota principal) ---
    let ripple = clone.querySelector('.ripple');
    if (!ripple) {
        ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.position = 'absolute';
        ripple.style.pointerEvents = 'none';
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255,255,255,0.22)';
        ripple.style.backdropFilter = 'blur(1px)';
        ripple.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25), inset 0 2px 6px rgba(255,255,255,0.12)';
        clone.appendChild(ripple);
    }

    // posicionamos el elemento exactamente en el centro calculado
    ripple.style.left = `${centerX}px`;
    ripple.style.top = `${centerY}px`;
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.opacity = '0';

    const anim = ripple.animate(
        [
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
            { transform: 'translate(-50%, -50%) scale(1.3)', opacity: 0.95 },
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
        ],
        {
            duration: 700,
            easing: 'cubic-bezier(.2,1,.2,1)'
        }
    );

    anim.onfinish = () => {
        try { ripple.remove(); } catch (e) {}
    };

    // --- ONDAS (waves) ---
    const totalWaves = 3;  // puedes subirlo si quieres más impacto

    for (let i = 1; i <= totalWaves; i++) {
        const wave = document.createElement("div");
        wave.className = "ripple-wave";

        wave.style.position = "absolute";
        wave.style.left = `${centerX}px`;
        wave.style.top = `${centerY}px`;
        wave.style.transform = "translate(-50%, -50%) scale(0)";
        wave.style.opacity = "0.45";
        wave.style.pointerEvents = "none";
        wave.style.borderRadius = "50%";
        wave.style.boxSizing = "border-box";
        wave.style.border = "3px solid rgba(255,255,255,0.6)";

        // ondas ligeramente más grandes por índice
        const waveSize = size + i * 40;
        wave.style.width = `${waveSize}px`;
        wave.style.height = `${waveSize}px`;

        clone.appendChild(wave);

        // Duración y delay variable para escalonar un poco
        const duration = 1100 + i * 180;
        const delay = i * 120;

        const waveAnim = wave.animate(
            [
                { transform: "translate(-50%, -50%) scale(0.6)", opacity: 0.45 },
                { transform: "translate(-50%, -50%) scale(1.25)", opacity: 0 }
            ],
            {
                duration: duration,
                easing: "ease-out",
                delay: delay
            }
        );

        waveAnim.onfinish = () => {
            try { wave.remove(); } catch (e) {}
        };
    }
}


// asignamos un ángulo inicial y velocidad distinta a cada carta
cards.forEach((card, i) => {
  states.push({
    el: card,
    angle: Math.random() * Math.PI * 2,
    speed: speed + Math.random() * 0.002,
    offset: Math.random() * 1000,
  });
});


function animateSomeCards() {
  // Escoge una carta aleatoria
  const randomState = states[Math.floor(Math.random() * states.length)];
  const el = randomState.el;

  const startTime = Date.now();
  

  function vibrate() {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / vibrationDuration;

    if (elapsed > vibrationDuration) {
      el.style.transform = ""; // restaurar
      return;
    }

    const intensity = vibrationIntensity * (1 - progress);
    // Movimiento pseudoaleatorio (vibración)
    const offsetX = (Math.random() - 0.5) * 1 * intensity;
    const offsetY = (Math.random() - 0.5) * 1 * intensity;
    const rotate = (Math.random() - 0.5) * 20; // grados de rotación pequeños (±2° aprox.)

    const scale = getComputedStyle(el).getPropertyValue("--scale");
    el.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg) scale(${scale})`;

    requestAnimationFrame(vibrate); 
  }

  vibrate();
}


function animateConstantly() {
  const time = Date.now();

  states.forEach(state => {
    state.angle += state.speed;

    // trayectoria suave (ligeramente elíptica y con ruido temporal)
    const dx = radius * Math.cos(state.angle + Math.sin(time/2000 + state.offset));
    const dy = radius * Math.sin(state.angle + Math.cos(time/2500 + state.offset));

    const scale = getComputedStyle(state.el).getPropertyValue("--scale");

    state.el.style.transform = `translate(${dx}px, ${dy}px)  scale(${scale})`;
  });

  requestAnimationFrame(animateConstantly);
}

// Añadimos un listener para manejar los clicks en las cartas
document.addEventListener("DOMContentLoaded", () => {
  cards.forEach(card => {
    card.addEventListener("click", () => {

      if (focusedEl) return; // Si ya hay una carta enfocada, no hacer nada
      focusedEl = card;

      const rect = card.getBoundingClientRect();

      const clone = document.createElement("div");
      const flipInner = document.createElement("div");
      flipInner.classList.add("flip-inner");

      const faceCard = card.cloneNode(true);
      const backCard = document.createElement("div");

      flipInner.appendChild(faceCard);
      flipInner.appendChild(backCard);
      clone.appendChild(flipInner);

      clone.classList.add("clone-card");
      faceCard.classList.add("face-card");
      backCard.classList.add("back-card");

      enableCardSwipeFlip(clone);

      actualCardName = faceCard.querySelector(".graduate-name").innerText;
      backDescription = faceCard.querySelector(".graduate-desc").dataset.description || "Descripción no disponible.";

      //Back Card test
      backCard.innerHTML = `<h2>${actualCardName}</h2><p>${backDescription}</p>`;
      
      // Desenfocar el overlay
      if(!overlay.classList.contains("active")){
        overlay.classList.add("active"); 
      }

      clone.style.width = rect.width + "px";
      clone.style.height = rect.height + "px";
      clone.style.top = rect.top + "px";
      clone.style.left = rect.left + "px";
      clone.style.animation = "none";

      document.body.appendChild(clone);

      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          backCard.style.width = `${width}px`;
          backCard.style.height = `${height}px`;
        }
      });

      observer.observe(faceCard);

      requestAnimationFrame(() => {
        clone.style.top    = "5%";
        clone.style.left   = "50%";
        clone.style.transform = "translate(-50%, -50%) scale(1.5)";
        clone.style.width  = "50%";       // ocupa el 90% del ancho de la pantalla
        clone.style.maxWidth = "350px";   // límite en pantallas grandes
        clone.style.height = "auto";
      });

      clone.addEventListener("transitionend", (e) => {
        console.log("Transición terminada:", e.propertyName);
        if (e.propertyName === "transform") {
          clone.classList.add("ready");
          closeOverlayBtn.style.display = "block";
        }
      });

      setTimeout(() => {
        if (clone.dataset.flipped !== "true") {
          doFakeFlipOnce(clone);
        }
      }, 4000); // igual a la transición .6s

      setTimeout(() => {
        showCenteredRippleOnClone(clone, 180);
      }, 2000);

      // Al hacer click en el clon → cambiar imagen (De momento, luego inicia animación)
      clone.addEventListener("click", () => {

        const img = clone.querySelector("img");
        if (!img.dataset.original) 
        {
          img.dataset.original = img.src.split('/').pop(); // ejemplo: "JuanFique.png"
        }

        if (!clone.classList.contains("ready") || clone.classList.contains("playing") || clone.dataset.flipped === "true") return;
        clone.classList.add("playing");

        let imgState = img.classList.contains("Anim") ? "anim" : "static";
        let originalPath = img.dataset.original;
        let baseName = originalPath.substring(0, originalPath.lastIndexOf("."));
        let videoPath = "../resources/videos/" + baseName + "-Transicion.mp4"; // ejemplo: JuanFique-Anim.mp4
        let extension = ".png"   // ".jpg"
        let animPath = "../resources/anim/" + baseName + "-Anim" + extension;


        console.log("imgState:", imgState);
        if (imgState === "static")
        {
          // Crear elemento de video
          const video = document.createElement("video");
          video.src = videoPath;
          video.autoplay = true;
          video.muted = true;
          video.playsInline = true;
          video.preload = "auto"; // fuerza carga anticipada
          video.style.width = "100%";
          video.style.aspectRatio = 3/4;
          video.style.borderTopLeftRadius = "40px";
          video.style.borderTopRightRadius = "40px";
          video.style.objectFit = "cover";

          const label = img.parentElement.querySelector(".graduate-label"); // o el nombre real de tu div del label

          // Esperar a que tenga datos antes de mostrarlo
          video.addEventListener("loadeddata", () => {
            img.style.display = "none";
            img.parentElement.insertBefore(video, label);
            video.play(); // asegura reproducción
            // Precarga imagen animada
            img.src = "../resources/" + animPath;
            img.alt = baseName + " Anim";
          });

          

          // Cuando termina el video → imagen animada
          video.addEventListener("ended", () => {
            img.style.display = "";
            img.classList.add("Anim");
            video.remove();
            clone.classList.remove("playing"); // permitir nuevos clics
            setTimeout(() =>
            {
              doFakeFlipOnce(clone);
            }, 1000);
          });
        }
        else
        {
          img.src = "../resources/" + img.dataset.original;
          img.alt = img.dataset.original.split('.')[0];
          img.classList.remove("Anim");
          clone.classList.remove("playing"); // permitir nuevos clics
          setTimeout(() =>
          {
            doFakeFlipOnce(clone);
          }, 1000);
        }
        void img.offsetWidth;
      });
    });
  });
});

closeOverlayBtn.addEventListener("click", () => {
  overlay.classList.remove("active");

  const clone = document.querySelector(".clone-card");
  if (clone) clone.remove();

  focusedEl = null;
  closeOverlayBtn.style.display = "none";

  const video = document.querySelector(".clone-card video");
  if (video) {
  video.pause();
  video.remove();
  }
});

setInterval(animateSomeCards, vibrationInterval);
