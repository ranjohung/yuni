'use server';

import { prisma } from '@/lib/prisma';

interface CreateNvcRecordData {
  observation: string;
  feeling: string;
  need: string;
  request: string;
  feedback?: string;
}

export async function createNvcRecord(userId: string, data: CreateNvcRecordData) {
  return await prisma.nvcRecord.create({
    data: {
      userId: parseInt(userId),
      observation: data.observation,
      feeling: data.feeling,
      need: data.need,
      request: data.request,
      feedback: data.feedback || '',
    },
  });
}

export async function getNvcRecords(userId: string, limit: number = 20) {
  const records = await prisma.nvcRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return records.map(record => ({
    id: record.id.toString(),
    observation: record.observation,
    feeling: record.feeling,
    need: record.need,
    request: record.request,
    feedback: record.feedback,
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function updateNvcRecord(userId: string, recordId: string, data: Partial<CreateNvcRecordData>) {
  return await prisma.nvcRecord.update({
    where: { id: parseInt(recordId), userId: parseInt(userId) },
    data,
  });
}

export async function deleteNvcRecord(userId: string, recordId: string) {
  return await prisma.nvcRecord.delete({
    where: { id: parseInt(recordId), userId: parseInt(userId) },
  });
}