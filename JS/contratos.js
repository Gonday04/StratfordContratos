

/* ── ESTADO GLOBAL ── */
let sigSigned = false;
let sigDataURL = '';
let contractSaved = false;
let savedData = {};

/* ── SIGNATURE PAD (variables) ── */
let sigCtx = null;
let sigDrawing = false;
let sigLastX = 0;
let sigLastY = 0;
let sigListenersAdded = false;

let vacanteSeleccionada = "";
let currentModalidad = "social";

/* ════════════════════════
   AUTENTICACIÓN Y FLUJO
════════════════════════ */


function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  const err = document.getElementById('login-error');
  const modalidad = document.querySelector('input[name="modalidad"]:checked').value;

  currentModalidad = modalidad; // Guardamos la modalidad globalmente

  if (!email || !pass) {
    if (err) {
      err.style.display = 'block';
      err.textContent = 'Por favor ingresa correo y contraseña.';
    }
    return;
  }
  if (err) err.style.display = 'none';

  const credenciales = { correo: email, contrasena: pass };

  fetch('http://localhost:5084/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales)
  })
    .then(response => response.json())
    .then(data => {
      if (data.mensaje && data.mensaje.includes("incorrectos")) {
        if (err) {
          err.style.display = 'block';
          err.textContent = data.mensaje;
        }
      } else {
        localStorage.setItem('usuarioNombre', data.nombreCompleto);
        localStorage.setItem('usuarioCorreo', email);
        localStorage.setItem('usuarioCarrera', data.carrera);

        actualizarNombresUI();

        if (currentModalidad === 'laboral') {
          goTo('screen-vacantes');
        } else {
          const tipoContrato = document.getElementById('tipo-contrato-text');
          if (tipoContrato) tipoContrato.textContent = "Servicio Social / Prácticas";
          goStep(1);
          goTo('screen-contract');
        }
      }
    })
    .catch(error => {
      if (err) {
        err.style.display = 'block';
        err.textContent = "Error al conectar con el servidor.";
      }
    });
}

function selectVacante(titulo) {
  vacanteSeleccionada = titulo;
  currentModalidad = 'laboral'; // Por seguridad confirmamos que es laboral

  const tipoContrato = document.getElementById('tipo-contrato-text');
  if (tipoContrato) {
    tipoContrato.textContent = "Mercado Laboral - " + titulo;
  }

  // Pre-llenamos el campo de puesto en el formulario laboral
  const fPuesto = document.getElementById('fl-puesto');
  if (fPuesto) fPuesto.value = titulo;

  goStep(1);
  goTo('screen-contract');
}

function doLogout() {
  location.reload();
}


function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  window.scrollTo(0, 0);
  if (id === 'screen-mycontracts') renderMyContracts();
}

function goStep(n) {
  const steps = [1, 2, 3, 4];
  steps.forEach(i => {
    const el = document.getElementById('step' + i);
    const tab = document.getElementById('step' + i + '-tab');
    if (el) el.style.display = (i === n) ? 'block' : 'none';
    if (tab) {
      tab.classList.remove('active', 'done');
      if (i === n) tab.classList.add('active');
      else if (i < n) tab.classList.add('done');
    }
  });

  // Mostrar el formulario correcto en el paso 1
  if (n === 1) {
    document.getElementById('form-social').style.display = (currentModalidad === 'social') ? 'grid' : 'none';
    document.getElementById('form-laboral').style.display = (currentModalidad === 'laboral') ? 'grid' : 'none';
  }

  window.scrollTo(0, 0);
  if (n === 2) renderPreview();
  if (n === 3) setTimeout(initSigPad, 150);
}

function getFormData() {
  if (currentModalidad === 'laboral') {
    return {
      tipo: 'laboral',
      nombre: document.getElementById('fl-nombre')?.value || '_______________',
      ciudad: document.getElementById('fl-ciudad')?.value || '_______________',
      fecha: formatDate(document.getElementById('fl-fecha')?.value)
    };
  } else {
    return {
      tipo: 'social',
      nombre: document.getElementById('f-nombre')?.value || '_______________',
      fecha: formatDate(document.getElementById('f-fecha')?.value),
      carrera: document.getElementById('f-carrera')?.value || '_______________',
      escuela: document.getElementById('f-escuela')?.value || '_______________',
      matricula: document.getElementById('f-matricula')?.value || '_______________',
      correo: document.getElementById('f-correo')?.value || '_______________'
    };
  }
}

