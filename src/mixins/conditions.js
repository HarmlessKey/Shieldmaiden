export const conditions = {
	data() {
		return {
			conditionList: [
				{
					"value": "blinded",
					"condition" : "You can't see",
					"effects" : [ 
						"A blinded creature can't see and automatically fails any ability check that requires sight.", 
						"Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage." 
					],
					"icon" : "M405.822 78.899l24.444 24.444L100.485 433.1 76.04 408.657zM168.32 255.677a87.704 87.704 0 0 1 117.196-82.575l43.402-43.402A236.362 236.362 0 0 0 256 118.452a239.715 239.715 0 0 0-84.454 15.616 270.752 270.752 0 0 0-38.861 18.59 293.179 293.179 0 0 0-34.816 23.821 311.884 311.884 0 0 0-29.423 26.507 336.397 336.397 0 0 0-22.681 25.355l-4.46 5.554-3.93 5.267c-2.443 3.204-4.518 6.224-6.2 8.678-1.683 2.455-2.974 4.541-3.85 5.855L26 255.758l1.325 2.063c.876 1.325 2.167 3.457 3.85 5.854 1.682 2.398 3.757 5.475 6.2 8.679l3.93 5.266 4.46 5.555a336.397 336.397 0 0 0 22.68 25.355 311.895 311.895 0 0 0 29.424 26.507q7.145 5.67 14.82 11.018l60.736-60.736a87.508 87.508 0 0 1-5.106-29.642zm316.367-2.086c-.876-1.337-2.166-3.515-3.85-5.889-1.682-2.374-3.756-5.509-6.2-8.736-2.443-3.457-5.255-6.995-8.39-10.867a339.52 339.52 0 0 0-22.68-25.459 311.768 311.768 0 0 0-29.423-26.564 306.188 306.188 0 0 0-17.587-12.954l-59.375 59.375a87.692 87.692 0 0 1-114.35 114.35l-43.31 43.31A240.015 240.015 0 0 0 256 392.913a236.834 236.834 0 0 0 84.454-15.258 269.046 269.046 0 0 0 38.861-18.544 290.32 290.32 0 0 0 34.816-23.822 311.768 311.768 0 0 0 29.423-26.564 339.52 339.52 0 0 0 22.681-25.458c3.146-3.884 5.947-7.457 8.39-10.868 2.443-3.227 4.518-6.247 6.2-8.736 1.683-2.49 2.974-4.61 3.85-5.89L486 255.69z",
					"name" : "Blinded"
				},
				{
					"value": "charmed",
					"condition" : "You are charmed",
					"effects" : [ 
						"A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.", 
						"The charmer has advantage on any ability check to interact socially with the creature." 
					],
					"icon" : "M256.563 20.53c-48.747 0-93.132 25.712-125.844 68.44-32.714 42.726-53.282 102.36-53.282 168.405s20.568 125.648 53.28 168.375c32.713 42.727 77.098 68.438 125.845 68.438 48.746 0 93.13-25.71 125.843-68.438 32.713-42.727 53.28-102.33 53.28-168.375.002-66.045-20.567-125.68-53.28-168.406-32.712-42.728-77.097-68.44-125.844-68.44zm-54.97 148.657c14.85-.292 29.283 8.698 33.845 28.188 9.805 41.902-43.157 82.06-43.157 107.656-11.71-20.28-81.58-31.536-91-71.686-9.28-39.562 34.006-62.027 62.907-33.125 5.326-19.873 21.6-30.72 37.407-31.032zm106.532 0c16.245-.337 33.326 10.558 38.813 31.032 28.9-28.903 72.218-6.438 62.937 33.124-9.42 40.15-79.288 51.405-91 71.687 0-25.595-52.993-65.753-43.188-107.655 4.415-18.862 18.104-27.89 32.438-28.188zM258.03 350.595c34.49 0 68.985 7.503 99.283 22.53l6.468 3.22-1.467 7.062s-3.773 17.89-18.813 35.094-41.975 34.063-85.47 34.063c-43.492 0-70.427-16.86-85.467-34.063-15.04-17.204-18.813-35.094-18.813-35.094l-1.47-7.062 6.47-3.22c2.803-1.39 5.66-2.675 8.53-3.937v-.375h.814c27.954-12.135 58.942-18.218 89.937-18.218zm-72.56 54.25c.38.46.75.912 1.155 1.375 11.94 13.657 32.584 27.655 71.406 27.655 38.823 0 59.466-13.998 71.408-27.656.404-.464.773-.917 1.156-1.376H185.47z",
					"name" : "Charmed"
				},
				{
					"value": "deafened",
					"condition" : "You can't hear",
					"effects" : [ 
						"A deafened creature can't hear and automatically fails any ability check that requires hearing." 
					],
					"icon" : "M453.395 34.029l24.582 24.582L58.605 477.983 34.023 453.4zM212.917 243.597c-10.164-11.756-24.058-17.25-37.995-15.305q-.268 14.407-.642 28.451-.416 17.101-.748 32.951l42.335-42.335a46.754 46.754 0 0 0-2.929-3.762zM189.735 415.31c7.236 3.773 19.591-3.42 28.686-10.11l10.132 13.765c-13.167 9.694-24.507 14.514-34.276 14.514a26.517 26.517 0 0 1-12.44-3.003c-9.62-5.034-15.882-15.647-19.773-31.786l-48.33 48.299c25.864 71.523 159.463 42.816 159.463-70.647 0-65.581 98.82-69.343 122.365-155.06 6.296-22.915 8.423-43.906 6.958-63.059L176.59 384.154c3.41 21.418 8.753 28.878 13.146 31.155zM157.18 256.337c.609-25.116 1.24-51.088 1.304-77.872.064-26.207 5.43-47.903 15.946-64.48a74.58 74.58 0 0 1 39.641-31.24c40.005-13.777 91.393 3.302 110.61 27.788l-13.446 10.56c-15.038-19.153-59.243-33.304-91.595-22.167-20.991 7.214-34.768 23.887-40.71 48.8a101.16 101.16 0 0 1 21.525-15.294c22.07-11.393 44.056-10.549 63.593 2.448l-9.47 14.236c-12.387-8.24-25.843-9.694-39.983-4.275-22.22 8.454-37.408 29.563-39.01 34.415q0 16.117-.321 31.797c18.789-1.785 37.15 5.824 50.607 21.375.77.898 1.518 1.807 2.234 2.726L376.078 87.169c-14.011-18.79-32.95-34.607-55.577-47.668-54.465-31.55-211.043-12.665-211.043 108.856V353.79l46.77-46.813c.15-15.444.514-32.33.952-50.639z",
					"name" : "Deafened"
				},
				{
					"value": "exhaustion",
					"condition" : "You are exhausted",
					"effects" : [ 
						"Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect's description.", "If an already exhausted creature suffers another effect that causes exhaustion, its current level of exhaustion increases by the amount specified in the effect's description.", "A creature suffers the effect of its current level of exhaustion as well as all lower levels. For example, a creature suffering level 2 exhaustion has its speed halved and has disadvantage on ability checks.", 
						"An effect that removes exhaustion reduces its level as specified in the effect's description, with all exhaustion effects ending if a creature's exhaustion level is reduced below 1.  Finishing a long rest reduces a creature's exhaustion level by 1, provided that the creature has also ingested some food and drink." 
					],
					"icon" : "M455.874 211.781C437.991 211.688 417.022 220.821 399.937 237.907C394.627 243.217 390.114 248.929 386.375 254.782C357.123 237.155 314 237.977 273.095 250.877C263.925 253.361 254.881 256.414 246.155 260.065C202.479 278.342 167.652 309.902 159.937 349.69C153.327 379.798 165.307 412.913 207.375 444.533L88.062 444.533L61.625 492.283L318.78 492.283L230.313 389.033C254.583 362.326 297.77 345.33 327.313 343.973C341.105 389.069 363.546 457.469 399.031 492.283L459.907 492.283C416.837 445.737 383.337 383.196 377.937 312.441C379.554 315.676 381.657 318.629 384.251 321.221C402.915 339.885 440.196 332.839 467.531 305.503C494.868 278.167 501.915 240.885 483.251 222.223C476.251 215.223 466.606 211.841 455.876 211.783Z",
					"name" : "Exhaustion"
				},
				{
					"value": "frightened",
					"condition" : "You are frightened",
					"effects" : [ 
						"A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.", 
						"The creature can't willingly move closer to the source of its fear."
					],
					"icon" : "M250.594 20.906c-45.425.318-89.65 20.975-112.78 61.282-22.594 39.374-34.23 82.722-31.314 115.406 1.458 16.34 6.393 29.793 14.72 39.5 8.325 9.706 20.104 16.173 37.53 18.03l11 1.19-3 10.655c-2.337 8.272-3.75 16.256-3.75 24.905 0 27.038 4.292 79.342 18.5 123.563 7.104 22.11 16.715 42.157 28.78 56.093 12.068 13.938 25.855 21.845 43.814 21.845 17.96 0 31.777-7.907 43.844-21.844 12.066-13.935 21.677-33.982 28.78-56.092 14.21-44.22 18.5-96.525 18.5-123.563 0-8.65-1.41-16.635-3.75-24.906l-2.968-10.533 10.875-1.28c17.146-2.04 29.05-8.367 37.47-17.72 8.417-9.352 13.49-22.17 15-38 3.02-31.66-8.958-74.675-34.814-117.03-25.5-41.774-70.927-61.8-116.374-61.5h-.062zM173.406 145.47c24.447 0 44.063 19.58 44.063 44.03 0 24.446-19.617 44.063-44.064 44.063-24.446 0-44.03-19.617-44.03-44.063s19.584-44.03 44.03-44.03zm161.438 0c24.447 0 44.062 19.58 44.062 44.03 0 24.446-19.616 44.063-44.062 44.063-24.447 0-44.03-19.617-44.03-44.063-.002-24.446 19.583-44.03 44.03-44.03zm-162.47 35.093c-6.623 0-11.78 5.188-11.78 11.812s5.157 11.78 11.78 11.78c6.625 0 11.814-5.156 11.814-11.78 0-6.627-5.188-11.813-11.813-11.813zm164.22 0c-6.624 0-11.78 5.188-11.78 11.812-.002 6.624 5.156 11.78 11.78 11.78s11.812-5.156 11.812-11.78c0-6.627-5.187-11.813-11.812-11.813zm-81.406 51.906c38.762 0 68.875 36.01 68.875 78.593 0 19.938-2.457 56.192-11.532 88.687-4.536 16.247-10.655 31.58-19.686 43.563-9.03 11.98-21.96 20.812-37.656 20.812-15.696 0-28.626-8.83-37.657-20.813-9.03-11.98-15.15-27.315-19.686-43.562-9.075-32.495-11.563-68.75-11.563-88.688 0-42.584 30.145-78.593 68.907-78.593zm0 18.686c-17.93 0-34.16 11.453-43.063 29.063h86.094c-8.895-17.61-25.103-29.064-43.033-29.064zm-27.282 173.938c1.45 2.532 2.956 4.878 4.53 6.97 6.78 8.99 13.692 13.373 22.75 13.373 9.06 0 15.943-4.383 22.72-13.375 1.576-2.09 3.08-4.436 4.53-6.968h-54.53z",
					"name" : "Frightened"
				},
				{
					"value": "grappled",
					"condition" : "You are grappled",
					"effects" : [ 
						"A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.", 
						"The condition ends if the grappler is incapacitated (see the condition).", 
						"The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect, such as when a creature is hurled away by the thunder-wave spell." 
					],
					"icon" : "M243.512 23.29c-27.105 18.337-53.533 32.92-82.274 45.337-2.843 17.364-3.948 34.497-4.05 51.584 28.913 15.41 56.096 32.85 83.33 49.634l7.045 4.344-3.432 7.482c-12.12 26.572-24.33 47.087-46.245 70.3l-5.184 5.512-6.46-3.904c-32.974-19.974-74.472-38.724-113.373-53.95l6.826-17.374c36.79 14.4 75.11 32.32 108.153 51.504 15.396-17.198 25.326-33.354 34.713-52.89-43.44-26.91-86.13-53.51-134.69-70.632-23.012 20.357-37.705 45.243-51.942 70.74 8.324 25.495 6.596 53.376-6.596 77.46 48.58-.593 97.994 2.23 150.666 10.26l5.658.837 1.787 5.44c8.85 26.46 11.79 54.41 8.325 83.588l-.987 8.432-8.466-.187c-40.508-.864-80.175-2.138-118.17.234 1.634 15.94-2.31 30.972-7.724 45.025 13.427 28.54 27.38 55.8 48.29 79.39 41.27-19.05 73.564-31.288 115.93-42.85-3.407-13.72-6.918-26.36-11.097-33.62-5.122-8.9-10.207-13.057-17.85-15.256-15.284-4.4-44.533 2.293-92.894 19.454l-6.243-17.594c48.907-17.354 79.702-26.894 104.283-19.82 9.133 2.628 16.884 8.004 23.066 15.46 14.487-7.627 28.415-16.79 42.053-26.996 12.34-45.92 37.29-81.42 66.626-112.107-7.226-13.52-13.208-27.204-20.563-40.613l-3.394-6.168 5-4.965c23.275-23.13 47.34-40.157 71.87-52.487l8.395 16.716c-20.952 10.53-41.503 25.913-61.795 45.152 12.41 23.91 22.263 45.5 39.457 64.826 37.488-27.124 74.943-51.39 116.84-74.938-13.96-30.473-31.345-58.357-56.286-79.462-32.2 13.38-62.527 17.39-92.61 12.29-14.223 13.25-30.094 22.23-48.756 23.337-29.017 1.722-60.74-15.74-99.174-57.672l6.858-6.295.017-.028.006.006 6.88-6.314c36.702 40.043 63.74 52.87 84.32 51.65 18.514-1.1 35.03-14.95 51.684-35.406-28.827-31.81-64.174-59.94-97.822-84.465zM39.324 277.884c-6.06.022-12.104.098-18.142.223 1.673 26.288 5.512 51.288 14.052 73.732 45.88-5.82 93.308-4.96 141.15-3.87 1.518-21.27-.253-41.69-6.058-61.212-45.528-6.565-88.59-9.03-131.002-8.873z",
					"name" : "Grappled"
				},
				{
					"value": "incapacitated",
					"condition" : "You can't take actions or reactions",
					"effects" : [ "An incapacitated creature can't take actions or reactions." ],
					"name" : "Incapacitated"
				},
				{
					"value": "invisible",
					"condition" : "You can't be seen",
					"effects" : [ 
						"An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves.",
						"Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage." 
					],
					"icon" : "M262.53 12.22l-2.936 18.468 2.72.437 2.155.5 2.124.625h.03l1.595.563.155.062.344.125 1.936.813.125.062 2.033 1 1.312.72 9.03-16.345-1.78-1-.22-.125-.217-.094-2.532-1.218-.22-.093-.248-.126-2.563-1.063-.25-.092-.25-.094-2.594-.906-.28-.094-.25-.063-2.656-.78-.28-.063-.252-.062-2.718-.594-.28-.06-.283-.064-2.75-.437zm-12.06.092l-2.376.22-.313.03-.28.032-2.938.5-.28.03-.282.063-2.906.657-.28.062-.283.094-2.81.844-.282.062-.282.094-2.78 1-.25.094-.25.125-2.75 1.155-.25.125-.22.125-1.344.656L237.688 35l.844-.438.064-.03 2.156-.938 2.78-1 2.282-.657 1.75-.406h.063l2.688-.436.156-.032 1.78-.156-1.78-18.593zm-38.564 18.75l-.812.813-.156.156-.157.19-2.124 2.343-.156.156-.156.155-2.03 2.5-.126.156-.125.157-1.97 2.594-.124.19-.126.155-1.844 2.72-.094.186-.125.157-1.75 2.844-.093.157-.093.188-.656 1.156 16.312 9.126.438-.812.218-.344 1.313-2.125.06-.094.157-.25 1.375-2.03.188-.25.063-.094 1.437-1.906 2-2.438.03-.03 1.532-1.688.313-.313.5-.5-13.22-13.218zm88.22 1.875l-14 12.376 1.312 1.468.28.314 1.376 1.718.03.063.22.25 1.562 2.156 1.28 1.907.22.313 1.438 2.344L295 57.937l.188.313.218.438 16.656-8.5-.406-.782-.094-.156-.093-.156-1.533-2.75-.093-.157-.094-.187-1.656-2.656-.094-.157-.125-.156-1.72-2.56-.092-.157-.125-.157-1.813-2.468-.125-.157-.125-.155-1.906-2.344-.126-.155-.125-.156-1.595-1.782zM191.187 67l-.22.688-.062.187-.062.188-.906 3.468-.063.19-.03.186-.782 3.53-.063.19-.03.186-.657 3.626-.032.187-.03.188-.5 3.656-.03.186-.032.188-.313 3.344 18.594 1.843.28-2.936.47-3.344.06-.344.595-3.25.625-2.812.063-.25.03-.125.72-2.75.218-.69L191.188 67zm128.28 2.25l-11.093 3.188-6.938 1.718.063.25.03.094.626 2.625.656 3 .032.22.03.124.438 2.75.063.343.375 2.78.03.313v.03l.25 2.814v.125l.033.25.062.906 18.656-1.06-.092-1.25v-.345l-.344-3.53v-.157l-.03-.188-.47-3.47v-.155l-.03-.188-.595-3.406-.033-.186-.03-.156-.688-3.376-.033-.156-.062-.187-.813-3.282-.03-.188-.063-.156v-.094zm-113.25 36.53l-18.562 1.94.094.968v.187l.03.188.564 3.75.03.187.032.188.688 3.656.03.187.032.19.844 3.593.03.187.064.188.97 3.5.03.187.062.188.875 2.75 17.814-5.688-.875-2.75-.782-2.78-.032-.19-.062-.186-.72-3.22-.56-2.906-.033-.188-.03-.187-.406-2.97-.063-.375-.06-.594zm97.282 1.72l-.375 2.53-.03.157-.033.22-.656 3.343-.687 2.906-.033.094-.062.28-.813 2.814-1.156 3.5-.125.344L317 130.31l.28-.75.064-.187.062-.188 1.156-3.468.063-.19.063-.186 1-3.594.062-.188.063-.187.875-3.656.03-.19.032-.218.72-3.718.06-.188.033-.22.437-2.905-18.5-2.78zm-86.844 29.438l-6.094 3.843-1.156.19-.187.03-.19.063-3.03.656-.22.03-.186.063-2.906.78.718 2.688-2.562 1.595 1.5 2.375.125.188.093.156 1.906 2.75.124.156.125.156.968 1.313 1.78 6.686 2.532-.687.28-.064.126-.03 2.25-.5.375-.064 2.72-.5 15.094-2.656-9.28-12.187-1.72-2.282-.125-.157-.126-.186-1.438-2.03-.187-.314-.032-.03-1.282-2.032zm75.47 1.625l-.688 1.093-.25.344-1.5 2.063-.25.343-1.813 2.28-9.375 11.845 14.78 3.095 2.47.53.375.095 2.03.5h.033l.343.094 2 .594.25.093.126.032 1.125.407 3.126-9.032 1.688-2.375.125-.157.124-.187.937-1.44-1.186-.78 1.28-3.688-1.5-.53-.155-.063-.22-.064-2.72-.812-.186-.063-.188-.03-2.812-.72-.188-.03-.187-.063-2.845-.593-.063.28-4.687-3.06zm-109.063 12.75l-1.625 1.03-.157.095-.155.125-2.375 1.656-.156.093-.156.125-2.282 1.75-.156.125-.156.125-2.22 1.843-.155.126-.126.125-2.156 1.94-.157.124-.124.125-2.062 2.03-.156.125-.125.125-1.594 1.688 13.56 12.875 1.345-1.438.156-.156.095-.095 1.563-1.53.28-.25 1.595-1.44.03-.03.25-.22 1.626-1.343.155-.125.156-.125 1.657-1.28.25-.188.063-.03 1.72-1.19.343-.218 1.28-.812-10.03-15.78zm143.78 2.75L315.97 169.25l1.467 1.03.25.19.032.03 1.655 1.313.28.218 1.626 1.345.22.188.063.062 1.593 1.438.25.25 1.563 1.53 1.78 1.845.22.218 1.31 1.47 13.908-12.47-1.5-1.687-.094-.126-.125-.094-2-2.094-.095-.125-.125-.124-2.063-1.97-.125-.124-.125-.125-2.093-1.906-.125-.124-.158-.094-2.156-1.812-.125-.125-.155-.125-2.22-1.72-.155-.093-.125-.125-1.78-1.25zM154.564 181.5l-1.5 2.594-.063.125-.063.124-1.5 2.75-.062.125-.063.124-1.406 2.844-.03.093-.064.126-1.343 2.906-.064.125-.03.094-1.282 3-.063.095-.03.125-1.094 2.72 17.344 6.968 1-2.532.094-.187v-.032l1.094-2.532.093-.22 1.126-2.436.125-.25 1.157-2.344.032-.03.093-.22 1.218-2.28.126-.25 1.375-2.345-16.218-9.28zm199.656 3.22l-16.25 9.218 1.374 2.437.125.22 1.25 2.343.092.218 1.22 2.406.093.22 1.156 2.5.095.218 1.125 2.563.094.187 1 2.406 17.28-7.062-1.062-2.625-.062-.095-.03-.094-1.314-3-.03-.093-.063-.093-1.344-2.938-.064-.094-.062-.093-1.406-2.845-.063-.125-.063-.094-1.468-2.78-.063-.126-.06-.094-1.5-2.687zM139.874 218.5l-.5 1.97-.03.06v.095l-.814 3.438v.093l-.03.094-.72 3.47-.03.093v.093l-.688 3.53v.064l-.03.094-.595 3.562-.03.094v.063l-.345 2.343 18.47 2.844.312-2.188.03-.156.564-3.25.03-.156.595-3.188.03-.187.72-3.313.687-3.062.063-.188.437-1.78-18.125-4.532zm229.22 2.97l-18.064 4.78.533 1.97.03.155.782 3.094h-.03l.75 3.28.03.188.656 3.187v.03l.033.126.593 3.25.03.157.345 2 18.44-3.093-.376-2.156v-.094l-.03-.063-.658-3.56v-.095l-.03-.094-.72-3.5-.03-.093v-.093l-.782-3.47-.03-.093-.002-.06-.843-3.44-.033-.093-.03-.093-.563-2.125zm-235.158 35.5l-.093 1.342v.126l-.22 3.843v.126l-.186 3.844v.125l-.094 3.875v.125l-.063 3.906v2.032l18.69.032v-1.907l.06-3.78H152l.125-3.594v-.157l.156-3.562v-.156l.22-3.532v-.156l.094-1.188-18.656-1.343zm241.625 2.967l-18.625 1.5.125 1.375h-.03l.25 3.657v.155l.187 3.563v.156l.124 3.594v.125l.062 3.625v.156l.03 1.53 18.69-.062-.032-1.687v-.125l-.063-3.906v-.157l-.124-3.875v-.093l-.03-.064-.188-3.844v-.157l-.25-3.812v-.157l-.125-1.5zM152.5 294.47l-18.656 1.06.187 3.158v.125l.032.125.625 8 .032.093v.126l.78 7.438 18.594-1.97-.75-7.218-.03-.22-.626-7.78-.188-2.937zm204.625 2.905l-.25 3.53h.03l-.342 3.783v.125l-.375 3.78-.032.157-.406 3.78-.03.126-.345 2.78 18.53 2.377.376-2.907v-.125l.47-4.06v-.064l.03-.094.376-4.03.03-.063.002-.095.343-4.03v-.124l.25-3.533-18.655-1.312zm-208.594 31.47v3.092l-10.28 1.813 1.063 6.063 1.375 7.718h20.343v-18.686h-12.5zm31.19 0v9.967h-.126l.125 1.907v6.81h.436l.063.75 18.655-1.25-.625-9.436-.563-8.75H179.72zm130.03 0l-.656 8.655-.75 10.25 18.625 1.406.75-10.25-.908-.062v-10H309.75zm35.75 0v18.686h23.156l1.5-7.5.625-3.124-9.78-1.97v-6.092h-15.5zm-145.375 36.842l-18.656 1.22 1.218 18.656 18.656-1.22-1.22-18.656zm106.813.72l-1.375 18.624 18.625 1.408 1.406-18.657-18.656-1.374zm-60.282 11.906V397h18.688v-18.688h-18.688zM202.562 403l-18.656 1.22 1.25 18.655 18.625-1.25L202.563 403zm101.594.688l-1.375 18.625 18.626 1.375 1.406-18.625-18.656-1.375zm-57.5 12v18.687h18.688v-18.688h-18.688zM205.03 440.28l-18.655 1.22 1.22 18.656 18.655-1.22-1.22-18.655zm96.345.658L300 459.594l18.625 1.375 1.406-18.626-18.655-1.406zm-54.72 12.125v18.687h18.69v-18.688h-18.69zm-39.186 24.53l-18.626 1.22.75 11.656.594 8.717h15.75v-9.812l2.312-.156-.78-11.626zm91.155.626l-.813 10.936 1.563.125v9.908h16.406l.658-8.657.812-10.936-18.625-1.375zm-74 2.28v18.688h18.688V480.5h-18.688zm37.375 0v18.688h18.688V480.5H262z",
					"name" : "Invisible"
				},
				{
					"value": "paralyzed",
					"condition" : "You are paralyzed",
					"effects" : [ 
						"A paralyzed creature is incapacitated (see the condition) and can't move or speak.", 
						"The creature automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.", 
						"Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."
					],
					"icon" : "M263.47 19.03c-1.234.04-2.47.126-3.69.126-38.983 0-70.75 33.895-70.75 75.906 0 21.274 8.43 40.465 21.5 54.282-80.868 10.566-98.35 105.42-79.124 191.562h31.656l-1.03-105.344 18.687-.187 1.25 129.25 10.218 130.313h55.53V319.344h18.688v175.594h56.22l12.687-143.313 1.125-116.25 18.687.188-1.03 105.343h33.5c21.795-88.46-5.595-178.95-79.626-190.687 13.658-13.88 22.53-33.346 22.53-55.157 0-39.39-27.808-72.008-63.406-75.907-1.187-.15-2.393-.162-3.625-.125zM248.28 36.5l12.25 35.03 25.095-27-18.594 44.845 44.22-9.125-29.094 19.313 21.594 12.28-34.47 1.75 20.908 38.563-26.375-15.78-10.907 20.03 15.22 27.844 42.343-12.28-29.94 35.874 57-9.063-39.217 34.47 18.5 42.47-22.782-5.19 22.345 104.876-53.656-101.97-62.095 67.814 35.813-90.28-32.813 10 22.22-34.94-49.814-24 54.72.345-27.28-31.78 37.28 9.686.625-52.06-25.125 3.686L241.844 99 211 74.406l31.438 3.563 5.843-41.47z",
					"name" : "Paralyzed"
				},
				{
					"value": "petrified",
					"condition" : "You are transformed into stone",
					"effects" : [ 
						"A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.", 
						"The creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings.", 
						"Attack rolls against the creature have advantage.", 
						"The creature automatically fails Strength and Dexterity saving throws.", 
						"The creature has resistance to all damage.", 
						"The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized." 
					],
					"icon" : "M177.682 25.404L78.695 81.97l53.743 53.74 77.328 15.465-3.532 17.652-64.79-12.959 27.095 81.287-17.078 5.692-31.328-93.985-44.908-44.91 5.38 58.899-38.287 137.638 59.082 44.313-10.8 14.398-45.157-33.867 26.147 130.73 73.678 11.334L128.308 425H128v-.77l-8.355-20.888 16.71-6.684L140.492 407h18.766L256 390.875 352.742 407h17.479l4.953-24.766 17.652 3.532-14.375 71.873 62.096-16.936 30.086-120.344-30.283-90.847-58.668-44.002-92.202 15.367-2.96-17.754 90.654-15.11 14.287-42.859 17.078 5.692-13.95 41.847 46.405 34.803 13.285-106.293-89.097-44.549-88.104-14.683-29.027 58.054-16.102-8.05L258.5 38.873l-80.818-13.469zm236.634 221.754l3.368 17.684-35.952 6.847c4.658 3.159 8.472 7.518 10.64 13.006 3.624 9.18 1.752 19.208-3.19 27.246-4.943 8.039-12.91 14.59-22.827 18.504-9.915 3.915-20.212 4.574-29.312 2.08-6.576-1.802-12.68-5.465-16.934-10.818l-8.716 47.94-110.89-9.24-7.921-39.602c-4.267 5.846-10.686 9.819-17.625 11.72-9.1 2.494-19.397 1.835-29.312-2.08-9.916-3.915-17.884-10.465-22.827-18.504-4.942-8.038-6.814-18.067-3.19-27.248 2.042-5.17 5.54-9.344 9.833-12.45l-35.315-7.436 3.708-17.614 150.234 31.63 166.228-31.665zM151 283.553c-2.047.051-3.967.318-5.672.785-4.862 1.332-7.714 3.818-8.957 6.967-1.243 3.148-.86 6.914 1.781 11.209 2.469 4.014 6.947 8.05 12.848 10.664v-29.625zm210 .004v29.62c5.901-2.612 10.38-6.65 12.848-10.665 2.64-4.295 3.024-8.059 1.78-11.207-1.242-3.149-4.094-5.637-8.956-6.97-1.704-.466-3.626-.727-5.672-.778zm-52.633 2.107l-60.455 11.514-43.531-9.164 11.115 55.58 81.111 6.76 11.76-64.69zM169 288.762v26.674c.405-.086.817-.165 1.201-.27 4.862-1.332 7.712-3.82 8.955-6.969 1.243-3.148.861-6.912-1.78-11.207-1.795-2.92-4.677-5.84-8.376-8.228zm174 0c-3.699 2.387-6.581 5.307-8.377 8.228-2.64 4.295-3.022 8.059-1.78 11.207 1.244 3.149 4.094 5.637 8.956 6.969.384.105.796.184 1.201.27v-26.674zM147.691 425l18.23 45.574 105.558 16.24 89.095-24.3-1.4-.28L366.62 425h-13.879L256 441.125 159.258 425H147.69z",
					"name" : "Petrified"
				},
				{
					"value": "poisoned",
					"condition" : "You are poisoned",
					"effects" : [ 
						"A poisoned creature has disadvantage on attack rolls and ability checks."
					],
					"icon" : "M181.78 33v51.53h149.407V33H181.78zm14.19 70.22c-.66 2.9-1.554 5.263-2.75 6.936-2.684 3.75-7.033 6.594-19.5 6.594-21.54 0-40.804 5.862-55.157 16.094-14.353 10.232-23.907 25.398-23.907 42.5V426.75c0 32.34 26.255 58.625 58.594 58.625h213.47c32.338 0 58.592-26.286 58.592-58.625V175.344c0-17.102-9.527-32.2-23.593-42.438-14.067-10.237-32.83-16.156-53.44-16.156-16.69 0-23.62-3.488-26.874-7.188-1.41-1.604-2.43-3.698-3.156-6.343h-19.125c1.073 6.658 3.37 13.137 8.25 18.686 8.11 9.223 21.523 13.53 40.906 13.53 16.978 0 32.056 5.008 42.44 12.564 10.38 7.556 15.905 17.1 15.905 27.344V426.75c0 22.355-17.55 39.938-39.906 39.938H153.25c-22.355 0-39.906-17.583-39.906-39.938V175.344c0-10.245 5.455-19.72 16.062-27.28 10.607-7.563 26.22-12.626 44.313-12.626 15.962 0 28.056-5.142 34.686-14.407 3.904-5.455 5.733-11.545 6.625-17.81h-19.06zm66.093 45.405c-30.545 0-50.062 12.865-63.282 32.313-12.295 18.09-18.387 42.315-19.186 66.062 25.033 12.795 39.555 27.632 43.844 44.97.734 2.967 1.173 5.942 1.312 8.905 9.01 5.134 23.22 8.44 37.813 8.438 12.935-.002 26.08-2.538 36.093-6.875.152-3.325.617-6.662 1.47-10 4.486-17.583 19.028-33.2 44.405-45.563-.838-22.46-6.793-46.595-19-64.938-13.2-19.84-32.745-33.312-63.467-33.312zM232.188 223.5c9.157 0 16.593 7.405 16.593 16.563 0 9.157-7.435 16.593-16.593 16.593-9.157 0-16.562-7.436-16.562-16.594 0-9.157 7.405-16.562 16.563-16.562zm55.437 0c9.158 0 16.594 7.405 16.594 16.563 0 9.157-7.438 16.593-16.595 16.593-9.158 0-16.563-7.436-16.563-16.594 0-9.157 7.405-16.562 16.563-16.562zm-28.844 33.594c6.275 13.248 11.25 26.503 13.72 39.75-9.148-3.022-18.29-3.426-27.438 0 3.34-13.25 7.352-26.504 13.72-39.75zm-37.03 63.47c-2.136 6.42-5.285 12.778-9.188 19.03 11.93 7.99 31.58 12.81 50.875 12.594 18.97-.214 36.878-5.57 46.22-12.407-3.55-5.764-6.412-11.8-8.344-18-11.947 4.416-25.424 6.375-38.75 6.376-14.447.002-28.77-2.222-40.813-7.594zm-70.656 17.06c-8.9 11.268-12.694 22.493-10.03 36.313 68.925 5.54 164.194 31.92 226.686 60.75 9.16-11.166 12.518-22.67 9.97-36.78-67.77-6.867-164.135-28.736-226.626-60.282zm216.594 0c-20.79 10.496-45.326 19.907-71.313 28.063 20.298 4.434 40.253 8.04 58.72 10.688 7.782-1.026 15.357-1.853 22.624-2.438 2.66-13.82-1.133-25.045-10.033-36.312zm-203.75 57.532c-7.904 1.084-15.56 2.01-22.875 2.75-2.55 14.11.81 25.615 9.968 36.78 21.375-9.86 46.575-19.447 73.25-27.998-20.87-4.912-41.385-8.868-60.343-11.532z",
					"name" : "Poisoned"
				},
				{
					"value": "prone",
					"condition" : "You are prone",
					"effects" : [ 
						"A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.", 
						"The creature has disadvantage on attack rolls.", 
						"An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage."
					],
					"icon" : "M455.874 211.781C437.991 211.688 417.022 220.821 399.937 237.907C394.627 243.217 390.114 248.929 386.375 254.782C357.123 237.155 314 237.977 273.095 250.877C263.925 253.361 254.881 256.414 246.155 260.065C202.479 278.342 167.652 309.902 159.937 349.69C153.327 379.798 165.307 412.913 207.375 444.533L88.062 444.533L61.625 492.283L318.78 492.283L230.313 389.033C254.583 362.326 297.77 345.33 327.313 343.973C341.105 389.069 363.546 457.469 399.031 492.283L459.907 492.283C416.837 445.737 383.337 383.196 377.937 312.441C379.554 315.676 381.657 318.629 384.251 321.221C402.915 339.885 440.196 332.839 467.531 305.503C494.868 278.167 501.915 240.885 483.251 222.223C476.251 215.223 466.606 211.841 455.876 211.783Z",
					"name" : "Prone"
				},
				{
					"value": "restrained",
					"condition" : "You are restrained",
					"effects" : [ 
						"A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.", 
						"Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.", 
						"The creature has disadvantage on Dexterity saving throws."
					],
					"icon" : "M81 17.656v15.22c-11.175 4.177-18.906 15.608-18.906 28.343 0 12.734 7.73 24.165 18.906 28.343v23.374c-11.175 4.178-18.906 15.61-18.906 28.344 0 12.736 7.73 24.167 18.906 28.345v24.47c-11.175 4.177-18.906 15.607-18.906 28.343 0 12.735 7.73 24.165 18.906 28.343v20.407l-15.875-4.03-43.063 120.906c-.01.034-.022.06-.03.093-2.42 9.276-.887 15.685 2.374 20.656 3.274 4.99 8.77 8.62 15.063 10.188 6.292 1.567 13.143.948 18.686-1.844 5.544-2.79 10.056-7.47 12.438-15.906l.125-.438.155-.406 26.28-67.75 3.064-7.875 8.155 2.25 54.875 15.19 5.656 1.56 1.063 5.72 26.624 143.625h15.5v.063h89.594v-.063h15.406L343.72 349.5l1.06-5.72 5.658-1.56 54.875-15.19 8.156-2.25 3.06 7.876 26.283 67.75.156.406.124.438c2.382 8.437 6.862 13.115 12.406 15.906 5.544 2.792 12.425 3.41 18.72 1.844 6.292-1.567 11.787-5.198 15.06-10.188 3.263-4.97 4.797-11.38 2.376-20.656l-.03-.094-43.063-120.906-14.563 3.72V250.78c11.184-4.177 18.938-15.607 18.938-28.343 0-12.735-7.754-24.165-18.938-28.343v-24.47c11.184-4.177 18.938-15.608 18.938-28.343 0-12.734-7.754-24.165-18.938-28.343V89.564c11.184-4.178 18.938-15.61 18.938-28.344 0-12.736-7.754-24.167-18.938-28.345v-15.22h-18.688v15.22c-11.175 4.178-18.906 15.61-18.906 28.344 0 12.734 7.73 24.165 18.906 28.343v23.374c-11.175 4.178-18.906 15.61-18.906 28.344 0 12.736 7.73 24.167 18.906 28.345v24.47c-11.175 4.177-18.906 15.607-18.906 28.343 0 12.735 7.73 24.165 18.906 28.343v24.845l-84.093 21.438c.79 4.353 1.217 8.83 1.217 13.406 0 41.343-33.718 75.06-75.062 75.06-41.344 0-75.063-33.717-75.063-75.06 0-4.49.426-8.88 1.188-13.158l-84.406-21.5h.594v-25.03c11.183-4.18 18.937-15.61 18.937-28.345s-7.754-24.165-18.938-28.343v-24.47c11.184-4.177 18.938-15.608 18.938-28.343 0-12.734-7.754-24.165-18.938-28.343V89.564c11.184-4.178 18.938-15.61 18.938-28.344 0-12.736-7.754-24.167-18.938-28.345v-15.22H81zm9.344 32.22c4.922 0 9.594 4.528 9.594 11.343 0 6.813-4.673 11.343-9.594 11.343-4.92 0-9.563-4.53-9.563-11.344 0-6.816 4.642-11.345 9.564-11.345zm334.312 0c4.922 0 9.594 4.528 9.594 11.343 0 6.813-4.673 11.343-9.594 11.343-4.92 0-9.562-4.53-9.562-11.344 0-6.816 4.64-11.345 9.562-11.345zm-334.312 80.06c4.922 0 9.594 4.53 9.594 11.345 0 6.816-4.673 11.345-9.594 11.345-4.92 0-9.563-4.53-9.563-11.344 0-6.813 4.642-11.343 9.564-11.343zm334.312 0c4.922 0 9.594 4.53 9.594 11.345 0 6.816-4.673 11.345-9.594 11.345-4.92 0-9.562-4.53-9.562-11.344 0-6.813 4.64-11.343 9.562-11.343zM90.344 211.096c4.922 0 9.594 4.53 9.594 11.344 0 6.814-4.673 11.343-9.594 11.343-4.92 0-9.563-4.528-9.563-11.343 0-6.814 4.642-11.343 9.564-11.343zm334.312 0c4.922 0 9.594 4.53 9.594 11.344 0 6.814-4.673 11.343-9.594 11.343-4.92 0-9.562-4.528-9.562-11.343 0-6.814 4.64-11.343 9.562-11.343zm-167.28 43c-31.245 0-56.376 25.13-56.376 56.375 0 19.348 9.646 36.356 24.406 46.5v-19.626h18.688v27.906c4.257 1.02 8.702 1.594 13.28 1.594 4.782 0 9.418-.61 13.845-1.72v-27.78h18.686v19.22c14.44-10.188 23.844-26.995 23.844-46.095 0-31.245-25.13-56.376-56.375-56.376z",
					"name" : "Restrained"
				},
				{
					"value": "stunned",
					"condition" : "You are stunned",
					"effects" : [ 
						"A stunned creature is incapacitated (see the condition), can't move, and can speak only falteringly.", 
						"The creature automatically fails Strength and Dexterity saving throws.", 
						"Attack rolls against the creature have advantage." 
					],
					"icon" : "M358.5 283.23c-22.89 3.1-52 5.23-88.72 6.48-23.3.79-49.43 1.19-77.68 1.19-35.57 0-67.27-.63-86.89-1.09a208.69 208.69 0 0 0 8.9 58.51c22.42 74.88 81.29 125.55 139.88 125.55a99 99 0 0 0 28.48-4.16c65-19.46 98.09-101.96 76.03-186.48zm-162.38 87.28l-13.58-8.25-6 10.53-15.74-9 6.27-10.93-14-8.5 9.42-15.5 13.58 8.25 6-10.53 15.74 9-6.27 10.93 14 8.5zm98.3-25.82l-13.58-8.25-6 10.53-15.74-9 6.24-10.97-14-8.49 9.45-15.51 13.58 8.25 6-10.53 15.74 9-6.27 10.93 14 8.5zm121.79-227.27l22 18.33 24.32-15.08-10.64 26.57 21.86 18.47-28.55-1.91-10.84 26.5-7-27.75-28.54-2.1 24.17-15.23zm-.22-78.84l2.08 17.88 17.62 3.67-16.36 7.5 2 17.89-12.21-13.24-16.41 7.39L401.53 64l-12.1-13.33 17.65 3.55zm-353.07-.45L81.35 60l26.59-10.58-15.13 24.32 18.28 22-27.78-6.87-15.32 24.19-2-28.54-27.74-7.07 26.52-10.76zm353.07 205.31c-4.56 12.66-25.56 26.15-146.72 30.27-25.88.88-52.47 1.18-77.14 1.18-41.91 0-121.2-1.21-121.2-1.21v-16s79.47 1.21 121.21 1.21c24.14 0 50.12-.29 75.43-1.14 38.77-1.29 69.93-3.69 92.62-7.11 34.07-5.15 39.81-11.23 40.63-12.44-.24-.57-1.22-2.35-4.86-5.23-10.14-8-28.53-16-53.3-23.44a202.41 202.41 0 0 0-16.56-21.22c2 .51 4 1 5.88 1.53 35.17 9.36 60 19.64 73.88 30.56 6.51 5.18 13.58 13.36 10.13 23.04zm-304.81-1.51c1.5-7.33 8.84-26.5 12.41-31.92 56.35 3.86 150.85-15.72 176.38-25.16 15.21 13.25 32.71 35.84 40.61 52.19-57.31 6.52-159.43 6.65-229.43 4.9zm19.4-72.09c-10.08-.6-33.73-2.07-42.65 2 11.87 11.21 75 12.46 128.23 4.92 57.06-8.08 110-21.46 141.07-42.63 12.94-8.82 19.78-21.71 18.54-27.43-6.3-29.16-174.12-39.46-174.12-39.46s178.29 3.69 179.61 39.45c1.42 38.36-82.14 67.8-162.44 80.33-76.27 11.9-149.39 12.73-145.6-18.73 2.2-18.28 51.33-14.87 72.59-12.45-4.22 2.91-11.95 10.56-15.26 14.01zm75.88-19.13a106.28 106.28 0 0 1 42.58 4.6c-12.73 3.12-58.29 9.31-85.16 10 21.21-12.93 38.79-14.14 42.55-14.59z",
					"name" : "Stunned"
				},
				{
					"value": "unconscious",
					"condition" : "You are unconscious",
					"effects" : [ 
						"An unconscious creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings", "The creature drops whatever it's holding and falls prone.", "The creature automatically fails Strength and Dexterity saving throws.", 
						"Attack rolls against the creature have advantage.", 
						"Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."
					],
					"icon" : "M256 19.313c-44.404 0-85.098 25.433-115.248 68.123C110.6 130.126 91.594 189.846 91.594 256c0 66.152 19.005 125.87 49.156 168.563 30.15 42.69 70.845 68.125 115.25 68.125 44.402 0 85.07-25.435 115.22-68.125 30.15-42.69 49.186-102.41 49.186-168.563 0-66.152-19.037-125.87-49.19-168.564-30.15-42.69-70.812-68.124-115.214-68.124H256zM204.23 213.88l14.99 9.966-20.074 30.19 30.192 20.073-9.965 14.99-30.19-20.073-20.074 30.192-14.99-9.966 20.07-30.192L144 238.99l9.965-14.99 30.19 20.072 20.074-30.19zm103.54 0l20.074 30.192L358.034 224 368 238.99l-30.19 20.072 20.07 30.192-14.99 9.965-20.072-30.193-30.19 20.073-9.966-14.99 30.192-20.073-20.073-30.19 14.99-9.966zM256 367c26 0 52.242 8.515 70.363 26.637l-12.726 12.726c-3.28-3.28-7.006-6.198-11.067-8.75-.06 1.55-.142 3.128-.27 4.737-.46 5.693-1.33 11.654-3.568 17.257-2.236 5.603-6.655 11.875-14.228 13.487-8.496 1.807-15.982-2.58-21.13-7.59-5.146-5.01-9.12-11.24-12.495-17.422-4.78-8.754-8.213-17.494-9.83-21.902-16.58 2.595-31.98 9.477-42.687 20.183l-12.726-12.726C203.757 375.515 230 367 256 367zm3.945 18.084c1.67 4.095 3.972 9.312 6.735 14.373 2.885 5.286 6.303 10.28 9.25 13.147 2.8 2.724 4.114 2.98 4.728 2.896.056-.07.543-.523 1.358-2.564 1.098-2.752 1.965-7.354 2.34-12.032.333-4.114.343-8.192.257-11.523-7.827-2.495-16.192-3.952-24.668-4.296z",
					"name" : "Unconscious"
				}
			]
		}
	},
	methods: {
	}
}
