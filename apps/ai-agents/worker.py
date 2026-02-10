import asyncio
import json
import redis.asyncio as redis
import os
import time
import psutil
from services.crawler import DeepCrawler

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
QUEUE_NAME = "ai:agents:crawl_queue"

class Worker:
    def __init__(self):
        self.crawler = DeepCrawler()
        self.redis = redis.from_url(REDIS_URL, decode_responses=True)
        self.running = True
        self.failure_threshold = 5
        self.jobs_processed = 0
        self.max_jobs = 100
        self.max_memory_mb = 500

    async def start(self):
        print(f"Worker started. Listening on {QUEUE_NAME}...")
        while self.running:
            try:
                # Use blpop async
                item = await self.redis.blpop(QUEUE_NAME, timeout=1)

                if item:
                    queue, data = item
                    job = json.loads(data)
                    print(f"Processing job: {job}")

                    if job.get("type") == "crawl":
                        url = job["payload"].get("url")
                        await self.process_crawl(url)
                        self.jobs_processed += 1
                    elif job.get("type") == "rag_index":
                        # await self.process_rag(job["payload"])
                        pass

                # Check memory usage (Cycle 12)
                if self.should_restart():
                    print("Restarting worker due to memory/job limit...")
                    self.running = False
                    # Allow orchestrator (Docker/PM2) to restart process
                    break

            except Exception as e:
                print(f"Worker Error: {e}")
                await asyncio.sleep(1)

    def should_restart(self) -> bool:
        if self.jobs_processed >= self.max_jobs:
            print(f"Max jobs processed ({self.jobs_processed}). Restarting.")
            return True

        process = psutil.Process(os.getpid())
        mem_info = process.memory_info()
        mem_mb = mem_info.rss / 1024 / 1024

        if mem_mb > self.max_memory_mb:
            print(f"Memory limit exceeded ({mem_mb:.2f}MB > {self.max_memory_mb}MB). Restarting.")
            return True

        return False

    async def process_crawl(self, url: str):
        if not url:
            return

        domain = url.split("/")[2]
        if await self.is_circuit_open(domain):
            print(f"Circuit open for {domain}. Skipping.")
            return

        try:
            result = await self.crawler.crawl(url)
            print(f"Crawl result for {url}: {result}")
            # Save result to DB or Redis
            # Example: Store result in Redis
            result_key = f"crawl:result:{url}"
            await self.redis.set(result_key, json.dumps(result), ex=86400)
        except Exception as e:
            print(f"Crawl failed: {e}")
            await self.record_failure(domain)

    async def is_circuit_open(self, domain: str) -> bool:
        return await self.redis.get(f"circuit:open:{domain}") is not None

    async def record_failure(self, domain: str):
        key = f"circuit:failure_count:{domain}"
        count = await self.redis.incr(key)
        await self.redis.expire(key, 60) # 1 min window

        if count > self.failure_threshold:
            await self.redis.set(f"circuit:open:{domain}", "1", ex=600) # Open for 10 min
            print(f"Circuit breaker opened for {domain}")

if __name__ == "__main__":
    worker = Worker()
    asyncio.run(worker.start())
