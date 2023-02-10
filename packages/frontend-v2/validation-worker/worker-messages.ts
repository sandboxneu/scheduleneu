import { Major2, MajorValidationResult, ScheduleCourse2 } from "@graduate/common"

export type WorkerMessage = Loaded | ValidationResult

export enum WorkerMessageType {
  Loaded = "Loaded",
  ValidationResult = "ValidationResult"
}

export type ValidationResult = {
  type: WorkerMessageType.ValidationResult, 
  result: MajorValidationResult,
  requestNumber: number
}
export type Loaded = {type: WorkerMessageType.Loaded}

export interface WorkerPostInfo {
  major: Major2,
  taken: ScheduleCourse2<unknown>[],
  concentration?: string,
  requestNumber: number
}