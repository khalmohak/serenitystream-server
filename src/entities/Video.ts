import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsUUID, IsString, IsNotEmpty, IsNumber, IsArray, IsUrl, MinLength, MaxLength, Min, IsOptional, IsDecimal } from 'class-validator';

@Entity('videos')
export class Video {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID()
    id: string;

    @Column()
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
    title: string;

    @Column()
    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'Description cannot be longer than 1000 characters' })
    description: string;

    @Column()
    @IsUUID()
    @IsNotEmpty({ message: 'Instructor ID is required' })
    instructorId: string;

    @Column({
      type:'float8'
    })
    duration: number;

    @Column('simple-array')
    @IsArray()
    @IsNotEmpty({ message: 'At least one quality must be specified' })
    qualities: string[];

    @Column()
    @IsUrl({}, { message: 'Invalid HLS manifest URL' })
    @IsNotEmpty({ message: 'HLS manifest URL is required' })
    hlsManifestUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Add a constructor to set default values
    constructor(partial: Partial<Video> = {}) {
        Object.assign(this, partial);
    }
}