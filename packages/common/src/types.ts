/**
 * Describes an abbreviation for one of Northeastern's NUPath academic breadth
 * requirements. Each two-character NUPath directly corresponds to
 * Northeastern's abbreviation of the requirement.
 */
export enum NUPathEnum {
  ND = "ND",
  EI = "EI",
  IC = "IC",
  FQ = "FQ",
  SI = "SI",
  AD = "AD",
  DD = "DD",
  ER = "ER",
  WF = "WF",
  WD = "WD",
  WI = "WI",
  EX = "EX",
  CE = "CE",
}

/**
 * Represents one of the seasons in which a student can take a course, as
 * abbreviated by Northeastern.
 */
export enum SeasonEnum {
  FL = "FL",
  SP = "SP",
  S1 = "S1",
  S2 = "S2",
  SM = "SM",
}

/** A Status is one of on CO-OP, CLASSES, or INACTIVE */
export enum StatusEnum {
  COOP = "COOP",
  CLASSES = "CLASSES",
  INACTIVE = "INACTIVE",
  HOVERINACTIVE = "HOVERINACTIVE",
  HOVERCOOP = "HOVERCOOP",
}

export type NUPath = keyof typeof NUPathEnum;
export type Status = keyof typeof StatusEnum;
export type Season = keyof typeof SeasonEnum;

/** A SearchNEU prerequisite object. */
export type INEUPrereq = INEUAndPrereq | INEUOrPrereq | INEUPrereqCourse;
/**
 * A SearchNEU AND prerequisite object.
 *
 * @param type   The type of the SearchNEU prerequisite.
 * @param values The prerequisites that must be completed for this prereq. to be
 *   marked as done.
 */
export interface INEUAndPrereq {
  type: "and";
  values: INEUPrereq[];
}

/**
 * A SearchNEU OR prerequisite object.
 *
 * @param type   The type of the SearchNEU prerequisite.
 * @param values The prerequisites of which one must be completed for this
 *   prerequisite to be marked as done.
 */
export interface INEUOrPrereq {
  type: "or";
  values: INEUPrereq[];
}

/**
 * A SearchNEU prerequisite course.
 *
 * @param classId The course number of this prerequisite course.
 * @param subject The subject of this prerequisite course.
 * @param missing True if the class is missing.
 */
export interface INEUPrereqCourse {
  classId: string;
  subject: string;
  missing?: true;
}

export type INEUPrereqError = INEUPreReqCourseError | INEUPrereqAndError | INEUPrereqOrError

export interface INEUPreReqCourseError {
  type: "course";
  subject: string;
  classId: string;
}

export interface INEUPrereqAndError {
  type: "and";
  missing: INEUPrereqError[];
}

export interface INEUPrereqOrError {
  type: "or";
  missing: INEUPrereqError[];
}

export interface courseError {
  [key: string]: INEUPrereqError | undefined
}
//                                       NEW MAJOR OBJECT HERE
/**
 * A Major, containing all the requirements.
 *
 * @param name                 The name of the major.
 * @param requirementSections  A list of the sections of requirements.
 * @param totalCreditsRequired Total credits required to graduate with this major.
 * @param yearVersion          The catalog version year of this major.
 * @param concentrations       The possible concentrations within this major.
 */
export interface Major2 {
  name: string;
  requirementSections: Section[];
  totalCreditsRequired: number;
  yearVersion: number;
  concentrations: Concentrations2;
}

/**
 * A Section, containing its related requirements.
 *
 * @param title               The title of the section.
 * @param requirements        A list of the requirements within this section.
 * @param minRequirementCount The minimum number of requirements (counts from
 *   requirements) that are accepted for the section to be fulfilled.
 */
export interface Section {
  type: "SECTION";
  title: string;
  requirements: Requirement2[];
  minRequirementCount: number;
}

/** Represents a degree requirement that allows a Section to be completed. */
export type Requirement2 =
  | IXofManyCourse
  | IAndCourse2
  | IOrCourse2
  | ICourseRange2
  | IRequiredCourse
  | Section;

/**
 * Represents a requirement where X number of credits need to be completed from
 * a list of courses.
 *
 * @param type          The type of requirement.
 * @param numCreditsMin The minimum number of credits needed to fulfill a given section.
 * @param courses       The list of requirements that the credits can be fulfilled from.
 */
