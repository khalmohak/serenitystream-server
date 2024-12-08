import { Request, Response } from 'express';
import { SearchService } from '../services/searchServices';

export class SearchController {
  private searchService: SearchService;
  
  constructor() {
    this.searchService = new SearchService();
    this.initializeSearchService();
  }
  
  private async initializeSearchService() {
    try {
      await this.searchService.initialize();
    } catch (error) {
      console.error('Failed to initialize SearchController:', error);
    }
  }
  
  globalSearch = async (req: Request, res: Response) => {
    try {
      const { query, limit } = req.query;
      const results = await this.searchService.globalSearch(
        query as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(results);
    } catch (error) {
      console.error('Global search error:', error);
      res.status(500).json({ error: 'Failed to perform global search' });
    }
  };
  
  institutionSearch = async (req: Request, res: Response) => {
    try {
      const { query, limit } = req.query;
      const results = await this.searchService.institutionSearch(
        query as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(results);
    } catch (error) {
      console.error('Institution search error:', error);
      res.status(500).json({ error: 'Failed to perform institution search' });
    }
  };
  
  instructorSearch = async (req: Request, res: Response) => {
    try {
      const { query, limit } = req.query;
      const results = await this.searchService.instructorSearch(
        query as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(results);
    } catch (error) {
      console.error('Instructor search error:', error);
      res.status(500).json({ error: 'Failed to perform instructor search' });
    }
  };
  
  refreshSearchData = async (req: Request, res: Response) => {
    try {
      await this.searchService.refreshSearchData();
      res.json({ message: 'Search data refreshed successfully' });
    } catch (error) {
      console.error('Refresh search data error:', error);
      res.status(500).json({ error: 'Failed to refresh search data' });
    }
  };
}