function buildContractHTML(d, sigImg) {
  if (d.tipo === 'laboral') {
    // --- CONTRATO LABORAL ---
    return `
      <div class="doc-header">
        <div style="font-size:11px;color:#666;margin-bottom:8px;text-align:center;">
          ACADEMIA ST LERNEN S.C. | Av. Ángel de la Independencia #36, col. Metropolitana 2da sección,
          Ciudad Nezahualcóyotl, Estado de México CP. 57740
        </div>
        <h2>CONTRATO INDIVIDUAL DE TRABAJO</h2>
        <p style="font-size:13px; font-weight:bold; margin-top:8px;">MODALIDAD: CAPACITACIÓN INICIAL – MEDIO TIEMPO</p>
      </div>
   
      <div class="doc-body">
        <p>En la Ciudad de <strong>${d.ciudad}</strong>, a <strong>${d.fecha}</strong>, comparecen por una parte <strong>ACADEMIA ST LERNEN S.C.</strong>, con domicilio en Av. Ángel de la Independencia #36, Col. Metropolitana 2ª Sección, Ciudad Nezahualcóyotl, Estado de México, CP 57740, a quien en lo sucesivo se le denominará “EL PATRÓN”, y por la otra <strong>${d.nombre}</strong>, a quien se denominará “EL TRABAJADOR”, al tenor de las siguientes:</p>
   
        <p class="doc-section-title">DECLARACIONES</p>
        <p><strong>I. Declara EL PATRÓN:</strong><br>Que se dedica a actividades educativas y de formación académica y que requiere personal para apoyo administrativo y de gestión escolar.</p>
        <p><strong>II. Declara EL TRABAJADOR:</strong><br>Que cuenta con conocimientos básicos y desea adquirir experiencia y capacitación para desempeñar funciones administrativas y de gestión escolar.</p>
   
        <p class="doc-section-title">CLÁUSULAS</p>
        <p><strong>PRIMERA. Tipo de contrato</strong><br>El presente contrato se celebra bajo la modalidad de Contrato de Capacitación Inicial conforme al artículo 39-B de la Ley Federal del Trabajo.</p>
        
        <p><strong>SEGUNDA. Puesto</strong><br>EL TRABAJADOR desempeñará el puesto de <strong>Asistente Administrativo y de Gestión Escolar</strong>.</p>
        
        <p><strong>TERCERA. Actividades</strong><br>Atención a alumnos y padres de familia, control de inscripciones, pagos y expedientes, organización de horarios y grupos, registro de asistencias y apoyo administrativo general.</p>
        
        <p><strong>CUARTA. Jornada</strong><br>Medio tiempo: __________________________________.</p>
        
        <p><strong>QUINTA. Lugar de trabajo</strong><br>Instalaciones de ACADEMIA ST LERNEN S.C. y modalidad en línea cuando se requiera.</p>
        
        <p><strong>SEXTA. Duración</strong><br>Hasta 3 meses como periodo de capacitación inicial.</p>
        
        <p><strong>SÉPTIMA. Salario</strong><br>$ __________________________________.</p>
        
        <p><strong>OCTAVA. Prestaciones</strong><br>Las que correspondan conforme a la Ley Federal del Trabajo y Ley del Seguro Social, de manera proporcional.</p>
        <p><strong>NOVENA. Capacitación</strong><br>EL PATRÓN brindará la capacitación necesaria.</p>
        <p><strong>DÉCIMA. Obligaciones</strong><br>Cumplir horario, funciones, reglamentos y cuidar bienes e información.</p>
        <p><strong>DÉCIMA PRIMERA. Rescisión</strong><br>Conforme al artículo 47 de la Ley Federal del Trabajo y artículo 39-B.</p>
        
        <p style="margin-top:20px; text-align:justify;">Leído que fue el presente contrato y enteradas las partes, lo firman de conformidad.</p>
   
        <div class="firma-area">
          <div class="firma-box">
            <div style="height:70px;"></div>
            <div class="firma-line"></div>
            <p>Ing. Viridiana Reynoso Sánchez</p>
            <small>EL PATRÓN</small>
          </div>
          <div class="firma-box">
            <div style="height:70px;position:relative;">
              ${sigImg ? `<img src="${sigImg}" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);max-width:200px;max-height:65px;">` : ''}
            </div>
            <div class="firma-line"></div>
            <p>${d.nombre}</p>
            <small>EL TRABAJADOR</small>
          </div>
        </div>
      </div>`;
  } else {
    return `
      <div class="doc-header">
        <div style="font-size:11px;color:#666;margin-bottom:8px">
          ACADEMIA ST LERNEN S.C. | Av. Ángel de la Independencia #36, col. Metropolitana 2da sección,
          Ciudad Nezahualcóyotl, Estado de México CP. 57740
        </div>
        <h2>CONTRATO DE PRESTACIÓN DE SERVICIOS</h2>
        <p style="font-size:12px;margin-top:8px">Fecha ${d.fecha}</p>
      </div>
   
      <div class="doc-body">
        <p><strong>PRESENTE</strong></p>
   
        <p>Este documento denominado como "Contrato de prestación de Servicios" que celebra por una parte la Academia ST. Lernen,
        En adelante nombrado como "Prestador" y por la otra parte el/la <strong>${d.nombre}</strong>
        de la carrera <strong>${d.carrera}</strong> de la Escuela <strong>${d.escuela}</strong>
        con Número de identificación <strong>${d.matricula}</strong> denominado en lo sucesivo el
        "Practicante/Trabajador", Al tenor de las siguientes:</p>
   
        <p>La Academia <strong>ST Lernen</strong> Ubicada en
        <strong>Av. Ángel de la independencia #36, col. Metropolitana 2da sección,
        Ciudad Nezahualcóyotl Estado de México CP. 57740</strong>
        con un número de teléfono <strong>56 10 97 64 82</strong> y un correo de contacto:
        <strong>academiastratfordlernen@gmail.com</strong></p>
   
        <p>Acepto yo "Practicante/Trabajador" que dentro de las instalaciones de ST Lernen Academy tendré un
        periodo de prestación previamente definido por la Institución de procedencia, acorde a dicho
        periodo de prestación Acepto que mis actividades serán definidas por la Academia ST Lernen
        en donde dichas actividades y sus respectivas reglas son:</p>
   
        <p class="doc-section-title">Actividades y reglas:</p>
        <ul>
          <li>Cumplir con el horario establecido</li>
          <li>1 retardo injustificado equivaldría a la baja del programa</li>
          <li>1 falta injustificada equivaldría a la baja del programa</li>
          <li>Falta de compromiso equivaldría a la baja del programa</li>
          <li>Las sesiones de capacitación son obligatorias</li>
          <li>El horario se programa de acuerdo al horario laboral/escolar enviado</li>
          <li>El horario que se programe en fin de semana es obligatorio
              (restricciones al correo: academiastratfordlernen@gmail.com)</li>
          <li>Las restricciones laborales únicamente son aceptadas para fines de semana</li>
          <li>Cumplir de la mejor manera las actividades asignadas de manera presencial como en línea</li>
          <li>Cumplir con los proyectos asignados en tiempo y forma</li>
          <li>En caso de dar asesoramiento y/o clases, reportar el avance de manera diaria</li>
        </ul>
   
        <p class="doc-section-title">Compromisos de Stratford Lernen Academy:</p>
        <ol style="margin-left:20px">
          <li>Hacer conocer y cumplir con el presente contrato</li>
          <li>No recibir a ningún prestador sin carta de presentación</li>
          <li>No recibir a ningún prestador sin haber firmado este contrato</li>
          <li>Contribuir a la formación humanística, académica y profesional del estudiante</li>
          <li>Ubicar al estudiante en temas relacionados con su profesión</li>
          <li>Brindar el ambiente y espacio adecuado para el desarrollo de actividades</li>
          <li>Contar con un responsable para la operación eficiente del programa</li>
        </ol>
   
        <div class="firma-area">
          <div class="firma-box">
            <div style="height:70px;"></div>
            <div class="firma-line"></div>
            <p>Ing. Viridiana Reynoso Sánchez</p>
            <small>ADMINISTRADOR GENERAL</small>
          </div>
          <div class="firma-box">
            <div style="height:70px;position:relative;">
              ${sigImg ? `<img src="${sigImg}" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);max-width:200px;max-height:65px;">` : ''}
            </div>
            <div class="firma-line"></div>
            <p>${d.nombre}</p>
            <small>NOMBRE Y FIRMA</small>
          </div>
        </div>
      </div>`;
  }
}

function formatDate(val) {
  if (!val) return '__ de ______ del 20__';
  const [y, m, d] = val.split('-');
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} del ${y}`;
}

