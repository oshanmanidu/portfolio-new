import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  const nav = document.querySelector("nav");
  const header = document.querySelector(".header");
  const heroImg = document.querySelector(".hero-img");
  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("2d");

  const setCanvasSize = () => {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    context.scale(pixelRatio, pixelRatio);
  };

  setCanvasSize();

  const frameCount = 192;
  const currentFrame = (index) =>
    `/frames/frame_${(index + 1).toString().padStart(4, "0")}.jpg`;

  let images = [];
  let videoFrames = { frame: 0 };
  let imagesToLoad = frameCount;

  const onLoad = () => {
    imagesToLoad--;

    if (!imagesToLoad) {
      render();
      setupScrollTrigger();
    }
  };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.onload = onLoad;
    img.onerror = function () {
      onLoad.call(this);
    };
    img.src = currentFrame(i);
    images.push(img);
  }

  const render = () => {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    const img = images[videoFrames.frame];

    if (img && img.complete && img.naturalWidth > 0) {
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (imageAspect > canvasAspect) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imageAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imageAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      }

      context.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  };

  const setupScrollTrigger = () => {
    ScrollTrigger.create({
      trigger: ".hero",
      start: "top top",
      end: `+=${window.innerHeight * 7}px`,
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress;

        const animationProgress = Math.min(progress / 0.9, 1);
        const targetFrame = Math.round(animationProgress * (frameCount - 1));
        videoFrames.frame = targetFrame;
        render();

        // Nav Animation
        if (progress <= 0.1) {
          const navProgress = progress / 0.1;
          const opacity = 1 - navProgress;
          gsap.set(nav, { opacity });
        } else {
          gsap.set(nav, { opacity: 0 });
        }

        // Header Animation
        if (progress <= 0.25) {
          const zProgress = progress / 0.25;
          const translateZ = zProgress * 800; // Zoom in (positive translateZ)

          let opacity = 1;
          if (progress >= 0.1) {
            const fadeProgress = Math.min((progress - 0.1) / (0.25 - 0.1), 1);
            opacity = 1 - fadeProgress; // Fade out as it zooms in
          }

          gsap.set(header, {
            transform: `translate(-50%, -50%) translateZ(${translateZ}px)`,
            opacity,
          });
        } else {
          gsap.set(header, { opacity: 0 });
        }

        // Hero Image Animation
        if (progress < 0.6) {
          gsap.set(heroImg, {
            transform: "translateZ(1000px)",
            opacity: 0,
          });
        } else if (progress >= 0.6 && progress <= 0.9) {
          const imgProgress = (progress - 0.6) / 0.3;
          const translateZ = 1000 - imgProgress * 1000;

          let opacity = 0;
          if (progress <= 0.8) {
            const opacityProgress = (progress - 0.6) / 0.2;
            opacity = opacityProgress;
          } else {
            opacity = 1;
          }

          gsap.set(heroImg, {
            transform: `translateZ(${translateZ}px)`,
            opacity,
          });
        } else {
          gsap.set(heroImg, {
            transform: "translateZ(0px)",
            opacity: 1,
          });
        }
      },
    });
  };

  // =========================================================================
  // CYBERPUNK HUD SECTION ACTIONS
  // =========================================================================

  const glitchType = (element, targetText, speed = 25) => {
    let i = 0;
    const chars = "01$#@%&*+=?_XYZ";
    element.textContent = "";
    
    const interval = setInterval(() => {
      if (i < targetText.length) {
        const randomChar = chars[Math.floor(Math.random() * chars.length)];
        element.textContent = targetText.slice(0, i) + randomChar;
        i++;
      } else {
        element.textContent = targetText;
        clearInterval(interval);
      }
    }, speed);
  };

  const updateConnectingLines = () => {
    const svg = document.getElementById("network-svg");
    const container = document.getElementById("network-graph");
    if (!svg || !container) return;

    if (window.innerWidth <= 1024) return;

    const svgRect = svg.getBoundingClientRect();
    const profile = document.querySelector(".center-profile-hub");
    if (!profile) return;
    const profileRect = profile.getBoundingClientRect();
    const profileRadius = profileRect.width / 2;

    const startX = profileRect.left + profileRect.width / 2 - svgRect.left;
    const startY = profileRect.top + profileRect.height / 2 - svgRect.top;

    const cardsData = [
      { name: "photography", side: "left" },
      { name: "software", side: "left" },
      { name: "network", side: "left" },
      { name: "osh", side: "right" },
      { name: "eyelensia", side: "right" },
      { name: "cisco", side: "right" },
      { name: "cloud", side: "bottom" },
      { name: "solver", side: "bottom" },
      { name: "devops", side: "bottom" }
    ];

    cardsData.forEach((cardData) => {
      const cardEl = document.querySelector(`.card-${cardData.name}`);
      const lineEl = document.querySelector(`.conn-line.conn-${cardData.name}`);
      const pulseEl = document.querySelector(`.conn-pulse.conn-${cardData.name}`);
      if (!cardEl || !lineEl || !pulseEl) return;

      const cardRect = cardEl.getBoundingClientRect();
      let tx, ty;

      if (cardData.side === "left") {
        tx = cardRect.right - svgRect.left;
        ty = cardRect.top + cardRect.height / 2 - svgRect.top;
      } else if (cardData.side === "right") {
        tx = cardRect.left - svgRect.left;
        ty = cardRect.top + cardRect.height / 2 - svgRect.top;
      } else {
        tx = cardRect.left + cardRect.width / 2 - svgRect.left;
        ty = cardRect.top - svgRect.top;
      }

      const dx = tx - startX;
      const dy = ty - startY;
      const angle = Math.atan2(dy, dx);
      const sx = startX + Math.cos(angle) * (profileRadius - 10);
      const sy = startY + Math.sin(angle) * (profileRadius - 10);

      let dPath = "";
      if (cardData.side === "left" || cardData.side === "right") {
        const bendX1 = sx + (tx - sx) * 0.25;
        const bendX2 = sx + (tx - sx) * 0.65;
        dPath = `M ${sx} ${sy} L ${bendX1} ${sy} L ${bendX2} ${ty} L ${tx} ${ty}`;
      } else {
        const bendY1 = sy + (ty - sy) * 0.3;
        const bendY2 = sy + (ty - sy) * 0.65;
        dPath = `M ${sx} ${sy} L ${sx} ${bendY1} L ${tx} ${bendY2} L ${tx} ${ty}`;
      }

      lineEl.setAttribute("d", dPath);
      pulseEl.setAttribute("d", dPath);
    });
  };

  const initParticles = () => {
    const canvas = document.getElementById("hud-particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let particles = [];
    const count = 45;
    
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = Math.random() * 0.3 - 0.15;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
        ctx.fill();
      }
    }
    
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
    
    window.addEventListener("resize", resize);
  };

  const initCodeScroll = () => {
    const codeStream = document.getElementById("code-stream-content");
    if (!codeStream) return;
    let scrollOffset = 0;
    
    const codeText = codeStream.innerHTML;
    codeStream.innerHTML = codeText + "\n" + codeText;

    setInterval(() => {
      scrollOffset += 0.55;
      if (scrollOffset > codeStream.scrollHeight / 2) {
        scrollOffset = 0;
      }
      codeStream.parentElement.scrollTop = scrollOffset;
    }, 45);
  };

  const initTerminal = () => {
    const terminalLines = [
      { type: 'cmd', num: 1, text: 'whoami' },
      { type: 'resp', num: 1, text: 'oshanmanidu' },
      { type: 'cmd', num: 2, text: 'skills --list' },
      { type: 'resp', num: 2, text: 'loading... success.' },
      { type: 'cmd', num: 3, text: 'passion --status' },
      { type: 'resp', num: 3, text: '100% max energy' },
      { type: 'cmd', num: 4, text: 'mission' },
      { type: 'resp', num: 4, text: 'create | inspire | solve | innovate' }
    ];

    const typeTerminalSequence = () => {
      let step = 0;
      
      const typeNext = () => {
        if (step >= terminalLines.length) {
          setTimeout(() => {
            for (let i = 1; i <= 4; i++) {
              const cmdEl = document.querySelector(`.typed-cmd-${i}`);
              const respEl = document.querySelector(`.response-${i}`);
              if (cmdEl) cmdEl.textContent = "";
              if (respEl) respEl.textContent = "";
            }
            step = 0;
            typeNext();
          }, 6000);
          return;
        }

        const line = terminalLines[step];
        if (line.type === 'cmd') {
          const el = document.querySelector(`.typed-cmd-${line.num}`);
          if (el) {
            el.innerHTML = '<span class="cursor-blink"></span>';
            let charIndex = 0;
            const textToType = line.text;
            
            const typingInterval = setInterval(() => {
              if (charIndex < textToType.length) {
                el.innerHTML = textToType.slice(0, charIndex + 1) + '<span class="cursor-blink"></span>';
                charIndex++;
              } else {
                clearInterval(typingInterval);
                el.innerHTML = textToType;
                step++;
                setTimeout(typeNext, 400);
              }
            }, 60);
          } else {
            step++;
            typeNext();
          }
        } else {
          const el = document.querySelector(`.response-${line.num}`);
          if (el) {
            setTimeout(() => {
              el.textContent = line.text;
              step++;
              setTimeout(typeNext, 600);
            }, 250);
          } else {
            step++;
            typeNext();
          }
        }
      };

      typeNext();
    };

    typeTerminalSequence();
  };

  const init3DTilt = () => {
    const cards = document.querySelectorAll(".node-card");
    cards.forEach(card => {
      card.addEventListener("mousemove", (e) => {
        if (window.innerWidth <= 1024) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const angleX = (yc - y) / 8;
        const angleY = (x - xc) / 8;
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.03) translateZ(10px)`;
        
        const nodeName = card.getAttribute("data-node");
        const line = document.querySelector(`.conn-line.conn-${nodeName}`);
        const pulse = document.querySelector(`.conn-pulse.conn-${nodeName}`);
        if (line) {
          line.style.strokeWidth = "3px";
          line.style.opacity = "1";
        }
        if (pulse) {
          pulse.style.strokeWidth = "4px";
          pulse.style.opacity = "1";
        }
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)`;
        const nodeName = card.getAttribute("data-node");
        const line = document.querySelector(`.conn-line.conn-${nodeName}`);
        const pulse = document.querySelector(`.conn-pulse.conn-${nodeName}`);
        if (line) {
          line.style.strokeWidth = "1.5px";
          line.style.opacity = "0.7";
        }
        if (pulse) {
          pulse.style.strokeWidth = "2.5px";
          pulse.style.opacity = "0.85";
        }
      });
    });
    
    const hudSection = document.querySelector(".cyberpunk-hud-section");
    const wrapper = document.querySelector(".hud-grid-wrapper");
    if (hudSection && wrapper) {
      hudSection.addEventListener("mousemove", (e) => {
        if (window.innerWidth <= 1024) return;
        const rect = hudSection.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(wrapper, {
          rotateY: x * 0.003,
          rotateX: -y * 0.003,
          duration: 1.2,
          ease: "power1.out"
        });
      });
      
      hudSection.addEventListener("mouseleave", () => {
        gsap.to(wrapper, {
          rotateY: 0,
          rotateX: 0,
          duration: 1.2,
          ease: "power1.out"
        });
      });
    }
  };

  const setupHUDScrollTrigger = () => {
    ScrollTrigger.create({
      trigger: "#about-hud",
      start: "top 70%",
      once: true,
      onEnter: () => {
        initParticles();
        initCodeScroll();
        initTerminal();
        init3DTilt();

        const hudTimeline = gsap.timeline();
        
        hudTimeline.to(".hud-bg-grid", { opacity: 0.8, duration: 0.8 });
        hudTimeline.to(".hud-bg-scanlines", { opacity: 0.15, duration: 0.8 }, "-=0.6");
        hudTimeline.to(".hud-bg-radar", { opacity: 1, duration: 0.8 }, "-=0.6");
        hudTimeline.to(".hud-outer-frame", { opacity: 1, duration: 0.6 }, "-=0.4");
        
        hudTimeline.to(".center-profile-hub", { 
          scale: 1, 
          duration: 0.8, 
          ease: "back.out(1.4)" 
        }, "-=0.3");

        hudTimeline.add(() => {
          updateConnectingLines();
          
          const lines = document.querySelectorAll(".conn-line");
          const pulses = document.querySelectorAll(".conn-pulse");
          
          lines.forEach((line) => {
            const length = line.getTotalLength() || 400;
            line.style.strokeDasharray = length;
            line.style.strokeDashoffset = length;
            line.style.opacity = 0.7;
            
            gsap.to(line, {
              strokeDashoffset: 0,
              duration: 1.2,
              ease: "power2.out"
            });
          });

          setTimeout(() => {
            pulses.forEach(pulse => {
              pulse.classList.add("active");
            });
          }, 1000);
        }, "-=0.3");

        const cardsList = [
          "photography", "software", "network", 
          "osh", "eyelensia", "cisco", 
          "cloud", "solver", "devops"
        ];

        cardsList.forEach((nodeName, index) => {
          const card = document.querySelector(`.card-${nodeName}`);
          const rect = card.querySelector(".card-border-rect");
          
          hudTimeline.add(() => {
            if (rect) {
              rect.style.strokeDasharray = 680;
              rect.style.strokeDashoffset = 680;
              gsap.to(rect, {
                strokeDashoffset: 0,
                duration: 0.8,
                ease: "power2.inOut"
              });
            }

            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.45,
              ease: "power1.out"
            });

            const titleEl = card.querySelector(".card-title h3");
            if (titleEl) {
              const originalText = titleEl.textContent;
              glitchType(titleEl, originalText, 18);
            }
            
            const listItems = card.querySelectorAll(".card-body-area li");
            gsap.fromTo(listItems, 
              { opacity: 0, x: -6 },
              { opacity: 0.85, x: 0, stagger: 0.1, duration: 0.35, ease: "power1.out", delay: 0.15 }
            );
          }, `-=${index === 0 ? 0.2 : 0.6}`);
        });

        hudTimeline.add(() => {
          const rows = document.querySelectorAll(".matrix-row");
          rows.forEach((row) => {
            const bar = row.querySelector(".matrix-bar");
            const targetWidth = row.getAttribute("data-percent") || "100";
            gsap.to(bar, {
              width: targetWidth + "%",
              duration: 1.4,
              ease: "power2.out"
            });
          });

          const scanRows = document.querySelectorAll(".scan-row");
          scanRows.forEach((scanRow, scanIdx) => {
            setTimeout(() => {
              const statusEl = scanRow.querySelector(".scan-status");
              if (statusEl) {
                statusEl.textContent = "[ OK ]";
                statusEl.classList.remove("pending");
                statusEl.classList.add("ok");
              }
            }, scanIdx * 250);
          });

          gsap.to(".node-card", {
            y: "+=5",
            duration: 2.8,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: {
              each: 0.25,
              from: "random"
            }
          });
        }, "-=0.2");

        hudTimeline.to(".hud-panel", {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out"
        }, "-=1.0");
      }
    });
  };

  setupHUDScrollTrigger();

  window.addEventListener("resize", () => {
    setCanvasSize();
    render();
    ScrollTrigger.refresh();
    updateConnectingLines();
  });
});


