export type DehashStatus =
    | "DEHASHING"
    | "FOUND"
    | "NOT_FOUND"
    | "SERVER_ERROR"
    | "INVALID";

export interface DehashSearchResult {
    found: boolean;
    message: string;
    password: string | null;
    algorithm: string | null;
    kind: string | null;
    recipe: string | null;
    salt: string | null;
    candidates: number;
    elapsed: number;
    tolerant: boolean;
    missingPosition: number | null;
    missingChar: string | null;
}

export interface DehashResult {
    found: boolean;
    message: string;
    password: string | null;
    status: DehashStatus;
    name: string | null;
    hash: string;
}

export interface DehashAttempt {
    id: number;
    hash: string;
    name: string | null;
    result: string | null;
    status: DehashStatus;
}

export type DehashCounts = Record<DehashStatus, number>;

export interface DehashPage {
    items: DehashAttempt[];
    total: number;
    counts: DehashCounts;
}
