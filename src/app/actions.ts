"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { z } from "zod";

// Zod schema for validation on the server
const listingFormSchema = z.object({
  title: z.string().min(5),
  description: z.string().optional(),
  pallet_type: z.enum(["EUR/EPAL", "FIN", "MUU"]),
  pallet_condition: z.enum(["UUS", "KASUTATUD_HELE", "KASUTATUD_TUME"]),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().positive(),
  location: z.string().min(2),
});

export async function createListingAction(formData: unknown) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Peate olema sisse logitud, et kuulutust lisada." };
  }

  const validatedFields = listingFormSchema.safeParse(formData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Vigased andmed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { title, description, pallet_type, pallet_condition, quantity, price, location } = validatedFields.data;

  const { data, error } = await supabase
    .from("listings")
    .insert([{
      user_id: user.id,
      title,
      description,
      pallet_type,
      pallet_condition,
      quantity,
      price,
      location,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating listing:", error);
    return { success: false, error: "Andmebaasi viga: kuulutuse loomine ebaõnnestus." };
  }

  return { success: true, data };
}

export async function getOrCreateConversationAction(listingId: string, sellerId: string) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Peate olema sisse logitud." };
  }
  
  if (user.id === sellerId) {
    return { success: false, error: "Oma kuulutusele ei saa sõnumit saata." };
  }

  // 1. Kontrolli, kas vestlus juba eksisteerib
  let { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .single();

  // 2. Kui ei eksisteeri, loo uus
  if (!conversation) {
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return { success: false, error: "Vestluse loomine ebaõnnestus." };
    }
    conversation = newConversation;
  }
  
  return { success: true, data: conversation };
}

export async function sendMessageAction(conversationId: string, content: string) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Peate olema sisse logitud." };
  }
  
  // Turvakontroll: kontrolli, kas kasutaja on vestluse osaline
  const { data: conversation } = await supabase
    .from("conversations")
    .select("buyer_id, seller_id")
    .eq("id", conversationId)
    .single();

  if (!conversation || (user.id !== conversation.buyer_id && user.id !== conversation.seller_id)) {
    return { error: "Teil ei ole õigust sellesse vestlusesse postitada." };
  }

  // Lisa sõnum andmebaasi
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content,
  });

  if (error) {
    console.error("Error sending message:", error);
    return { error: "Sõnumi saatmine ebaõnnestus." };
  }

  return { success: true };
}