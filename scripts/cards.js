const radius = 8; // radio de oscilación
const speed = 0.010; // velocidad base
const cards = document.querySelectorAll(".graduate-card");
const overlay = document.querySelector(".overlay");
const closeOverlayBtn = document.querySelector(".clone-close");

let focusedEl = null;

const states = [];

// asignamos un ángulo inicial y velocidad distinta a cada carta
cards.forEach((card, i) => {
  states.push({
    el: card,
    angle: Math.random() * Math.PI * 2,
    speed: speed + Math.random() * 0.002, // velocidad distinta
    offset: Math.random() * 1000 // desfase para variar trayectorias
  });
});

function animate() {
  const time = Date.now();

  states.forEach(state => {
    state.angle += state.speed;

    // trayectoria suave (ligeramente elíptica y con ruido temporal)
    const dx = radius * Math.cos(state.angle + Math.sin(time/2000 + state.offset));
    const dy = radius * Math.sin(state.angle + Math.cos(time/2500 + state.offset));

    const scale = getComputedStyle(state.el).getPropertyValue("--scale");

    state.el.style.transform = `translate(${dx}px, ${dy}px)  scale(${scale})`;
  });

  requestAnimationFrame(animate);
}

// Añadimos un listener para manejar los clicks en las cartas
document.addEventListener("DOMContentLoaded", () => {
  cards.forEach(card => {
    card.addEventListener("click", () => {

      if (focusedEl) return; // Si ya hay una carta enfocada, no hacer nada
      focusedEl = card;

      const rect = card.getBoundingClientRect();

      const clone = card.cloneNode(true);
      clone.classList.add("clone-card");
      
      // Desenfocar el overlay
      if(!overlay.classList.contains("active")){
        overlay.classList.add("active"); 
      }


      clone.style.width = rect.width + "px";
      clone.style.height = rect.height + "px";
      clone.style.top = rect.top + "px";
      clone.style.left = rect.left + "px";


      document.body.appendChild(clone);

      requestAnimationFrame(() => {
        clone.style.top    = "50%";
        clone.style.left   = "50%";
        clone.style.transform = "translate(-50%, -50%) scale(1.5)";
        clone.style.width  = "50%";       // ocupa el 90% del ancho de la pantalla
        clone.style.maxWidth = "350px";   // límite en pantallas grandes
        clone.style.height = "auto";      // altura automática para mantener la proporción
      });

      clone.addEventListener("transitionend", (e) => {
        if (e.propertyName === "transform") {
          clone.classList.add("ready");
          closeOverlayBtn.style.display = "block";
        }
      });

      // Al hacer click en el clon → cambiar imagen (De momento, luego inicia animación)
      clone.addEventListener("click", () => {

        const img = clone.querySelector("img");
        if (!img.dataset.original) 
        {
          img.dataset.original = img.src.split('/').pop(); // ejemplo: "JuanFique.png"
        }

        if (!clone.classList.contains("ready") || clone.classList.contains("playing")) return;
        clone.classList.add("playing");

        let imgState = img.classList.contains("Anim") ? "anim" : "static";
        let originalPath = img.dataset.original;
        let baseName = originalPath.substring(0, originalPath.lastIndexOf("."));
        let videoPath = "../resources/videos/" + baseName + "-Transicion.mp4"; // ejemplo: JuanFique-Anim.mp4
        let extension = ".png"   // ".jpg"
        let animPath = baseName + "-Anim" + extension;


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
          });

          // Cuando termina el video → imagen animada
          video.addEventListener("ended", () => {
            video.remove();
            img.style.display = "";
            img.src = "../resources/" + animPath;
            img.alt = baseName + " Anim";
            img.classList.add("Anim");
            clone.classList.remove("playing"); // permitir nuevos clics
          });
        }
        else
        {
          img.src = "../resources/" + img.dataset.original;
          img.alt = img.dataset.original.split('.')[0];
          img.classList.remove("Anim");
          clone.classList.remove("playing"); // permitir nuevos clics
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

animate(); //Anima las cartas