function renderPreview() {
  const d = getFormData();
  savedData = d;
  const previewDiv = document.getElementById('preview-doc-content');
  if (previewDiv) previewDiv.innerHTML = buildContractHTML(d, null);
}



/* ════════════════════════
   PAD DE FIRMA
════════════════════════ */
function initSigPad() {
  const canvas = document.getElementById('sig-canvas');
  if (!canvas) return;

  /* Medir el tamaño real ya renderizado */
  const rect = canvas.getBoundingClientRect();
  const w = Math.round(rect.width) || 600;
  const h = 160;

  canvas.width = w;
  canvas.height = h;

  sigCtx = canvas.getContext('2d');
  sigCtx.strokeStyle = '#111';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';
  sigCtx.lineJoin = 'round';
  sigCtx.fillStyle = '#fafafa';
  sigCtx.fillRect(0, 0, w, h);

  /* Agregar listeners solo una vez */
  if (sigListenersAdded) return;
  sigListenersAdded = true;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const scaleX = canvas.width / r.width;
    const scaleY = canvas.height / r.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - r.left) * scaleX,
        y: (e.touches[0].clientY - r.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - r.left) * scaleX,
      y: (e.clientY - r.top) * scaleY,
    };
  }

  function onStart(e) {
    e.preventDefault();
    sigDrawing = true;
    const p = getPos(e);
    sigLastX = p.x;
    sigLastY = p.y;
    /* Dibujar punto inicial para clics sin arrastre */
    sigCtx.beginPath();
    sigCtx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
    sigCtx.fillStyle = '#111';
    sigCtx.fill();
  }

  function onMove(e) {
    e.preventDefault();
    if (!sigDrawing) return;
    const p = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(sigLastX, sigLastY);
    sigCtx.lineTo(p.x, p.y);
    sigCtx.stroke();
    sigLastX = p.x;
    sigLastY = p.y;
  }

  function onStop() {
    if (!sigDrawing) return;
    sigDrawing = false;
    setSigned();
  }

  canvas.addEventListener('mousedown', onStart);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseup', onStop);
  canvas.addEventListener('mouseleave', onStop);
  canvas.addEventListener('touchstart', onStart, { passive: false });
  canvas.addEventListener('touchmove', onMove, { passive: false });
  canvas.addEventListener('touchend', onStop);
}

