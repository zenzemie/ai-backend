import { Injectable, Logger } from '@nestjs/common';
import { LangGraphService } from './langgraph.service';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(private langGraphService: LangGraphService) {}

  async runGraph(initialInput: any) {
    this.logger.log(`Starting graph execution using LangGraph...`);
    return this.langGraphService.runGraph(initialInput);
  }
}
