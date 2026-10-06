/**
 * ECOVERDE - SCRIPT PRINCIPAL CLIENT-SIDE
 * Funcionalidades: Geolocalização GPS, Sanitização contra XSS e Validações.
 */

document.addEventListener("DOMContentLoaded", () => {
  initMenuMobile();
  initGeolocalizacao();
  initFormValidations();
});

/* 1. NAVEGAÇÃO MOBILE RESPONSIVA */
function initMenuMobile() {
  const btnToggle = document.getElementById("btnMenuToggle");
  const navMenu = document.getElementById("navMenu");

  if (btnToggle && navMenu) {
    btnToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
}

/* 2. SANITIZAÇÃO CONTRA XSS (SEGURANÇA DE ENTRADAS) */
function sanitizarEntrada(texto) {
  if (typeof texto !== 'string') return '';
  return texto.trim().replace(/[&<>"']/g, (m) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

/* 3. GEOLOCALIZAÇÃO (REQUISITO 6) */
// Base de dados simulada dos EcoPontos cadastrados no sistema
const ecoPontosBD = [
  { id: 1, nome: "EcoPonto Central", lat: -20.5386, lng: -47.4008, endereco: "Rua do Meio Ambiente, 100", materiais: "Papel, Plástico, Vidro" },
  { id: 2, nome: "EcoPonto Zona Norte", lat: -20.5200, lng: -47.3900, endereco: "Av. das Árvores, 450", materiais: "Eletrônicos, Baterias" },
  { id: 3, nome: "EcoPonto Sul - Recicla", lat: -20.5500, lng: -47.4100, endereco: "Rua das Flores, 88", materiais: "Óleo Usado, Metal" }
];

function initGeolocalizacao() {
  const btnGeo = document.getElementById("btnGeolocalizacao");
  const statusGeo = document.getElementById("statusGeolocalizacao");

  if (!btnGeo) return;

  btnGeo.addEventListener("click", () => {
    if (!navigator.geolocation) {
      statusGeo.textContent = "Geolocalização não é suportada pelo seu navegador.";
      return;
    }

    statusGeo.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i> Obtendo sua localização...";

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const userLat = posicao.coords.latitude;
        const userLng = posicao.coords.longitude;

        statusGeo.textContent = `Localização encontrada! Latitude: ${userLat.toFixed(4)}, Longitude: ${userLng.toFixed(4)}`;
        exibirPontosProximos(userLat, userLng);
      },
      (erro) => {
        statusGeo.textContent = "Erro ao obter localização. Verifique as permissões do navegador.";
      }
    );
  });
}

// Fórmula de Haversine para calcular distância real em Quilômetros entre 2 pontos
function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function exibirPontosProximos(userLat, userLng) {
  const gridContainer = document.getElementById("gridEcoPontos");
  if (!gridContainer) return;

  gridContainer.innerHTML = "";

  const pontosComDistancia = ecoPontosBD.map(ponto => {
    const dist = calcularDistanciaKm(userLat, userLng, ponto.lat, ponto.lng);
    return { ...ponto, distancia: dist };
  }).sort((a, b) => a.distancia - b.distancia);

  pontosComDistancia.forEach(ponto => {
    const card = document.createElement("div");
    card.className = "card-form";
    card.innerHTML = `
      <h3><i class="fa-solid fa-dumpster-fire"></i> ${sanitizarEntrada(ponto.nome)}</h3>
      <p><strong>Distância:</strong> ${ponto.distancia.toFixed(2)} km de você</p>
      <p><strong>Endereço:</strong> ${sanitizarEntrada(ponto.endereco)}</p>
      <p><strong>Aceita:</strong> ${sanitizarEntrada(ponto.materiais)}</p>
    `;
    gridContainer.appendChild(card);
  });
}

/* 4. VALIDAÇÃO DE FORMULÁRIOS NO CLIENTE */
function initFormValidations() {
  const formCad = document.getElementById("formCadastro");
  if (formCad) {
    formCad.addEventListener("submit", (e) => {
      const email = document.getElementById("cadastroEmail").value;
      const senha = document.getElementById("cadastroSenha").value;

      if (!validarEmail(email)) {
        alert("Por favor, informe um e-mail válido.");
        e.preventDefault();
        return;
      }

      if (senha.length < 6) {
        alert("A senha deve possuir pelo menos 6 caracteres.");
        e.preventDefault();
      }
    });
  }
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