function setSigned() {
  sigSigned = true;
  const canvas = document.getElementById('sig-canvas');
  canvas.classList.add('signed');
  document.getElementById('sig-status').textContent = '✓ Firma registrada';
  document.getElementById('sig-status').className = 'sig-status ok';
  const btn = document.getElementById('btn-finish');
  btn.disabled = false;
  btn.style.opacity = '1';
  sigDataURL = canvas.toDataURL('image/png');
}

function clearSig() {
  const canvas = document.getElementById('sig-canvas');
  if (sigCtx) {
    sigCtx.fillStyle = '#fafafa';
    sigCtx.fillRect(0, 0, canvas.width, canvas.height);
  }
  canvas.classList.remove('signed');
  sigSigned = false;
  sigDataURL = '';
  document.getElementById('sig-status').textContent = 'Aún no has firmado.';
  document.getElementById('sig-status').className = 'sig-status';
  const btn = document.getElementById('btn-finish');
  btn.disabled = true;
  btn.style.opacity = '0.5';
}

/* ════════════════════════
   FINALIZAR 
════════════════════════ */
function finishContract() {
  if (!sigSigned) {
    showToast('Por favor firma antes de continuar.');
    return;
  }
  const canvas = document.getElementById('sig-canvas');
  sigDataURL = canvas.toDataURL('image/png');
  contractSaved = true;
  savedData = getFormData();
  savedData.sigImg = sigDataURL;
  goStep(4);
  showToast('¡Contrato firmado y guardado!');
}


