'use server';

import { prisma } from '@/lib/prisma';

interface CreateCbtRecordData {
  situation: string;
  thought: string;
  emotion: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
}

export async function createCbtRecord(userId: string, data: CreateCbtRecordData) {
  return await prisma.cbtRecord.create({
    data: {
      userId: parseInt(userId),
      situation: data.situation,
      thought: data.thought,
      emotions: JSON.stringify([data.emotion]),
      emotionIntensityBefore: 50,
      evidenceFor: data.evidenceFor,
      evidenceAgainst: data.evidenceAgainst,
      alternativeThought: data.alternativeThought,
      detectedDistortions: JSON.stringify([]),
    },
  });
}

export async function getCbtRecords(userId: string, limit: number = 20) {
  const records = await prisma.cbtRecord.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return records.map(record => ({
    id: record.id.toString(),
    situation: record.situation,
    thought: record.thought,
    emotion: JSON.parse(record.emotions as string)[0] || '',
    evidenceFor: record.evidenceFor,
    evidenceAgainst: record.evidenceAgainst,
    alternativeThought: record.alternativeThought,
    createdAt: record.createdAt.toISOString(),
  }));
}

export async function deleteCbtRecord(userId: string, recordId: string) {
  return await prisma.cbtRecord.delete({
    where: { id: parseInt(recordId), userId: parseInt(userId) },
  });
}