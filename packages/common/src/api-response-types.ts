import {
  ScheduleCourse,
  Schedule2,
  SupportedMajors,
  ScheduleCourse2,
} from "./types";

/** Types our API responds with. */

export class PlanModel<T> {
  id: number;
  name: string;
  student: StudentModel<null>;
  schedule: Schedule2<T>;
  major: string;
  concentration: string | undefined;
  catalogYear: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GetPlanResponse extends PlanModel<null> {}

export class UpdatePlanResponse extends PlanModel<null> {}

export class StudentModel<T> {
  uuid: string | undefined;
  nuid: string | undefined;
  isOnboarded: boolean;
  fullName: string | undefined;
  email: string;
  isEmailConfirmed: boolean;
  academicYear: number | undefined;
  graduateYear: number | undefined;
  catalogYear: number | undefined;
  major: string | undefined;
  coopCycle: string | undefined;
  coursesCompleted: ScheduleCourse[] | undefined;
  coursesTransfered: ScheduleCourse2<null>[] | undefined;
  primaryPlanId: number | undefined;
  plans: PlanModel<T>[];
  concentration: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class GetStudentResponse extends StudentModel<null> {}

export class UpdateStudentResponse extends StudentModel<null> {}

export class GetSupportedMajorsResponse {
  // { year => { majorName => {concentrations, minRequiredConcentrations} }}
  supportedMajors: SupportedMajors;
}
