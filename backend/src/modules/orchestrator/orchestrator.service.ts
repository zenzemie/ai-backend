import { Injectable, Logger } from '@nestjs/common';

export interface AgentNode {
  id: string;
  agent: any; // Reference to agent service
}

export interface AgentEdge {
  from: string;
  to: string;
  condition?: (output: any) => boolean;
}

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private nodes: Map<string, any> = new Map();
  private edges: AgentEdge[] = [];

  registerAgent(id: string, agent: any) {
    this.nodes.set(id, agent);
  }

  addEdge(from: string, to: string, condition?: (output: any) => boolean) {
    this.edges.push({ from, to, condition });
  }

  async runGraph(startNodeId: string, initialInput: any) {
    let currentNodeId = startNodeId;
    let currentInput = initialInput;

    this.logger.log(`Starting graph execution from node: ${startNodeId}`);

    while (currentNodeId) {
      const agent = this.nodes.get(currentNodeId);
      if (!agent) {
        throw new Error(`Agent not found: ${currentNodeId}`);
      }

      const output = await agent.processTask(currentInput);
      
      const nextEdge = this.edges.find(
        (edge) =>
          edge.from === currentNodeId &&
          (!edge.condition || edge.condition(output)),
      );

      if (nextEdge) {
        currentNodeId = nextEdge.to;
        currentInput = output;
      } else {
        currentNodeId = null;
        return output;
      }
    }
  }
}
