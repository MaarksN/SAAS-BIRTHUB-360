export interface ShardConfig {
  shardId: string;
  databaseUrl: string;
  region: string;
}

export class ShardingManager {
  private shards: Map<string, ShardConfig> = new Map();

  registerShard(config: ShardConfig) {
    this.shards.set(config.shardId, config);
  }

  getShardForUser(userId: string): ShardConfig | undefined {
    // Simple consistent hashing or lookup table strategy
    // For demo purposes, we return the first shard
    return this.shards.values().next().value;
  }
}
