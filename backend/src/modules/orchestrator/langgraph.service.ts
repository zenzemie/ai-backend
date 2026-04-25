import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, END, START } from '@langchain/langgraph';
import { ScoutAgent } from '../agent/scout.agent';
import { StrategistAgent } from '../agent/strategist.agent';
import { ExecutionAgent } from '../agent/execution.agent';
import { ReviewerAgent } from '../agent/reviewer.agent';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { RoutingService } from './routing.service';
import { withSpan } from '../../otel';

export interface AgentState {
  data: any;
  strategy?: any;
  result?: any;
  errors: string[];
  iterations: number;
  needsRevision?: boolean;
}

@Injectable()
export class LangGraphService {
  private readonly logger = new Logger(LangGraphService.name);
  private graph: any;

  constructor(
    private scout: ScoutAgent,
    private strategist: StrategistAgent,
    private execution: ExecutionAgent,
    private reviewer: ReviewerAgent,
    private knowledgeService: KnowledgeService,
    private routingService: RoutingService,
  ) {
    this.initGraph();
  }

  private initGraph() {
    const workflow = new StateGraph<AgentState>({
      channels: {
        data: {
          reducer: (a, b) => ({ ...a, ...b }),
          default: () => ({}),
        },
        strategy: {
          reducer: (a, b) => b ?? a,
          default: () => null,
        },
        result: {
          reducer: (a, b) => b ?? a,
          default: () => null,
        },
        errors: {
          reducer: (a, b) => [...a, ...b],
          default: () => [],
        },
        iterations: {
          reducer: (a, b) => b ?? a,
          default: () => 0,
        },
        needsRevision: {
          reducer: (a, b) => b ?? a,
          default: () => false,
        },
      },
    })
      .addNode('scout', async (state) => {
        return withSpan('agent.scout', async (span) => {
          span.setAttribute('agent.id', 'scout');
          span.setAttribute('agent.thought', 'Analyzing lead data and generating embeddings for context.');
          
          const similar = await this.knowledgeService.findSimilarSuccesses(state.data.industry || '');
          span.setAttribute('agent.reasoning', `Found ${similar.length} similar past successes. Enhancing context.`);

          const output = await this.scout.processTask(state.data);
          span.setAttributes({
            'agent.output.source': output.source,
          });
          return { data: output };
        });
      })
      .addNode('strategist', async (state) => {
        return withSpan('agent.strategist', async (span) => {
          span.setAttribute('agent.id', 'strategist');
          span.setAttribute('agent.thought', 'Selecting the best model and strategy based on current performance bandit.');
          
          const similar = await this.knowledgeService.findSimilarSuccesses(state.data.industry || '');
          const topStrategy = similar[0]?.entity || 'none';
          span.setAttribute('agent.reasoning', `Top performing strategy in this industry was: ${topStrategy}`);

          const output = await this.strategist.processTask(state.data);
          span.setAttribute('agent.strategy.id', output.strategy?.id);
          return { strategy: output.strategy, data: output };
        });
      })
      .addNode('execution', async (state) => {
        return withSpan('agent.execution', async (span) => {
          span.setAttribute('agent.id', 'execution');
          span.setAttribute('agent.thought', 'Generating personalized outreach message using selected model.');
          
          const similar = await this.knowledgeService.findSimilarSuccesses(state.data.industry || '');
          span.setAttribute('agent.reasoning', `Using knowledge from ${similar.length} past successes to refine tone.`);

          const output = await this.execution.processTask(state.data);
          span.setAttribute('agent.result.length', output.result?.length || 0);
          return { result: output.result, data: output };
        });
      })
      .addNode('reviewer', async (state) => {
        return withSpan('agent.reviewer', async (span) => {
          span.setAttribute('agent.id', 'reviewer');
          span.setAttribute('agent.thought', 'Validating output against quality standards and compliance rules.');
          const output = await this.reviewer.processTask(state.data);
          span.setAttribute('agent.needsRevision', output.needsRevision);
          if (output.needsRevision) {
              span.setAttribute('agent.reasoning', `Rejected output: ${output.reviewFeedback}`);
          } else {
              span.setAttribute('agent.reasoning', 'Output passed all quality checks.');
          }
          return { 
            needsRevision: output.needsRevision, 
            iterations: (state.iterations || 0) + 1 
          };
        });
      })
      .addNode('memory', async (state) => {
        return withSpan('agent.memory', async (span) => {
            span.setAttribute('agent.thought', 'Recording the execution outcome and extracting knowledge for future optimization.');
            this.logger.log('Memory node extracting entities and recording outcome...');
            if (state.result) {
                await this.knowledgeService.extractAndStoreEntities(state.result);
                const isSuccessful = !state.needsRevision;
                await this.knowledgeService.recordOutcome(state.data, state.strategy, isSuccessful);
                
                // Record feedback to the bandit pool for routing optimization
                if (state.strategy?.id) {
                    this.routingService.recordFeedback(state.strategy.id, isSuccessful, {
                        latency: 0, // In a real scenario, we'd track actual latency
                        tokens: 0,
                    });
                }
            }
            span.setAttribute('agent.reasoning', `Stored outcome for strategy ${state.strategy?.id}`);
            return {};
        });
      });

    workflow.addEdge(START, 'scout');
    workflow.addEdge('scout', 'strategist');
    workflow.addEdge('strategist', 'execution');
    workflow.addEdge('execution', 'reviewer');

    workflow.addConditionalEdges('reviewer', (state) => {
      if (state.needsRevision && state.iterations < 3) {
        return 'strategist';
      }
      return 'memory';
    });

    workflow.addEdge('memory', END);

    this.graph = workflow.compile();
  }

  async runGraph(input: any) {
    this.logger.log('Running LangGraph workflow...');
    const initialState: Partial<AgentState> = {
      data: input,
      errors: [],
      iterations: 0,
    };

    const result = await this.graph.invoke(initialState);
    return result;
  }

  getTopology() {
    // Return a simplified topology for the dashboard
    return {
      nodes: ['scout', 'strategist', 'execution', 'reviewer', 'memory'],
      edges: [
        { from: 'START', to: 'scout' },
        { from: 'scout', to: 'strategist' },
        { from: 'strategist', to: 'execution' },
        { from: 'execution', to: 'reviewer' },
        { from: 'reviewer', to: 'strategist', condition: 'needsRevision && iterations < 3' },
        { from: 'reviewer', to: 'memory', condition: 'else' },
        { from: 'memory', to: 'END' },
      ],
    };
  }
}
