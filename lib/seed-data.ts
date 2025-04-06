import { supabase } from "./supabase";

export async function seedInitialData() {
  try {
    // Create sample events
    await supabase.from('events').insert([
      {
        title: "Entraînement hebdomadaire",
        description: "Entraînement régulier du mardi soir, tous niveaux bienvenus.",
        type: "entrainement",
        event_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        location: "Piscine Judaïque, Bordeaux"
      },
      {
        title: "Compétition inter-écoles",
        description: "Compétition amicale entre les écoles d'ingénieurs de Bordeaux.",
        type: "competition",
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 180,
        location: "Piscine Universitaire, Talence"
      }
    ]);

    // Create sample cards
    await supabase.from('cards').insert([
      {
        card_id: "CARD-001",
        total_entries: 10,
        remaining_entries: 7,
        status: "active",
        purchase_price: 45.0,
        notes: "Carte achetée pour le club"
      },
      {
        card_id: "CARD-002",
        total_entries: 20,
        remaining_entries: 20,
        status: "active",
        purchase_price: 80.0,
        notes: "Carte pour compétitions"
      }
    ]);

    console.log("Sample data seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    return false;
  }
}