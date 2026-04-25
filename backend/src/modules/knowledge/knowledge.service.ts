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

  async getContext(query: string) {
    const hybrid = await this.hybridSearch(query);
    const graph = await this.graphSearch(query);

    return {
      hybrid,
      graph,
    };
  }
}
