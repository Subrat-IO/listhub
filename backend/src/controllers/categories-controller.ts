import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export async function getCategories(_req: Request, res: Response): Promise<void> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { attributes: { orderBy: { sortOrder: "asc" } } },
  });
  res.json({ categories });
}

const adminCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(2000).optional(),
  parentId: z.string().uuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function postAdminCategory(req: Request, res: Response): Promise<void> {
  const body = adminCreateSchema.parse(req.body);
  const cat = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      parentId: body.parentId ?? undefined,
      sortOrder: body.sortOrder ?? 0,
    },
  });
  res.status(201).json({ category: cat });
}

const adminPatchSchema = adminCreateSchema.partial();

export async function patchAdminCategory(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id);
  const body = adminPatchSchema.parse(req.body);
  const cat = await prisma.category.update({
    where: { id },
    data: {
      ...body,
      parentId: body.parentId === null ? null : body.parentId,
    },
  });
  res.json({ category: cat });
}

export async function deleteAdminCategory(req: Request, res: Response): Promise<void> {
  const id = z.string().uuid().parse(req.params.id);
  await prisma.category.delete({ where: { id } });
  res.json({ ok: true });
}
