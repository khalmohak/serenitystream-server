import { AppDataSource } from "../data-source";
import {
  Course,
  Module,
  ContentItem,
  CourseEnrollment,
  EnrollmentStatus,
  CourseLevel,
  ContentType,
} from "../entities";
import { CreateCourseDto, UpdateCourseDto } from "../dtos/course.dto";
import { HttpException } from "../exceptions/HttpException";
import { CreateReviewDto } from "../dtos/review.dto";
import { Review } from "../entities/Review";

export class CourseService {
  private courseRepository = AppDataSource.getRepository(Course);
  private moduleRepository = AppDataSource.getRepository(Module);
  private contentItemRepository = AppDataSource.getRepository(ContentItem);
  private enrollmentRepository = AppDataSource.getRepository(CourseEnrollment);
  private reviewRepository = AppDataSource.getRepository(Review);

  async createCourse(
    instructorId: string,
    dto: CreateCourseDto,
  ): Promise<Course> {
    const course = this.courseRepository.create({
      ...dto,
      instructorId,
    });
    return await this.courseRepository.save(course);
  }

  async getCourseById(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ["instructor", "modules", "enrollments"],
    });
    if (!course) throw new HttpException(404, "Course not found");
    return course;
  }

  async updateCourse(
    id: string,
    instructorId: string,
    dto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id, instructorId },
    });
    if (!course) throw new HttpException(404, "Course not found");

    Object.assign(course, dto);
    return await this.courseRepository.save(course);
  }

  async deleteCourse(id: string, instructorId: string): Promise<void> {
    const result = await this.courseRepository.delete({ id, instructorId });
    if (result.affected === 0) throw new HttpException(404, "Course not found");
  }

  async publishCourse(id: string, instructorId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id, instructorId },
      relations: ["modules", "modules.contentItems"],
    });

    if (!course) throw new HttpException(404, "Course not found");

    if (course.modules.length === 0) {
      throw new HttpException(400, "Cannot publish course without modules");
    }

    course.isPublished = true;
    return await this.courseRepository.save(course);
  }

  async enrollStudent(
    courseId: string,
    userId: string,
  ): Promise<CourseEnrollment> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, isPublished: true },
    });

    if (!course)
      throw new HttpException(404, "Course not found or not published");

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { courseId, userId },
    });

    if (existingEnrollment) {
      throw new HttpException(400, "User already enrolled in this course");
    }

    const enrollment = this.enrollmentRepository.create({
      courseId,
      userId,
      status: EnrollmentStatus.ACTIVE,
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async getCourseStats(courseId: string): Promise<any> {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
      relations: ["user"],
    });

    return {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(
        (e) => e.status === EnrollmentStatus.ACTIVE,
      ).length,
      completedEnrollments: enrollments.filter(
        (e) => e.status === EnrollmentStatus.COMPLETED,
      ).length,
    };
  }

  async getAllCourses(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      level?: CourseLevel;
      instructorId?: string;
      institutionId?: string;
    },
    sort?: {
      field: "price" | "createdAt" | "title";
      order: "ASC" | "DESC";
    },
  ): Promise<{ courses: Course[]; total: number }> {
    const queryBuilder = this.courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.instructor", "instructor")
      .leftJoinAndSelect("course.institution", "institution")
      .where("course.isPublished = :isPublished", { isPublished: true });

    if (filters) {
      if (filters.search) {
        queryBuilder.andWhere(
          "(course.title ILIKE :search OR course.description ILIKE :search)",
          { search: `%${filters.search}%` },
        );
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        queryBuilder.andWhere("course.price BETWEEN :minPrice AND :maxPrice", {
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });
      }

      if (filters.level) {
        queryBuilder.andWhere("course.level = :level", {
          level: filters.level,
        });
      }

      if (filters.instructorId) {
        queryBuilder.andWhere("course.instructorId = :instructorId", {
          instructorId: filters.instructorId,
        });
      }

      if (filters.institutionId) {
        queryBuilder.andWhere("course.institutionId = :institutionId", {
          institutionId: filters.institutionId,
        });
      }
    }

    // Apply sorting
    if (sort) {
      queryBuilder.orderBy(`course.${sort.field}`, sort.order);
    } else {
      queryBuilder.orderBy("course.createdAt", "DESC");
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [courses, total] = await queryBuilder.getManyAndCount();
    return { courses, total };
  }

  async getDetailedCourse(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        "instructor",
        "institution",
        "modules",
        "modules.contentItems",
        "reviews",
        "reviews.user",
      ],
    });

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    return course;
  }

  async unpublishCourse(id: string, instructorId: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id, instructorId },
    });

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    course.isPublished = false;
    return await this.courseRepository.save(course);
  }

  async createModule(
    courseId: string,
    instructorId: string,
    data: {
      title: string;
      description?: string;
      sequenceNo: number;
    },
  ): Promise<Module> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    const module = this.moduleRepository.create({
      ...data,
      course,
    });

    return await this.moduleRepository.save(module);
  }

  async updateModule(
    moduleId: string,
    instructorId: string,
    data: {
      title?: string;
      description?: string;
      sequenceNo?: number;
    },
  ): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId, course: { instructorId } },
      relations: ["course"],
    });

    if (!module) {
      throw new HttpException(404, "Module not found");
    }

    Object.assign(module, data);
    return await this.moduleRepository.save(module);
  }

  async createContentItem(
    moduleId: string,
    instructorId: string,
    data: {
      title: string;
      type: ContentType;
      content: any;
      sequenceNo: number;
      duration?: number;
    },
  ): Promise<ContentItem> {
    const module = await this.moduleRepository.findOne({
      where: { id: moduleId, course: { instructorId } },
      relations: ["course"],
    });

    if (!module) {
      throw new HttpException(404, "Module not found");
    }

    const contentItem = this.contentItemRepository.create({
      ...data,
      module,
    });

    return await this.contentItemRepository.save(contentItem);
  }

  async updateContentItem(
    contentItemId: string,
    instructorId: string,
    data: {
      title?: string;
      content?: any;
      sequenceNo?: number;
      duration?: number;
    },
  ): Promise<ContentItem> {
    const contentItem = await this.contentItemRepository.findOne({
      where: { id: contentItemId, module: { course: { instructorId } } },
      relations: ["module", "module.course"],
    });

    if (!contentItem) {
      throw new HttpException(404, "Content item not found");
    }

    Object.assign(contentItem, data);
    return await this.contentItemRepository.save(contentItem);
  }

  async addReview(
    courseId: string,
    userId: string,
    data: CreateReviewDto,
  ): Promise<Review> {
    // Check if user is enrolled
    const enrollment = await this.enrollmentRepository.findOne({
      where: { courseId, userId },
    });

    if (!enrollment) {
      throw new HttpException(
        403,
        "You must be enrolled to review this course",
      );
    }

    // Check if user already reviewed
    const existingReview = await this.reviewRepository.findOne({
      where: { courseId, userId },
    });

    if (existingReview) {
      throw new HttpException(400, "You have already reviewed this course");
    }

    const review = this.reviewRepository.create({
      ...data,
      courseId,
      userId,
    });

    return await this.reviewRepository.save(review);
  }

  async updateReview(
    reviewId: string,
    userId: string,
    data: CreateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, userId },
    });

    if (!review) {
      throw new HttpException(404, "Review not found");
    }

    Object.assign(review, data);
    return await this.reviewRepository.save(review);
  }

  async getEnrollments(
    courseId: string,
    instructorId: string,
  ): Promise<CourseEnrollment[]> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, instructorId },
    });

    if (!course) {
      throw new HttpException(404, "Course not found");
    }

    return await this.enrollmentRepository.find({
      where: { courseId },
      relations: ["user"],
    });
  }
}
