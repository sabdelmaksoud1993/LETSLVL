import { createClient } from "@/lib/supabase-browser";
import type { ChatMessage, Bid, Auction, Stream } from "@/types/database";

/**
 * Subscribe to new chat messages for a stream.
 * Returns an unsubscribe function.
 */
export function subscribeToChatMessages(
  streamId: string,
  onMessage: (msg: ChatMessage) => void,
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`chat:${streamId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `stream_id=eq.${streamId}`,
      },
      async (payload) => {
        const row = payload.new as {
          id: string;
          stream_id: string;
          user_id: string;
          message: string;
          created_at: string;
        };

        // Fetch the profile for user_name and avatar
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", row.user_id)
          .single();

        // Check if user is the stream seller
        const { data: stream } = await supabase
          .from("streams")
          .select("seller_id")
          .eq("id", row.stream_id)
          .single();

        const chatMessage: ChatMessage = {
          id: row.id,
          stream_id: row.stream_id,
          user_id: row.user_id,
          user_name: profile?.full_name ?? "Anonymous",
          user_avatar: profile?.avatar_url ?? null,
          message: row.message,
          created_at: row.created_at,
          is_seller: stream?.seller_id === row.user_id,
        };

        onMessage(chatMessage);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to bid updates for an auction.
 * Returns an unsubscribe function.
 */
export function subscribeToBids(
  auctionId: string,
  onBid: (bid: Bid) => void,
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`bids:${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "bids",
        filter: `auction_id=eq.${auctionId}`,
      },
      async (payload) => {
        const row = payload.new as {
          id: string;
          auction_id: string;
          user_id: string;
          amount: number;
          status: string;
          created_at: string;
        };

        // Fetch the profile for user_name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", row.user_id)
          .single();

        const bid: Bid = {
          id: row.id,
          auction_id: row.auction_id,
          user_id: row.user_id,
          user_name: profile?.full_name ?? "Anonymous",
          amount: row.amount,
          created_at: row.created_at,
          status: row.status as Bid["status"],
        };

        onBid(bid);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to auction status changes (current_bid, status, bid_count, etc.).
 * Returns an unsubscribe function.
 */
export function subscribeToAuction(
  auctionId: string,
  onUpdate: (auction: Partial<Auction> & { id: string }) => void,
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`auction:${auctionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "auctions",
        filter: `id=eq.${auctionId}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        onUpdate({
          id: row.id as string,
          current_bid: row.current_bid as number,
          bid_count: row.bid_count as number,
          status: row.status as Auction["status"],
          winner_id: (row.winner_id as string) ?? null,
          end_time: row.end_time as string,
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to stream viewer count and status changes.
 * Returns an unsubscribe function.
 */
export function subscribeToStream(
  streamId: string,
  onUpdate: (stream: Partial<Stream> & { id: string }) => void,
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`stream:${streamId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "streams",
        filter: `id=eq.${streamId}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        onUpdate({
          id: row.id as string,
          viewer_count: row.viewer_count as number,
          status: row.status as Stream["status"],
          ended_at: (row.ended_at as string) ?? null,
        });
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Send a chat message to a stream.
 */
export async function sendChatMessage(
  streamId: string,
  userId: string,
  message: string,
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("chat_messages").insert({
    stream_id: streamId,
    user_id: userId,
    message,
  });

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

/**
 * Place a bid on an auction.
 * Returns success/error status.
 */
export async function placeBid(
  auctionId: string,
  userId: string,
  amount: number,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // First, fetch the current auction state to validate the bid
  const { data: auction, error: fetchError } = await supabase
    .from("auctions")
    .select("current_bid, status")
    .eq("id", auctionId)
    .single();

  if (fetchError) {
    return { success: false, error: "Could not fetch auction details." };
  }

  if (auction.status !== "active" && auction.status !== "closing") {
    return { success: false, error: "This auction is no longer accepting bids." };
  }

  if (amount <= auction.current_bid) {
    return {
      success: false,
      error: `Bid must be higher than current bid of ${auction.current_bid}.`,
    };
  }

  // Insert the bid
  const { error: bidError } = await supabase.from("bids").insert({
    auction_id: auctionId,
    user_id: userId,
    amount,
    status: "active",
  });

  if (bidError) {
    return { success: false, error: `Failed to place bid: ${bidError.message}` };
  }

  // Update auction current_bid and bid_count atomically via RPC
  const { error: rpcError } = await supabase.rpc("increment_bid_count", {
    auction_id_input: auctionId,
    new_bid_amount: amount,
  });

  // Fallback: if RPC doesn't exist, update directly
  if (rpcError) {
    await supabase
      .from("auctions")
      .update({ current_bid: amount })
      .eq("id", auctionId);
  }

  // Mark previous active bids as outbid
  await supabase
    .from("bids")
    .update({ status: "outbid" })
    .eq("auction_id", auctionId)
    .eq("status", "active")
    .neq("user_id", userId);

  return { success: true };
}

/**
 * Fetch initial chat messages for a stream (last 50).
 */
export async function fetchChatMessages(
  streamId: string,
): Promise<ChatMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      `
      id,
      stream_id,
      user_id,
      message,
      created_at,
      profiles:user_id (
        full_name,
        avatar_url,
        role
      )
    `,
    )
    .eq("stream_id", streamId)
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    console.error("Failed to fetch chat messages:", error.message);
    return [];
  }

  // Fetch stream to determine seller_id
  const { data: stream } = await supabase
    .from("streams")
    .select("seller_id")
    .eq("id", streamId)
    .single();

  const sellerId = stream?.seller_id ?? "";

  return (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as {
      full_name: string | null;
      avatar_url: string | null;
      role: string | null;
    } | null;

    return {
      id: row.id as string,
      stream_id: row.stream_id as string,
      user_id: row.user_id as string,
      user_name: profile?.full_name ?? "Anonymous",
      user_avatar: profile?.avatar_url ?? null,
      message: row.message as string,
      created_at: row.created_at as string,
      is_seller: (row.user_id as string) === sellerId,
    };
  });
}

/**
 * Fetch recent bids for an auction (last 10, newest first).
 */
export async function fetchRecentBids(auctionId: string): Promise<Bid[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("bids")
    .select(
      `
      id,
      auction_id,
      user_id,
      amount,
      status,
      created_at,
      profiles:user_id (
        full_name
      )
    `,
    )
    .eq("auction_id", auctionId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Failed to fetch bids:", error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as { full_name: string | null } | null;

    return {
      id: row.id as string,
      auction_id: row.auction_id as string,
      user_id: row.user_id as string,
      user_name: profile?.full_name ?? "Anonymous",
      amount: row.amount as number,
      created_at: row.created_at as string,
      status: row.status as Bid["status"],
    };
  });
}
