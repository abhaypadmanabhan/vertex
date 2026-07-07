/**
 * Neo4j driver singleton, server-side only. Lane 2 owns this until Lane 5's
 * lib/client.ts lands (that will hold the cross-lane singleton); this local
 * copy exists so graph/ + lib/graph.ts are self-contained in the meantime.
 */
import neo4j, { type Driver, type Session } from "neo4j-driver";
import { NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD } from "../lib/config";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  }
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
