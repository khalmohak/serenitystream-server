import { AppDataSource } from '../data-source';
import { FavoriteCourse } from '../entities/FavoriteCourse';
import { FavoriteInstructor } from '../entities/FavoriteInstructor';
import { Course } from '../entities/Course';
import { Instructor } from '../entities/Instructor';
import { HttpException } from '../exceptions/HttpException';
import { validate } from 'class-validator';

export class FavoriteService {
  private favoriteCourseRepository = AppDataSource.getRepository(FavoriteCourse);
  private favoriteInstructorRepository = AppDataSource.getRepository(FavoriteInstructor);
  private courseRepository = AppDataSource.getRepository(Course);
  private instructorRepository = AppDataSource.getRepository(Instructor);

  async toggleFavoriteCourse(userId: string, courseId: string): Promise<{ favorited: boolean }> {
    // Check if course exists
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new HttpException(404, 'Course not found');
    }

    // Check if already favorited
    const existing = await this.favoriteCourseRepository.findOne({
      where: { userId, courseId }
    });

    if (existing) {
      // Remove favorite
      await this.favoriteCourseRepository.remove(existing);
      return { favorited: false };
    }

    // Add new favorite
    const favorite = this.favoriteCourseRepository.create({
      userId,
      courseId
    });

    // Validate using class-validator
    const errors = await validate(favorite);
    if (errors.length > 0) {
      throw new HttpException(400, 'Validation failed');
    }

    await this.favoriteCourseRepository.save(favorite);
    return { favorited: true };
  }

  async toggleFavoriteInstructor(userId: string, instructorId: string): Promise<{ favorited: boolean }> {
    // Check if instructor exists
    const instructor = await this.instructorRepository.findOne({ where: { id: instructorId } });
    if (!instructor) {
      throw new HttpException(404, 'Instructor not found');
    }

    // Check if already favorited
    const existing = await this.favoriteInstructorRepository.findOne({
      where: { userId, instructorId }
    });

    if (existing) {
      // Remove favorite
      await this.favoriteInstructorRepository.remove(existing);
      return { favorited: false };
    }

    // Add new favorite
    const favorite = this.favoriteInstructorRepository.create({
      userId,
      instructorId
    });

    // Validate using class-validator
    const errors = await validate(favorite);
    if (errors.length > 0) {
      throw new HttpException(400, 'Validation failed');
    }

    await this.favoriteInstructorRepository.save(favorite);
    return { favorited: true };
  }

  async getUserFavoriteCourses(userId: string): Promise<FavoriteCourse[]> {
    return await this.favoriteCourseRepository.find({
      where: { userId },
      relations: ['course', 'course.instructor'],
    });
  }

  async getUserFavoriteInstructors(userId: string): Promise<FavoriteInstructor[]> {
    return await this.favoriteInstructorRepository.find({
      where: { userId },
      relations: ['instructor', 'instructor.user'],
    });
  }
}