export interface IXofManyCourse {
  type: "XOM";
  numCreditsMin: number;
  courses: Requirement2[];
}

/**
 * Represents an 'AND' series of requirements.
 *
 * @param type    The type of requirement.
 * @param courses The list of requirements, all of which must be taken to
 *   satisfy this requirement.
 */
export interface IAndCourse2 {
  type: "AND";
  courses: Requirement2[];
}

/**
 * Represents an 'OR' set of requirements.
 *
 * @param type    The type of requirement.
 * @param courses The list of requirements, one of which can be taken to satisfy
 *   this requirement.
 */
export interface IOrCourse2 {
  type: "OR";
  courses: Requirement2[];
}

/**
 * Represents a requirement that specifies a range of courses.
 *
 * @param type            The type of requirement.
 * @param creditsRequired The number of credits taken from the range for this
 *   requirement to be fulfilled.
 * @param subject         The subject area of the range of courses.
 * @param idRangeStart    The course ID for the starting range of course numbers.
 * @param idRangeEnd      The course ID for the ending range of course numbers.
 * @param exceptions      The requirements within the mentioned range that do
 *   not count towards fulfulling this requirement.
 */
export interface ICourseRange2 {
  type: "RANGE";
  subject: string;
  idRangeStart: number;
  idRangeEnd: number;
  exceptions: IRequiredCourse[];
}

/**
 * A single required course.
 *
 * @param classId - The numeric ID of the course.
 * @param subject - The subject that the course is concerned with, such as CS
 *   (Computer Science).
 */
export interface IRequiredCourse {
  type: "COURSE";
  classId: number;
  subject: string;
}

/**
 * A Concentrations, contains all of the available concentrations for the major
 * and their respective requirements.
 *
 * @param minOptions           The minimum number of concentrations required for
 *   the major.
 * @param concentrationOptions The list of sections representing all of the
 *   available concentrations in the major.
 */
export interface Concentrations2 {
  minOptions: number;
  concentrationOptions: Section[];
}

/**
 * A clean version of a student's schedule as used in V2 of the App with no
 * redundunt year information.
 *
 * @param years A list of the years of this object
 */
export interface Schedule2<T> {
  years: ScheduleYear2<T>[];
}

/**
 * A ScheduleYear, representing a year of a schedule
 *
 * @param year         The academic year number(1, 2, 3...) not to be confused
 *   with the calendar year. One academic year spans from [Calendar Year X,
 *   Fall] - [Calendar Year X + 1, Summer 2].
 *
 *   Storing the academic year num isn't necessary but can be nice since it
 *   prevents us from relying on the order in which ScheduleYears are stored in
 *   a Schedule.
 * @param fall         The fall term
 * @param spring       The spring term
 * @param summer1      The summer 1 term
 * @param summer2      The summer 2 term
 * @param isSummerFull True if the summer1 should hold the classes for summer full.
 */
export interface ScheduleYear2<T> {
  year: number;
  fall: ScheduleTerm2<T>;
  spring: ScheduleTerm2<T>;
  summer1: ScheduleTerm2<T>;
  summer2: ScheduleTerm2<T>;
  isSummerFull: boolean;
}

/**
 * A clean version of the ScheduleTerm used by V2 of the App. A generic id field
 * is used for book keeping purposes by the drag and drop library, in cases
 * where we don't care about this id, T can null.
 *
 * @param year    The year of this term
 * @param season  The season of this term
 * @param status  The status of this term, on coop, classes, or inactive.
 * @param classes A list of the classes of this term.
 * @param id      Unique id used as a book keeping field for dnd.
 */
export interface ScheduleTerm2<T> {
  year: number;
  season: SeasonEnum;
  status: StatusEnum;
  classes: ScheduleCourse2<T>[];
  id: T;
}

/**
 * A course within a schedule used by V2 of the App. A generic id field is used
 * for book keeping purposes by the drag and drop library, in cases where we
 * don't care about this id, T can null.
 *
 * @param name          The name of the course
 * @param classId       The classId of this course (1210, 1800, etc)
 * @param subject       The subject of this course (CS, DS, etc)
 * @param prereqs       The prerequisites for this course
 * @param coreqs        The corequisites for this course
 * @param numCreditsMin The minimum number of credits this course gives
 * @param numCreditsMax The maximum number of credits this course gives
 * @param id            Unique id used as a book keeping field for dnd.
 */
