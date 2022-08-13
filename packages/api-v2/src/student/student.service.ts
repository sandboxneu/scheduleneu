import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { formatServiceCtx } from "src/utils";
import {
  DeleteResult,
  FindOneOptions,
  Repository,
  UpdateResult,
} from "typeorm";
import { SignUpStudentDto } from "../../../common";
import { Student } from "./entities/student.entity";
import { UpdateStudentDto } from "../../../common/src/dto-types";
@Injectable()
export class StudentService {
  private readonly logger: Logger = new Logger();

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>
  ) {}

  async create(createStudentDto: SignUpStudentDto): Promise<Student> {
    // make sure the user doesn't already exists
    const { email } = createStudentDto;
    const userInDb = await this.studentRepository.findOne({ where: { email } });
    if (userInDb) {
      this.logger.debug(
        { message: "User already exists in db", userInDb },
        StudentService.formatStudentServiceCtx("create")
      );
      return null;
    }

    if (createStudentDto.password !== createStudentDto.passwordConfirm) {
      return null;
    }

    const newStudent = this.studentRepository.create(createStudentDto);

    try {
      return this.studentRepository.save(newStudent);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<Student[]> {
    return await this.studentRepository.find();
  }

  async findByUuid(uuid: string, isWithPlans = false): Promise<Student> {
    const findOptions: FindOneOptions<Student> = { where: { uuid } };

    if (isWithPlans) {
      findOptions.relations = ["plans"];
    }

    return this.findOne(findOptions);
  }

  async findByEmail(email: string, isWithPlans = false): Promise<Student> {
    const findOptions: FindOneOptions<Student> = { where: { email } };

    if (isWithPlans) {
      findOptions.relations = ["plans"];
    }

    return this.findOne(findOptions);
  }

  private async findOne(
    findOptions: FindOneOptions<Student>
  ): Promise<Student> {
    const student = await this.studentRepository.findOne(findOptions);

    if (!student) {
      this.logger.debug(
        { message: "User doesn't exist in db", findOptions },
        StudentService.formatStudentServiceCtx("findOne")
      );
      return null;
    }

    return student;
  }

  async update(
    uuid: string,
    updateStudentDto: Partial<Student>
  ): Promise<UpdateResult> {
    const updateResult = await this.studentRepository.update(
      uuid,
      updateStudentDto
    );

    if (updateResult.affected === 0) {
      this.logger.debug(
        { message: "User doesn't exist in db", uuid },
        StudentService.formatStudentServiceCtx("update")
      );
      return null;
    }

    return updateResult;
  }

  async remove(uuid: string): Promise<DeleteResult> {
    const deleteResult = await this.studentRepository.delete(uuid);

    if (deleteResult.affected === 0) {
      this.logger.debug(
        { message: "User doesn't exist in db", uuid },
        StudentService.formatStudentServiceCtx("delete")
      );
      return null;
    }

    return deleteResult;
  }

  static isEqualStudents(student1: Student, student2: Student): boolean {
    return student1.uuid === student2.uuid;
  }

  private static formatStudentServiceCtx(methodName: string) {
    return formatServiceCtx(StudentService.name, methodName);
  }
}