/* ════════════════════════
   MIS CONTRATOS
════════════════════════ */
function renderMyContracts() {
  const badge = document.getElementById('mycontract-badge');
  const body  = document.getElementById('mycontract-body');
 
  if (contractSaved && savedData.nombre) {
    badge.className   = 'badge badge-green';
    badge.textContent = 'Firmado ✓';
    
    // Si el contrato es LABORAL (Oculta los campos de escuela, carrera, etc.)
    if (savedData.tipo === 'laboral') {
      body.innerHTML = `
        <div style="margin-bottom:14px">
          <div class="readonly-label">Nombre</div>
          <div class="readonly-field">${savedData.nombre}</div>
          <div class="readonly-label">Ciudad de firma</div>
          <div class="readonly-field">${savedData.ciudad}</div>
          <div class="readonly-label">Fecha</div>
          <div class="readonly-field">${savedData.fecha}</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-red" id="btn-ver-contrato" onclick="toggleContractView()">Ver contrato</button>
        </div>
        <div id="contract-inline-view" style="display:none;margin-top:20px">
          <div class="preview-doc">${buildContractHTML(savedData, savedData.sigImg)}</div>
        </div>`;
    } 
    // Si el contrato es de SERVICIO SOCIAL (Muestra todo)
    else {
      body.innerHTML = `
        <div style="margin-bottom:14px">
          <div class="readonly-label">Nombre</div>
          <div class="readonly-field">${savedData.nombre}</div>
          <div class="readonly-label">Fecha</div>
          <div class="readonly-field">${savedData.fecha}</div>
          <div class="readonly-label">Carrera</div>
          <div class="readonly-field">${savedData.carrera}</div>
          <div class="readonly-label">Escuela</div>
          <div class="readonly-field">${savedData.escuela}</div>
          <div class="readonly-label">Matrícula</div>
          <div class="readonly-field">${savedData.matricula}</div>
          <div class="readonly-label">Correo</div>
          <div class="readonly-field">${savedData.correo}</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-red" id="btn-ver-contrato" onclick="toggleContractView()">Ver contrato</button>
        </div>
        <div id="contract-inline-view" style="display:none;margin-top:20px">
          <div class="preview-doc">${buildContractHTML(savedData, savedData.sigImg)}</div>
        </div>`;
    }
  } else {
    // Cuando aún no se ha firmado nada
    badge.className   = 'badge badge-amber';
    badge.textContent = 'Pendiente de firma';
    body.innerHTML = `
      <p style="font-size:13px;color:#888;text-align:center;padding:16px 0">
        Aún no has firmado este contrato.
      </p>
      <div style="text-align:center">
        <button class="btn btn-red" onclick="goTo('screen-contract')">Ir a firmar →</button>
      </div>`;
  }
}

/* ════════════════════════
   UTILIDADES
════════════════════════ */
function toggleContractView() {
  const view = document.getElementById('contract-inline-view');
  const btn = document.getElementById('btn-ver-contrato');
  if (!view) return;
  if (view.style.display === 'none') {
    view.style.display = 'block';
    if (btn) btn.textContent = 'Ocultar contrato';
  } else {
    view.style.display = 'none';
    if (btn) btn.textContent = 'Ver contrato';
  }
}

function closePdfModal() {
  document.getElementById('pdf-modal').classList.remove('open');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}


function actualizarNombresUI() {
  const nombre = localStorage.getItem('usuarioNombre');
  const correo = localStorage.getItem('usuarioCorreo');
  const carrera = localStorage.getItem('usuarioCarrera');

  if (nombre) {
    document.querySelectorAll('.welcome-text h2').forEach(h2 => {
      h2.textContent = `Bienvenido(a), ${nombre} 👋`;
    });

    const fNombre = document.getElementById('f-nombre');
    const fCorreo = document.getElementById('f-correo');
    const fCarrera = document.getElementById('f-carrera');

    if (fNombre) fNombre.value = nombre;
    if (fCorreo) fCorreo.value = correo;
    if (fCarrera) fCarrera.value = carrera || "";
  }
}

function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);

  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈';
  } else {

    input.type = 'password';
    icon.textContent = '👁️';
  }
}