export interface ScheduleCourse2<T> {
  name: string;
  classId: string;
  subject: string;
  prereqs?: INEUAndPrereq | INEUOrPrereq;
  coreqs?: INEUAndPrereq | INEUOrPrereq;
  numCreditsMin: number;
  numCreditsMax: number;
  id: T;
}

// LEGACY SCHEDULE. USED BY V1 OF THE APP.

/**
 * A Schedule
 *
 * @param years   A list of the years of this object
 * @param yearMap An object containing the year objects of this schedule
 * @param id      The id number of this schedule
 */
export interface Schedule {
  years: number[];
  yearMap: {
    [key: number]: ScheduleYear;
  };
}

/**
 * A ScheduleYear, representing a year of a schedule
 *
 * @param year         The year
 * @param fall         The fall term
 * @param spring       The spring term
 * @param summer1      The summer 1 term
 * @param summer2      The summer 2 term
 * @param isSummerFull True if the summer1 should hold the classes for summer full.
 */
export interface ScheduleYear {
  year: number;
  fall: ScheduleTerm;
  spring: ScheduleTerm;
  summer1: ScheduleTerm;
  summer2: ScheduleTerm;
  isSummerFull: boolean;
}

/**
 * A ScheduleTerm, representing a term of a scheudle
 *
 * @param season  The season of this term
 * @param year    The year of this term
 * @param termId  The termId of this term
 * @param id      The unique id of this term
 * @param status  The status of this term, on coop, classes, or inactive.
 * @param classes A list of the classes of this term.
 */
export interface ScheduleTerm {
  season: Season | SeasonEnum;
  year: number;
  termId: number;
  status: Status | StatusEnum;
  classes: ScheduleCourse[];
}

/**
 * A course of a schedule
 *
 * @param classId       The classId of this course
 * @param subject       The subject of this course
 * @param prereqs       The prerequisites for this course
 * @param coreqs        The corequisites for this course
 * @param numCreditsMin The minimum number of credits this course gives
 * @param numCreditsMax The maximum number of credits this course gives
 */
export interface ScheduleCourse {
  name: string;
  classId: string; // Should this be a number?
  subject: string;
  prereqs?: INEUAndPrereq | INEUOrPrereq;
  coreqs?: INEUAndPrereq | INEUOrPrereq;
  numCreditsMin: number;
  numCreditsMax: number;
  semester?: string | null;
}

/** An enumeration of the different kinds of transferable exams available. */
export enum TransferableExamTypeEnum {
  AP = "AP",
  IB = "IB",
}

export type TransferableExamType = keyof typeof TransferableExamTypeEnum;

/**
 * A transferable exam available for transfer credit, with the courses and
 * semester hours it counts for.
 *
 * @param name            The name of this exam
 * @param mappableCourses The NEU courses which this credit counts for
 * @param semesterHours   The number of semester hours which this credit counts for
 */
export interface TransferableExam {
  name: string;
  type: TransferableExamType;
  mappableCourses: IRequiredCourse[];
  semesterHours: number;
}

/**
 * A subject group of AP exams available for transfer.
 *
 * @param name              The name of this group of exams
 * @param transferableExams An array of exams which are within this group
 */
export interface TransferableExamGroup {
  name: string;
  transferableExams: TransferableExam[];
}

/**
 * A scheduled course.
 *
 * @param classId The course number of the scheduled course.
 * @param subject The subject of the scheduled course.
 */
export interface IScheduleCourse {
  classId: number;
  subject: string;
}

/**
 * Types for a some result from an algorithim. Currently used for the result of
 * the Major 2 validation algorithm.
 */
export enum ResultType {
  Ok = "Ok",
  Err = "Err",
}

export type Result<T, E> =
  | { ok: T; type: ResultType.Ok }
  | { err: E; type: ResultType.Err };

export const Ok = <T, E>(ok: T): Result<T, E> => ({ ok, type: ResultType.Ok });

export const Err = <T, E>(err: E): Result<T, E> => ({
  err,
  type: ResultType.Err,
});
