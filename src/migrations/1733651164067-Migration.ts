import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733651164067 implements MigrationInterface {
    name = 'Migration1733651164067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`CREATE TYPE "public"."instructors_type_enum" AS ENUM('institutional', 'independent')`);
        await queryRunner.query(`CREATE TABLE "instructors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."instructors_type_enum" NOT NULL, "bio" character varying, "websiteUrl" character varying, "linkedinUrl" character varying, "specializations" text, "title" character varying, "institutionId" uuid, "userId" uuid, CONSTRAINT "REL_dfa0fcb3c8ae7ded658b4272e1" UNIQUE ("userId"), CONSTRAINT "PK_95e3da69ca76176ea4ab8435098" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "imageUrl" character varying`);
        await queryRunner.query(`CREATE INDEX "idx_expiresAt" ON "refresh_tokens" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "idx_userId_isValid" ON "refresh_tokens" ("userId", "isValid") `);
        await queryRunner.query(`CREATE INDEX "idx_token_isValid" ON "refresh_tokens" ("token", "isValid") `);
        await queryRunner.query(`ALTER TABLE "instructors" ADD CONSTRAINT "FK_dfa0fcb3c8ae7ded658b4272e19" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructors" ADD CONSTRAINT "FK_d06d5e2eabea3fdd41cd02c7b59" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "instructors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`ALTER TABLE "instructors" DROP CONSTRAINT "FK_d06d5e2eabea3fdd41cd02c7b59"`);
        await queryRunner.query(`ALTER TABLE "instructors" DROP CONSTRAINT "FK_dfa0fcb3c8ae7ded658b4272e19"`);
        await queryRunner.query(`DROP INDEX "public"."idx_token_isValid"`);
        await queryRunner.query(`DROP INDEX "public"."idx_userId_isValid"`);
        await queryRunner.query(`DROP INDEX "public"."idx_expiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`DROP TABLE "instructors"`);
        await queryRunner.query(`DROP TYPE "public"."instructors_type_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
