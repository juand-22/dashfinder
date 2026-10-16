import { isIP } from "node:net";
import * as findClient from "./find.client";
import * as findRepository from "./find.repository";

export async function findUsersByUsername(username: string) {
  return findRepository.findUsersByUsername(username);
}

export async function findCountryByIp(ip: string) {
  if (!isIP(ip)) {
    throw new Error("IP geolocation requires a valid IP address");
  }

  return findClient.fetchIpCountry(ip);
}

export async function findMinecraftProfile(username: string) {
  return findClient.fetchMinecraftProfile(username);
}

export async function getMinecraftServerStatus(address: string) {
  return findClient.fetchMinecraftServerStatus(address);
}
