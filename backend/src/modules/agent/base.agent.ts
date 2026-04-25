import { Injectable, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@nestjs/common';

@Injectable()
export abstract class BaseAgent implements OnModuleInit {
  protected readonly id: string;
  protected readonly logger: Logger;

  constructor(protected readonly type: string) {
    this.id = `${type}-${uuidv4()}`;
    this.logger = new Logger(this.id);
  }

  async onModuleInit() {
    this.logger.log(`Starting agent: ${this.id}`);
    this.startHeartbeat();
    await this.setupSubscriptions();
  }

  private startHeartbeat() {
    setInterval(() => {
      // Implement heartbeat logic with NATS or similar
      // this.nats.publish(...)
    }, 5000);
  }

  abstract setupSubscriptions(): Promise<void>;

  abstract processTask(task: any): Promise<any>;
}
