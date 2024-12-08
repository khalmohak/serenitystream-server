import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { Course, Institution } from "../entities";
import { Instructor } from "../entities/Instructor";
import Fuse from 'fuse.js';

interface SearchResultBase {
  type: 'course' | 'institution' | 'instructor';
  id: string;
  title: string;
  description?: string;
}

interface CourseSearchResult extends SearchResultBase {
  type: 'course';
  price: number;
  instructorName: string;
  institutionName?: string;
}

interface InstitutionSearchResult extends SearchResultBase {
  type: 'institution';
  domain: string;
  coursesCount: number;
}

interface InstructorSearchResult extends SearchResultBase {
  type: 'instructor';
  institutionName?: string;
  specializations?: string[];
}

type SearchResult = CourseSearchResult | InstitutionSearchResult | InstructorSearchResult;

export class SearchService {
  private courseRepository: Repository<Course>;
  private institutionRepository: Repository<Institution>;
  private instructorRepository: Repository<Instructor>;
  
  private courseFuse: Fuse<Course>;
  private institutionFuse: Fuse<Institution>;
  private instructorFuse: Fuse<Instructor>;
  
  private courseData: Course[] = [];
  private institutionData: Institution[] = [];
  private instructorData: Instructor[] = [];
  
  constructor() {
    this.courseFuse = new Fuse([], {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3,
      includeScore: true
    });
    
    this.institutionFuse = new Fuse([], {
      keys: ['name', 'description', 'tags'],
      threshold: 0.3,
      includeScore: true
    });
    
    this.instructorFuse = new Fuse([], {
      keys: ['user.firstName', 'user.lastName', 'bio', 'specializations', 'title'],
      threshold: 0.3,
      includeScore: true
    });
  }

  async initialize() {
    try {
      if (!AppDataSource.isInitialized) {
        console.log("Search Service not initialized");
      }

      this.courseRepository = AppDataSource.getRepository(Course);
      this.institutionRepository = AppDataSource.getRepository(Institution);
      this.instructorRepository = AppDataSource.getRepository(Instructor);

      await this.loadData();
    } catch (error) {
      console.error('Error initializing SearchService:', error);
      throw new Error('Failed to initialize SearchService');
    }
  }
  
  private async loadData(): Promise<void> {
    try {
      this.courseData = await this.courseRepository.find({
        relations: {
          instructor: {
            user: true
          },
          institution: true
        },
        where: { isPublished: true }
      });
      
      this.institutionData = await this.institutionRepository.find({
        relations: ['courses']
      });
      
      this.instructorData = await this.instructorRepository.find({
        relations: {
          user: true,
          institution: true,
          courses: true
        }
      });
      
      this.courseFuse.setCollection(this.courseData);
      this.institutionFuse.setCollection(this.institutionData);
      this.instructorFuse.setCollection(this.instructorData);
      
    } catch (error) {
      console.error('Error loading search data:', error);
      throw new Error('Failed to load search data');
    }
  }
  
  async refreshSearchData(): Promise<void> {
    await this.loadData();
  }
  
  globalSearch = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
    if (!query.trim()) {
      return [];
    }
    
    const courseResults = this.courseFuse.search(query, { limit });
    const institutionResults = this.institutionFuse.search(query, { limit });
    const instructorResults = this.instructorFuse.search(query, { limit });
    
    const results: SearchResult[] = [
      ...courseResults.map(result => ({
        type: 'course' as const,
        id: result.item.id,
        title: result.item.title,
        description: result.item.description,
        price: result.item.price,
        instructorName: `${result.item.instructor.user.firstName} ${result.item.instructor.user.lastName}`,
        institutionName: result.item.institution?.name
      })),
      
      ...institutionResults.map(result => ({
        type: 'institution' as const,
        id: result.item.id,
        title: result.item.name,
        description: result.item.description,
        domain: result.item.domain,
        coursesCount: result.item.courses.length
      })),
      
      ...instructorResults.map(result => ({
        type: 'instructor' as const,
        id: result.item.id,
        title: `${result.item.user.firstName} ${result.item.user.lastName}`,
        description: result.item.bio,
        institutionName: result.item.institution?.name,
        specializations: result.item.specializations
      }))
    ];
    
    return results.slice(0, limit);
  };
  
  institutionSearch = async (query: string, limit: number = 10): Promise<InstitutionSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }
    
    const results = this.institutionFuse.search(query, { limit });
    
    return results.map(result => ({
      type: 'institution' as const,
      id: result.item.id,
      title: result.item.name,
      description: result.item.description,
      domain: result.item.domain,
      coursesCount: result.item.courses.length
    }));
  };
  
  instructorSearch = async (query: string, limit: number = 10): Promise<InstructorSearchResult[]> => {
    if (!query.trim()) {
      return [];
    }
    
    const results = this.instructorFuse.search(query, { limit });
    
    return results.map(result => ({
      type: 'instructor' as const,
      id: result.item.id,
      title: `${result.item.user.firstName} ${result.item.user.lastName}`,
      description: result.item.bio,
      institutionName: result.item.institution?.name,
      specializations: result.item.specializations
    }));
  };
}
