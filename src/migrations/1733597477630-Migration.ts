import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733597477630 implements MigrationInterface {
    name = 'Migration1733597477630'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."content_items_type_enum" AS ENUM('quiz', 'material', 'video')`);
        await queryRunner.query(`CREATE TABLE "content_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "type" "public"."content_items_type_enum" NOT NULL, "content" jsonb NOT NULL, "duration" integer, "sequenceNo" integer NOT NULL, "moduleId" uuid NOT NULL, CONSTRAINT "PK_9c6bf4f28851752cee186915e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3bc44e18fa7bbb867815244f42" ON "content_items" ("sequenceNo") `);
        await queryRunner.query(`CREATE TABLE "modules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text, "sequenceNo" integer NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, "duration" integer NOT NULL DEFAULT '0', "metadata" jsonb, "contentItemsCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "courseId" uuid NOT NULL, CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2495d7fb95cd3965284a728294" ON "modules" ("sequenceNo") `);
        await queryRunner.query(`CREATE TYPE "public"."courses_currency_enum" AS ENUM('USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY')`);
        await queryRunner.query(`CREATE TYPE "public"."courses_level_enum" AS ENUM('beginner', 'intermediate', 'advanced')`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, "imageUrl" character varying, "currency" "public"."courses_currency_enum" NOT NULL DEFAULT 'USD', "duration" integer, "level" "public"."courses_level_enum", "tags" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "institutionId" uuid, "instructorId" uuid NOT NULL, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "institutions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "domain" character varying NOT NULL, "description" text, "settings" jsonb, "logoUrl" character varying, "tags" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1cc0e17b15e64cb50b8ae44bcf7" UNIQUE ("domain"), CONSTRAINT "PK_0be7539dcdba335470dc05e9690" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."course_enrollments_status_enum" AS ENUM('active', 'completed', 'expired', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "course_enrollments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "enrolledAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."course_enrollments_status_enum" NOT NULL DEFAULT 'active', "expiryDate" date, "completedAt" TIMESTAMP, "userId" uuid NOT NULL, "courseId" uuid NOT NULL, CONSTRAINT "PK_609f6e4f0fc9a6149a35211b380" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_progress_status_enum" AS ENUM('not_started', 'in_progress', 'completed')`);
        await queryRunner.query(`CREATE TABLE "user_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "progress" integer NOT NULL DEFAULT '0', "status" "public"."user_progress_status_enum" NOT NULL DEFAULT 'not_started', "metadata" jsonb, "completedAt" TIMESTAMP, "attempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastAccessedAt" TIMESTAMP, "userId" uuid NOT NULL, "contentItemId" uuid NOT NULL, CONSTRAINT "PK_7b5eb2436efb0051fdf05cbe839" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_9961c25feb714503650148585d" ON "user_progress" ("userId", "contentItemId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'instructor', 'student')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying NOT NULL, "middleName" character varying, "lastName" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "countryCode" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "institutionId" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "theme" character varying NOT NULL DEFAULT 'light', "receiveNotifications" boolean NOT NULL DEFAULT true, "language" character varying NOT NULL DEFAULT 'en', "otherPreferences" character varying, "userId" uuid, CONSTRAINT "PK_e8cfb5b31af61cd363a6b6d7c25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_verifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerificationToken" character varying, "isPhoneVerified" boolean NOT NULL DEFAULT false, "phoneVerificationToken" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_3269a92433d028916ab342b94fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "userId" uuid NOT NULL, "deviceId" character varying NOT NULL, "userAgent" character varying NOT NULL, "ipAddress" character varying NOT NULL, "isValid" boolean NOT NULL DEFAULT true, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_0afc67be1aa1fa80e28d2a32de0" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "modules" ADD CONSTRAINT "FK_83489b37212a5a547bde8f89014" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_477dfb3469de6ce682f3339eb8f" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_enrollments" ADD CONSTRAINT "FK_ab72c7fa06784137e905f1f8b8e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_enrollments" ADD CONSTRAINT "FK_d77e489db35c7d325700d799be6" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_progress" ADD CONSTRAINT "FK_a9ca2105b68e7e61a53195e57bb" FOREIGN KEY ("contentItemId") REFERENCES "content_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_412354ee74d15b76137f5dba3e3" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_verifications" ADD CONSTRAINT "FK_b5aadfc04db5b23d06c0447e0f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
        await queryRunner.query(`ALTER TABLE "user_verifications" DROP CONSTRAINT "FK_b5aadfc04db5b23d06c0447e0f4"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_412354ee74d15b76137f5dba3e3"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_a9ca2105b68e7e61a53195e57bb"`);
        await queryRunner.query(`ALTER TABLE "user_progress" DROP CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89"`);
        await queryRunner.query(`ALTER TABLE "course_enrollments" DROP CONSTRAINT "FK_d77e489db35c7d325700d799be6"`);
        await queryRunner.query(`ALTER TABLE "course_enrollments" DROP CONSTRAINT "FK_ab72c7fa06784137e905f1f8b8e"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_477dfb3469de6ce682f3339eb8f"`);
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "FK_83489b37212a5a547bde8f89014"`);
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_0afc67be1aa1fa80e28d2a32de0"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "user_verifications"`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9961c25feb714503650148585d"`);
        await queryRunner.query(`DROP TABLE "user_progress"`);
        await queryRunner.query(`DROP TYPE "public"."user_progress_status_enum"`);
        await queryRunner.query(`DROP TABLE "course_enrollments"`);
        await queryRunner.query(`DROP TYPE "public"."course_enrollments_status_enum"`);
        await queryRunner.query(`DROP TABLE "institutions"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TYPE "public"."courses_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."courses_currency_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2495d7fb95cd3965284a728294"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3bc44e18fa7bbb867815244f42"`);
        await queryRunner.query(`DROP TABLE "content_items"`);
        await queryRunner.query(`DROP TYPE "public"."content_items_type_enum"`);
    }

}
