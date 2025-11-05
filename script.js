const input = document.getElementById('numero');
const error = document.getElementById('error');
const fraseBox = document.getElementById('frase');

const frases = {
  1:"Darle la mano al de tu izquierda x una ronda",
  2:"Repudio",
  3:"Chupale la oreja al de tu derecha",
  4:"El que se ríe pierde",
  5:"Toman los q nunca han estado en algo",
  6:"Cachipun a la primera, perdedor toma",
  7:"Pon una regla",
  8:"Casados toman",
  9:"Vale por una ida al baño",
  10:"Limones",
  11:"Selfie",
  12:"Toman los que hayan wajiado en un medio de transporte",
  13:"No decir “si/no” por una ronda",
  14:"Sinónimos de pene",
  15:"Mi pico/vagina es… (con una letra)",
  16:"Teñidxs toman",
  17:"Los veggies toman",
  18:"Los que les gusta el olor a bencina",
  19:"Cacho humano",
  20:"Chancho inflado",
  21:"Bodyshot",
  22:"Ropa roja toma",
  23:"7",
  24:"Apple toma",
  25:"Raja rut",
  26:"Siéntate arriba del de tu derecha x una ronda",
  27:"Cambiar prenda con el de izquierda",
  28:"Regla del dedo (ultimo que pone el dedo toma)",
  29:"Rulers toman",
  30:"Totem",
  31:"2 mentiras 1 verdad",
  32:"Tararear una canción y adivinar",
  33:"Mostrar ropa interior",
  34:"Toma tantos tragos como tantas letras tenga tu nombre",
  35:"Cultura chupistica",
  36:"Es de cuico",
  37:"Trago por vez ida de waja",
  38:"El que tenga calcetines diferentes toma",
  39:"Fondo",
  40:"El último que toca el suelo toma",
  41:"Es de roto",
  42:"Trompetazo",
  43:"Penitencia",
  44:"Toman los q tengan un medallón",
  45:"Los que salgan sonriendo en el carnet",
  46:"King of the Bongo",
  47:"Cambio tu acento x una ronda",
  48:"Botellita",
  49:"Búfalo (tomar con la izquierda)",
  50:"Beso de amix",
  51:"La mas macabea toma",
  52:"Wpp a la última persona que te agarraste",
  53:"Deportistas destacados toman",
  54:"Quien es mas probable...",
  55:"Confesion",
  56:"Broma telefónica",
  57:"Más ritmo (póngale)",
  58:"Años divido en 2 = tragos",
  59:"Africano",
  60:"Toman los que tienen reloj",
  61:"Rotar vasos a la derecha",
  62:"Sácate una prenda",
  63:"Toman los que estén fumando",
  64:"Sigue la historia (un...un pájaro...)",
  65:"Snorkel",
  66:"Chica 3D",
  67:"Comerse un filtro",
  68:"Elegir si o no (3 veces) toma la minoría",
  69:"Mátala por chistosito",
  70:"El último q se sube a la silla toma",
  71:"Cascada",
  72:"Reparte 6 tragos",
  73:"Frutal / animales sonidos",
  74:"Los que se han ido de intercambio toman",
  75:"Toman los que están tomando con blanca",
  76:"Toman los cabeza de pishi",
  77:"Patos (1 pato 2 patas)",
  78:"Vikingo (vikingo, remos, marea)",
  79:"1 trago x arito",
  80:"Infiltrado",
  81:"Toma 4 tragos",
  82:"Fuck, marry, kill",
  83:"Que corra el hielo de boca en boca",
  84:"Piernas cruzadas toman 2",
  85:"Piropos al de alado, 1 ronda",
  86:"Rappi de hielo",
  87:"Mi vagina es...",
  88:"Los que estudien o quieran comercial toman",
  89:"Agregar regla",
  90:"Chupón al del frente, parte a elección",
  91:"Toman los ojitos de piscina",
  92:"La y el mas pelado toma",
  93:"Las mujeres toman",
  94:"El mejor orgasmo reparte 10 tragos",
  95:"Toma la más pechugona",
  96:"Espalda con espalda (quien es la más y apuntar)",
  97:"Un chupito",
  98:"Residente toma",
  99:"Repudio",
  100:"Guiño (teni q cachar quien se guiña)",
  101:"Fantasmita",
  102:"Trago x ex",
  103:"Beso en la parte del cuerpo con tu inicial",
  104:"Toman las q se han agarrado alguien de un(s) año más chico",
  105:"Toma x cada pelado de tu colegio",
  106:"Pelados x tragos",
  107:"Dedo arriba o abajo: A. Que tus papás te vean tirando / tu ver a tus papas tirando.  B.Que tu abuelo te mande nudes / tu mandarle uno C. Tomar con blanca/ negra",
  108:"V o R",
  109:"Voy al bar...",
  110:"Cuenta una historia bizarra",
  111:"Toma el impuntual, último que llegó",
  112:"La mas sobria toma",
  113:"Pic instagram",
  114:"Toman los q tienen tinder",
  115:"Paranoia (pregunta baja, respuesta alta) 3 personas",
  116:"Tarita",
  117:"Probabilidades",
  118:"5 minutos en el paraíso con el sexo opuesto a la derecha",
  119:"El más probable que: A. de ser stripper. B. de casarse con unx millonarix. C.que interactúe con un fantasma",
  120:"Toman los q se lo han llevado en cana",
  121:"Languetazo (hombro-frente)",
  122:"Zurdos toman",
  123:"Si esta tu pelado comparte 2 tragos con el",
  124:"Trabalenguas",
  125:"Cachetada al más votado",
  126:"Todos toman menos tu",
  127:"Toman los que tengan más de la mitad del vaso",
  128:"Teléfono",
  129:"Toman los que llevan A en su nombre",
  130:"Palabras encadenadas (casa-saco)",
  131:"Barman (todos te piden piscola ati)",
  132:"Tocar narices mientras el de al frente la mata",
  133:"Toma x garabato 1 ronda",
  134:"Mejor twerk de hombres reparte tragos, mujeres votan",
  135:"Todos toman",
  136:"Toma el concho familiar",
  137:"Tapita",
  138:"Los que no han estado de cumpleaños toman",
  139:"Shot a ciegas",
  140:"Sorbo sorbo shot",
  141:"Toma el con la anaconda más grande",
  142:"Cheers for the friendship",
  143:"Toma el número del mes en que nacieron",
  144:"Nunca nunca 1 ronda",
  145:"Cambio de nombres",
  146:"El de tu izquierda debe armar un trago en tu boca",
  147:"Menor y mayor toman la diferencia entre ambos",
  148:"Toman por cada mes de pololeo",
  149:"Todos pegados con todos de los codos, toma por separada de codos",
  150:"Tragos por pelón arrepentido",
  151:"Medusa (1,2,3 mirar, contacto visual toma)",
  152:"Fantasía sexual",
  153:"Lugar más random q se hayan pelado , todos",
  154:"Toma por todas las personas que te han gustado",
  155:"Apunten todos al mejor vestido y vestida",
  156:"Contar peor experiencia sexual",
  157:"Toman l@s q siguen en el colegio",
  158:"Toman l@s que hayan estado en un colegio Opus"
};

function mostrarFrase(num) {
  fraseBox.textContent = frases[num] || "Sin frase registrada.";
  fraseBox.classList.remove("visible");
  void fraseBox.offsetWidth;
  fraseBox.classList.add("visible");
}

function validateAndShow() {
  const raw = input.value.trim();
  if (raw === '') {
    error.textContent = "Debe ingresar un número.";
    fraseBox.textContent = "";
    fraseBox.classList.remove("visible");
    return;
  }

  const v = parseInt(raw, 10);
  if (Number.isNaN(v)) {
    error.textContent = "Valor inválido.";
    fraseBox.textContent = "";
    fraseBox.classList.remove("visible");
    return;
  }

  if (v < 1 || v > 158) {
    error.textContent = "Debe ser entre 1 y 158.";
    fraseBox.textContent = "";
    fraseBox.classList.remove("visible");
    return;
  }

  error.textContent = "";
  mostrarFrase(v);
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    validateAndShow();
  }
});

input.addEventListener("blur", validateAndShow);
