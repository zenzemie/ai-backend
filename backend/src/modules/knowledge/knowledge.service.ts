import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(private prisma: PrismaService) {}

  async hybridSearch(query: string) {
    // keyword search using FTS
    // Note: This is a simplified version for demonstration
    this.logger.log(`Performing hybrid search for: ${query}`);
    try {
        const keywordResults = await this.prisma.$queryRaw`
          SELECT * FROM "Lead" 
          WHERE name ILIKE ${'%' + query + '%'}
          LIMIT 5
        `;
        return keywordResults;
    } catch (error) {
        this.logger.error('Hybrid search failed', error);
        return [];
    }
  }

  async graphSearch(entity: string) {
    this.logger.log(`Performing graph search for entity: ${entity}`);
    return this.prisma.knowledgeGraph.findMany({
      where: {
        OR: [
          { entity: { contains: entity, mode: 'insensitive' } },
          { target: { contains: entity, mode: 'insensitive' } },
        ],
      },
    });
  }

  async addKnowledge(entity: string, relation: string, target: string, metadata?: any) {
    this.logger.log(`Adding knowledge: ${entity} ${relation} ${target}`);
    return this.prisma.knowledgeGraph.create({
      data: {
        entity,
        relation,
        target,
        metadata,
      },
    });
  }

  async recordOutcome(context: any, strategy: any, success: boolean) {
    this.logger.log(`Recording outcome for strategy ${strategy?.id}: ${success ? 'SUCCESS' : 'FAILURE'}`);
    return this.addKnowledge(
      `strategy:${strategy?.id}`,
      'had_outcome',
      success ? 'success' : 'failure',
      {
        context,
        timestamp: new Date().toISOString(),
      }
    );
  }

  async getSuccessfulExamples(limit: number = 5) {
    return this.prisma.knowledgeGraph.findMany({
      where: {
        relation: 'had_outcome',
        target: 'success',
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSimilarSuccesses(query: string, limit: number = 3) {
    this.logger.log(`Finding similar successes for: ${query}`);
    return this.prisma.knowledgeGraph.findMany({
      where: {
        relation: 'had_outcome',
        target: 'success',
        OR: [
          { entity: { contains: query, mode: 'insensitive' } },
          { metadata: { path: ['context', 'industry'], equals: query } }
        ]
      },
      take: limit,
    });
  }

  async extractAndStoreEntities(text: string) {
    // In a real scenario, we would use an LLM to extract triples.
    // For this implementation, we'll do a simple mock extraction.
    this.logger.log(`Extracting entities from text...`);
    
    // Mock extraction logic
    if (text.includes('works at')) {
        const parts = text.split('works at');
        const entity = parts[0].trim();
        const target = parts[1].trim();
        await this.addKnowledge(entity, 'works_at', target);
    }
  }

  async getContext(query: string) {
    const hybrid = await this.hybridSearch(query);
    const graph = await this.graphSearch(query);

    return {
      hybrid,
      graph,
    };
  }
}
