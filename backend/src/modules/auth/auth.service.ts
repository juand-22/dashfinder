import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import env  from "../../config/env";
import type { LoginInput, RegisterInput } from "./auth.schema";

export async function register(data: RegisterInput) {
  const username = data.username.toLowerCase().trim();

  const existUser = await prisma.user.findUnique({
    where: { username }
  });

  if (existUser) {
    throw new Error("USERNAME_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      username,
      password: hashedPassword
    },
    select: {
      id: true,
      username: true,
      createdAt: true
    }
  });

  const token = jwt.sign(
    {
      userId: newUser.id,
      username: newUser.username
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user: newUser, token };
}

export async function login(data: LoginInput) {
  const username = data.username.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);

  if (!isMatch) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      username: user.username
    },
    token
  };
}