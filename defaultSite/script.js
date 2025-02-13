document.addEventListener("DOMContentLoaded", function () {
    const particleContainer = document.getElementById("particles");

    function createParticle() {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = Math.random() * 100 + "vh";
        particle.style.animationDuration = Math.random() * 3 + 2 + "s";
        particle.style.opacity = Math.random();
        particleContainer.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 5000);
    }

    setInterval(createParticle, 200);
});

// Add Particles to CSS
const style = document.createElement("style");
style.innerHTML = `
    .particle {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        animation: floatUp 5s linear infinite;
    }

    @keyframes floatUp {
        from { transform: translateY(0px) scale(1); }
        to { transform: translateY(-100vh) scale(0.5); opacity: 0; }
    }
`;
document.head.appendChild(style);
