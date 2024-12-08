import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733658084978 implements MigrationInterface {
    name = 'Migration1733658084978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_477dfb3469de6ce682f3339eb8f"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "institutionId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_477dfb3469de6ce682f3339eb8f" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_477dfb3469de6ce682f3339eb8f"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "institutionId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_477dfb3469de6ce682f3339eb8f" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
