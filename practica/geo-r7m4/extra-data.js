window.GEO_EXTRA = [
  {
    "type": "match",
    "topic": "Información de los mapas",
    "prompt": "Relaciona cada información con el mapa que conviene consultar.",
    "pairs": [
      [
        "Países, estados y fronteras",
        "División política"
      ],
      [
        "Montañas, ríos y mares",
        "Relieve e hidrografía"
      ],
      [
        "Climas y vegetación",
        "Clima y vegetación"
      ],
      [
        "Cantidad de habitantes por región",
        "Población"
      ]
    ],
    "explain": "Los mapas pueden representar información diferente: límites, elementos naturales, climas, población, carreteras y caminos.",
    "visual": null,
    "id": 29
  },
  {
    "type": "fill",
    "topic": "Información de los mapas",
    "prompt": "Para planear un viaje por carretera consulto un mapa de _____.",
    "options": [
      "población",
      "carreteras y caminos",
      "vegetación",
      "lenguas"
    ],
    "correct": 1,
    "explain": "Un mapa de carreteras y caminos muestra vías de comunicación.",
    "visual": null,
    "id": 30
  },
  {
    "type": "mc",
    "topic": "Información de los mapas",
    "prompt": "La figura destaca montañas y un río. ¿Qué información presenta principalmente?",
    "options": [
      "Lenguas y tradiciones",
      "Relieve y cuerpos de agua",
      "Cantidad de habitantes",
      "Autoridades y leyes"
    ],
    "correct": 1,
    "explain": "Las montañas forman parte del relieve; los ríos son cuerpos de agua.",
    "visual": "landscape",
    "id": 31
  },
  {
    "type": "anagram",
    "topic": "Información de los mapas",
    "prompt": "Ordena las letras: elemento que relaciona las distancias del dibujo con las reales.",
    "word": "ESCALA",
    "explain": "La escala relaciona las distancias representadas con las reales.",
    "visual": null,
    "id": 32
  },
  {
    "type": "match",
    "topic": "Componentes geográficos",
    "prompt": "Relaciona el componente con su descripción.",
    "pairs": [
      [
        "Natural",
        "Elementos de la naturaleza"
      ],
      [
        "Social",
        "Población y organización de la comunidad"
      ],
      [
        "Económico",
        "Producción e intercambio de bienes y servicios"
      ],
      [
        "Político",
        "Gobierno, leyes y límites territoriales"
      ],
      [
        "Cultural",
        "Lenguas, costumbres y tradiciones"
      ]
    ],
    "explain": "Los cinco componentes ayudan a estudiar el espacio geográfico. Pueden relacionarse entre sí; aquí identificamos el aspecto destacado.",
    "visual": null,
    "id": 33
  },
  {
    "type": "fill",
    "topic": "Componentes geográficos",
    "prompt": "El clima, el suelo, las plantas y los animales son parte del componente _____.",
    "options": [
      "social",
      "cultural",
      "natural",
      "político",
      "económico"
    ],
    "correct": 2,
    "explain": "Son elementos de la naturaleza; no fueron creados por los seres humanos.",
    "visual": "landscape",
    "id": 34
  },
  {
    "type": "mc",
    "topic": "Componentes geográficos",
    "prompt": "¿Qué grupo contiene solamente ejemplos del componente natural?",
    "options": [
      "Río, montaña y vegetación",
      "Gobierno, río y comercio",
      "Familia, lengua y montaña",
      "Tienda, carretera y ganado"
    ],
    "correct": 0,
    "explain": "Río, montaña y vegetación son ejemplos naturales. La actividad ganadera es económica.",
    "visual": null,
    "id": 35
  },
  {
    "type": "anagram",
    "topic": "Componentes geográficos",
    "prompt": "Ordena las letras: componente al que pertenecen ríos, montañas y clima.",
    "word": "NATURAL",
    "explain": "El componente natural incluye agua, relieve, clima, suelo, plantas y animales.",
    "visual": "landscape",
    "id": 36
  },
  {
    "type": "match",
    "topic": "Componentes geográficos",
    "prompt": "Relaciona cada ejemplo con el componente destacado.",
    "pairs": [
      [
        "Familias y población",
        "Social"
      ],
      [
        "Agricultura y pesca",
        "Económico"
      ],
      [
        "Gobierno municipal y leyes",
        "Político"
      ],
      [
        "Lengua y fiestas tradicionales",
        "Cultural"
      ],
      [
        "Montañas y ríos",
        "Natural"
      ]
    ],
    "explain": "Para elegir, observa qué aspecto se estudia: población, actividad productiva, organización territorial, tradiciones o naturaleza.",
    "visual": null,
    "id": 37
  },
  {
    "type": "fill",
    "topic": "Componentes geográficos",
    "prompt": "El número de habitantes y las familias de una comunidad pertenecen al componente _____.",
    "options": [
      "natural",
      "social",
      "cultural",
      "económico",
      "político"
    ],
    "correct": 1,
    "explain": "El componente social se refiere a la población, sus grupos y la manera en que se organiza y convive.",
    "visual": null,
    "id": 38
  },
  {
    "type": "open",
    "topic": "Componentes geográficos",
    "prompt": "Escribe dos ejemplos diferentes del componente económico.",
    "model": "Por ejemplo: agricultura y comercio.",
    "groups": [
      [
        "agricultura"
      ],
      [
        "ganaderia"
      ],
      [
        "pesca"
      ],
      [
        "industria"
      ],
      [
        "turismo"
      ],
      [
        "mineria"
      ],
      [
        "comercio",
        "venta",
        "comprar",
        "vender"
      ]
    ],
    "explain": "Son actividades para producir, intercambiar o prestar bienes y servicios. Escribe al menos dos ejemplos diferentes.",
    "visual": null,
    "id": 39,
    "minimum": 2
  },
  {
    "type": "anagram",
    "topic": "Componentes geográficos",
    "prompt": "Ordena las letras: componente relacionado con gobierno, leyes y fronteras.",
    "word": "POLITICO",
    "explain": "La palabra es POLÍTICO. Se relaciona con la organización y administración de un territorio.",
    "visual": null,
    "id": 40
  },
  {
    "type": "mc",
    "topic": "Componentes geográficos",
    "prompt": "Una comunidad conserva su lengua y una danza tradicional. ¿Qué componente se destaca?",
    "options": [
      "Natural",
      "Político",
      "Cultural",
      "Económico"
    ],
    "correct": 2,
    "explain": "La lengua, las expresiones artísticas y las tradiciones son parte del componente cultural.",
    "visual": "festival",
    "id": 41
  },
  {
    "type": "fill",
    "topic": "Componentes geográficos",
    "prompt": "La venta de frutas en el mercado es una actividad del componente _____.",
    "options": [
      "natural",
      "económico",
      "político",
      "cultural",
      "social"
    ],
    "correct": 1,
    "explain": "El comercio es una actividad económica. La pregunta destaca la venta de productos.",
    "visual": "market",
    "id": 42
  },
  {
    "type": "open",
    "topic": "Componentes geográficos",
    "prompt": "Escribe dos ejemplos diferentes del componente cultural.",
    "model": "Por ejemplo: lengua y fiestas tradicionales.",
    "groups": [
      [
        "lengua",
        "idioma"
      ],
      [
        "musica"
      ],
      [
        "danza",
        "baile"
      ],
      [
        "fiesta",
        "tradicion",
        "costumbre"
      ],
      [
        "vestimenta"
      ],
      [
        "comida",
        "gastronomia"
      ],
      [
        "creencia",
        "religion"
      ],
      [
        "arte"
      ]
    ],
    "explain": "Las lenguas, la música, la comida, las fiestas, la vestimenta y las tradiciones son ejemplos culturales.",
    "visual": null,
    "id": 43,
    "minimum": 2
  },
  {
    "type": "mc",
    "topic": "Componentes geográficos",
    "prompt": "En una escuela hay una elección para decidir las autoridades del municipio. ¿Qué componente destaca la elección municipal?",
    "options": [
      "Político",
      "Natural",
      "Económico",
      "Cultural"
    ],
    "correct": 0,
    "explain": "La elección de autoridades municipales corresponde al componente político. Importa la actividad descrita, no solo el edificio donde ocurre.",
    "visual": null,
    "id": 44
  },
  {
    "type": "mc",
    "topic": "Agua del planeta",
    "prompt": "Aproximadamente, ¿qué parte de la superficie de la Tierra está cubierta por agua?",
    "options": [
      "7%",
      "29%",
      "71%",
      "100%"
    ],
    "correct": 2,
    "explain": "Aproximadamente el 71% de la superficie terrestre está cubierta por agua. Esto no significa que toda sea dulce o potable.",
    "visual": "waterSurface",
    "id": 45
  },
  {
    "type": "fill",
    "topic": "Agua del planeta",
    "prompt": "La mayor parte del agua del planeta es _____.",
    "options": [
      "dulce",
      "salada",
      "potable",
      "subterránea"
    ],
    "correct": 1,
    "explain": "La mayor parte del agua del planeta es salada y se encuentra en océanos y mares.",
    "visual": "waterSources",
    "id": 46
  },
  {
    "type": "match",
    "topic": "Agua del planeta",
    "prompt": "Relaciona cada depósito con el tipo de agua que contiene generalmente.",
    "pairs": [
      [
        "Océanos y mares",
        "Agua salada"
      ],
      [
        "Glaciares y capas de hielo",
        "Agua dulce congelada"
      ],
      [
        "Ríos y la mayoría de los lagos",
        "Agua dulce superficial"
      ],
      [
        "Acuíferos",
        "Agua almacenada bajo el suelo"
      ]
    ],
    "explain": "El agua dulce se encuentra congelada, en la superficie y bajo tierra. Hay excepciones, como lagos salados. Agua dulce no significa necesariamente potable.",
    "visual": "waterSources",
    "id": 47
  },
  {
    "type": "anagram",
    "topic": "Agua del planeta",
    "prompt": "Ordena las letras: grandes masas de agua salada que cubren gran parte del planeta.",
    "word": "OCEANOS",
    "explain": "La palabra es OCÉANOS. Contienen la mayor parte del agua del planeta.",
    "visual": "waterSources",
    "id": 48
  },
  {
    "type": "mc",
    "topic": "Disponibilidad del agua",
    "prompt": "¿Qué significa disponibilidad del agua?",
    "options": [
      "Solo la cantidad de lluvia de un día",
      "Cantidad de agua que existe y puede aprovecharse",
      "Que toda el agua se puede beber",
      "Que todos los países tienen la misma cantidad"
    ],
    "correct": 1,
    "explain": "Se refiere a la cantidad de agua que existe y que puede aprovecharse. También importan su calidad y la posibilidad de acceder a ella.",
    "visual": null,
    "id": 49
  },
  {
    "type": "fill",
    "topic": "Disponibilidad del agua",
    "prompt": "El agua almacenada bajo el suelo se llama agua _____.",
    "options": [
      "marina",
      "subterránea",
      "atmosférica",
      "salada"
    ],
    "correct": 1,
    "explain": "El agua subterránea se almacena en los poros y grietas de materiales bajo la superficie.",
    "visual": "waterSources",
    "id": 50
  },
  {
    "type": "open",
    "topic": "Disponibilidad del agua",
    "prompt": "Menciona dos depósitos diferentes donde puede encontrarse agua dulce.",
    "model": "Por ejemplo: ríos y glaciares.",
    "groups": [
      [
        "rio"
      ],
      [
        "lago"
      ],
      [
        "presa"
      ],
      [
        "glaciar",
        "hielo"
      ],
      [
        "acuifero",
        "subterranea"
      ]
    ],
    "explain": "Son ejemplos los ríos, la mayoría de los lagos, presas, glaciares y acuíferos. Encontrarla allí no asegura que pueda beberse sin tratamiento.",
    "visual": null,
    "id": 51,
    "minimum": 2
  },
  {
    "type": "mc",
    "topic": "Disponibilidad del agua",
    "prompt": "Un lago tiene agua dulce. ¿Eso garantiza que el agua sea potable?",
    "options": [
      "Sí, dulce siempre significa potable",
      "Sí, si el lago se ve limpio",
      "No, debe comprobarse su calidad y tratarse cuando corresponda",
      "No, porque toda agua dulce está congelada"
    ],
    "correct": 2,
    "explain": "Agua dulce significa que contiene pocas sales. Potable significa apta para el consumo humano; no son lo mismo.",
    "visual": null,
    "id": 52
  },
  {
    "type": "match",
    "topic": "Disponibilidad del agua",
    "prompt": "Relaciona cada situación con su efecto o explicación.",
    "pairs": [
      [
        "Lluvias muy escasas",
        "Puede disminuir la recarga de agua"
      ],
      [
        "Basura y sustancias contaminantes en un río",
        "Se reduce la calidad del agua"
      ],
      [
        "Más población con la misma fuente de agua",
        "Aumenta la demanda de agua"
      ],
      [
        "Reparar una fuga",
        "Evita desperdiciar agua"
      ]
    ],
    "explain": "La disponibilidad depende de las condiciones naturales, la calidad del agua, el acceso y el uso que hacemos de ella.",
    "visual": null,
    "id": 53
  },
  {
    "type": "fill",
    "topic": "Disponibilidad del agua",
    "prompt": "La disponibilidad de agua es _____ entre las regiones del mundo.",
    "options": [
      "idéntica",
      "desigual",
      "siempre abundante",
      "independiente del clima"
    ],
    "correct": 1,
    "explain": "Hay regiones con más agua y otras con escasez. Influyen el clima, la falta de lluvia, la contaminación y la demanda de la población.",
    "visual": null,
    "id": 54
  },
  {
    "type": "open",
    "topic": "Disponibilidad del agua",
    "prompt": "Escribe dos causas diferentes que pueden dificultar la disponibilidad de agua.",
    "model": "Por ejemplo: falta de lluvia y contaminación.",
    "groups": [
      [
        "sequia",
        "falta de lluvia",
        "poca lluvia",
        "escasez de lluvia"
      ],
      [
        "contaminacion",
        "contamina"
      ],
      [
        "poblacion",
        "demanda"
      ],
      [
        "sobreexplotacion"
      ],
      [
        "desperdicio",
        "fuga"
      ]
    ],
    "explain": "La falta de lluvia, la contaminación y el aumento de la demanda pueden dificultar la disponibilidad. Las fugas y el uso excesivo también influyen.",
    "visual": null,
    "id": 55,
    "minimum": 2
  },
  {
    "type": "mc",
    "topic": "Disponibilidad del agua",
    "prompt": "Dos comunidades tienen un río parecido, pero una descarga basura en él. ¿Por qué puede disponer de menos agua aprovechable?",
    "options": [
      "Porque la contaminación reduce su calidad",
      "Porque el agua se vuelve toda hielo",
      "Porque desaparece la orientación",
      "Porque todos los ríos son salados"
    ],
    "correct": 0,
    "explain": "Aunque exista agua, su contaminación puede impedir aprovecharla para ciertos usos.",
    "visual": "pollution",
    "id": 56
  },
  {
    "type": "mc",
    "topic": "Integración",
    "prompt": "En el dibujo hay un río, personas que venden productos y una fiesta tradicional. ¿Qué relación es correcta?",
    "options": [
      "Río: político; venta: natural; fiesta: económico",
      "Río: natural; venta: económico; fiesta: cultural",
      "Río: cultural; venta: político; fiesta: natural",
      "Todos son del mismo componente"
    ],
    "correct": 1,
    "explain": "Un mismo lugar reúne varios componentes. El río es natural, la venta es económica y la fiesta tradicional es cultural.",
    "visual": "community",
    "id": 57
  },
  {
    "type": "fill",
    "topic": "Integración",
    "prompt": "Para estudiar cuántas personas viven en cada región, consulto un mapa de _____.",
    "options": [
      "relieve",
      "carreteras",
      "población",
      "ríos"
    ],
    "correct": 2,
    "explain": "Un mapa de población representa información sobre habitantes y su distribución.",
    "visual": null,
    "id": 58
  },
  {
    "type": "open",
    "topic": "Integración",
    "prompt": "Escribe una acción concreta para evitar desperdiciar o contaminar el agua.",
    "model": "Por ejemplo: reparar las fugas o no tirar basura en los ríos.",
    "groups": [
      [
        "repar",
        "cerr",
        "no tirar",
        "no arrojar",
        "evitar tirar",
        "evitar contaminar",
        "no contaminar",
        "reutiliz",
        "ahorr",
        "reportar",
        "recoger",
        "no desperdiciar"
      ]
    ],
    "explain": "Son válidas acciones concretas como reparar o reportar fugas, cerrar la llave cuando no se usa y evitar arrojar basura o contaminantes al agua.",
    "visual": null,
    "id": 59,
    "minimum": 1
  },
  {
    "type": "mc",
    "topic": "Integración",
    "prompt": "¿Cuál afirmación relaciona correctamente los componentes del espacio geográfico?",
    "options": [
      "La pesca es política porque ocurre en un país",
      "Una lengua es natural porque se escucha",
      "Un río es natural y la pesca que se realiza en él es económica",
      "Todas las actividades humanas son naturales"
    ],
    "correct": 2,
    "explain": "Los componentes están relacionados. El río es un elemento natural y la pesca es una actividad económica.",
    "visual": null,
    "id": 60
  }
];
