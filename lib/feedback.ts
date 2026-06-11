import { prisma } from "./prisma";

export type CreateFeedbackInput = {
  rating: number;
  message?: string | null;
  ticketNumber?: string | null;
};

const normalizeOptionalText = (value: string | null | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

export const createFeedback = async (input: CreateFeedbackInput) => {
  const created = await prisma.feedback.create({
    data: {
      rating: input.rating,
      message: normalizeOptionalText(input.message),
      ticketNumber: normalizeOptionalText(input.ticketNumber),
    },
  });

  return {
    id: created.id,
    rating: created.rating,
    message: created.message ?? "",
    ticketNumber: created.ticketNumber ?? "",
    createdAt: created.createdAt.toISOString(),
  };
};
