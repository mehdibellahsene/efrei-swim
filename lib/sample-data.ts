import type { Article, Card, Event, Purchase, User } from "./types"

export const sampleUsers: User[] = [
  {
    id: "1",
    email: "admin@efrei.net",
    name: "Admin",
    role: "admin",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    email: "membre@efrei.net",
    name: "Sophie Martin",
    role: "membre",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    email: "athlete1@efrei.net",
    name: "Thomas Dubois",
    role: "athlete",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    email: "athlete2@efrei.net",
    name: "Emma Bernard",
    role: "athlete",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Entraînement hebdomadaire",
    description: "Entraînement régulier du mardi soir, tous niveaux bienvenus.",
    type: "entrainement",
    date: "2025-04-08T18:30:00",
    duration: 90,
    location: "Piscine Judaïque, Bordeaux",
    participants: [sampleUsers[2], sampleUsers[3]],
  },
  {
    id: "2",
    title: "Compétition inter-écoles",
    description: "Compétition amicale entre les écoles d'ingénieurs de Bordeaux.",
    type: "competition",
    date: "2025-04-15T14:00:00",
    duration: 180,
    location: "Piscine Universitaire, Talence",
    participants: [sampleUsers[2]],
  },
  {
    id: "3",
    title: "Sortie plage",
    description: "Journée détente et baignade à la plage du Porge.",
    type: "sortie",
    date: "2025-04-20T10:00:00",
    duration: 480,
    location: "Plage du Porge",
    participants: [sampleUsers[1], sampleUsers[2], sampleUsers[3]],
  },
  {
    id: "4",
    title: "Entraînement spécial sprint",
    description: "Session focalisée sur les techniques de sprint et les départs.",
    type: "entrainement",
    date: "2025-04-10T18:30:00",
    duration: 90,
    location: "Piscine Judaïque, Bordeaux",
    participants: [sampleUsers[2], sampleUsers[3]],
  },
  {
    id: "5",
    title: "Entraînement endurance",
    description: "Travail sur l'endurance et la technique de respiration.",
    type: "entrainement",
    date: "2025-04-17T18:30:00",
    duration: 90,
    location: "Piscine Judaïque, Bordeaux",
    participants: [sampleUsers[2]],
  },
]

export const sampleCards: Card[] = [
  {
    id: "1",
    cardId: "CARD-001",
    totalEntries: 10,
    remainingEntries: 7,
    status: "active",
    purchasePrice: 45.0,
    notes: "Carte achetée le 01/03/2025",
  },
  {
    id: "2",
    cardId: "CARD-002",
    totalEntries: 20,
    remainingEntries: 15,
    status: "active",
    purchasePrice: 80.0,
    notes: "Carte achetée le 15/03/2025",
  },
  {
    id: "3",
    cardId: "CARD-003",
    totalEntries: 10,
    remainingEntries: 0,
    status: "inactive",
    purchasePrice: 45.0,
    notes: "Carte épuisée le 01/04/2025",
  },
]

export const samplePurchases: Purchase[] = [
  {
    id: "1",
    amount: 45.0,
    label: "Achat carte 10 entrées",
    date: "2025-03-01",
    relatedCardId: "1",
    category: "Entrées piscine",
  },
  {
    id: "2",
    amount: 80.0,
    label: "Achat carte 20 entrées",
    date: "2025-03-15",
    relatedCardId: "2",
    category: "Entrées piscine",
  },
  {
    id: "3",
    amount: 120.0,
    label: "Achat matériel d'entraînement",
    date: "2025-03-20",
    category: "Équipement",
  },
  {
    id: "4",
    amount: 45.0,
    label: "Achat carte 10 entrées",
    date: "2025-02-15",
    relatedCardId: "3",
    category: "Entrées piscine",
  },
  {
    id: "5",
    amount: 75.0,
    label: "Inscription compétition régionale",
    date: "2025-03-25",
    category: "Compétition",
  },
]

export const sampleArticles: Article[] = [
  {
    id: "1",
    authorId: "2",
    author: sampleUsers[1],
    title: "Résultats de la compétition inter-écoles",
    content:
      "Nous sommes fiers d'annoncer que notre équipe a remporté la première place lors de la compétition inter-écoles qui s'est tenue le week-end dernier. Félicitations à tous les participants pour leurs performances exceptionnelles et leur esprit d'équipe remarquable. Un grand merci également à nos coachs pour leur dévouement et leur soutien constant.",
    coverImage: "/placeholder.svg?height=200&width=400",
    createdAt: "2025-03-18T14:30:00",
  },
  {
    id: "2",
    authorId: "2",
    author: sampleUsers[1],
    title: "Nouveaux horaires d'entraînement pour le printemps",
    content:
      "À partir du 1er avril, nous mettons en place de nouveaux horaires d'entraînement pour mieux répondre aux besoins de nos membres. Les séances du mardi et jeudi soir commenceront désormais à 19h au lieu de 18h30, et nous ajoutons une séance supplémentaire le samedi matin à 10h. Ces changements visent à offrir plus de flexibilité et à permettre à un plus grand nombre d'athlètes de participer régulièrement aux entraînements.",
    coverImage: "/placeholder.svg?height=200&width=400",
    createdAt: "2025-03-25T10:15:00",
  },
  {
    id: "3",
    authorId: "2",
    author: sampleUsers[1],
    title: "Conseils pour améliorer votre technique de crawl",
    content:
      "La technique de crawl est fondamentale pour tout nageur souhaitant progresser. Dans cet article, nous partageons quelques conseils pratiques pour améliorer votre efficacité dans l'eau. Nous aborderons la position du corps, la rotation des épaules, le mouvement des bras et la coordination de la respiration. Ces conseils sont issus de l'expertise de nos coachs et peuvent être mis en pratique lors de vos prochains entraînements.",
    coverImage: "/placeholder.svg?height=200&width=400",
    createdAt: "2025-04-01T16:45:00",
  },
  {
    id: "4",
    authorId: "2",
    author: sampleUsers[1],
    title: "Préparation pour la compétition régionale",
    content:
      "La compétition régionale approche à grands pas ! Pour vous aider à vous préparer au mieux, nous avons élaboré un programme d'entraînement spécifique qui sera mis en place dans les semaines à venir. Ce programme mettra l'accent sur le développement de l'endurance, l'amélioration des techniques de départ et de virage, ainsi que sur la gestion du stress en situation de compétition.",
    coverImage: "/placeholder.svg?height=200&width=400",
    createdAt: "2025-04-03T09:20:00",
  },
]

