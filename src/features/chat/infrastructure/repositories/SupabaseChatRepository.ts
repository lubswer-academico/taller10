import { supabase } from "@shared/infrastructure/supabase/client";
import { Message, Room } from "@features/chat/domain/entities/Message";
import { IChatRepository } from "@features/chat/domain/repositories/IChatRepository";
import { optimizeImageToArrayBuffer } from "@features/chat/infrastructure/services/imageOptimizer";

const CHAT_IMAGES_BUCKET = "chat-images";

export class SupabaseChatRepository implements IChatRepository {
 
  async getRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms').select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(this.mapRoom);
  }
 
  async createRoom(name: string, userId: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms').insert({ name, created_by: userId })
      .select().single();
    if (error) throw error;
    return this.mapRoom(data);
  }
 
  async getMessages(roomId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('id, room_id, user_id, content, image_url, created_at, profiles(username)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map(this.mapMessage);
  }
 
  async uploadImage(roomId: string, userId: string, localUri: string): Promise<string> {
    const arrayBuffer = await optimizeImageToArrayBuffer(localUri);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `${roomId}/${userId}_${uniqueSuffix}.jpg`;

    const { data, error } = await supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(CHAT_IMAGES_BUCKET)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    imageUrl?: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content: content || null,
        image_url: imageUrl ?? null,
      })
      .select('id, room_id, user_id, content, image_url, created_at, profiles(username)')
      .single();
    if (error) throw error;
    return this.mapMessage(data);
  }
 
  subscribeToRoom(roomId: string, onMessage: (msg: Message) => void): () => void {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
          event: 'INSERT', schema: 'public',
          table: 'messages', filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // El payload no incluye el username — se obtiene con una query extra
          const { data: profile } = await supabase
            .from('profiles').select('username')
            .eq('id', payload.new.user_id).single();
          onMessage({
            id:             payload.new.id,
            roomId:         payload.new.room_id,
            userId:         payload.new.user_id,
            content:        payload.new.content ?? '',
            imageUrl:       payload.new.image_url ?? undefined,
            createdAt:      new Date(payload.new.created_at),
            authorUsername: profile?.username,
          });
        }
      ).subscribe();
 
    return () => { supabase.removeChannel(channel); };
  }
 
  private mapRoom = (raw: any): Room => ({
    id: raw.id, name: raw.name,
    createdBy: raw.created_by, createdAt: new Date(raw.created_at),
  });
 
  private mapMessage = (raw: any): Message => ({
    id: raw.id, roomId: raw.room_id, userId: raw.user_id,
    content: raw.content ?? '',
    imageUrl: raw.image_url ?? undefined,
    createdAt: new Date(raw.created_at),
    authorUsername: raw.profiles?.username,
  });
}
