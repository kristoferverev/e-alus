"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Database } from "@/lib/database.types";
import { ChatInterface } from "../../../components/chat/chat-interface";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function ChatPage(props: any) {
  const conversationId = props.params.conversationId;
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `
      id,
      listing:listings (*),
      buyer:profiles!conversations_buyer_id_fkey (id, full_name, company_name),
      seller:profiles!conversations_seller_id_fkey (id, full_name, company_name)
    `
    )
    .eq("id", conversationId)
    .single();

  if (!conversation) {
    notFound();
  }

  // Turvakontroll: veendu, et sisseloginud kasutaja on vestluse osaline
  if (
    !conversation.buyer || !conversation.seller ||
    (session.user.id !== conversation.buyer.id &&
    session.user.id !== conversation.seller.id)
  ) {
    notFound();
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
    
  const otherParticipant = session.user.id === conversation.buyer.id
    ? conversation.seller
    : conversation.buyer;

  const otherParticipantName = otherParticipant?.company_name || otherParticipant?.full_name || "Teadmata";

  return (
    <div className="flex-1 flex flex-col">
       <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle>Vestlus</CardTitle>
            <CardDescription>
              Kuulutuse{" "}
              <Link href={`/listings/${conversation.listing?.id}`} className="underline hover:text-primary">
                {conversation.listing?.title}
              </Link>
              {" "}teemal. Vestluskaaslane: {otherParticipantName}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex">
          <ChatInterface
            initialMessages={messages || []}
            conversationId={conversationId}
            session={session}
          />
        </CardContent>
      </Card>
    </div>
  );
}