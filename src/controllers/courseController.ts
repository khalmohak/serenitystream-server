import { Course } from "../entity";
import { Request, Response } from "express";


export class CourseController {
  async create(req: Request, res: Response) {
    try {
      const { title, description, price } = req.body;
      
      const course = Course.create({
        title,
        description,
        price,
        institution: req.user.institution
      });
      
      await course.save();
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  
  async list(req: Request, res: Response) {
    const courses = await Course.find({
      where: { institution: req.user.institution },
      relations: ['modules']
    });
    res.json(courses);
  }
}