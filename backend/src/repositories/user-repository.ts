import type { RoleName, UserStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export async function findUserWithRolesByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      profile: true,
      userRoles: { include: { role: true } },
    },
  });
}

export async function findUserWithRolesById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      userRoles: { include: { role: true } },
    },
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  displayName: string;
  roleNames: RoleName[];
}) {
  const email = data.email.toLowerCase();
  return prisma.$transaction(async (tx) => {
    const roles = await tx.role.findMany({
      where: { name: { in: data.roleNames } },
    });
    if (roles.length !== data.roleNames.length) {
      throw new Error("Role configuration is invalid");
    }
    const user = await tx.user.create({
      data: {
        email,
        passwordHash: data.passwordHash,
        profile: {
          create: { displayName: data.displayName },
        },
        userRoles: {
          createMany: {
            data: roles.map((r) => ({ roleId: r.id })),
          },
        },
      },
      include: {
        profile: true,
        userRoles: { include: { role: true } },
      },
    });
    return user;
  });
}

export async function updateUserStatus(id: string, status: UserStatus) {
  return prisma.user.update({
    where: { id },
    data: { status },
    include: {
      profile: true,
      userRoles: { include: { role: true } },
    },
  });
}

export function mapRoles(user: {
  userRoles: { role: { name: RoleName } }[];
}): RoleName[] {
  return user.userRoles.map((ur) => ur.role.name);
}
