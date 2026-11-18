import { ChatError } from "../../../../shared/domain/errors/AppError";
import { Message } from "../../domain/entities/Message";
import { IChatRepository } from "../../domain/repositories/IChatRepository";

export class SendMessageUseCase {
  constructor(private readonly chatRepo: IChatRepository) {}

  async execute(
    roomId: string,
    userId: string,
    content: string,
    imageUri?: string,
  ): Promise<Message> {
    const trimmed = content.trim();
    if (!trimmed && !imageUri) {
      throw new ChatError("El mensaje o la imagen no pueden estar vacíos");
    }
    if (trimmed.length > 500) {
      throw new ChatError("Máximo 500 caracteres");
    }

    let imageUrl: string | undefined;
    if (imageUri) {
      imageUrl = await this.chatRepo.uploadImage(roomId, userId, imageUri);
    }

    return this.chatRepo.sendMessage(roomId, userId, trimmed, imageUrl);
  }
}