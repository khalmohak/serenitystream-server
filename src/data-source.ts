import "reflect-metadata";
import { DataSource } from "typeorm";
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

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  // port: 5432,
  port: 5433,
  username: "testuser",
  password: "testpass123",
  database: "testdb",
  synchronize: true,
  logging: false,
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
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
