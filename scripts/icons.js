const currentPage = document.body.dataset.page;

const shareIconButton = document.querySelector(".icon-button.share");
const downloadIconButton = document.querySelector(".icon-button.download");
const phoneIconButton = document.querySelector(".icon-button.phone");
const pcIconButton = document.querySelector(".icon-button.pc");

const mobileUrl = "/templates/mobile.html";
const desktopUrl = "/templates/Escritorio.html";

shareIconButton.addEventListener("click", async () => {
    const shareData = {
        title: document.title,
        text: "¿Has visto estos increíbles graduados de Diseño 3? ¡Echa un vistazo!",
        url: window.location.href
    };

    if (navigator.share) {
        try {
        await navigator.share(shareData);
    } catch (err) {
        console.log("Compartir cancelado.");
    }
    } else {
        // Fallback si no soporta Web Share API
        await navigator.clipboard.writeText(shareData.url);
        alert("Navegador no compatible. Enlace copiado al portapapeles.");
    }
});

if(currentPage === "desktop")
{
    phoneIconButton.addEventListener("click", () => {
        window.location.href = mobileUrl;
    });
}
else if(currentPage === "mobile")
{
    pcIconButton.addEventListener("click", () => {
        window.location.href = desktopUrl;
    });
}

