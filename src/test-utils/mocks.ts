export function mockCryptoRandomUUID(): { mockId: string; restore: () => void } {
  const mockId = '550e8400-e29b-41d4-a716-446655440000';
  const originalRandomUUID = crypto.randomUUID;

  crypto.randomUUID = () => mockId as `${string}-${string}-${string}-${string}-${string}`;

  const restore = () => {
    crypto.randomUUID = originalRandomUUID;
  };

  return { mockId, restore };
}

export function withMockedCryptoUUID<T>(callback: (mockId: string) => T): T {
  const { mockId, restore } = mockCryptoRandomUUID();
  try {
    return callback(mockId);
  } finally {
    restore();
  }
}

export class UUIDGenerator {
  private counter = 0;

  next(): string {
    return `test-uuid-${this.counter++}`;
  }

  reset(): void {
    this.counter = 0;
  }
}
