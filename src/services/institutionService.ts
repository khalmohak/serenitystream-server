import { Repository, Like, FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../data-source";
import { Institution } from "../entities";
import { validate } from "class-validator";
import { HttpException } from "../exceptions/HttpException";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export class InstitutionService {
  private institutionRepository: Repository<Institution>;

  constructor() {
    this.institutionRepository = AppDataSource.getRepository(Institution);
  }

  async create(data: Partial<Institution>): Promise<Institution> {
    const institution = this.institutionRepository.create(data);

    const errors = await validate(institution);
    if (errors.length > 0) {
      throw new HttpException(400, "Validation failed");
    }

    try {
      const existingInstitution = await this.institutionRepository.findOne({
        where: { domain: data.domain },
      });

      if (existingInstitution) {
        throw new HttpException(
          400,
          "Institution with this domain already exists",
        );
      }

      return await this.institutionRepository.save(institution);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error creating institution");
    }
  }

  async list(params: ListParams): Promise<[Institution[], number]> {
    const {
      page,
      limit,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = params;

    try {
      const where: FindOptionsWhere<Institution> = {};
      if (search) {
        where.name = Like(`%${search}%`);
      }

      const order: any = {};
      if (sortBy && sortOrder) {
        order[sortBy] = sortOrder;
      }

      return await this.institutionRepository.findAndCount({
        where,
        order,
        skip: (page - 1) * limit,
        take: limit,
        relations: ["users", "instructors", "courses"],
      });
    } catch (error) {
      throw new HttpException(500, "Error fetching institutions");
    }
  }

  async findById(id: string): Promise<Institution | null> {
    try {
      const institution = await this.institutionRepository.findOne({
        where: { id },
        relations: ["users", "instructors", "courses"],
      });

      return institution;
    } catch (error) {
      throw new HttpException(500, "Error fetching institution");
    }
  }

  async update(id: string, data: Partial<Institution>): Promise<Institution> {
    try {
      const institution = await this.findById(id);

      if (!institution) {
        throw new HttpException(404, "Institution not found");
      }

      if (data.domain && data.domain !== institution.domain) {
        const existingInstitution = await this.institutionRepository.findOne({
          where: { domain: data.domain },
        });

        if (existingInstitution) {
          throw new HttpException(
            400,
            "Institution with this domain already exists",
          );
        }
      }

      Object.assign(institution, data);

      // Validate the updated 
      const errors = await validate(institution);
      if (errors.length > 0) {
        throw new HttpException(400, "Validation failed");
      }

      return await this.institutionRepository.save(institution);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(500, "Error updating institution");
    }
  }
}
