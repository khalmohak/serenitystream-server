import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "./config/config";
import {
  ContentItem,
  Course,
  CourseEnrollment,
  Institution,
  RefreshToken,
  User,
  UserPreferences,
  UserProgress,
  UserVerification,
  Module,
} from "./entities";
import { FavoriteCourse } from "./entities/FavoriteCourse";
import { FavoriteInstructor } from "./entities/FavoriteInstructor";
import { Instructor } from "./entities/Instructor";
import { Invoice } from "./entities/Invoice";
import { Payment } from "./entities/Payment";
import { Review } from "./entities/Review";
import { Video } from "./entities/Video";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.isDevelopment,
  logging: config.isDevelopment,
  entities: [
    User,
    Institution,
    CourseEnrollment,
    UserProgress,
    Module,
    Course,
    RefreshToken,
    ContentItem,
    UserPreferences,
    UserVerification,
    Instructor,
    Review,
    FavoriteCourse,
    FavoriteInstructor,
    Video,
    Payment,
    Invoice
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
